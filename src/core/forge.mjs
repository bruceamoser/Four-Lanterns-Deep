import { deedsClasses, deedsOrigins, atlasStudies, fieldOf } from "./deeds-origins.mjs";
import { DEEDS_CLASSES, deedsHero, deedsDP, deedsVitals, disciplinePrice } from "./deeds-development.mjs";
import { bulkCatalog, encumbranceFor } from "./bulk.mjs";
import {
  FORGE_VERSION,
  FORGE_LEVEL_CAP,
  FORGE_DISCIPLINES,
  FORGE_NODES,
  FORGE_NODE,
} from "./forge-catalog.mjs";
import { gameCatalog, POWERS } from "./powers.mjs";
import {
  ancestryBenefits,
  ancestrySelection,
} from "../../public/vendor/hol/rules/ancestry.mjs";
const attributes = [
  "brawn",
  "fortitude",
  "agility",
  "guile",
  "knowledge",
  "reason",
];
export function newForgeDraft() {
  return {
    name: "",
    attributes: Object.fromEntries(attributes.map((k) => [k, 0])),
    traitIds: [],
    languages: { home: "common" },
    classDisciplines: [],
    signatures: {},
    culture: {},
    background: {},
    forge: { version: FORGE_VERSION, nodes: [] },
    progression: { level: 1 },
    kit: "vanguard",
    shopping: [],
    loadout: {},
  };
}
export function forgeCatalog(source) {
  const c = structuredClone(gameCatalog(source));
  c.forge = true;
  const powers = new Set(FORGE_NODES.map((n) => n.power).filter(Boolean));
  const grants = new Set(FORGE_NODES.map((n) => n.grant).filter(Boolean));
  c.choices = c.choices.filter(
    (r) =>
      r.kind !== "ability" ||
      POWERS[r.id]?.signature || powers.has(r.id) ||
      grants.has(r.id) ||
      (r.universal &&
        ![
          "ability-basic-melee",
          "ability-basic-ranged",
          "ability-basic-unarmed",
          "ability-shield-block",
          "ability-basic-throw",
          "ability-command-a-summon",
          "ability-force",
        ].includes(r.id)),
  );
  for (const r of c.choices) {
    if (r.kind === "class")
      r.signatures = Object.fromEntries([1,3,7].map(level => [level,r.signatures[level].filter(id => POWERS[id]?.signature)]));
    if (r.kind === "origin")
      r.pairs = [
        ...new Map(
          r.pairs.map((p) => [
            p.disciplineId,
            { disciplineId: p.disciplineId },
          ]),
        ).values(),
      ];
    if (r.id === "ability-shield-block") r.universal = false;
  }
  for (const entry of FORGE_DISCIPLINES)
    if (!c.choices.some(r=>r.id==="discipline-"+entry.id)) c.choices.push({id:"discipline-"+entry.id,kind:"discipline",name:entry.name});
  for (const [id,origin] of Object.entries(deedsOrigins)) {
    let r=c.choices.find(choice=>choice.id===id);
    if (!r) {r={id,kind:"origin",name:origin.name,pairs:[]}; c.choices.push(r);}
    r.deedsDisciplines=atlasStudies(origin.roots);
  }
  for (const r of c.choices.filter(r=>r.kind==="class")) r.deedsDisciplines=atlasStudies(deedsClasses[r.id]);
  return c;
}
export function forgeOrigins(draft, C) {
  const cls = C.choices.find((r) => r.id === draft.classId),
    origins = [];
  const classId = draft.classDisciplines?.[0];
  if (cls?.kind === "class" && (deedsHero(draft) ? cls.deedsDisciplines : cls.startingDisciplines).includes(classId))
    origins.push({
      source: "Class",
      id: classId.replace("discipline-", "") + ":origin",
    });
  for (const key of ["culture", "background"]) {
    const s = draft[key],
      r = C.choices.find((r) => r.id === s?.id);
    if (
      r?.id.startsWith("origin-" + key + "-") &&
      (deedsHero(draft) ? r.deedsDisciplines?.includes(s.discipline) : r.pairs.some((p) => p.disciplineId === s.discipline))
    )
      origins.push({
        source: key === "culture" ? "Culture" : "Background",
        id: s.discipline.replace("discipline-", "") + ":origin",
      });
  }
  return origins;
}
export function forgeBudget(draft, C) {
  if (deedsHero(draft)) return deedsDP(draft);
  const roots = forgeOrigins(draft, C);
  return (
    8 +
    4 * (Math.min(FORGE_LEVEL_CAP, draft.progression?.level ?? 1) - 1) +
    (roots.length - new Set(roots.map((r) => r.id)).size) * 3
  );
}
export const forgeSpent = (draft) =>
  (draft.forge?.nodes ?? []).reduce(
    (n, id) => n + disciplinePrice(draft, FORGE_NODE[id]),
    0,
  );
export function forgeOwned(draft, C) {
  return new Set([
    ...forgeOrigins(draft, C).map((r) => r.id),
    ...(draft.forge?.nodes ?? []),
  ]);
}
export function forgeRanks(draft, C) {
  const ranks = {};
  for (const id of forgeOwned(draft, C)) {
    const n = FORGE_NODE[id];
    if (n?.rank)
      ranks[`discipline-${n.discipline}`] = Math.max(
        ranks[`discipline-${n.discipline}`] ?? 0,
        n.rank,
      );
  }
  return ranks;
}
export function forgeRequirements(node, draft, C, { budget = true } = {}) {
  const reasons = [],
    owned = forgeOwned(draft, C),
    level = draft.progression?.level ?? 1;
  if (!node) return ["Unknown forge node."];
  if (!deedsHero(draft) && FORGE_DISCIPLINES.some(d=>d.inner===2 && d.id===node.discipline)) return ["Adopt Deeds rules in Greyhaven first."];
  if (owned.has(node.id)) return ["Already learned."];
  if (node.kind === "origin" && level < 2 && !deedsHero(draft))
    reasons.push("Learn additional disciplines from level 2.");
  const mastery = deedsHero(draft) && node.mastery;
  const minimumLevel = mastery ? 7 : (node.minimumLevel ?? 1);
  if (level < minimumLevel)
    reasons.push(`Requires level ${minimumLevel}.`);
  for (const id of node.requires ?? [])
    if (!owned.has(id)) reasons.push(`Unlock ${FORGE_NODE[id]?.name ?? id}.`);
  const ranks = forgeRanks(draft, C);
  if (
    !mastery && node.minimumRank &&
    (ranks[`discipline-${node.discipline}`] ?? 0) < node.minimumRank
  )
    reasons.push(
      `Requires ${FORGE_DISCIPLINES.find((d) => d.id === node.discipline).name} ${["", "I", "II", "III"][node.minimumRank]}.`,
    );
  if (node.investment) {
    const count = (draft.forge?.nodes ?? []).filter(
      (id) =>
        FORGE_NODE[id]?.discipline === node.discipline &&
        !["origin", "rank"].includes(FORGE_NODE[id].kind),
    ).length;
    if (count < node.investment)
      reasons.push(
        `Requires ${node.investment} purchased ${node.discipline} nodes (${count}/${node.investment}).`,
      );
  }
  const cost = disciplinePrice(draft, node);
  if (budget && cost > forgeBudget(draft, C) - forgeSpent(draft))
    reasons.push(
      `Need ${cost} DP; ${forgeBudget(draft, C) - forgeSpent(draft)} available.`,
    );
  return reasons;
}
export function validateForge(draft, C) {
  const errors = [];
  if (
    ![1, FORGE_VERSION].includes(draft.forge?.version) ||
    !Array.isArray(draft.forge.nodes)
  )
    return [
      "This character belongs to an earlier ruleset. Start a new v0.6 journey.",
    ];
  const level = draft.progression?.level;
  if (!Number.isSafeInteger(level) || level < 1 || level > FORGE_LEVEL_CAP)
    return ["Choose a trained level from 1 to 30."];
  const p = structuredClone(draft);
  p.forge.nodes = [];
  for (const id of draft.forge.nodes) {
    const n = FORGE_NODE[id],
      why = forgeRequirements(n, p, C);
    if (why.length) errors.push(`${n?.name ?? id}: ${why.join(" ")}`);
    else p.forge.nodes.push(id);
  }
  return errors;
}
export function forgeRefundPlan(draft, C, id = null) {
  const free = new Set(forgeOrigins(draft, C).map((r) => r.id));
  if (id && free.has(id))
    throw new Error(
      "Starting disciplines are changed through full character respec.",
    );
  const p = structuredClone(draft);
  p.forge.nodes = [];
  const removed = [];
  for (const n of draft.forge.nodes) {
    if (
      id === null ||
      n === id ||
      forgeRequirements(FORGE_NODE[n], p, C, { budget: false }).length
    )
      removed.push(n);
    else p.forge.nodes.push(n);
  }
  return {
    draft: p,
    removed,
    refund: removed.reduce((n, id) => n + disciplinePrice(draft, FORGE_NODE[id]), 0),
  };
}
export function forgeBenefits(draft, C) {
  const owned = forgeOwned(draft, C),
    stats = {},
    profiles = { melee: [1, 1, 2], ranged: [1, 1, 2] },
    upgrades = [],
    abilities = deedsHero(draft) ? ["power-forge-strike", "power-forge-shot", "ability-stabilize"] : [],
    recipes = [];
  if (deedsHero(draft)) {
    const signatures = Object.values(draft.signatures ?? {}).map(id => POWERS[id]).filter(p => p?.signature && p.classId === draft.classId && p.minimumLevel <= draft.progression.level);
    for (const power of signatures) {
      abilities.push(power.id);
      for (const [key,value] of Object.entries(power.buildStats ?? {}))
        stats[key] = Math.max(stats[key] ?? 0,value);
    }
  }
  if (!deedsHero(draft) && draft.traitIds?.includes("trait-human-far-walker")) {
    stats.movement = 1;
    stats.capacity = 2;
  }
  for (const id of owned) {
    const n = FORGE_NODE[id];
    if (!n) continue;
    if (n.power) abilities.push(n.power);
    if (n.grant) abilities.push(n.grant);
    for (const [key, value] of Object.entries(n.stats ?? {}))
      stats[key] = (stats[key] ?? 0) + value;
    if (n.profile) profiles[n.profile.key] = [...n.profile.value];
    if (n.upgrade) upgrades.push(n.upgrade);
    recipes.push(...(n.recipes ?? []));
  }
  return {
    stats,
    profiles,
    upgrades,
    abilities: [...new Set(abilities)],
    recipes: [...new Set(recipes)],
    owned: [...owned],
  };
}
const COMMON = [
  "item-travel-clothes",
  "item-food-bundle",
  "item-water-flask",
  "item-lighting-bundle",
  "item-lesser-healing-bottle",
];
export const FORGE_KITS = {
  vanguard: {
    name: "Vanguard",
    text: "Melee weapon, shield and light armor.",
    items: [
      "item-ordinary-melee-weapon",
      "item-ordinary-shield",
      "item-ordinary-light-armor",
    ],
    held: ["item-ordinary-melee-weapon", "item-ordinary-shield"],
  },
  ranger: {
    name: "Ranger",
    text: "Bow, arrows and a backup melee weapon.",
    items: [
      "item-ordinary-ranged-weapon",
      "item-ammunition-bundle",
      "item-ordinary-melee-weapon",
    ],
    held: ["item-ordinary-ranged-weapon"],
  },
  arcanist: {
    name: "Wayfarer",
    text: "Melee weapon, craft tools and rope.",
    items: ["item-ordinary-melee-weapon", "item-craft-tools", "item-rope-coil"],
    held: ["item-ordinary-melee-weapon"],
  },
  medic: {
    name: "Field medic",
    text: "Melee weapon, field dressings and mixing kit.",
    items: [
      "item-ordinary-melee-weapon",
      "item-field-dressing",
      "item-mixing-kit",
    ],
    held: ["item-ordinary-melee-weapon"],
  },
};
export function forgeCharacter(draft, C) {
  C = bulkCatalog(C);
  const errors = [],
    error = (code, text) => errors.push({ code, text });
  if (!draft?.forge) {
    return {
      valid: false,
      errors: [
        {
          code: "ruleset",
          text: "Start a new v0.6 journey for the discipline forge.",
        },
      ],
      state: { abilities: [], ranks: {}, recipes: [] },
    };
  }
  if (!draft.name?.trim() || draft.name.length > 64)
    error("name", "Choose a name of 1–64 characters.");
  const ancestry = C.choices.find(
      (r) => r.id === draft.ancestryId && r.kind === "ancestry",
    ),
    cls = C.choices.find((r) => r.id === draft.classId && r.kind === "class");
  if (!ancestry) error("ancestry", "Choose an ancestry.");
  if (!cls) error("class", "Choose a class starting point.");
  const attr = draft.attributes ?? {};
  if (
    attributes.some(
      (k) => !Number.isInteger(attr[k]) || attr[k] < (deedsHero(draft) ? -2 : 0) || attr[k] > 2,
    ) ||
    attributes.reduce((n, k) => n + (attr[k] ?? 0), 0) !== 3
  )
    error(
      "attributes",
      "Attributes must total +3 and stay within the allowed range.",
    );
  if (
    draft.traitIds?.length !== 2 ||
    new Set(draft.traitIds).size !== 2 ||
    draft.traitIds.some((id) => !ancestry?.traits.includes(id))
  )
    error("traits", "Choose two distinct ancestry traits.");
  if (deedsHero(draft)) {
    for (const [tier,id] of Object.entries(draft.signatures ?? {}))
      if (!cls?.signatures?.[tier]?.includes(id) || Number(tier) > draft.progression.level)
        error("signature","Choose a signature for this class and trained level.");
    for (const stat of DEEDS_CLASSES[draft.classId]?.minimum ?? [])
      if (attr[stat] < 0) error("class", "This class requires at least 0 " + stat + ".");
    const roots = forgeOrigins(draft, C);
    if (new Set(roots.map(root => fieldOf(root.id))).size < roots.length)
      error("origins", "Choose three distinct starting disciplines.");
  }
  const selection = ancestrySelection(draft, C.choices);
  errors.push(...selection.errors);
  if (forgeOrigins(draft, C).length !== 3)
    error(
      "origins",
      "Choose a discipline starting point for class, culture and background.",
    );
  for (const text of validateForge(draft, C)) error("forge", text);
  const b = forgeBenefits(draft, C),
    benefits = ancestryBenefits(selection.traitIds),
    level = draft.progression?.level ?? 1,
    kit = FORGE_KITS[draft.kit];
  if (!kit) error("equipment", "Choose a starting equipment kit.");
  const receipts = [...COMMON, ...(kit?.items ?? [])].map((id) => ({
    catalogId: id,
    instanceId: id === "item-travel-clothes" ? "creation-outfit" : `kit:${id}`,
    quantity: 1,
  }));
  let spent = 0;
  for (const [i, s] of (draft.shopping ?? []).entries()) {
    const def = C.inventory.equipment.find((r) => r.id === s.id);
    if (
      !def ||
      def.grantOnly ||
      def.specialOrder ||
      !Number.isSafeInteger(s.quantity) ||
      s.quantity < 1 ||
      s.quantity > 99 ||
      !Number.isFinite(def.price) ||
      (def.handChoices?.length && !def.handChoices.includes(s.hands))
    ) {
      error(
        "shopping",
        "Choose valid ordinary equipment, quantity and hand use.",
      );
      continue;
    }
    spent += def.price * s.quantity;
    receipts.push({
      catalogId: s.id,
      instanceId: s.instanceId ?? `purchase:${i}`,
      quantity: s.quantity,
      hands: s.hands,
    });
  }
  if (spent > 60)
    error(
      "coins",
      `Equipment costs ${spent} coins; the starting purse contains 60.`,
    );
  const items = receipts
    .map((r) => {
      const definition = C.inventory.equipment.find(
        (d) => d.id === r.catalogId,
      );
      if (!definition) {
        error("equipment", `Missing equipment ${r.catalogId}.`);
        return null;
      }
      const hands = r.hands ?? definition.handChoices?.[0] ?? 0,
        saved = draft.loadout?.[r.instanceId],
        armor = r.catalogId.match(
          /item-ordinary-(light|medium|heavy)-armor/,
        )?.[1];
      return {
        ...r,
        definition,
        slot: r.catalogId === "item-travel-pack" ? "back" : r.slot,
        hands,
        carried: saved?.carried !== false,
        held:
          saved?.held ??
          (r.instanceId.startsWith("kit:") &&
            !!kit?.held.includes(r.catalogId)),
        worn: armor
          ? (deedsHero(draft) || b.abilities.includes(`ability-wear-${armor}-armor`)) &&
            (saved?.worn ?? r.instanceId.startsWith("kit:"))
          : (saved?.worn ?? r.catalogId === "item-travel-clothes"),
        inventoryDie: definition.inventoryDie,
        bulk: definition.bulk * r.quantity,
      };
    })
    .filter(Boolean);
  if (new Set(items.map((i) => i.instanceId)).size !== items.length)
    error("equipment", "Equipment receipt IDs must be distinct.");
  if (
    items.filter((i) => i.held && i.carried).reduce((n, i) => n + i.hands, 0) >
    2
  )
    error("equipment", "Ready equipment using no more than two hands.");
  const capacity =
      10 +
      3 * (attr.brawn ?? 0) +
      benefits.capacityBonus +
      (b.stats.capacity ?? 0),
    bulk = items
      .filter(
        (i) => i.carried && !(i.worn && i.catalogId === "item-travel-clothes"),
      )
      .reduce((n, i) => n + i.bulk, 0),
    encumbrance = encumbranceFor(bulk, capacity);
  const maximumHp =
      14 +
      (ancestry?.hp ?? 0) +
      (attr.fortitude ?? 0) +
      benefits.maximumHpBonus +
      Math.floor((level - 1) / 2) +
      (b.stats.hp ?? 0),
    speedBase = (ancestry?.speed ?? 4) + benefits.speedBaseBonus,
    unencumberedSpeed = speedBase + (attr.agility ?? 0);
  const languages = [{ id: "common", name: "Common" }],
    dp = forgeBudget(draft, C) - forgeSpent(draft);
  const summary = {
    maximumHp,
    gritGranted: 3 + Math.floor((level - 1) / 6),
    ...(deedsHero(draft) ? deedsVitals(draft, benefits.maximumHpBonus + (b.stats.hp ?? 0),b.stats.maximumSp ?? 0) : {}),
    gritSpent: 0,
    stability: benefits.stability,
    speedBase,
    unencumberedSpeed,
    speed: Math.max(0, unencumberedSpeed - encumbrance),
    capacity,
    capacityBonus: benefits.capacityBonus,
    ancestryTraitIds: selection.traitIds,
    defenseBoons: benefits.defenseBoons,
    vision: {
      lowLightVision: benefits.lowLightVision,
      seismicVisionRange: benefits.seismicVisionRange,
      ruleReferences: [],
    },
    languages,
    startingCoins: 60,
    creationAttributes: { ...attr },
  };
  const state = {
    level,
    stage: "forge",
    dp,
    ranks: forgeRanks(draft, C),
    abilities: b.abilities,
    recipes: b.recipes,
    items,
    languages,
    gritGranted: summary.gritGranted,
    gritSpent: 0,
    purchases: draft.forge.nodes.map((id) => ({ id })),
    pendingSignatures: [],
  };
  return {
    valid: !errors.length,
    errors,
    state,
    summary,
    attributes: { ...attr },
    forge: b,
    inventory: {
      items,
      bulk,
      capacity,
      encumbrance,
      spent,
      startingCoins: 60,
      remainingCoins: 60 - spent,
    },
    resistances: {},
    passiveSources: [],
    development: {
      level,
      current: dp,
      spent: forgeSpent(draft),
      total: forgeBudget(draft, C),
      expired: 0,
    },
    levels: {},
    stages: { 0: state, 1: state },
    play: { inventory: items, languages },
    ledger: [],
  };
}
export function forgePower(spec, h) {
  if (!h?.draft?.forge) return spec;
  const p = structuredClone(spec),
    b = h.preview.forge ?? { stats: {}, profiles: {}, upgrades: [] };
  if (p.id === "power-field-care")
    p.effects.unshift({ kind: "heal", amount: [1, 2, 3] });
  const weaponProfile = p.forgeProfile ?? (!p.forgePower && p.weapon);
  if (weaponProfile) {
    for (const e of p.effects)
      if (e.kind === "damage") {
        e.amount = [...(b.profiles[weaponProfile] ?? [1, 1, 2])];
        if (p.damageType) e.type = p.damageType;
      }
  } else if (!p.forgePower)
    for (const e of p.effects ?? [])
      if (e.kind === "damage")
        e.amount = Array.isArray(e.amount)
          ? e.amount.map((v) => Math.max(1, Math.ceil(v * 0.6)))
          : Math.max(1, Math.ceil(e.amount * 0.6));
  if (p.weapon === "ranged") p.range += b.stats.rangedRange ?? 0;
  for (const u of b.upgrades.filter((u) => u.power === p.id)) {
    if (u.fixedProfile) p.effects.find(e=>e.kind==="damage").amount=[...u.fixedProfile];
    if (u.strongSteps || u.ignoreTarget) Object.assign(p.effects.find(e=>e.kind==="cue"),{...(u.strongSteps ? {strongSteps:u.strongSteps} : {}),...(u.ignoreTarget ? {ignoreTarget:true} : {})});
    if (u.range) p.range = (p.range ?? 0) + u.range;
    for (const e of p.effects ?? []) {
      for (const key of ["damage", "heal", "barrier"])
        if (u[key] && e.kind === key)
          e.amount = Array.isArray(e.amount)
            ? e.amount.map((n) => n + u[key])
            : e.amount + u[key];
      if (u.condition && e.kind === "condition") e.rating += u.condition;
      if (u.cleanse && e.kind === "cleanse") e.amount += u.cleanse;
      if (u.push && ["push", "pull"].includes(e.kind)) e.amount += u.push;
      if (u.turns && e.turns) e.turns += u.turns;
      if (u.rounds && e.rounds) e.rounds += u.rounds;
    }
    if (u.selfWard)
      p.effects.push({
        kind: "barrier",
        amount: u.selfWard,
        turns: 2,
        self: true,
      });
  }
  if (deedsHero(h.draft)) {
    if ((p.id === "power-forge-shot" && b.owned?.includes("marksmanship:0:0")) || (p.id === "power-forge-strike" && b.owned?.includes("arms:0:0"))) p.trainingBoon=1;
    if (p.id === "power-forge-shot") {
      p.normalRange = 12 + (b.stats.rangedRange ?? 0);
      p.range = p.normalRange + 6;
    }
    if (p.spell) {
      p.attribute = DEEDS_CLASSES[h.draft.classId]?.casting ?? "knowledge";
      p.spCost = p.spCost ?? (p.rank <= 1 ? 0 : Math.min(5,(p.rank ?? 2) + Number(!!p.radius)));
    }
    if (p.effects.some(e => e.kind === "damage"))
      for (const e of p.effects) if (["condition","push","pull"].includes(e.kind)) e.minimumBand ??= 1;
    if (p.effects.some(e => e.kind === "wound")) {
      p.effects = p.effects.flatMap(e => e.kind === "wound" ? [{kind:"stabilize"},{kind:"cleanse",keys:["bleeding","poisoned","burning"],amount:3},{kind:"heal",amount:[2,4,6]}] : [e]);
      delete p.supply;
    }
  }
  return p;
}
export function forgePowerText(p) {
  const value = (v) => (Array.isArray(v) ? v.join("/") : v);
  return [
    `${{ main: "Action", maneuver: "Maneuver", reaction: "Reaction", passive: "Passive" }[p.category] ?? "Power"}${p.target === "self" ? "" : ` · range ${p.range ?? 0}`}${p.radius ? ` · radius ${p.radius}` : ""}${p.shape ? ` · ${p.shape}` : ""}${p.shots ? ` · ${p.shots} arrows` : ""}.`,
    p.spell && p.spCost != null ? p.spCost + " SP · " + (p.weapon || p.shield ? "Held focus." : "Free hand required.") : "",
    p.trainingBoon ? "Basic strike training grants 1 Boon on this attack." : "",
    p.normalRange ? "Normal range " + p.normalRange + ". Beyond it, 1 Bane." : "",
    p.attribute && p.effects?.some((e) => ["damage", "heal"].includes(e.kind))
      ? `Roll ${p.attribute}.`
      : "",
    ...(p.effects ?? []).map(
      (e) => (e.minimumBand === 1 ? "Standard or Strong · " : e.minimumBand === 2 ? "Strong · " : "") + (
        ({
          damage: `${value(e.amount)} ${e.type} damage.`,
          heal: `Restore ${value(e.amount)} HP.`,
          condition: `Apply ${e.key} ${e.rating}.`,
          barrier: `Absorb ${e.amount} damage for ${e.turns} turns.`,
          push: `Push ${e.amount} squares.`,
          pull: `Pull ${e.amount} squares.`,
          cleanse: `Remove ${e.amount} temporary severity: ${e.keys?.join(", ")}.`,
          buff: `${Object.entries(e.stats ?? {})
            .map(
              ([k, v]) =>
                `${k} ${v === true ? "enabled" : v > 0 ? "+" + v : v}`,
            )
            .join(", ")} for ${e.turns} turns.`,
          zone: `Create ${e.surface} for ${e.rounds} rounds.`,
          move: `${e.mode} to empty ground.`,
          swap: "Swap with a companion.",
          guard: "Prepare adjacent interception using your Reaction.",
          counter:
            "Prepare one Basic Melee counter after an adjacent physical attack. Requires a readied melee weapon and an unspent Reaction. Remains through your next turn; Shield Block spends the same Reaction.",
          survey: "Reveal the floor layout and containers, not hidden enemies.",
          cue: (e.ally ? "Choose an ally within three squares to move" : "You may step") + " up to " + (e.steps ?? 1) + " square(s)" + (e.strongSteps ? " ("+e.strongSteps+" on Strong)" : "") + (e.safe ? " without reactions." : e.ignoreTarget ? " without a reaction from the target." : ".") + (e.aid ? " The ally gains an attack Boon against the target." : ""),
          sense: "Sense "+e.sense+" within "+e.range+" squares and record what the company discovers.",
          wound: "Treat one recoverable wound using a restoration draught.",
          stabilize: "Stabilize a dying companion.",
          reveal: "Reveal the target.",
          resource: `Restore/queue one ${e.resource}.`,
        })[e.kind] ?? e.kind),
    ),
    p.recipes?.length
      ? `Learn ${p.recipes.map((r) => r.replace("recipe-", "").replaceAll("-", " ")).join(", ")}.`
      : "",
    p.passive?.craftSpeed
      ? `Reduce remaining crafting time by ${Math.round(p.passive.craftSpeed * 100)}%. Minimum 5 minutes.`
      : "",
    p.weapon === "ranged" ? "Requires a readied bow and ammunition." : "",
    p.weapon === "melee" ? "Requires a readied melee weapon." : "",
    p.supply
      ? `Supply: ${p.supply.replace("item-", "").replaceAll("-", " ")}.`
      : "",
    p.fieldSupply ? "Outside combat, check a field dressing." : "",
  ]
    .filter(Boolean)
    .join(" ");
}
