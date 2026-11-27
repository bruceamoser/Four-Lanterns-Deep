import {distance,key,neighbors,lineOfSight} from "./dungeon.mjs";
import {surfaceAt} from "./battlefield.mjs";
import { DEEDS_CLASSES } from "./deeds-development.mjs";
import {effectStatus} from "./treasure.mjs";

export const techniqueMethods = {
  cueOptions(cue = this.pendingCue) {
    const owner = this.party.find(h => h.id===cue?.owner);
    if (!owner || this.mode!=="combat") return [];
    const heroes = cue.ally ? this.party.filter(h=>h!==owner && distance(owner,h)<=3 && lineOfSight(this.map,owner,h)) : [owner];
    return heroes.flatMap(h=>{
      if (!this.canAct(h)) return [];
      const occupied=this.occupied(h.id), routes=new Map([[key(h.x,h.z),[]]]), queue=[h];
      for (const pos of queue) {
        const prior=routes.get(key(pos.x,pos.z));
        if (prior.length>=cue.steps) continue;
        for (const p of neighbors(this.map,pos,occupied)) {
          if (routes.has(key(p.x,p.z))) continue;
          routes.set(key(p.x,p.z),[...prior,p]); queue.push(p);
        }
      }
      return [...routes.values()].filter(path=>path.length).map(path=>{
        const p=path.at(-1), dx=p.x-h.x, dz=p.z-h.z;
        const directions=[dz<0?"north":dz>0?"south":"",dx<0?"west":dx>0?"east":""].join("");
        const danger=path.some(t=>surfaceAt(this.map,t,"fire") || surfaceAt(this.map,t,"trap"));
        const threatened=!cue.safe && this.enemies.some(e=>this.canOpportunity(e) && !(cue.ignoreTarget && e.id===cue.enemy) &&
          [h,...path.slice(0,-1)].some((from,n)=>distance(from,e)<=1 && distance(path[n],e)>1));
        return {hero:h.id,path,id:h.id+"/"+key(p.x,p.z),label:h.name+" · "+directions+" ("+dx+", "+dz+")"+(danger?" · hazard":"")+(threatened?" · may provoke":"")};
      });
    });
  },
  resolveCue(id) {
    const cue=this.pendingCue;
    if (!cue) throw new Error("No tactical step is pending.");
    const option=id && this.cueOptions().find(o=>o.id===id);
    if (id && !option) throw new Error("That destination is no longer legal.");
    this.pendingCue=null;
    if (option) {
      const hero=this.party.find(h=>h.id===option.hero), operation={kind:"cue-step",label:"a tactical step",path:option.path,
        ally:hero.id, owner:cue.owner, enemy:cue.enemy, safe:cue.safe, ignoreTarget:cue.ignoreTarget, aid:cue.aid};
      if (!cue.safe && this.provoke(hero,operation,option.path)) return;
      this.finishCueStep(operation);
    }
    this.emit("change"); this.advance();
  },
  finishCueStep(o) {
    const hero=this.party.find(h=>h.id===o.ally);
    if (!hero || !this.canAct(hero)) return;
    const traversed=[{x:hero.x,z:hero.z}];
    for (const p of o.path) {
      if (!neighbors(this.map,hero,this.occupied(hero.id)).some(n=>n.x===p.x && n.z===p.z)) break;
      Object.assign(hero,p); traversed.push(p); this.surfaceContact(hero,{entry:true});
      if (!this.canAct(hero)) break;
    }
    if (traversed.length>1 && o.aid) hero.opening={owner:o.owner,enemy:o.enemy};
    this.emit("move",{steps:[{heroId:hero.id,points:traversed}]});
  },
  senseDungeon(h,sense,radius) {
    if (this.mode==="town") throw new Error("Use this sense on a dungeon floor.");
    const discoveries=this.discoveries(), facts=[];
    const inside=p=>distance(h,p)<=radius;
    if (["all","magic"].includes(sense)) for (const c of this.map.chests.filter(inside))
      if (c.items?.some(i=>i.base || i.appearance || i.kind==="recall")) {
        this.seen[key(c.x,c.z)]=true; facts.push("An aura at "+key(c.x,c.z));
      }
    if (["all","traps"].includes(sense) && this.map.vault && inside(this.map.vault.door)) {
      const v=this.map.vault; this.seen[key(v.door.x,v.door.z)]=true; this.seen[key(v.seam.x,v.seam.z)]=true;
      facts.push(v.alarm || v.quiet ? "The postern’s alarm is spent" : "The postern rings a watch bell. A silver seam bypasses its wire");
    }
    if (["all","creatures"].includes(sense)) for(const e of this.enemies.filter(e=>e.hp>0 && inside(e))) {
      this.breakConcealment(e); this.seen[key(e.x,e.z)]=true; facts.push(e.name+" at "+key(e.x,e.z));
    }
    if (["all","path"].includes(sense)) {
      const exit=this.map.exit; this.seen[key(exit.x,exit.z)]=true;
      facts.push("Descent lies at "+key(exit.x,exit.z));
    }
    const entry=facts.length ? facts.join(" · ") : "Nothing detected nearby.";
    (discoveries.notes ??= []).push({depth:this.map.depth,text:entry});
    discoveries.notes=discoveries.notes.slice(-60); this.note(entry);
  },
  identifyRitual(caster,owner,id) {
    const patient=this.party[owner],h=this.party[caster];
    const find=patient?.treasure?.find(i=>i.instanceId===id && i.carried);
    const training=this.buildStat(h,"identify");
    if (!h || !find || !(find.appearance || find.veiled) || !training || !this.canAct(h) || !["town","exploration"].includes(this.mode))
      throw new Error("Requires a trained, conscious diviner and an unidentified carried find.");
    if (this.mode!=="town" && distance(h,patient)>1) throw new Error("Bring the find beside the diviner.");
    if (this.freeHands(h)<1 || h.sp<3) throw new Error("Identification requires a free hand and 3 SP.");
    h.sp-=3; this.advanceTime(600,{provisions:true});
    const tier=this.heroRoll(h,DEEDS_CLASSES[h.draft.classId]?.casting ?? "knowledge").tier, count={weak:1,standard:2,strong:3}[tier]+training-1;
    if (find.veiled) {
      const facts=[...new Set(find.effects.flatMap(e=>[e.name,e.text,effectStatus(h,e).requirement]).filter(Boolean))];
      find.facts=facts.slice(0,(find.facts?.length ?? 0)+count);
      if (find.facts.length===facts.length) this.identifyFind(find);
      else this.note("Identified property · "+find.facts.at(-1));
    } else this.identifyFind(find);
    this.refreshHero(patient); this.emit("party"); this.emit("change");
  },
};

