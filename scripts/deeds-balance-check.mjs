import assert from "node:assert/strict";
import { fresh, drafts, C, learn } from "../tests/forge-fixture.mjs";
import { forgeCharacter } from "../src/core/forge.mjs";
import { Random } from "../src/core/dungeon.mjs";
import { DELVE_FINDS } from "../src/core/delve-finds.mjs";

const seeds = new Random(906701);
const report = [];
for (const [level, depth] of [
  [1, 1],
  [3, 6],
  [7, 12],
  [10, 20],
]) {
  const g = fresh();
  const builds = drafts.map((source, index) => {
    const d = structuredClone(source);
    d.progression.level = level;
    const signatures = C.choices.find((c) => c.id === d.classId).signatures;
    for (const tier of [1, 3, 7].filter((t) => t <= level))
      d.signatures[tier] = signatures[tier][0];
    if (index === 0 && level >= 7) learn(d, "arms:0:4");
    if (index === 1) {
      if (level === 1) d.forge.nodes = ["marksmanship:0:0", "marksmanship:0:1"];
      learn(d, "flame:origin");
      if (level >= 3) learn(d, "intersection:flaming-arrow");
    }
    return d;
  });
  // At entry level the hybrid chooses an early bow technique to afford its second field.
  g.campaign.party = builds.map((d, i) => {
    const preview = forgeCharacter(d, C);
    assert.ok(preview.valid, JSON.stringify(preview.errors));
    return g.hero(d, i);
  });
  const counts = {
    floors: 0,
    vaults: 0,
    chests: 0,
    loose: 0,
    foes: 0,
    carriers: 0,
    magic: 0,
    loot: 0,
    sampledPickups: 0,
    immediateSales: 0,
  };
  const families = new Set(),
    identities = new Set(),
    carrierItems = {};
  let min = Infinity,
    max = 0;
  for (let i = 0; i < 64; i++) {
    g.campaign.seed = seeds.int(1, 2147483646);
    g.campaign.depth = depth;
    g.campaign.generatedMagic = [];
    g.campaign.lootGeneration = 0;
    delete g.campaign.discoveries;
    g.newFloor();
    counts.floors++;
    counts.vaults += Number(!!g.map.vault);
    counts.chests += g.map.chests.filter((c) => !c.dropped).length;
    counts.loose += g.map.chests.filter((c) => c.dropped).length;
    const groupCount = new Set(g.enemies.map((e) => e.group)).size;
    assert.ok(groupCount > 0);
    counts.foes += g.enemies.length;
    for (const enemy of g.enemies) g.creatureTreasure(enemy);
    const carriers = g.map.chests.filter((c) => c.id.startsWith("spoils-"));
    counts.carriers += carriers.length;
    for (const c of carriers)
      carrierItems[c.items.length] = (carrierItems[c.items.length] ?? 0) + 1;
    for (const c of g.map.chests)
      for (const item of c.items ?? []) {
        counts.loot++;
        if (item.base) {
          counts.magic++;
          families.add("enchanted");
        }
        if (item.find) {
          families.add(DELVE_FINDS[item.find].family);
          identities.add(item.find);
        }
        if (item.kind === "ordinary") families.add("supplies");
      }
    // Compare a fixed purchasing policy separately from the generator totals. Keep
    // enchantments and unidentified items. Sell duplicate labeled supplies to town.
    const sample = g.map.chests
      .filter((c) => !c.guardBossId)
      .flatMap((c) => (c.items ?? []).map((item) => ({ c, item })))
      .slice(0, 8);
    const owned = new Set(
      g.party.flatMap((h) =>
        h.preview.inventory.items
          .filter((i) => i.carried)
          .map((i) => i.catalogId),
      ),
    );
    for (const [index, { c, item }] of sample.entries()) {
      const slot = index % 4,
        h = g.party[slot];
      g.mode = "exploration";
      Object.assign(h, { x: c.x, z: c.z });
      g.takeTreasure("coffer:" + c.id, item.instanceId, slot);
      counts.sampledPickups++;
      if (
        item.kind === "ordinary" &&
        owned.has(item.catalogId) &&
        item.definition.price > 0
      ) {
        g.mode = "town";
        g.sell("alchemy", slot, item.instanceId);
        counts.immediateSales++;
      }
      owned.add(item.catalogId);
    }
    // The next seed represents a new company with the same builds and starter kit.
    g.campaign.party = builds.map((d, i) => g.hero(d, i));
    min = Math.min(min, g.enemies.length);
    max = Math.max(max, g.enemies.length);
  }
  assert.ok(
    counts.loot &&
      counts.magic &&
      counts.carriers &&
      counts.carriers < counts.foes,
  );
  report.push({
    level,
    depth,
    ...counts,
    foesPerFloor: [min, max],
    families: [...families].sort(),
    distinctFinds: identities.size,
    carrierItems,
  });
}
console.log(JSON.stringify(report, null, 2));
