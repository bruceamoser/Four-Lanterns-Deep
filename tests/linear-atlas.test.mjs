import test from "node:test";
import assert from "node:assert/strict";
import { C, R, arena, fresh } from "./forge-fixture.mjs";
import { drafts as examples } from "./game-fixture.mjs";
import { effectStatus, magicItem } from "../src/core/treasure.mjs";
import { Game } from "../src/core/game.mjs";
import {
  LINEAR_PATHS,
  LINEAR_FIELDS,
  studyRoot,
} from "../src/core/linear-atlas.mjs";
import { SPELLS } from "../src/core/spell-pages.mjs";
import { BOOKS } from "../src/core/study-books.mjs";
import { forgeStartingDrafts } from "../src/core/forge-presets.mjs";
import {
  forgeCharacter,
  forgeOwned,
  forgeRequirements,
  forgeRefundPlan,
  forgeBudget,
} from "../src/core/forge.mjs";
import { FORGE_NODE } from "../src/core/forge-catalog.mjs";
import {
  digitalXPForLevel,
  xpForLevel,
  trainingTarget,
  xpProgress,
} from "../src/core/experience.mjs";
import { deedsVitals, rulesLevel } from "../src/core/deeds-development.mjs";
const company = forgeStartingDrafts(examples, C);
function scholar(path, stage = 7, index = 3) {
  const d = structuredClone(company[index]);
  d.progression.level = 100;
  d.forge.nodes = [];
  const root = studyRoot(path.field);
  if (!forgeOwned(d, C).has(root)) d.forge.nodes.push(root);
  d.forge.nodes.push(...path.nodes.slice(0, stage).map((n) => n.id));
  return d;
}
test("all 84 ordered arms reach mastery; technique improvements occupy one slot, book sections retain earlier pages", () => {
  assert.equal(LINEAR_FIELDS.length, 21);
  assert.equal(LINEAR_PATHS.length, 84);
  assert.equal(BOOKS.length, 29);
  assert.equal(SPELLS.length, 319);
  assert.equal(new Set(SPELLS.map((p) => p.id)).size, 319);
  for (const path of LINEAR_PATHS) {
    const d = scholar(path, 0);
    for (const n of path.nodes) {
      assert.deepEqual(forgeRequirements(n, d, C), [], n.id);
      if (n.stage < 7)
        assert.ok(forgeRequirements(path.nodes[n.stage], d, C).length);
      d.forge.nodes.push(n.id);
      const p = forgeCharacter(d, C);
      assert.equal(p.valid, true, n.id);
      if (n.spec) {
        assert.equal(p.forge.techniques[n.power], n.id);
        assert.deepEqual(
          p.state.abilities.filter((id) => id.startsWith("technique-")),
          [n.power],
        );
      }
      if (n.pages) {
        const expected = path.nodes.slice(0, n.stage).flatMap((s) => s.pages);
        assert.deepEqual(p.forge.spellbook[path.key.slice(5)], expected);
        assert.ok(expected.every((id) => p.state.abilities.includes(id)));
      }
    }
    const plan = forgeRefundPlan(d, C, path.nodes[2].id);
    assert.deepEqual(
      plan.removed,
      path.nodes.slice(2).map((n) => n.id),
    );
    assert.equal(forgeCharacter(plan.draft, C).valid, true);
  }
});
test("study updates a single hero immediately; a refund and save/reload reconstruct the personal spellbook and pins", () => {
  const g = new Game(R, C);
  g.fresh(company);
  g.pause();
  const wizard = g.party[3],
    healer = g.party[2];
  const before = structuredClone(healer.preview.forge.spellbook);
  const section = FORGE_NODE["book:flame:3"];
  assert.ok(!wizard.preview.state.abilities.includes(section.pages[0]));
  g.editForge(3, { buy: section.id });
  for (const id of section.pages)
    assert.ok(g.availableActions(g.party[3]).some((c) => c.id === id));
  assert.deepEqual(healer.preview.forge.spellbook, before);
  assert.ok(!g.party[3].favorites.includes(section.pages[0]));
  const copy = new Game(R, C);
  copy.load(structuredClone(g.snapshot()), { resume: false });
  assert.deepEqual(
    copy.party[3].preview.forge.spellbook.flame,
    g.party[3].preview.forge.spellbook.flame,
  );
  copy.party[3].favorites = [section.pages[0]];
  copy.editForge(3, { refund: section.id });
  assert.ok(!copy.party[3].favorites.includes(section.pages[0]));
  assert.ok(
    !copy
      .availableActions(copy.party[3])
      .find((c) => c.id === section.pages[0]),
  );
  assert.equal(copy.party[3].preview.forge.spellbook.flame.length, 4);
});
test("all 100 trained levels use bounded growth, actual awards, and the same ten-tier encounter budget", () => {
  const d = structuredClone(company[0]);
  const base = deedsVitals(d);
  assert.equal(digitalXPForLevel(2), 200);
  const g = new Game(R, C);
  g.fresh(company);
  g.pause();
  g.awardXP("first", 200, "First victory");
  assert.equal(g.party[0].earnedLevel, 2);
  const level2 = g.trainForge(0);
  assert.equal(level2.preview.state.level, 2);
  assert.equal(forgeBudget(level2.draft, C) - forgeBudget(d, C), 1);
  for (let l = 1; l <= 100; l++) {
    d.progression.level = l;
    assert.equal(rulesLevel(d), 1 + Math.floor((l - 1) / 11));
    assert.equal(
      deedsVitals(d).maximumSp,
      base.maximumSp + Math.floor((2 * (l - 1)) / 11),
    );
    if (l < 100) assert.ok(digitalXPForLevel(l + 1) > digitalXPForLevel(l));
  }
  assert.equal(forgeCharacter(d, C).valid, true);
  g.awardXP("final", digitalXPForLevel(100), "Final delve");
  assert.equal(g.trainForge(0).preview.state.level, 100);
  assert.equal(xpProgress(g.party[0]).next, null);
});
test("adoption retains lifetime XP, earned progress, identity and inventory; ordinary training cannot change editions", () => {
  const g = fresh(),
    old = g.party[0];
  g.awardXP("legacy", xpForLevel(3) + 120, "Earlier delve");
  g.trainForge(0);
  const h = g.party[0],
    d = g.forgeRespecDraft(0);
  assert.equal(d.forge.version, 3);
  assert.deepEqual(d.traitIds, h.draft.traitIds);
  d.forge.nodes = ["arm:arms:bladework:1"];
  assert.throws(() => g.forgeCommit(0, d), /Rebuild/);
  d.signatures[3] = C.choices.find(c=>c.id===d.classId).signatures[3][0];
  const rebuilt = g.forgeCommit(0, d, { respec: true });
  assert.equal(rebuilt.heroId, old.heroId);
  assert.equal(rebuilt.xp, h.xp);
  assert.equal(trainingTarget(rebuilt), 23);
  assert.equal(rebuilt.preview.summary.maximumHp, h.preview.summary.maximumHp);
  assert.deepEqual(
    rebuilt.preview.inventory.items.map((i) => i.instanceId),
    h.preview.inventory.items.map((i) => i.instanceId),
  );
  assert.ok(xpProgress(rebuilt).current > 0);
  const copy = new Game(R, C);
  copy.load(structuredClone(g.snapshot()), { resume: false });
  assert.equal(copy.party[0].xpOffset, rebuilt.xpOffset);
});
test("every purchased spell page resolves through the game casting authority with its printed SP cost", () => {
  for (const path of LINEAR_PATHS.filter((p) => p.isBook)) {
    const d = scholar(path);
    for (const id of path.nodes.flatMap((n) => n.pages)) {
      const g = arena(d),
        h = g.active,
        p = g.powerSpec(id, h),
        ally = g.party[1],
        enemy = g.enemies[0];
      const printed = BOOKS.find((b) => b.id === p.book).pages.find(
        ([n]) => n === p.page,
      );
      assert.equal(p.spCost, printed[2], id);
      h.sp = h.preview.summary.maximumSp - 6;
      ally.sp = 2;
      ally.survival.hp = 1;
      for (const key of ["poisoned", "dazed", "burning", "slowed"])
        g.powerCondition(ally, key, 2, "sample");
      if (p.effects.every((e) => e.kind === "stabilize")) {
        ally.survival.status = "dying";
        ally.survival.hp = 0;
      }
      if (p.effects.some((e) => e.kind === "refill")) {
        const water = ally.preview.inventory.items.find(
          (i) => i.catalogId === "item-water-flask",
        );
        ally.supplies[water.instanceId] = 4;
      }
      if (p.effects.some((e) => e.kind === "unlockVault"))
        g.map.vault = { door: { x: 6, z: 4, open: false } };
      if (p.ritualMinutes) {
        assert.match(g.actionReason(id, h), /Ritual/);
        g.mode = "exploration";
        g.encounter = null;
      }
      if (p.context) {
        assert.throws(() => g.useAbility(id, null, { subject: "absent" }));
        continue;
      }
      const before = h.sp;
      let target =
        p.target === "self"
          ? h.id
          : p.target === "ally"
            ? ally.id
            : p.target === "enemy"
              ? enemy.id
              : { x: 5, z: 4 };
      if (p.target === "ground" && p.effects.some((e) => e.kind === "damage"))
        target = { x: enemy.x, z: enemy.z };
      if (p.shape === "wall") target = { x: 8, z: 5 };
      assert.equal(g.actionReason(id, h), "", id);
      assert.doesNotThrow(() => g.useAbility(id, target), id);
      if (p.effects.some((e) => e.kind === "unlockVault"))
        assert.equal(g.map.vault.door.open, true);
      if (p.effects.some((e) => e.kind === "recall"))
        assert.ok(g.campaign.returnPassage);
      if (!p.effects.some((e) => e.kind === "transferSP"))
        assert.equal(h.sp, before - p.spCost, id);
    }
  }
});
test("unaffordable and unstudied spells spend nothing; Fire Bolt is cast at zero SP", () => {
  const g = arena(company[3]),
    h = g.active,
    enemy = g.enemies[0];
  h.sp = 0;
  assert.throws(() => g.useAbility("spell-flame-3", enemy.id), /SP/);
  assert.throws(() => g.useAbility("spell-flame-7", enemy.id), /learned/);
  g.useAbility("spell-flame-1", enemy.id);
  assert.ok(enemy.hp < enemy.maxHp);
  assert.equal(h.sp, 0);
});

test("a personal Identify page names a real find and a resurrection page spends its two offerings", () => {
  for (const [book, id] of [
    ["detection", "spell-detection-6"],
    ["restoration", "spell-restoration-a3"],
  ]) {
    const g = new Game(R, C);
    const d = scholar(LINEAR_PATHS.find((p) => p.key === "book:" + book));
    g.fresh([d, ...company.slice(1)]);
    g.pause();
    const h = g.active,
      before = h.sp,
      clock = g.clock().seconds;
    if (book === "detection") {
      const find = g.veilItem(
        magicItem(99, 3, { base: "blade", affixes: ["ember", "gravebane"] }),
      );
      h.treasure = [find];
      g.refreshHero(h);
      const [subject] = g.bookRitualSubjects(id, h);
      g.useAbility(id, null, { subject: subject.id });
      assert.ok(!find.veiled || find.facts.length);
      assert.equal(h.sp, before - 3);
      assert.equal(g.clock().seconds, clock + 600);
    } else {
      const fallen = g.party[1];
      fallen.survival.hp = 0;
      fallen.survival.status = "dead";
      g.recordFallen();
      assert.throws(
        () => g.useAbility(id, null, { subject: fallen.heroId }),
        /Requires/,
      );
      assert.equal(h.sp, before);
      h.treasure = [
        g.createFind("pearl", "pearl"),
        g.createFind("revenant", "ash"),
      ];
      g.refreshHero(h);
      g.useAbility(id, null, { subject: fallen.heroId });
      assert.equal(h.sp, before - 8);
      assert.equal(g.clock().seconds, clock + 8 * 3600);
      assert.equal(g.party[1].survival.hp, 1);
      assert.equal(h.treasure.length, 0);
    }
  }
});
test("elemental gear follows the actual studied book while the sheet shows canonical disciplines", () => {
  const g = new Game(R, C);
  g.fresh(company);
  g.pause();
  const h = g.party[3];
  assert.ok(h.preview.state.ranks["discipline-elements"]);
  assert.equal(h.preview.state.ranks["discipline-flame"], undefined);
  assert.equal(effectStatus(h, { discipline: "flame", rank: 1 }).active, true);
  assert.equal(effectStatus(h, { discipline: "frost", rank: 1 }).active, false);
  g.editForge(3, { refund: "book:flame:1" });
  assert.equal(
    effectStatus(g.party[3], { discipline: "flame", rank: 1 }).active,
    false,
  );
});
test("each active martial stage executes its current technique through the normal action resolver", () => {
  for (const path of LINEAR_PATHS.filter((path) => !path.isBook)) {
    for (const node of path.nodes.filter((n) => n.spec)) {
      const d = scholar(path, node.stage, 0);
      d.kit = node.spec.weapon === "ranged" ? "ranger" : "vanguard";
      const g = arena(d),
        h = g.active,
        ally = g.party[1],
        enemy = g.enemies[0],
        p = g.powerSpec(node.power, h);
      assert.equal(p.name, node.name);
      ally.survival.hp = 1;
      g.powerCondition(ally, "poisoned", 2, "sample");
      g.powerCondition(ally, "dazed", 2, "sample");
      let target =
        p.target === "enemy"
          ? enemy.id
          : p.target === "ally"
            ? ally.id
            : p.target === "self"
              ? h.id
              : { x: 5, z: 4 };
      if (p.target === "ground" && p.effects.some((e) => e.kind === "damage"))
        target = enemy;
      assert.equal(g.actionReason(node.power, h), "", node.id);
      assert.doesNotThrow(() => g.useAbility(node.power, target), node.id);
    }
  }
});
