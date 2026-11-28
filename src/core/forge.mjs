import { LINEAR_FIELDS, LINEAR_NODES, studyRoot } from "./linear-atlas.mjs";
import { linearHero, signatureLevel } from "./deeds-development.mjs";
import { deedsClasses, deedsOrigins, atlasStudies, fieldOf, startingPurse } from "./deeds-origins.mjs";
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
export function newForgeDraft(version = FORGE_VERSION) {
  return {
    name: "",
    attributes: Object.fromEntries(attributes.map((k) => [k, 0])),
    traitIds: [],
    languages: { home: "common" },
    classDisciplines: [],
    signatures: {},
    culture: {},
    background: {},
    forge: { version, nodes: [] },
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
  for (const n of LINEAR_NODES) { if (n.power) powers.add(n.power); for (const id of n.pages ?? []) powers.add(id); }
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
    r.studies=origin.roots.map(id=>"discipline-"+id);
    r.deedsDisciplines=atlasStudies(origin.roots);
  }
  for (const r of c.choices.filter(r=>r.kind==="class")) { r.deedsDisciplines=atlasStudies(deedsClasses[r.id]); r.studies=deedsClasses[r.id].map(id=>"discipline-"+id); }
  for (const id of LINEAR_FIELDS) if (!c.choices.some(r=>r.id==="discipline-"+id)) c.choices.push({id:"discipline-"+id,kind:"discipline",name:id[0].toUpperCase()+id.slice(1)});
  return c;
}
export function forgeOrigins(draft, C) {
  const cls = C.choices.find((r) => r.id === draft.classId),
    origins = [];
  const classId = draft.classDisciplines?.[0];
  if (cls?.kind === "class" && (linearHero(draft) ? cls.studies : deedsHero(draft) ? cls.deedsDisciplines : cls.startingDisciplines).includes(classId))
    origins.push({
      source: "Class",
      id: linearHero(draft) ? studyRoot(classId.slice(11)) : classId.replace("discipline-", "") + ":origin",
    });
  for (const key of ["culture", "background"]) {
    const s = draft[key],
      r = C.choices.find((r) => r.id === s?.id);
    if (
      r?.id.startsWith("origin-" + key + "-") &&
      (linearHero(draft) ? r.studies?.includes(s.discipline) : deedsHero(draft) ? r.deedsDisciplines?.includes(s.discipline) : r.pairs.some((p) => p.disciplineId === s.discipline))
    )
      origins.push({
        source: key === "culture" ? "Culture" : "Background",
        id: linearHero(draft) ? studyRoot(s.discipline.slice(11)) : s.discipline.replace("discipline-", "") + ":origin",
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
    if (linearHero(draft) && n?.pages) {
      const school = n.arm.slice(5);
      const alias = {flame:"flame",water:"frost",air:"storm"}[school] ?? {mentalism:"mind",invocation:"calling",wards:"radiance"}[n.discipline];
      if (alias) ranks["discipline-"+alias] = Math.max(ranks["discipline-"+alias] ?? 0, n.rank);
    }
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
  if (node && !!node.linear !== linearHero(draft)) return ["This choice belongs to a different Atlas edition."];
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
    ![1, 2, FORGE_VERSION].includes(draft.forge?.version) ||
    !Array.isArray(draft.forge.nodes)
  )
    return [
      "This character belongs to an earlier ruleset. Start a new v0.6 journey.",
    ];
  const level = draft.progression?.level;
  if (!Number.isSafeInteger(level) || level < 1 || level > (linearHero(draft) ? 100 : FORGE_LEVEL_CAP))
    return ["Choose a valid trained level."];
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
export function missingSignatures(draft) {
  return deedsHero(draft) && draft.classId ? [1,3,7].filter(n=>signatureLevel(draft,n)<=draft.progression.level && !draft.signatures?.[n]) : [];
}
export function forgeBenefits(draft, C) {
  const owned = forgeOwned(draft, C),
    stats = {},
    profiles = { melee: [1, 1, 2], ranged: [1, 1, 2] },
    techniques = {}, spellbook = {}, upgrades = [],
    abilities = deedsHero(draft) ? ["power-forge-strike", "power-forge-shot", "ability-stabilize"] : [],
    recipes = [];
  if (deedsHero(draft)) {
    const signatures = Object.values(draft.signatures ?? {}).map(id => POWERS[id]).filter(p => p?.signature && p.classId === draft.classId && signatureLevel(draft,p.minimumLevel) <= draft.progression.level);
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
    if (n.spec) techniques[n.power] = n.id;
    if (n.pages) {
      (spellbook[n.arm.slice(5)] ??= []).push(...n.pages);
      abilities.push(...n.pages);
    }
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
    techniques, spellbook, abilities: [...new Set(abilities)],
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
      if (!cls?.signatures?.[tier]?.includes(id) || signatureLevel(draft,tier) > draft.progression.level)
        error("signature","Choose a signature for this class and trained level.");
    for (const stat of DEEDS_CLASSES[draft.classId]?.minimum ?? [])
      if (attr[stat] < 0) error("class", "This class requires at least 0 " + stat + ".");
    const roots = forgeOrigins(draft, C);
    if (new Set(roots.map(root => linearHero(draft) ? root.id : fieldOf(root.id))).size < roots.length)
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
  const purse=deedsHero(draft) ? startingPurse(draft) : 60;
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
  if (spent > purse)
    error(
      "coins",
      `Equipment costs ${spent} coins; the starting purse contains ${purse}.`,
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
    startingCoins: purse,
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
      startingCoins: purse,
      remainingCoins: purse - spent,
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
  const b = h.preview.forge ?? { stats: {}, profiles: {}, upgrades: [] };
  const p = structuredClone(FORGE_NODE[b.techniques?.[spec.id]]?.spec ?? spec);
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
      if (["power-spirit-ward", "power-living-ward"].includes(p.id)) p.sustained = true;
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
    p.ritualMinutes ? "Ritual · "+p.ritualMinutes+" min outside combat." : "",
    p.maxTargets ? "Up to "+p.maxTargets+" adjacent enemies." : "",
    p.dungeonName ? "Adapted from "+p.printedName+"." : "",
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
          barrier: p.sustained ? "Absorb up to " + e.amount + " damage. Sustain for one Maneuver each following turn, up to one minute. Upkeep costs 0 SP and preserves the remaining ward." : `Absorb ${e.amount} damage for ${e.turns} turns.`,
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
          refill: "Refill a carried water flask to d8.",
          transferSP: (e.draw ? "Draw up to " : "Give up to ")+e.amount+" SP from the donor’s current reserve. Casting costs are separate.",
          identify: "Choose an unidentified carried find. Examine it for hidden properties.",
          returnRite: "Return one fallen hero at the Shrine. Consumes a Grave pearl and Ash of the Last Witness.",
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
