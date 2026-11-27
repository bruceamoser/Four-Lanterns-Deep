import { Random } from "./dungeon.mjs";

const potion = (name, depth, effect, amount, description) => ({ family: "potion", name, depth, effect, amount, description, die: 4, price: 32 + depth * 4 });
const tool = (family, name, depth, effect, amount, description) => ({ family, name, depth, effect, amount, description, die: family === "wand" ? 6 : null, price: 45 + depth * 7 });

export const DELVE_FINDS = {
  mending: potion("Mending draught", 1, "hp", 6, "Restore 6 HP before Life resistance."),
  clarity: potion("Clarity cordial", 2, "sp", 3, "Restore up to 3 spent Spell Points."),
  antitoxin: potion("Antitoxin", 1, "poisoned", 3, "Remove up to 3 temporary Poisoned."),
  coalsalve: potion("Cindersalve", 1, "burning", 3, "Remove up to 3 temporary Burning."),
  thaw: potion("Winter cordial", 2, "freezing", 3, "Remove up to 3 temporary Freezing."),
  clotting: potion("Redroot tincture", 1, "bleeding", 3, "Remove up to 3 temporary Bleeding."),
  courage: potion("Lionheart tonic", 3, "frightened", 3, "Remove up to 3 temporary Frightened."),
  waking: potion("Bellflower bitters", 2, "dazed", 2, "Remove up to 2 temporary Dazed."),
  fleet: potion("Fleetfoot elixir", 2, "movement", 2, "Gain 2 Speed for three turns."),
  iron: potion("Ironbark cordial", 3, "dr", 1, "Gain 1 physical resistance for three turns."),
  veil: potion("Veilwater", 4, "hidden", true, "Become hidden for three turns. Attacking reveals you."),
  spring: potion("Deepwell elixir", 6, "sp", 7, "Restore up to 7 spent Spell Points."),
  sight: potion("Lantern-eye distillate",3,"light",3,"Reveal a pocket of light around the drinker for four rounds."),
  smokeOil: potion("Smokeheart phial",4,"smoke",1,"Fill the nearby floor with screening smoke for four rounds."),
  ward: potion("Glassward serum",4,"absorb",5,"Absorb the next five damage within three turns."),
  edge: potion("Executioner’s cordial",3,"damage",3,"Add 3 damage to your next attack within three turns."),
  stride: potion("Slipstream tonic",4,"disengage",true,"Leave enemy reach without provoking for the remainder of your turn."),
  blindbane: potion("Clear-eye wash",2,"blinded",3,"Remove up to three temporary Blinded."),
  thawstride: potion("Quicksilver cordial",3,"slowed",3,"Remove up to three temporary Slowed."),
  bitterroot: potion("Bitterroot concentrate",2,"poison",2,"Poison the drinker, applying Poisoned 2."),
  sluggish: potion("Leaden syrup",3,"leaden",2,"Apply Slowed 2 to the drinker."),
  unravel: potion("White ash bitters",5,"purge",2,"Remove two severity from every temporary Burn, Freeze, Bleed and Poison."),
  trail: tool("scroll","Wayfinder’s vellum",2,"path",1,"Record the descent in the company journal."),
  hazard: tool("scroll","Bell-reader’s strip",2,"traps",9,"Expose a nearby vault alarm and its alternate entrance."),
  aura: tool("scroll","Silverleaf assay",1,"magic",8,"Mark nearby enchanted caches in the company journal."),
  sentry: tool("scroll","Watchman’s register",4,"creatures",8,"Reveal enemies within eight squares and record their positions."),
  embers: tool("scroll","Cinder circle",3,"fire",1,"Lay a ring of burning terrain around the reader. It can harm either side."),
  shadow: tool("scroll","Sunless writ",4,"darkness",2,"Darken nearby squares for four rounds."),
  smoke: tool("implement","Smoke shell",2,"smoke",2,"Screen nearby lanes with smoke for four rounds."),
  dressing: tool("implement","Trauma satchel",3,"aid",7,"Restore 7 HP to a living companion within three squares."),
  splint: tool("implement","Field splint",3,"stabilize",1,"Stabilize a dying companion within three squares."),
  spike: tool("implement","Sapping spike",3,"breach",1,"Open an adjacent vault door or seam during exploration without sounding the bell."),
  brand: tool("wand","Brand of cinders",3,"boltFire",4,"Strike a visible enemy for 4 fire damage."),
  splinter: tool("wand","Rime needle",2,"chill",2,"Apply Freezing 2 to a visible enemy."),
  spark: tool("wand","Storm reed",3,"arc",3,"Strike a visible enemy and its adjacent allies for 3 lightning damage each."),
  silence: tool("wand","Rod of quiet",4,"daze",2,"Apply Dazed 2 to a visible enemy."),
  drag: tool("wand","Lodestone hook",3,"drag",3,"Pull a visible enemy three squares toward the bearer."),
  dusk: tool("wand","Moth-wing prism",4,"blind",2,"Blind a visible enemy for two severity."),
  leech: tool("wand","Leechstone",5,"leech",3,"Drain life from an enemy and restore the amount actually lost to the bearer."),
  remedy: tool("wand","Willow switch",3,"aid",5,"Restore 5 HP to a wounded companion within three squares."),
  lightwell: tool("wand","Lantern font",6,"healing",1,"Create healing ground around the bearer for four rounds."),
  chart: tool("scroll", "Surveyor’s chart", 1, "survey", 7, "Map passages within seven squares of the reader."),
  farChart: tool("scroll", "Echo atlas", 5, "survey", 16, "Map terrain within sixteen squares of the reader."),
  beacon: tool("wand", "Lantern wand", 2, "light", 3, "Light a three-square area around the user for four rounds."),
  mist: tool("scroll", "Script of concealment", 2, "hidden", true, "Conceal the reader for three turns. Attacking reveals you."),
  rain: tool("wand", "Rainmaker", 2, "water", 1, "Douse nearby burning ground with water for four rounds."),
  rescue: tool("wand", "Shepherd’s crook", 4, "rescue", 2, "Draw a living companion within six squares up to two squares toward the wielder."),
  repulse: tool("wand", "Wand of repulsion", 3, "repulse", 2, "Push one visible enemy within six squares away by two. Resolve collisions."),
  snare: tool("implement", "Recovered binding snare", 1, "snare", 2, "Apply Slowed 2 to one visible enemy within three squares."),
  glare: tool("implement", "Firestarter’s flare", 1, "light", 2, "Light the nearby floor for four rounds."),
  revenant: tool("reagent", "Ash of the Last Witness", 8, "rite", 1, "Bring this ash and a grave pearl to the Hall to restore one fallen hero."),
  pearl: tool("reagent", "Grave pearl", 6, "rite", 1, "Bring this pearl and Ash of the Last Witness to the Hall to restore one fallen hero."),
};
const vessels = ["Blue striped", "Smoky spiral", "Amber flecked", "Ivory ribbed", "Green square", "Obsidian ridged", "Violet banded", "Silver teardrop", "Ochre hexagonal", "Rose knotted", "White speckled", "Crimson twisted","Bronze veined","Lavender squat","Verdigris fluted","Gray pearled","Clear prismatic","Brown spiral","Indigo squat","Yellow tapered","Green ribbed","Milky blue"];

export function bottleNames(seed) {
  const patterns = [...vessels], rng = new Random(seed);
  for (let i = patterns.length - 1; i > 0; --i) {
    const j = rng.int(0, i);
    [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
  }
  return Object.fromEntries(Object.keys(DELVE_FINDS).filter(k => DELVE_FINDS[k].family === "potion").map((k, i) => [k, patterns[i] + " bottle"]));
}

export function delveFind(key, instanceId, appearance = null) {
  const def = Object.hasOwn(DELVE_FINDS, key) && DELVE_FINDS[key];
  if (!def || typeof instanceId !== "string" || !instanceId) throw new Error("Unknown dungeon find.");
  return {
    kind: "find", catalogId: "delve-" + key, find: key, appearance, instanceId, icon: def.family === "potion" ? "potion" : def.family === "scroll" ? "book" : "star",
    inventoryDie: def.die, quantity: 1, carried: true, held: false, worn: false, hands: 0, bulk: 0.5,
    definition: { id: "delve-" + key, name: appearance ?? def.name, bulk: 0.5, price: appearance ? 10 : def.price },
  };
}
export function rollFind(rng, depth, families) {
  const eligible = Object.keys(DELVE_FINDS).filter(k => families.includes(DELVE_FINDS[k].family) && DELVE_FINDS[k].depth <= depth);
  return eligible.length ? eligible[rng.int(0, eligible.length - 1)] : null;
}

