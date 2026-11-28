import { linearHero } from "./deeds-development.mjs";
export const XP_RULES = Object.freeze({
  firstLevel: 10000,
  room: 60,
  roomDepth: 10,
  enemy: 100,
  enemyDepth: 20,
  coin: 5,
});
export const XP_THRESHOLDS = (() => {
  const result=[0,0,10000,32500,85000];
  let gap=52500;
  for(let level=5;level<=30;level++) { gap=Math.round(gap*1.55/500)*500;result[level]=result[level-1]+gap; }
  return Object.freeze(result);
})();
export function xpForLevel(level) { return XP_THRESHOLDS[Math.max(1,Math.min(30,level))]; }
const digitalThresholds = [0, 0];
for (let level = 2; level <= 100; level++) {
  const step = level - 2;
  digitalThresholds[level] = digitalThresholds[level - 1] + 200 + 35 * step + 4 * step * step;
}
export const digitalXPForLevel = level => digitalThresholds[Math.max(1, Math.min(100, level))];
export const heroThreshold = draft => linearHero(draft) ? digitalXPForLevel : xpForLevel;
export const effectiveXP = hero => (hero.xp ?? 0) - (hero.xpOffset ?? 0);
export function legacyXPForLevel(level) { const n=Math.max(0,Math.min(30,level)-1);return n*400+n*(n-1)*175/2; }
export function levelForXP(xp, threshold=xpForLevel) {
  const cap = threshold === digitalXPForLevel ? 100 : 30;
  let level=1;while(level<cap && xp>=threshold(level+1)) level++;return level;
}
// Preserve the power band of a trained Deeds hero when a player adopts the digital Atlas.
export function digitalEquivalent(draft, level) {
  if (draft.forge?.version === 1) return Math.min(100, 1 + Math.round((level-1)*99/29));
  return Math.min(100, 1 + 11 * (level-1));
}
export function convertedProgress(hero) {
  const p = xpProgress(hero);
  const floor = digitalXPForLevel(digitalEquivalent(hero.draft,p.level));
  const ceiling = digitalXPForLevel(digitalEquivalent(hero.draft,p.level+1));
  const xp = floor + Math.floor((ceiling-floor) * (p.required ? Math.min(1,p.current/p.required) : 0));
  return {offset:hero.xp-xp, earnedLevel:levelForXP(xp,digitalXPForLevel)};
}
export function trainingTarget(hero) {
  const trained = hero.preview?.state.level ?? hero.draft?.progression?.level ?? 1;
  return hero.draft?.forge?.version === 2 ? Math.max(trained, Math.min(10, hero.earnedLevel)) : hero.earnedLevel;
}
export function xpProgress(hero) {
  const threshold = heroThreshold(hero.draft), xp = effectiveXP(hero);
  const level = Math.max(hero.earnedLevel, levelForXP(xp, threshold));
  const floor = threshold(level), next = level < (linearHero(hero.draft) ? 100 : 30) ? threshold(level + 1) : null;
  return {
    level,
    total: hero.xp ?? 0,
    current: xp - floor,
    required: next === null ? 0 : next - floor,
    next,
    percent:
      next === null
        ? 100
        : Math.max(
            0,
            Math.min(100, ((xp - floor) / (next - floor)) * 100),
          ),
  };
}
export const experienceMethods = {
  awardXP(claim, amount, reason) {
    if (!Number.isSafeInteger(amount) || amount < 0)
      throw new Error("Invalid XP award.");
    this.map.xpClaims ??= [];
    if (this.map.xpClaims.includes(claim) || amount === 0) return false;
    const recipients = this.party.filter((h) => h.survival.status !== "dead");
    if (!recipients.length) return false;
    this.map.xpClaims.push(claim);
    for (const h of recipients) {
      const previous = trainingTarget(h);
      h.xp = (h.xp ?? heroThreshold(h.draft)(h.earnedLevel)) + amount;
      h.earnedLevel = Math.max(h.earnedLevel, levelForXP(effectiveXP(h), heroThreshold(h.draft)));
      if (trainingTarget(h) > previous)
        this.emit("level-ready", { hero: h, level: trainingTarget(h) });
      h.xpHistory ??= [];
      h.xpHistory.push({
        amount,
        reason,
        depth: this.campaign.depth,
        expedition: this.campaign.expeditions,
      });
      h.xpHistory = h.xpHistory.slice(-40);
    }
    this.note(`+${amount} XP each · ${reason}.`);
    this.emit("xp", { amount, reason });
    return true;
  },
  discoverRooms() {
    if (!["exploration", "combat"].includes(this.mode)) return;
    this.map.rooms.forEach((r, index) => {
      if (index === 0) return; // Entering the safe arrival chamber is not a discovery reward.
      if (
        this.party.some(
          (h) =>
            this.canAct(h) &&
            h.x >= r.x &&
            h.x < r.x + r.w &&
            h.z >= r.z &&
            h.z < r.z + r.h,
        )
      )
        this.awardXP(
          `room:${index}`,
          XP_RULES.room + XP_RULES.roomDepth * (this.campaign.depth - 1),
          `Discovered chamber ${index + 1}`,
        );
    });
  },
  awardEncounterXP(ids) {
    const defeated = this.enemies.filter(
      (e) =>
        ids.includes(e.id) &&
        e.hp <= 0 &&
        !this.map.xpClaims.includes(`enemy:${e.id}`),
    );
    if (!defeated.length) return;
    const amount = defeated.reduce(
      (n, e) =>
        n +
        Math.round(
          ((e.cv ?? 8) / 8) *
            (XP_RULES.enemy + XP_RULES.enemyDepth * (this.campaign.depth - 1)),
        ),
      0,
    );
    if (
      this.awardXP(
        `encounter:${defeated
          .map((e) => e.id)
          .sort()
          .join(",")}`,
        amount,
        `Overcame ${defeated.length} ${defeated.length === 1 ? "creature" : "creatures"}`,
      )
    )
      this.map.xpClaims.push(...defeated.map((e) => `enemy:${e.id}`));
  },
  bankTreasureXP() {
    const amount = this.campaign.pendingTreasureXP ?? 0;
    if (amount)
      this.awardXP(
        `treasure:${this.campaign.expeditions}`,
        amount,
        "Brought treasure safely to Greyhaven",
      );
    this.campaign.pendingTreasureXP = 0;
  },
};
