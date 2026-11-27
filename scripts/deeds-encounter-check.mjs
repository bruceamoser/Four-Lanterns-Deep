// A reproducible four-hero doorway drill using the live combat rules and creature AI.
import assert from "node:assert/strict";
import { arena, drafts, C, R, learn } from "../tests/forge-fixture.mjs";
import { distance, Random } from "../src/core/dungeon.mjs";

for (const useLance of [false, true]) {
  const seeds = new Random(91148);
  for (const [level, type] of [
    [1, "wolf"],
    [3, "goblin-spearhand"],
    [7, "barrow-guard"],
    [10, "wight"],
  ]) {
    const rounds = [],
      outcomes = { cleared: 0, withdrew: 0, timeout: 0 };
    for (let run = 0; run < 16; run++) {
      const g = arena(),
        random = new Random(seeds.int(1, 2147483646));
      g.dice = (n = 3) => Array.from({ length: n }, () => random.int(1, 6));
      g.supplyDie = (n) => random.int(1, n);
      g.rng = random;
      g.campaign.party = drafts.map((source, i) => {
        const d = structuredClone(source);
        d.progression.level = level;
        const signatures = C.choices.find((c) => c.id === d.classId).signatures;
        for (const tier of [1, 3, 7].filter((t) => t <= level))
          d.signatures[tier] = signatures[tier][0];
        if (level >= 7 && i === 0) learn(d, "arms:0:4");
        if (level >= 3 && i === 1) learn(d, "intersection:flaming-arrow");
        return Object.assign(g.hero(d, i), {
          x: i === 0 ? 5 : 6,
          z: i === 0 ? 5 : 4 + i,
        });
      });
      const c = C.creatures.creatures.find(
        (row) => row.id === "creature-" + type,
      );
      g.enemies = Array.from({ length: 3 }, (_, i) => ({
        id: "foe-" + i,
        type: c.id,
        name: c.name,
        x: 4,
        z: 4 + i,
        hp: c.hp.max,
        maxHp: c.hp.max,
        group: 1,
        cv: c.cv,
        stability: c.defenses.stability,
        ammunition: 6,
        conditions: [],
        powerTurn: 0,
        aiState: {},
      }));
      g.encounter = R.startEncounter(
        [
          ...g.party.map((h) => ({ id: h.id, side: "players" })),
          ...g.enemies.map((e) => ({ id: e.id, side: "opposition" })),
        ],
        g.dice(),
      );
      let outcome;
      for (let operation = 0; operation < 200 && !outcome; operation++) {
        if (g.party.some((h) => h.survival.hp === 0)) outcome = "withdrew";
        else if (g.enemies.every((e) => e.hp === 0)) outcome = "cleared";
        else if (g.encounter.round > 10) outcome = "timeout";
        else if (g.pendingDefense) g.resolveReaction(true);
        else if (g.pendingProvocation) g.resolveOpportunity(false);
        else if (g.encounter.nextSide === "opposition") g.enemyTurn();
        else {
          if (!g.encounter.current) {
            const id = R.availableParticipants(g.encounter)[0].id;
            g.selected = g.party.findIndex((h) => h.id === id);
            const limits = g.restrictions(g.active);
            const count = Math.max(limits.dazed, limits.grappled);
            g.beginHero(
              count
                ? ["main", "maneuver", "reaction"].slice(
                    0,
                    Math.max(0, 3 - count),
                  )
                : undefined,
            );
          }
          const h = g.active;
          const names = [
            "power-forge-flaming-arrow",
            ...(useLance ? ["power-ember-lance"] : []),
            "power-forge-shot",
            "power-forge-strike",
            "power-forge-unarmed",
          ];
          let attacked = false;
          for (const id of names) {
            if (attacked || g.powerReason(id, h)) continue;
            for (const e of g.enemies
              .filter((e) => e.hp > 0)
              .sort((a, b) => distance(h, a) - distance(h, b))) {
              try {
                g.powerPlan(id, e.id, h);
              } catch {
                continue;
              }
              g.usePower(id, e.id);
              attacked = true;
              break;
            }
          }
          if (!g.pendingProvocation && !g.pendingDefense && g.encounter.current)
            g.endTurn();
        }
      }
      assert.ok(outcome, "Encounter drill could not finish");
      outcomes[outcome]++;
      rounds.push(g.encounter?.round ?? 1);
    }
    rounds.sort((a, b) => a - b);
    console.log(
      JSON.stringify({
        level,
        type,
        ...outcomes,
        useLance,
        medianRounds: (rounds[7] + rounds[8]) / 2,
      }),
    );
  }
}
