import test from "node:test";
import assert from "node:assert/strict";
import { fresh, arena, drafts } from "./forge-fixture.mjs";
import { magicItem } from "../src/core/treasure.mjs";
import { actionDetails } from "../src/ui/action-details.mjs";
import { serialize, deserialize } from "../src/core/save.mjs";
import { bottleNames } from "../src/core/delve-finds.mjs";
const give = (g, hero, item) => {
  (hero.treasure ??= []).push(item);
  g.refreshHero(hero);
  return item;
};

test("an unknown Ember blade shows and deals fire only for a qualified melee wielder", () => {
  const g = arena(drafts[3]),
    h = g.active;
  const blade = give(
    g,
    h,
    g.veilItem(magicItem(761, 1, { base: "blade", affixes: ["ember"] })),
  );
  for (const item of h.preview.inventory.items.filter((i) => i.held))
    g.equip(0, item.instanceId, "stow");
  g.mode = "town";
  g.equip(0, blade.instanceId, "ready");
  assert.match(
    actionDetails(g, "power-forge-strike", h).notes.join(" "),
    /\+1 fire damage/,
  );
  assert.doesNotMatch(
    actionDetails(g, "power-forge-shot", h).notes.join(" "),
    /\+1 fire damage/,
  );
  g.campaign.bank = 20;
  g.appraise(0, blade.instanceId);
  assert.equal(
    h.treasure.find((i) => i.instanceId === blade.instanceId).veiled,
    false,
  );
  assert.equal(g.campaign.bank, 0);
  assert.throws(() => g.appraise(0, blade.instanceId));
  g.equip(0, blade.instanceId, "stow");
  g.transferTreasure(0, blade.instanceId, 1);
  g.equip(1, blade.instanceId, "ready");
  assert.doesNotMatch(
    actionDetails(g, "power-forge-strike", g.party[1]).notes.join(" "),
    /\+1 fire damage/,
  );
});

test("bottle appearance is run-wide and inconclusive use survives as tried until a discovery", () => {
  const g = fresh(),
    h = g.party[3];
  const item = give(g, h, g.createFind("mending", "sample-one"));
  const other = give(g, g.party[0], g.createFind("mending", "sample-two"));
  g.supplyDie = () => 4;
  assert.equal(item.appearance, other.appearance);
  assert.equal(new Set(Object.values(bottleNames(121))).size, 22);
  g.useFind(3, item.instanceId, h.id);
  assert.deepEqual(g.discoveries().tried, ["mending"]);
  assert.deepEqual(g.discoveries().known, []);
  h.survival.hp -= 6;
  g.useFind(3, item.instanceId, h.id);
  assert.equal(h.survival.hp, h.survival.maxHp);
  assert.deepEqual(g.discoveries().known, ["mending"]);
  assert.equal(other.appearance, null);
  const loaded = fresh();
  loaded.load(deserialize(serialize(g.snapshot())), { resume: false });
  assert.equal(
    loaded.createFind("mending", "sample-three").definition.name,
    "Mending draught",
  );
  assert.equal(
    loaded.party[0].preview.inventory.items.find(
      (i) => i.instanceId === "sample-two",
    ).definition.name,
    "Mending draught",
  );
});

test("a paid potion identification updates matching bottles in a saved recall passage", () => {
  const g = fresh(),
    h = g.active;
  const item = give(g, h, g.createFind("antitoxin", "owned"));
  g.campaign.returnPassage = {
    floor: {
      map: { chests: [{ items: [g.createFind("antitoxin", "passage")] }] },
    },
  };
  assert.throws(() => g.appraise(0, item.instanceId), /coins/);
  assert.ok(item.appearance);
  g.campaign.bank = 20;
  g.appraise(0, item.instanceId);
  assert.equal(
    g.campaign.returnPassage.floor.map.chests[0].items[0].definition.name,
    "Antitoxin",
  );
});

test("creature spoils resolve once even on repeated death events", () => {
  const g = arena(),
    e = g.enemies[0];
  g.map.lootSeed = 1;
  g.map.depth = 3;
  Object.assign(e, { type: "creature-kobold-trapkeeper", boss: true, hp: 0 });
  g.defeatEnemy(e);
  g.defeatEnemy(e);
  assert.equal(g.map.chests.length, 1);
  assert.equal(g.map.chests[0].items[0].find, "snare");
});

test("the Hall consumes both rare offerings for a single named hero and keeps history", () => {
  const g = fresh(),
    h = g.party[0];
  h.survival.hp = 0;
  h.survival.status = "dead";
  h.survival.gritAvailable = 0;
  g.recordFallen();
  give(g, g.party[1], g.createFind("pearl", "pearl"));
  assert.match(g.returnRite(h.heroId, true), /Requires/);
  give(g, g.party[2], g.createFind("revenant", "ash"));
  assert.equal(g.returnRite(h.heroId, true), "");
  assert.equal(g.party[0].survival.hp, 1);
  assert.equal(g.party[0].survival.gritAvailable, 0);
  assert.equal(g.party[1].treasure.length, 0);
  const loaded = fresh();
  loaded.load(deserialize(serialize(g.snapshot())), { resume: false });
  assert.equal(loaded.campaign.fallenHeroes.length, 1);
  assert.ok(loaded.party[0].returnedOnce);
  loaded.party[0].survival.hp = 0;
  loaded.party[0].survival.status = "dead";
  loaded.recordFallen();
  assert.match(loaded.returnRite(h.heroId, true), /already/);
  assert.ok(loaded.campaign.fallenHeroes[0].previousDeath);
});
