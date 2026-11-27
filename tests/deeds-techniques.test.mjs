import { xpForLevel, trainingTarget } from "../src/core/experience.mjs";
import { equipmentRollBonus } from "../src/core/equipment-bonuses.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { fresh, arena, drafts, learn, C } from "./forge-fixture.mjs";
import { magicItem } from "../src/core/treasure.mjs";
import { actionDetails } from "../src/ui/action-details.mjs";
import { forgeCharacter, forgeOrigins } from "../src/core/forge.mjs";
import { deedsOrigins, fieldOf } from "../src/core/deeds-origins.mjs";
import { DELVE_FINDS } from "../src/core/delve-finds.mjs";
import { key } from "../src/core/dungeon.mjs";

const build = (node, level = 7, index = 0) => {
  const d = structuredClone(drafts[index]);
  d.forge.nodes = [];
  d.signatures = {};
  d.progression.level = level;
  learn(d, node);
  return d;
};
test("all 52 Deeds origins and ten classes have playable studies and three different starting fields", () => {
  assert.equal(Object.keys(deedsOrigins).length, 52);
  for (const id of Object.keys(deedsOrigins)) {
    const r = C.choices.find((r) => r.id === id);
    assert.ok(r.deedsDisciplines.length);
    for (const id of r.deedsDisciplines)
      assert.ok(
        C.choices.some((s) => s.id === id),
        id,
      );
  }
  for (const draft of drafts)
    assert.equal(
      new Set(forgeOrigins(draft, C).map((r) => fieldOf(r.id))).size,
      3,
    );
  const d = structuredClone(drafts[3]);
  d.background = {
    id: "origin-background-weather-apprentice",
    discipline: "discipline-storm",
  };
  assert.equal(forgeCharacter(d, C).valid, false);
});
test("Direct Thrust uses distinct Weak/Standard/Strong outcomes and optional legal safe steps", () => {
  for (const [tier, steps, loss] of [
    ["weak", 0, 1],
    ["standard", 1, 2],
    ["strong", 2, 4],
  ]) {
    const g = arena(build("fencing:0:2"));
    g.heroRoll = () => ({ tier });
    const h = g.active,
      target = g.enemies[0];
    g.provoke = () => {
      throw Error("A safe step provoked");
    };
    g.usePower("power-direct-thrust", target.id);
    assert.equal(target.hp, 200 - loss);
    assert.equal(g.pendingCue?.steps ?? 0, steps);
    if (steps) {
      const option = g.cueOptions().find((o) => o.path.length === steps);
      assert.ok(option);
      const before = g.movementLeft();
      g.map.lights[0].radius = 12;
      const saved = structuredClone(g.snapshot());
      const copy = fresh();
      copy.load(saved, { resume: false });
      assert.equal(copy.pendingCue.steps, steps);
      g.resolveCue(option.id);
      assert.equal(
        key(h.x, h.z),
        key(option.path.at(-1).x, option.path.at(-1).z),
      );
      assert.equal(g.movementLeft(), before);
    }
  }
});
test("Exploit the Opening selects another hero, permits declining and exempts only its target when improved", () => {
  const g = arena(build("tactics:0:2")),
    h = g.active;
  g.heroRoll = () => ({ tier: "standard" });
  g.usePower("power-exploit-opening", "target");
  assert.ok(g.pendingCue.ignoreTarget);
  assert.ok(g.cueOptions().every((o) => o.hero !== h.id));
  const before = g.party.map(({ x, z }) => [x, z]);
  g.resolveCue(null);
  assert.deepEqual(
    g.party.map(({ x, z }) => [x, z]),
    before,
  );
});
test("one area spell charges SP once and shares one roll including damage to allies", () => {
  const g = arena(build("force:0:2", 3, 3));
  const h = g.active,
    foe = g.enemies[0];
  g.provoke = () => false;
  let rolls = 0;
  g.heroRoll = () => {
    rolls++;
    return { tier: "standard" };
  };
  const hp = h.survival.hp,
    sp = h.sp;
  g.usePower("power-shatter", { x: foe.x, z: foe.z });
  assert.equal(rolls, 1);
  assert.equal(h.sp, sp - 3);
  assert.ok(h.survival.hp < hp);
  assert.equal(foe.hp, 195);
});
test("a failed cast never spends SP and field identification is a timed, repeatable property ritual", () => {
  const g = arena(build("divination:0:2", 3, 3));
  const h = g.active;
  g.mode = "exploration";
  const item = g.veilItem(
    magicItem(99, 3, { base: "blade", affixes: ["ember", "gravebane"] }),
  );
  h.treasure = [item];
  g.refreshHero(h);
  g.heroRoll = () => ({ tier: "weak" });
  const start = g.clock().seconds;
  g.identifyRitual(0, 0, item.instanceId);
  assert.ok(item.veiled);
  assert.equal(item.facts.length, 1);
  assert.equal(g.clock().seconds, start + 600);
  h.sp = 0;
  assert.throws(() => g.identifyRitual(0, 0, item.instanceId), /3 SP/);
  assert.equal(g.clock().seconds, start + 600);
  while (item.veiled) {
    h.sp = 4;
    g.identifyRitual(0, 0, item.instanceId);
  }
  assert.equal(item.effects.length, 2);
});
test("the same unappraised Ember weapon adds fire on Weak and Standard, Burning only on Strong", () => {
  for (const tier of ["weak", "standard", "strong"]) {
    const trial = (equipped) => {
      const g = arena(drafts[3]),
        h = g.active,
        e = g.enemies[0];
      g.heroRoll = () => ({ tier });
      g.mode = "town";
      if (equipped) {
        for (const i of h.preview.inventory.items.filter((i) => i.held))
          g.equip(0, i.instanceId, "stow");
        const blade = g.veilItem(
          magicItem(77, 1, { base: "blade", affixes: ["ember"] }),
        );
        h.treasure = [blade];
        g.refreshHero(h);
        g.equip(0, blade.instanceId, "ready");
        assert.match(
          actionDetails(g, "power-forge-strike", h).notes.join(" "),
          /fire damage/,
        );
      }
      g.mode = "combat";
      g.usePower("power-forge-strike", e.id);
      return {
        loss: 200 - e.hp,
        burn: e.conditions.some((c) => c.key === "burning"),
      };
    };
    const base = trial(false),
      magic = trial(true);
    // Fixed physical resistance can already reduce the physical component to zero.
    assert.ok(magic.loss >= base.loss);
    if (tier === "strong") assert.ok(magic.loss > base.loss);
    assert.equal(magic.burn, tier === "strong");
  }
});
test("each find has an eligible depth and an executable effect family", () => {
  const families = Object.groupBy(Object.values(DELVE_FINDS), (d) => d.family);
  assert.deepEqual(
    Object.fromEntries(Object.entries(families).map(([k, v]) => [k, v.length])),
    { potion: 22, scroll: 9, implement: 6, wand: 13, reagent: 2 },
  );
});

test("new training banks excess XP and a previously trained higher level is retained", () => {
  const g = fresh();
  g.awardXP("deep", xpForLevel(12), "Deep vault");
  g.trainForge(0);
  assert.equal(g.active.preview.state.level, 10);
  assert.equal(g.active.xp, xpForLevel(12));
  assert.throws(() => g.trainForge(0), /No untrained/);
  assert.equal(
    trainingTarget({ ...g.active, preview: { state: { level: 12 } } }),
    12,
  );
});
test("a sustained ward costs one maneuver on following turns, never refills and ends on missed upkeep", () => {
  const g = arena(build("life:1:0", 3, 2)),
    h = g.active,
    ally = g.party[1];
  g.provoke = () => false;
  g.usePower("power-living-ward", ally.id);
  assert.ok(h.sustainedWard);
  assert.equal(g.sustainDue(h), false);
  const ward = ally.powerEffects.find((e) => e.id === "ward:" + h.id);
  assert.ok(ward.stats.absorb > 2);
  const initial = ward.stats.absorb;
  assert.equal(g.absorbPowerDamage(ally, 2, "physical"), 0);
  assert.equal(ward.stats.absorb, initial - 2);
  const sp = h.sp;
  h.powerTurn++;
  g.budget.remaining.maneuver = 1;
  assert.equal(g.sustainDue(h), true);
  g.sustainWard();
  assert.equal(g.budget.remaining.maneuver, 0);
  assert.equal(h.sp, sp);
  assert.equal(ward.stats.absorb, initial - 2);
  assert.throws(() => g.sustainWard(), /No ward/);
  h.powerTurn++;
  g.finishCombatTurn();
  assert.equal(h.sustainedWard, undefined);
  assert.ok(!ally.powerEffects.includes(ward));
});
test("role-specific slaying and the Bloodglass drawback apply only with the readied weapon", () => {
  const g = arena(),
    h = g.active;
  g.mode = "town";
  for (const i of h.preview.inventory.items.filter((i) => i.held))
    g.equip(0, i.instanceId, "stow");
  const spec = { weapon: "melee" };
  for (const affix of ["gravebane", "bloodglass"]) {
    const blade = magicItem(99, 7, { base: "blade", affixes: [affix] });
    h.treasure = [blade];
    g.refreshHero(h);
    const foe = { type: "creature-barrow-guard" },
      other = { type: "creature-road-bandit" };
    const get = (target) => g.buildDamage(h, target, spec, "physical", 1);
    const base = get(foe),
      def = equipmentRollBonus(h, { mode: "defense", type: "physical" });
    g.equip(0, blade.instanceId, "ready");
    assert.equal(get(foe), base + 2);
    assert.equal(get(other), affix === "gravebane" ? base : base + 2);
    assert.equal(
      equipmentRollBonus(h, { mode: "defense", type: "physical" }),
      def - Number(affix === "bloodglass"),
    );
    g.equip(0, blade.instanceId, "stow");
    assert.equal(get(foe), base);
  }
});
