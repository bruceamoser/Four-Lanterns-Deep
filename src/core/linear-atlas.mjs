import { ARMS } from "./study-arms.mjs";
import { BOOKS } from "./study-books.mjs";
import { SPELLS } from "./spell-pages.mjs";

export const STUDY_COSTS = [1, 2, 2, 3, 4, 4, 5];
export const STUDY_LEVELS = [1, 1, 1, 23, 23, 23, 67];
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
const slug = (name) => name.toLowerCase().replaceAll(" ", "-");
export const studyRoot = (field) => "study:" + field;
const stageRank = (stage) => (stage === 6 ? 3 : stage >= 3 ? 2 : 1);
const stageLevel = (stage) => STUDY_LEVELS[stage];
const amount = [
  [2, 3, 5],
  [3, 4, 6],
  [3, 5, 6],
  [2, 4, 6],
  [3, 5, 7],
  [4, 5, 8],
  [4, 7, 10],
];
const value = [2, 3, 4, 5, 6, 7, 10],
  turns = [1, 1, 2, 2, 2, 3, 3],
  reach = [2, 3, 4, 5, 6, 7, 8];
const act = (target, range, effects, extra = {}) => ({
  category: "main",
  target,
  range,
  effects,
  ...extra,
});
const buff = (stats, t) => ({ kind: "buff", stats, turns: t });
const strike = (stage, extra = {}, effects = [], profile = amount[stage]) =>
  act(
    "enemy",
    1,
    [{ kind: "damage", type: "physical", amount: profile }, ...effects],
    { attribute: "brawn", weapon: "melee", ...extra },
  );
const cue = (steps, extra = {}) => ({
  kind: "cue",
  minimumBand: 1,
  steps,
  ...extra,
});
const condition = (key, rating, minimumBand = 1) => ({
  kind: "condition",
  key,
  rating,
  minimumBand,
});
const guard = (stage, n = 0) => ({
  kind: "barrier",
  amount: value[stage] + n,
  turns: turns[stage],
});
const group = (stage) => (stage >= 6 ? 2 : stage >= 3 ? 1 : 0);
const aid = (stage, effects, extra = {}) =>
  act("ally", reach[stage], effects, { category: "maneuver", ...extra });
const stats = (key, value, extra = {}) => ({
  stats: { [key]: value },
  ...extra,
});
const passive =
  (key, steps, recipes = []) =>
  (s) =>
    stats(
      key,
      steps[s],
      recipes[s] ? { recipes: ["recipe-" + recipes[s]] } : {},
    );
const shield = { shield: true, weapon: undefined };
const sword = (s, extras) => strike(s, {}, extras);
const bow = (s, extras, opts = {}) =>
  strike(
    s,
    {
      range: 12 + Math.floor(s / 2),
      weapon: "ranged",
      attribute: "agility",
      ...opts,
    },
    extras,
  );
const brace = (s, n = 0) => aid(s, [guard(s, n)], { target: "self" });
const escape = (s, extra = []) =>
  act("ground", reach[s], [{ kind: "move", mode: "route" }, ...extra], {
    category: "maneuver",
  });
const scan = (sense, s) =>
  act("self", 0, [{ kind: "sense", sense, range: 4 + 2 * s }], {
    field: true,
    category: "maneuver",
  });
const clean = (s, keys) => ({ kind: "cleanse", amount: 1 + s, keys });
const fixedStep = (s) => [1, 2, 3, 3, 4, 5, 6][s];
const sweep = (s) => ({ target: "self", range: 0, radius: 1, maxTargets: 3 });
const arms = {
  Bladework: (s) =>
    strike(
      s,
      s >= 3 ? sweep(s) : {},
      [
        ...(s < 3 ? [cue(1, { minimumBand: 2 })] : []),
        ...(s === 2 ? [condition("bleeding", 1, 2)] : []),
        ...(s >= 5 ? [{ kind: "push", amount: 1, minimumBand: 2 }] : []),
        ...(s === 6 ? [cue(3, { minimumBand: 0 })] : []),
      ],
      [
        [2, 3, 5],
        [3, 4, 6],
        [3, 4, 6],
        [1, 2, 4],
        [2, 3, 5],
        [2, 3, 5],
        [3, 5, 8],
      ][s],
    ),
  Impact: (s) =>
    sword(s, [
      {
        kind: "push",
        amount: 1 + Math.floor(s / 2),
        minimumBand: s >= 3 ? 0 : 1,
      },
      ...(s >= 2 ? [condition(s >= 4 ? "dazed" : "slowed", 1 + group(s))] : []),
    ]),
  Dueling: (s) =>
    aid(s, [guard(s), ...(s >= 3 ? [{ kind: "counter" }] : [])], {
      target: "self",
      weapon: "melee",
    }),
  Unarmed: (s) =>
    strike(
      s,
      { weapon: undefined, ...(s >= 3 ? sweep(s) : {}) },
      s === 2 || s >= 5 ? [stagger(s)] : [],
    ),
  Advance: (s) => escape(s, [buff({ reduction: 1 + group(s) }, turns[s])]),
  Bracing: (s) =>
    aid(
      s,
      [
        buff({ reduction: 1 + Math.floor(s / 2) }, 1 + (s % 2)),
        ...(s >= 3 ? [guard(s)] : []),
      ],
      { target: "self" },
    ),
  Deflection: (s) => brace(s, 1 + group(s)),
  Harness: (s) =>
    stats("capacity", [1, 1, 2, 1, 2, 2, 3][s], {
      grant:
        s === 0
          ? "ability-wear-light-armor"
          : s === 2
            ? "ability-wear-medium-armor"
            : s === 3
              ? "ability-wear-heavy-armor"
              : undefined,
    }),
  Precision: (s) =>
    strike(
      s,
      {
        weapon: "ranged",
        attribute: "agility",
        range: [8, 8, 12, 8, 12, 12, 12][s],
        ...(s >= 3 ? { radius: 2, maxTargets: 3, volley: true } : {}),
        ...(s === 6 ? { piercePhysical: 2 } : {}),
      },
      [],
      [
        [2, 3, 5],
        [3, 4, 6],
        [3, 4, 6],
        [1, 2, 4],
        [1, 2, 4],
        [2, 3, 5],
        [3, 5, 8],
      ][s],
    ),
  Pinning: (s) =>
    bow(s, [
      condition("slowed", 1 + Math.floor(s / 2)),
      ...(s >= 5 ? [{ kind: "push", amount: 2, minimumBand: 1 }] : []),
    ]),
  Readiness: (s) =>
    bow(s, [cue(1 + group(s), { ally: s >= 3, safe: s >= 2, aid: s >= 5 })]),
  "Thrown Weapons": (s) =>
    strike(
      s,
      {
        range: reach[s],
        weapon: "melee",
        oneHand: true,
        attribute: "agility",
        ...(s >= 3 ? { shape: "line" } : {}),
      },
      s >= 5 ? [condition("bleeding", 2)] : [],
    ),
  Climbing: (s) =>
    escape(s, s >= 3 ? [buff({ movement: 1 + group(s) }, turns[s])] : []),
  Leaping: (s) =>
    act(
      "ground",
      reach[s],
      [{ kind: "move", mode: "leap" }, ...(s >= 3 ? [guard(s)] : [])],
      { category: "maneuver" },
    ),
  Balance: (s) =>
    aid(s, [clean(s, ["slowed", "dazed"]), guard(s)], {
      target: s < 3 ? "self" : "ally",
    }),
  Swimming: (s) =>
    aid(
      s,
      [
        buff({ movement: fixedStep(s) }, turns[s]),
        ...(s >= 3 ? [guard(s)] : []),
      ],
      { target: s < 3 ? "self" : "ally" },
    ),
  Repairs: (s) => aid(s, [guard(s, 1 + group(s))], { radius: group(s) }),
  Mixtures: (s) =>
    act(
      "ground",
      reach[s],
      [{ kind: "zone", surface: "smoke", rounds: 2 + s }],
      { radius: 1 + group(s) },
    ),
  Safeguards: passive(
    "craftDiscount",
    [0.03, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06],
  ),
  Workshop: passive(
    "craftSpeed",
    [0.03, 0.03, 0.04, 0.04, 0.05, 0.05, 0.06],
    [
      "bound-torches",
      "fletched-ammunition",
      "field-dressing",
      "smoke-flask",
      "flash-powder",
      "greater-healing-bottle",
      "restoration-draught",
    ],
  ),
  Pointwork: (s) =>
    strike(
      s,
      { attribute: "agility", oneHand: true },
      [
        cue(s >= 3 ? 2 : 1, { safe: true, strongSteps: s >= 2 ? 2 : 1 }),
        ...(s >= 5 ? [stagger(s)] : []),
      ],
      [
        [1, 2, 4],
        [2, 3, 5],
        [2, 3, 5],
        [2, 4, 5],
        [3, 5, 6],
        [3, 5, 6],
        [4, 7, 9],
      ][s],
    ),
  Footwork: (s) => escape(s, [buff({ defense: 1 + group(s) }, turns[s])]),
  "Blade Contact": (s) =>
    aid(s, [{ kind: "counter" }, guard(s)], {
      target: "self",
      weapon: "melee",
    }),
  "Blade Tricks": (s) =>
    strike(s, { oneHand: true, attribute: "agility" }, [
      stagger(s),
      ...(s >= 3 ? [{ kind: "push", amount: group(s) + 1 }] : []),
    ]),
  Shieldwork: (s) =>
    strike(s, { ...shield, ...(s >= 3 ? sweep(s) : {}) }, [
      { kind: "push", amount: 1 + group(s) },
      ...(s >= 5 ? [stagger(s)] : []),
    ]),
  Shelter: (s) => aid(s, [guard(s, 2)], { shield: true, radius: group(s) }),
  Interception: (s) =>
    aid(s, [{ kind: "guard" }, guard(s)], {
      otherOnly: true,
      range: 1 + group(s),
    }),
  Watchfulness: (s) =>
    aid(s, [{ kind: "swap" }, guard(s)], { otherOnly: true }),
  Negotiation: passive("barter", [0.02, 0.02, 0.03, 0.03, 0.04, 0.04, 0.05]),
  Leadership: (s) =>
    aid(s, [buff({ attack: 1 + group(s) }, turns[s]), guard(s)], {
      radius: group(s),
    }),
  Rejoinder: (s) =>
    act("enemy", reach[s], [buff({ attack: -1 - group(s) }, turns[s])], {
      category: "maneuver",
    }),
  Pressure: (s) =>
    act("enemy", reach[s], [
      { kind: "push", amount: fixedStep(s) },
      ...(s >= 3 ? [condition("dazed", 1 + group(s), 0)] : []),
    ]),
  "First Aid": (s) =>
    aid(
      s,
      [
        { kind: "heal", amount: amount[s] },
        ...(s >= 3 ? [clean(s, ["bleeding"])] : []),
      ],
      { field: true, fieldSupply: "item-field-dressing", category: "main" },
    ),
  Nursing: (s) =>
    aid(s, [clean(s, ["burning", "poisoned"]), guard(s)], {
      field: true,
      fieldSupply: "item-field-dressing",
    }),
  Resuscitation: (s) =>
    aid(
      s,
      [
        { kind: "stabilize" },
        { kind: "heal", amount: [1, 2 + s, 3 + s] },
        ...(s >= 3 ? [guard(s)] : []),
      ],
      { field: true, fieldSupply: "item-field-dressing", category: "main" },
    ),
  Diagnosis: (s) =>
    aid(
      s,
      [
        clean(s, ["bleeding", "dazed", "slowed"]),
        ...(s >= 3 ? [{ kind: "heal", amount: amount[s] }] : []),
      ],
      { field: true, fieldSupply: "item-field-dressing" },
    ),
  Investigation: (s) => scan(s >= 6 ? "all" : s >= 3 ? "magic" : "traps", s),
  Planning: (s) =>
    aid(s, [buff({ movement: 1 + group(s), defense: 1 }, turns[s]), guard(s)]),
  Disputation: (s) =>
    aid(s, [clean(s, ["dazed"]), buff({ defense: 1 + group(s) }, turns[s])], {
      radius: group(s),
    }),
  Languages: (s) => scan(s >= 6 ? "all" : s >= 3 ? "path" : "magic", s),
  Locks: (s) => scan(s >= 6 ? "all" : "traps", s),
  Sleight: (s) => escape(s, [buff({ hidden: true }, turns[s])]),
  Traps: (s) =>
    act(
      "ground",
      reach[s],
      [{ kind: "zone", surface: "trap", rounds: 2 + s }],
      { radius: group(s) },
    ),
  Stealth: (s) =>
    aid(s, [buff({ hidden: true, movement: 1 + group(s) }, turns[s])], {
      target: s < 3 ? "self" : "ally",
      radius: group(s),
    }),
  Openings: (s) =>
    strike(s, { attribute: "knowledge", weapon: undefined }, [
      cue(1 + group(s), { ally: true, safe: s >= 5, aid: s >= 3 }),
    ]),
  Coordination: (s) =>
    aid(s, [buff({ movement: 1 + group(s) }, turns[s]), guard(s)], {
      radius: group(s),
    }),
  Contingencies: (s) =>
    aid(s, [guard(s), buff({ defense: 1 + group(s) }, turns[s])], {
      otherOnly: true,
    }),
  Foresight: (s) =>
    aid(s, [buff({ attack: 1 + group(s), damage: value[s] }, turns[s])], {
      otherOnly: true,
    }),
  Tracking: (s) => scan(s >= 6 ? "all" : "creatures", s),
  "Animal Handling": (s) =>
    act("enemy", reach[s], [
      buff({ movement: -fixedStep(s), attack: -1 - group(s) }, turns[s]),
    ]),
  Trailcraft: (s) => scan(s >= 6 ? "all" : s >= 3 ? "traps" : "path", s),
  Provisioning: passive(
    "forageStudy",
    [2, 2, 2, 3, 3, 3, 5],
    [
      "travel-food",
      null,
      "twisted-cord",
      null,
      "bound-torches",
      null,
      "fletched-ammunition",
    ],
  ),
  "Soul Capacity": passive("maximumSp", [2, 2, 3, 3, 3, 3, 4]),
  "Mind Capacity": passive("maximumSp", [2, 2, 3, 3, 3, 3, 4]),
  Recovery: passive("restSp", [1, 1, 1, 1, 1, 1, 2]),
};
function stagger(s) {
  return condition("dazed", 1 + group(s));
}

export const LINEAR_FIELDS = [
  ...new Set([...ARMS.map((r) => r[0]), ...BOOKS.map((b) => b.field)]),
].sort();
export const LINEAR_NODES = LINEAR_FIELDS.map((discipline) => ({
  id: studyRoot(discipline),
  linear: true,
  kind: "origin",
  name: discipline[0].toUpperCase() + discipline.slice(1),
  discipline,
  cost: 2,
  rank: 1,
  requires: [],
}));
export const LINEAR_PATHS = [];
export const TECHNIQUES = [];
function addPath(field, key, name, isBook, stages) {
  const nodes = stages.map((stage, i) => ({
    id: key + ":" + (i + 1),
    linear: true,
    discipline: field,
    arm: key,
    stage: i + 1,
    kind: isBook ? "section" : "technique",
    cost: STUDY_COSTS[i],
    minimumLevel: stageLevel(i),
    rank: stageRank(i),
    requires: [i ? key + ":" + i : studyRoot(field)],
    ...stage,
  }));
  LINEAR_PATHS.push({ key, field, name, isBook, nodes });
  LINEAR_NODES.push(...nodes);
}
for (const [field, path, base, advanced, master] of ARMS) {
  const key = "arm:" + field + ":" + slug(path),
    stableId = "technique-" + field + "-" + slug(path);
  const stages = ROMAN.map((_, s) => {
    const name =
      s === 6 ? master : (s >= 3 ? advanced : base) + " " + ROMAN[s % 3];
    const payload = arms[path](s);
    if (!payload.effects) return { name, ...payload };
    const spec = {
      id: stableId,
      name,
      description: name,
      linear: true,
      deedsOnly: true,
      gamePower: true,
      forgePower: true,
      discipline: "discipline-" + field,
      rank: stageRank(s),
      ...payload,
    };
    if (!s) TECHNIQUES.push(spec);
    return {
      name,
      power: stableId,
      spec,
      ...(path === "Shieldwork" && s === 0
        ? { grant: "ability-shield-block" }
        : {}),
    };
  });
  addPath(field, key, path, false, stages);
}
for (const book of BOOKS) {
  addPath(
    book.field,
    "book:" + book.id,
    book.title,
    true,
    ROMAN.map((r, i) => {
      const pages = SPELLS.filter(
        (p) => p.book === book.id && p.section === i + 1,
      );
      return {
        name: "Section " + r,
        pages: pages.map((p) => p.id),
        ...(pages.some((p) => p.context === "identify")
          ? { stats: { identify: 1 } }
          : {}),
      };
    }),
  );
}
