import { Random, distance, key } from "./dungeon.mjs";
import { ordinaryItem } from "./treasure.mjs";

// Put the two entrances beyond the easternmost carved cell so neither can be bypassed around a corner.
export function furnishDelve(map) {
  const rng = new Random(map.seed ^ Math.imul(map.depth, 22695477));
  // Join two far rooms independently of the original construction chain.
  const first = map.rooms[1], far = map.rooms.at(-2);
  if (map.rooms.length >= 5) {
    let x=first.cx,z=first.cz;
    const carve=()=>{map.tiles[key(x,z)] ??= {x,z};map.tiles[key(x+1,z)] ??= {x:x+1,z};};
    while (z!==far.cz) {carve();z+=Math.sign(far.cz-z);}
    while (x!==far.cx) {carve();map.tiles[key(x,z+1)] ??= {x,z:z+1};x+=Math.sign(far.cx-x);}
    carve();
  }
  for (const [i,c] of map.chests.entries()) {
    c.grade=map.depth>=5 && rng.next()<.22 ? "iron" : "wood";
    if (i === 0 || i === map.chests.length - 1 || rng.next() < .35) continue;
    c.dropped = true;
    c.coins = rng.int(0,5);
    c.recipeSearched = true;
    delete map.obstacles[key(c.x,c.z)];
  }
  if (map.depth < 2) return;
  if (map.depth % 4 !== 2 && rng.next() >= .25) return;
  const anchor = [...map.rooms.slice(1)].sort((a,b) => b.x+b.w-a.x-a.w)[0];
  if (!anchor) return;
  const east = Math.max(...Object.values(map.tiles).map(t => t.x)) + 3;
  const north = anchor.cz - 3;
  const carve = (x,z) => { map.tiles[key(x,z)] ??= {x,z}; delete map.obstacles[key(x,z)]; };
  for (let x=east+1; x<=east+6; x++)
    for (let z=north; z<=north+6; z++) carve(x,z);
  const door = {x:east,z:north+1}, seam = {x:east,z:north+5};
  for (const entry of [door,seam]) {
    for (let x=anchor.cx; x<=east; x++) carve(x,entry.z);
    map.obstacles[key(entry.x,entry.z)] = true;
  }
  const room = {x:east+1,z:north,w:6,h:7,cx:east+3,cz:north+3,vault:true};
  map.rooms.splice(map.rooms.length-1,0,room);
  map.vault = {door,seam,bell:{x:east+3,z:north+2}, quiet:false, alarm:false};
  map.chests.splice(Math.max(1,map.chests.length-1),0,{id:"trapkeepers-cache",x:east+5,z:north+3,coins:rng.int(6,14)+map.depth,opened:false,vault:true});
}
export const vaultMethods = {
  vaultFixtures() {
    const v = this.map.vault;
    if (!v) return [];
    const list = [];
    if (!v.door.open) list.push({...v.door,id:"vault:door",kind:"vaultDoor",name:"Ironbound postern",action:"Open the postern",description:"The lock is wired to a bell. A hero trained in Subterfuge or Craft can bypass it quietly. Forcing the door sounds the alarm."});
    if (!v.seam.open) list.push({...v.seam,id:"vault:seam",kind:"ore",name:"Silver-bearing seam",action:"Work the seam",description:"Carve a second entrance and recover silver ore. Craft training or carried tools shorten the work."});
    if (!v.quiet && !v.alarm) list.push({...v.bell,id:"vault:bell",kind:"bell",name:"Watch bell",action:"Cut the bell cord",description:"Silence the trapkeeper’s call for reinforcements."});
    return list.map(item=>({...item,available:true}));
  },
  ringVault() {
    const v = this.map.vault;
    if (!v || v.quiet || v.alarm) return false;
    v.alarm = true;
    const keeper = this.enemies.find(e=>e.vaultKeeper && e.hp>0);
    if (!keeper) return false;
    const guard = this.enemies.filter(e=>e.hp>0 && e.group!==keeper.group && !e.boss && !this.encounter?.roster.some(r=>r.id===e.id))
      .sort((a,b)=>distance(a,keeper)-distance(b,keeper))[0];
    if (guard) guard.group=keeper.group;
    this.note(guard ? "A watch bell rings. "+guard.name+" answers the trapkeeper’s call." : "The vault bell echoes through the passages.");
    if (this.mode === "combat" && guard) this.encounter = this.R.changeRoster(this.encounter,{id:guard.id,side:"opposition",mode:"join-next-round",reason:"watch bell"});
    if (this.mode === "exploration") this.detect([keeper]);
    this.emit("world-objects");
    return true;
  },
  workVault(item) {
    const v = this.map.vault, heroes=this.party.filter(h=>this.canAct(h) && distance(h,item)<=this.touchRange(h));
    if (!v || !heroes.length) throw new Error("Move beside the mechanism.");
    if (item.id === "vault:bell") {
      v.quiet=true; this.note("The bell cord falls silent.");
    } else if (item.id === "vault:door") {
      const trained=heroes.some(h=>h.preview.state.ranks["discipline-subterfuge"] || h.preview.state.ranks["discipline-craft"]);
      delete this.map.obstacles[key(item.x,item.z)];
      v.door.open=true;
      this.note(trained ? "The company disconnects the wire and picks the postern." : "The company forces the ironbound postern.");
      if (trained) this.advanceTime(60,{provisions:true}); else this.ringVault();
    } else {
      const trained=heroes.some(h=>h.preview.state.ranks["discipline-craft"] || h.preview.inventory.items.some(i=>i.carried && i.catalogId==="item-craft-tools"));
      delete this.map.obstacles[key(item.x,item.z)];
      v.seam.open=true;
      this.advanceTime(trained ? 300 : 1200,{provisions:true});
      const ore=ordinaryItem(this.C,"item-material-bundle","vault-ore-"+this.map.lootSeed);
      this.map.chests.push({id:"vault-silver",x:item.x,z:item.z,dropped:true,opened:false,coins:6+this.map.depth*2,items:[ore],recipeSearched:true});
      this.note("The seam opens into the vault. Silver and workable stone lie at your feet.");
    }
    this.emit("world-objects"); this.emit("change");
  },
};

