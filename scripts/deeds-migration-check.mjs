// Produce an authentic previous-edition save with the tagged engine, then load it with this checkout.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { fresh, drafts } from "../tests/forge-fixture.mjs";
import { serialize, deserialize } from "../src/core/save.mjs";
const tmp = mkdtempSync(join(tmpdir(), "fld-upgrade-rules-"));
try {
  const archive = join(tmp, "legacy.tar");
  execFileSync("git", [
    "archive",
    "--format=tar",
    "-o",
    archive,
    "v0.8.8",
    "src/core",
    "tests/forge-fixture.mjs",
    "tests/game-fixture.mjs",
    "public/vendor/hol/rules",
    "public/vendor/hol/data",
  ]);
  execFileSync("tar", ["-xf", archive, "-C", tmp]);
  const fromTag = (rel) => import(pathToFileURL(join(tmp, rel)).href);
  const makeSave = async () => {
    const { fresh, drafts } = await fromTag("tests/forge-fixture.mjs");
    const { magicItem } = await fromTag("src/core/treasure.mjs");
    const { serialize } = await fromTag("src/core/save.mjs");
    const g = fresh();
    g.campaign.seed = 10881;
    g.newFloor();
    g.mode = "town";
    g.createRecruit({ ...structuredClone(drafts[1]), name: "The survivor" });
    const fallen = g.createRecruit({
      ...structuredClone(drafts[2]),
      name: "The witness",
    });
    fallen.survival.hp = 0;
    fallen.survival.status = "dead";
    g.recordFallen();
    const h = g.party[0];
    h.survival.gritAvailable--;
    h.survival.hp -= 2;
    g.awardXP("legacy:claim", 44, "legacy survey");
    h.treasure = [magicItem(77, 1, { base: "blade", affixes: ["ember"] })];
    g.refreshHero(h);
    const record = g.C.wounds.records.find((w) => w.recoveryValue);
    h.wounds.push({
      id: "sample-old-scar",
      record,
      effects: [],
      applied: true,
    });
    g.campaign.returnPassage = {
      depth: g.campaign.depth,
      seed: g.campaign.seed,
      floor: structuredClone(g.snapshot().floor),
      positions: g.party.map(({ x, z }) => ({ x, z })),
    };
    g.mode = "exploration";
    g.detect([g.enemies[0]]);
    if (g.encounter.nextSide === "players") g.beginHero();

    return serialize(g.snapshot());
  };
  const old = deserialize(await makeSave()),
    g = fresh();
  g.load(old, { resume: false });

  assert.equal(g.mode, "combat");
  assert.deepEqual(g.snapshot().encounter, old.encounter);
  assert.deepEqual(g.snapshot().returnPassage, old.returnPassage);
  assert.equal(g.campaign.reserve.length, old.reserve.length);
  assert.equal(g.campaign.fallenHeroes.length, 1);
  for (const [i, h] of g.party.entries()) {
    assert.equal(h.heroId, old.party[i].heroId);
    assert.equal(h.draft.forge.version, 1);
    assert.equal(h.survival.gritAvailable, old.party[i].survival.gritAvailable);
  }
  g.enemies.forEach((e) => (e.hp = 0));
  g.encounter.roster
    .filter((r) => r.side === "opposition")
    .forEach((r) => (r.withdrawn = true));
  g.suspended = false;
  g.advance();
  g.pause();
  assert.equal(g.mode, "exploration");
  g.party.forEach((h, i) =>
    Object.assign(h, {
      x: g.map.start.x + (i % 2),
      z: g.map.start.z + Math.floor(i / 2),
    }),
  );
  g.extract();
  assert.equal(g.mode, "town");
  const start = g.party[0],
    rebuild = structuredClone(drafts[0]);
  rebuild.name = start.name;
  rebuild.progression.level = start.preview.state.level;
  const after = g.forgeCommit(0, rebuild, {
    respec: true,
    expectedHeroId: start.heroId,
  });
  assert.equal(after.draft.forge.version, 2);
  assert.equal(after.heroId, start.heroId);
  assert.equal(after.xp, start.xp);
  assert.deepEqual(after.treasure, start.treasure);
  assert.equal(after.wounds.length, 0);
  assert.equal(after.scars[0].source, "sample-old-scar");
  assert.equal(after.injuryHistory[0].record.id, start.wounds[0].record.id);
  assert.equal(after.survival.gritAvailable, 0);
  const reloaded = fresh();
  reloaded.load(deserialize(serialize(g.snapshot())), { resume: false });
  assert.deepEqual(reloaded.party[0].scars, after.scars);
  console.log(
    "0.8.8 combat, reserve, Hall, passage, gear, XP, spent Grit, injury history and respec passed.",
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
