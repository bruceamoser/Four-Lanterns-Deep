import { expect } from "@playwright/test";

export async function verifyLinearAtlas(page) {
  const saved = await page.evaluate(() =>
    structuredClone(window.__ddd.game.snapshot()),
  );
  try {
    await page.locator('[data-hero="3"]').click();
    await page.locator('[data-tab="spellbook"]').click();
    await expect(page.locator(".personal-book")).toContainText("Fire Bolt");
    await expect(page.locator(".personal-book")).toContainText("Burning Hands");
    await expect(page.locator(".personal-book")).not.toContainText(
      "Scorching Ray",
    );
    await page.locator("[data-book-atlas]").click();
    await page.locator('[data-field="elements"]').click();
    await expect(page.locator(".study-arm")).toHaveCount(4);
    await page.locator('[data-node="book:flame:3"]').click();
    await expect(page.locator(".study-reader")).toContainText("Scorching Ray");
    await page.locator("[data-study]").click();
    await expect(page.locator(".study-reader")).toContainText("Learned");
    await page.screenshot({ path: "test-results/linear-spell-atlas.png" });
    await page.locator(".forge-close").click();
    await page.locator('[data-tab="spellbook"]').click();
    await expect(page.locator(".personal-book")).toContainText("Scorching Ray");
    await expect(page.locator(".personal-book [data-cast]")).toHaveCount(6);
    await page.screenshot({ path: "test-results/personal-spellbook.png" });
    await page.keyboard.press("Escape");
    await page.locator('[data-hero="2"]').click();
    await page.locator('[data-tab="spellbook"]').click();
    await expect(page.locator(".personal-book")).toContainText("Cure Wounds");
    await expect(page.locator(".personal-book")).not.toContainText("Fire Bolt");
    await page.evaluate(() => {
      const g = window.__ddd.game;
      g.party[2].survival.hp -= 7;
    });
    const sp = await page.evaluate(() => window.__ddd.game.party[2].sp);
    await page.locator('[data-cast="spell-restoration-2"]').click();
    await page.locator('[data-field-target="hero-2"]').click();
    expect(await page.evaluate(() => window.__ddd.game.party[2].sp)).toBe(
      sp - 1,
    );
    await page.locator('[data-hero="0"]').click();
    await page.locator("#sheet-training").click();
    await page.locator('[data-field="arms"]').click();
    await page.locator('[data-node="arm:arms:bladework:3"]').click();
    await page.locator("[data-study]").click();
    await expect(page.locator(".study-reader")).toContainText(
      "Bleeding".toLowerCase(),
    );
    await page.locator('[data-node="arm:arms:bladework:4"]').click();
    await expect(page.locator("[data-study]")).toBeDisabled();
    await expect(page.locator(".study-reader")).toContainText(
      "Requires level 23",
    );
    await page.screenshot({ path: "test-results/linear-technique-atlas.png" });
    await page.locator('[data-node="arm:arms:bladework:2"]').click();
    await page.locator("[data-refund]").click();
    await expect(page.locator(".study-reader")).toContainText(
      "Measured Cut III",
    );
    await page.locator("[data-refund]").click();
    expect(
      await page.evaluate(
        () =>
          window.__ddd.game.powerSpec(
            "technique-arms-bladework",
            window.__ddd.game.party[0],
          ).name,
      ),
    ).toBe("Measured Cut I");
    console.log(
      "Native personal book, automatic section learning, healing cast, staged technique, level gate and cascading refund passed.",
    );
  } finally {
    if (await page.locator(".forge-close").count())
      await page.locator(".forge-close").click();
    if (await page.locator("#modal-root > *").count())
      await page.keyboard.press("Escape");
    await page.evaluate((s) => {
      const g = window.__ddd.game;
      g.load(s, { resume: false });
      g.emit("change");
    }, saved);
  }
}
