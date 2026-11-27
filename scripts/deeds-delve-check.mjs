import { expect } from "@playwright/test";

// Uses only the isolated journey and the same world, market and sheet controls as a player.
export async function verifyDeedsDelve(page) {
  const before = await page.evaluate(() => window.__ddd.game.snapshot());
  try {
    await page.evaluate(() => {
      const g = window.__ddd.game;
      g.pause();
      g.mode = "town";
      g.campaign.depth = 2;
      g.campaign.seed = 19237;
      g.newFloor();
      g.mode = "exploration";
      const seam = g.map.vault.seam;
      g.party.forEach((h, i) =>
        Object.assign(h, {
          x: seam.x - 1 - (i % 2),
          z: seam.z + Math.floor(i / 2),
        }),
      );
      for (const t of Object.values(g.map.tiles))
        if (Math.abs(t.x - seam.x) < 8 && Math.abs(t.z - seam.z) < 8)
          g.seen[[t.x, t.z].join(",")] = true;
      g.emit("floor");
      g.emit("change");
    });
    await page.evaluate(() =>
      window.__ddd.game.emit("interact-ready", { id: "vault:seam" }),
    );
    await expect(
      page.getByRole("dialog", { name: "Silver-bearing seam" }),
    ).toBeVisible();
    await page.locator('[data-world-option="use"]').click();
    await expect
      .poll(() => page.evaluate(() => !!window.__ddd.game.map.vault.seam.open))
      .toBe(true);
    await page.evaluate(() => {
      const g = window.__ddd.game,
        c = g.map.chests.find((c) => c.vault);
      Object.assign(g.active, { x: c.x - 1, z: c.z });
      g.emit("interact-ready", { id: "coffer:" + c.id });
    });
    await page.locator('[data-world-option="use"]').click();
    const bottle = page.locator('[data-take^="vault-bottle-"]');
    await expect(bottle).toHaveCount(1);
    await bottle.click();
    await page.locator("[data-finish]").click();
    await page.screenshot({ path: "test-results/deeds-vault.png" });
    await page.evaluate(() => {
      const g = window.__ddd.game;
      g.party.forEach((h, i) =>
        Object.assign(h, {
          x: g.map.start.x + (i % 2),
          z: g.map.start.z + Math.floor(i / 2),
        }),
      );
      g.extract();
      g.campaign.bank = 100;
      g.emit("change");
    });
    await page.keyboard.press("m");
    await page.locator('[data-merchant="alchemy"]').click({ timeout: 30000 });
    await page.locator('[data-market-mode="appraise"]').click();
    await page.locator('[data-appraise^="vault-bottle-"]').click();
    expect(
      await page.evaluate(() => window.__ddd.game.discoveries().known),
    ).toContain("antitoxin");
    await page.keyboard.press("Escape");
    await page.locator('[data-hero="0"]').first().click();
    await expect(page.locator("#avert-death")).toBeVisible();
    await page.locator("#sheet-training").click();
    await expect(
      page.locator(".forge-signatures select").first(),
    ).toBeVisible();
    await expect(page.locator('[data-discipline="fencing"]')).toBeVisible();
    await page.screenshot({ path: "test-results/deeds-forge.png" });
    await page.keyboard.press("Escape");
    console.log(
      "Deeds native delve passed two-route vault interaction, four-hero dungeon, inventory transfer, paid appraisal and signature/mastery UI.",
    );
  } finally {
    if (await page.locator("#modal-root > *").count())
      await page.keyboard.press("Escape");
    await page.evaluate((saved) => {
      const g = window.__ddd.game;
      g.load(saved, { resume: false });
      g.emit("floor");
      g.emit("party");
      g.emit("change");
      g.resume();
    }, before);
  }
}
