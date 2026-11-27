import { Random, distance, key, lineOfSight } from "./dungeon.mjs";
import { DELVE_FINDS, bottleNames, delveFind, rollFind } from "./delve-finds.mjs";
import { CREATURE_ROSTER } from "./creature-roster.mjs";
import { ITEM_BASES, magicItem, ordinaryItem } from "./treasure.mjs";
import { heroCanSee } from "./lighting.mjs";

const restorative = new Set(["blinded","slowed","poisoned", "burning", "freezing", "bleeding", "frightened", "dazed"]);
const hash = (s, seed) => [...s].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, seed);
export const APPRAISAL_PRICE = 20;

const enemyFinds = new Set(["repulse","snare","boltFire","chill","arc","daze","drag","blind","leech"]);
const terrainFinds = new Set(["light","water","fire","darkness","smoke","healing"]);
export const discoveryMethods = {
  discoveries() {
    return (this.campaign.discoveries ??= { seed: this.campaign.seed, known: [], tried: [] });
  },
  createFind(id, receipt, { labeled = false } = {}) {
    const book = this.discoveries();
    const unknown = !labeled && DELVE_FINDS[id].family === "potion" && !book.known.includes(id);
    return delveFind(id, receipt, unknown ? bottleNames(book.seed)[id] : null);
  },
  veilItem(item) {
    if (!item) return null;
    item.veiled = true;
    item.appraisedName = item.definition.name;
    item.definition = { ...item.definition, name: "Unidentified " + ITEM_BASES[item.base].name.toLowerCase() };
    return item;
  },
  identifyFind(item) {
    if (item.veiled) {
      const known = magicItem(item.seed, item.depth, item);
      item.definition = { ...known.definition, name: item.appraisedName ?? known.definition.name };
      item.veiled = false;
      delete item.facts;
    } else if (item.appearance) {
      const book = this.discoveries();
      if (!book.known.includes(item.find)) book.known.push(item.find);
      const roster = [...this.party, ...this.campaign.reserve, ...this.campaign.fallenHeroes.map(e => e.hero)];
      const copies = [...roster.flatMap(h => h.treasure ?? []), ...[this.map, this.campaign.returnPassage?.floor?.map].flatMap(map => (map?.chests ?? []).flatMap(c => c.items ?? []))];
      for (const copy of [item, ...copies]) if (copy.find === item.find) {
        copy.appearance = null;
        copy.definition = delveFind(copy.find, copy.instanceId).definition;
      }
    } else throw new Error("This item is already identified.");
    for (const h of [...this.party, ...this.campaign.reserve]) this.refreshHero(h);
    this.note("Identified " + item.definition.name + ".");
  },
  appraise(index, id) {
    const item = this.party[index]?.treasure?.find(i => i.instanceId === id && i.carried);
    if (this.mode !== "town" || !(item?.veiled || item?.appearance)) throw new Error("Bring an unidentified find to Vale’s Crucible.");
    if (this.campaign.bank < APPRAISAL_PRICE) throw new Error("The company needs " + APPRAISAL_PRICE + " coins.");
    this.identifyFind(item);
    this.campaign.bank -= APPRAISAL_PRICE;
    this.emit("party");
    this.emit("change");
  },
  treasureDraw(source, seed, depth) {
    const rng = new Random(seed), tier = depth + (rng.next() < 0.05 ? 4 : 0);
    const roll = rng.next();
    if (source === "vault" && depth >= 6 && roll < 0.015)
      return this.createFind(depth >= 8 && rng.next() < 0.4 ? "revenant" : "pearl", "rite-" + seed);
    if (roll < (source === "vault" ? 0.38 : source === "coffer" ? 0.17 : 0.045))
      return this.veilItem(this.uniqueMagic(seed, tier));
    if (roll < 0.76) {
      const families = source === "loose" ? ["potion", "scroll", "implement"] : ["potion", "scroll", "wand", "implement"];
      return this.createFind(rollFind(rng, tier, families), "find-" + seed);
    }
    const supplies = ["item-field-dressing", "item-ammunition-bundle", "item-food-bundle", "item-lighting-bundle"];
    return ordinaryItem(this.C, supplies[rng.int(0, supplies.length - 1)], "supply-" + seed);
  },
  rememberCreature(enemy,field,value) {
    if (!enemy?.type || !value) return;
    const book=this.discoveries(); book.creatures ??= {};
    const facts=(book.creatures[enemy.type] ??= {actions:[],drops:[]})[field];
    if (!facts.includes(value)) facts.push(value);
  },
  creatureTreasure(enemy) {
    if (this.map.lootSeed === undefined || enemy.lootResolved || enemy.summoned || !this.enemies.includes(enemy)) return;
    enemy.lootResolved = true;
    const profile = CREATURE_ROSTER[enemy.type];
    if (!profile) return;
    const seed = hash(enemy.id, this.map.lootSeed), rng = new Random(seed);
    const wild = ["vermin", "beasts", "elementals", "haunted", "rime", "infernal"].includes(profile.theme);
    if (!enemy.boss && rng.next() >= (wild ? 0.18 : 0.52)) return;
    let item;
    if (enemy.type.endsWith("trapkeeper")) item = this.createFind("snare", "snare-" + seed);
    else if (enemy.type.endsWith("firestarter")) item = this.createFind("glare", "flare-" + seed);
    else if (["bow", "dart"].includes(profile.weapon)) item = ordinaryItem(this.C, "item-ammunition-bundle", "ammo-" + seed);
    else if (wild) {
      item = ordinaryItem(this.C, "item-material-bundle", "material-" + seed);
      item.materialType = ["haunted", "elementals", "infernal"].includes(profile.theme) ? "recipe-lesser-healing-bottle" : "recipe-travel-food";
    } else item = this.treasureDraw(enemy.boss ? "vault" : "loose", seed, this.map.depth);
    const items=item ? [item] : [];
    if (!wild && (enemy.boss || (profile.depth>=4 && rng.next()<.3))) {
      const bonus=this.treasureDraw(enemy.boss ? "vault" : "loose",rng.int(0,2147483646),this.map.depth);
      if (bonus) items.push(bonus);
    }
    const coins = wild ? 0 : rng.int(0, 3 + this.map.depth);
    if (!items.length && !coins) return;
    this.map.chests.push({ id: "spoils-" + enemy.id, x: enemy.x, z: enemy.z, dropped: true, opened: !coins, coins, recipeSearched: true, items });
    for (const drop of items) this.rememberCreature(enemy,"drops",drop.definition.name);
    this.emit("world-objects");
  },
  findTargets(h, item) {
    const effect = DELVE_FINDS[item.find].effect;
    if (enemyFinds.has(effect)) return this.enemies.filter(e => this.mode === "combat" && e.hp > 0 && distance(h, e) <= (effect === "snare" ? 3 : 6) && this.encounter.roster.some(p => p.id === e.id && !p.withdrawn) && heroCanSee(this.map, this.party, h, e) && lineOfSight(this.map, h, e));
    if (["aid","stabilize"].includes(effect)) return this.party.filter(p=>!["dead","lastWords"].includes(p.survival.status) && distance(h,p)<=3 && lineOfSight(this.map,h,p) && (effect==="stabilize" ? p.survival.status==="dying" : p.survival.hp < this.healingMaximum(p)));
    if (effect === "breach") return this.vaultFixtures().filter(f=>this.mode==="exploration" && ["ore","vaultDoor"].includes(f.kind) && distance(h,f)<=1);
    if (effect === "rescue") return this.party.filter(p => p !== h && p.survival.status !== "dead" && distance(h, p) <= 6 && lineOfSight(this.map, h, p));
    return [h];
  },
  useFind(index, id, targetId) {
    const h = this.party[index], item = h?.treasure?.find(i => i.kind === "find" && i.instanceId === id && i.carried);
    if (!item || !["town", "combat", "exploration"].includes(this.mode) || this.busy || !this.canAct(h)) throw new Error("Choose a capable bearer and a carried find.");
    const d = DELVE_FINDS[item.find], target = this.findTargets(h, item).find(t => t.id === targetId);
    if (!target || d.family === "reagent") throw new Error("Choose a legal target.");
    if (d.family !== "potion" && this.mode === "town") throw new Error("Use this in the dungeon.");
    if (this.freeHands(h) < 1) throw new Error("Free one hand first.");
    if (d.die && !this.supplyValue(h, item)) throw new Error("This supply is exhausted.");
    if (this.mode === "combat") {
      if (h !== this.active || this.encounter.nextSide !== "players") throw new Error("Wait for the bearer’s turn.");
      this.spend(d.family === "potion" ? "maneuver" : "main", id);
      if (this.provoke(h, { kind: "find", index, item: id, target: targetId, label: "using " + item.definition.name })) return;
    }
    const before = item.definition.name;
    let observed = true;
    if (d.effect === "hp") observed = this.powerHeal(h, d.amount) > 0;
    else if (d.effect === "sp") {
      const initial = h.sp ?? 0;
      h.sp = Math.min(h.preview.summary.maximumSp ?? 0, initial + d.amount);
      observed = h.sp > initial;
    } else if (restorative.has(d.effect)) {
      const total = () => (h.conditions ?? []).filter(c => c.key === d.effect && c.persistence === "temporary").reduce((n,c) => n+c.rating,0);
      const initial = total();
      h.conditions = this.R.reduceTemporary(h.conditions, d.effect, d.amount);
      observed = total() < initial;
    } else if (["movement", "dr", "hidden","absorb","damage","disengage"].includes(d.effect)) this.powerBuff(h, h, { [d.effect]: d.amount }, 3, "find-" + item.find);
    else if (d.effect === "survey") {
      for (const tile of Object.values(this.map.tiles)) if (distance(h, tile) <= d.amount) this.seen[key(tile.x, tile.z)] = true;
    } else if (terrainFinds.has(d.effect)) {
      if (this.mode !== "town") this.createSurface(d.effect,Object.values(this.map.tiles).filter(t=>distance(h,t)<=d.amount && (d.effect!=="fire" || distance(h,t)>0) && lineOfSight(this.map,h,t)),h,4);
      else observed=false;
    }
    else if (["path","traps","creatures","magic"].includes(d.effect)) this.senseDungeon(h,d.effect,d.amount);
    else if (d.effect==="purge") {
      const before=JSON.stringify(h.conditions);
      for (const k of ["burning","freezing","bleeding","poisoned"]) h.conditions=this.R.reduceTemporary(h.conditions,k,d.amount);
      observed=before!==JSON.stringify(h.conditions);
    }
    else if (["poison","leaden","chill","daze","blind"].includes(d.effect)) this.powerCondition(target,{poison:"poisoned",leaden:"slowed",chill:"freezing",daze:"dazed",blind:"blinded"}[d.effect],d.amount,h.id);
    else if (d.effect==="aid") this.powerHeal(target,d.amount);
    else if (d.effect==="stabilize") target.survival=this.R.stabilize(target.survival);
    else if (d.effect==="breach") { this.map.vault[target.kind==="ore"?"seam":"door"].open=true; delete this.map.obstacles[key(target.x,target.z)]; this.emit("world-objects"); }
    else if (d.effect==="boltFire") this.powerDamage(target,d.amount,"fire",h);
    else if (d.effect==="arc") for (const foe of this.enemies.filter(e=>e.hp>0 && distance(e,target)<=1 && this.encounter.roster.some(r=>r.id===e.id && !r.withdrawn))) this.powerDamage(foe,d.amount,"lightning",h);
    else if (d.effect==="leech") { const hp=target.hp; this.powerDamage(target,d.amount,"life",h); this.powerHeal(h,hp-target.hp); }
    else if (d.effect === "snare") this.powerCondition(target, "slowed", d.amount, h.id);
    else if (["repulse","rescue","drag"].includes(d.effect)) {
      const direction = d.effect === "repulse" ? 1 : -1;
      this.powerForceMove(target, { x: Math.sign(target.x - h.x) * direction, z: Math.sign(target.z - h.z) * direction }, d.effect === "rescue" ? Math.min(d.amount, distance(h, target)-1) : d.amount, h);
    }
    if (item.appearance && observed) this.identifyFind(item);
    else if (item.appearance && !this.discoveries().tried.includes(item.find)) this.discoveries().tried.push(item.find);
    if (d.die) this.checkSupply(h, item, "using " + before);
    else this.removePortableItem(h, id);
    this.refreshHero(h);
    this.note(h.name + " uses " + before + (observed ? " · " + d.description : " · no visible change."));
    this.emit("party");
    this.emit("change");
  },
};
