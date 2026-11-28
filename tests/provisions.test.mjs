import test from "node:test";
import assert from "node:assert/strict";
import { fresh, C, R } from "./forge-fixture.mjs";
import { Game } from "../src/core/game.mjs";
function quiet() {
  const g = fresh();
  g.mode = "exploration";
  g.enemies = [];
  g.supplyDie = () => 1;
  return g;
}
const supply = (h, id) =>
  h.preview.inventory.items.find((i) => i.carried && i.catalogId === id);
const day = 24 * 3600;
test("a 360-square walk and eight hours of work do not roll a day's rations early", () => {
  const g = quiet(),
    h = g.party[0];
  for (let i = 0; i < 360; i++) g.advanceTime(10, { provisions: true });
  g.advanceTime(8 * 3600, { provisions: true });
  const food = supply(h, "item-food-bundle"),
    water = supply(h, "item-water-flask");
  assert.equal(g.supplyValue(h, food), 8);
  assert.equal(g.supplyValue(h, water), 8);
  const copy = new Game(R, C);
  copy.load(structuredClone(g.snapshot()), { resume: false });
  copy.supplyDie = () => 1;
  copy.advanceTime(15 * 3600 - 1, { provisions: true });
  assert.equal(copy.supplyValue(copy.party[0], water), 8);
  copy.advanceTime(1, { provisions: true });
  assert.equal(copy.supplyValue(copy.party[0], water), 6);
  assert.equal(copy.supplyValue(copy.party[0], food), 6);
  copy.autoProvisions();
  assert.equal(copy.supplyValue(copy.party[0], water), 6);
});
test("final use feeds for a day; a shortage warns once and refilling does not collect missed days", () => {
  const g = quiet(),
    h = g.party[0],
    water = supply(h, "item-water-flask");
  h.supplies[water.instanceId] = 4;
  g.advanceTime(day, { provisions: true });
  assert.equal(g.needs(h).thirsty, false);
  g.advanceTime(3 * day, { provisions: true });
  assert.equal(g.needs(h).thirsty, true);
  const notices = g.campaign.supplyNotices.length;
  g.autoProvisions();
  assert.equal(g.campaign.supplyNotices.length, notices);
  h.supplies[water.instanceId] = 8;
  g.autoProvisions();
  assert.equal(g.needs(h).thirsty, false);
  assert.equal(g.supplyValue(h, water), 6);
  g.advanceTime(day - 1, { provisions: true });
  assert.equal(g.supplyValue(h, water), 6);
});
test("time in Greyhaven and on the reserve does not consume carried food and water", () => {
  const g = quiet();
  const reserve = structuredClone(g.party[1]);
  reserve.heroId = "reserve";
  g.campaign.reserve.push(reserve);
  g.mode = "town";
  g.advanceTime(3 * day, { provisions: true });
  g.mode = "exploration";
  g.advanceTime(2 * day + 1, { provisions: true });
  assert.equal(g.needs(reserve).thirsty, false);
  for (const h of g.party) {
    assert.equal(g.supplyValue(h, supply(h, "item-water-flask")), 4);
    assert.equal(g.supplyValue(h, supply(h, "item-food-bundle")), 4);
  }
});
test("old step counters and premature shortages migrate without rerolling or refilling items", () => {
  const fixture = quiet();
  const water = supply(fixture.party[0], "item-water-flask");
  const old = fixture.snapshot();
  old.clockSeconds = 1800;
  old.provisionTrail = { steps: 79, seconds: 7199 };
  const h = old.party[0];
  h.needs.waterDue = true;
  h.needs.warned.push("drankAt");
  h.torch.steps = 24;
  h.torch.seconds = 120;
  h.supplies[water.instanceId] = 4;
  const g = new Game(R, C);
  g.load(old, { resume: false });
  assert.equal(g.needs(g.active).thirsty, false);
  assert.equal(g.active.torch.seconds, 360);
  assert.equal(g.active.supplies[water.instanceId], 4);
  g.load(structuredClone(g.snapshot()), { resume: false });
  assert.equal(g.active.torch.seconds, 360);
  assert.equal(g.active.supplies[water.instanceId], 4);
});
test("camp preserves provisions, daily timers and fire fuel without deferred consumption", () => {
  const g = quiet();
  g.campWanderers = () => [];
  const before = g.party.map((h) => ({
    supplies: structuredClone(h.supplies),
    foodAge: g.clock().seconds - h.needs.ateAt,
    waterAge: g.clock().seconds - h.needs.drankAt,
  }));
  const fuel = g.party.map((h) => h.torch.seconds);
  g.startCamp(
    Object.fromEntries(g.party.map((h) => [h.heroId, ["guard", "guard"]])),
    32,
  );
  for (let i = 0; i < 32; i++) g.campHour();
  for (const [i, h] of g.party.entries()) {
    assert.deepEqual(h.supplies, before[i].supplies);
    assert.equal(g.clock().seconds - h.needs.ateAt, before[i].foodAge);
    assert.equal(g.clock().seconds - h.needs.drankAt, before[i].waterAge);
  }
  assert.deepEqual(
    g.party.map((h) => h.torch.seconds),
    fuel,
  );
  assert.equal(g.campaign.camp.fireLit, true);
  g.autoProvisions();
  g.party.forEach((h, i) => assert.deepEqual(h.supplies, before[i].supplies));
});
