import { xpProgress, XP_RULES, trainingTarget } from "../core/experience.mjs";
import { esc } from "./icons.mjs";
export function xpMeter(hero, compact = false) {
  const p = xpProgress(hero),
    trained = hero.preview?.state.level ?? hero.draft.progression?.level ?? 1;
  return `<div class="xp-meter ${compact ? "compact" : ""}" data-xp="${p.total}"><div class="xp-caption"><span>${compact ? `LV ${trained}` : `${p.total.toLocaleString()} total XP`}</span><span>${hero.draft?.forge?.version === 2 && trained >= 10 ? "XP BANKED" : p.next === null ? "MAXIMUM LEVEL" : `${p.current.toLocaleString()} / ${p.required.toLocaleString()} XP${compact ? "" : ` to level ${p.level + 1}`}`}</span></div><div class="xp-track" role="progressbar" aria-label="Experience toward next level" aria-valuemin="0" aria-valuemax="${p.required || 100}" aria-valuenow="${p.next === null ? 100 : p.current}"><i style="width:${p.percent}%"></i></div>${trainingTarget(hero) > trained && hero.survival?.status !== "dead" ? `<small class="training-ready">◆ Training ready · Level ${trainingTarget(hero)}</small>` : ""}</div>`;
}
export function experienceDetails(hero, depth = 1) {
  return `<section class="experience-panel"><div class="eyebrow">EXPERIENCE & ADVANCEMENT</div>${xpMeter(hero)}<p>${hero.draft?.forge?.version===3?"Train through 100 levels. Each level earns a development point.":"Legacy development reaches level 10. Rebuild in Greyhaven to adopt the 100-level Atlas."} Train in Greyhaven to spend development points on eligible choices.</p><details><summary>How experience is earned</summary><p>Every living expedition member receives the same award. Heroes waiting in town earn no XP.</p><dl><div><dt>New chamber</dt><dd>${XP_RULES.room + XP_RULES.roomDepth * (depth - 1)} XP at depth ${depth}</dd></div><div><dt>Encounter overcome</dt><dd>${XP_RULES.enemy + XP_RULES.enemyDepth * (depth - 1)} XP × creature CV ÷ 8 at depth ${depth} (rounded per creature)</dd></div><div><dt>Treasure brought home</dt><dd>${XP_RULES.coin} XP per newly looted coin</dd></div></dl><p>${hero.draft?.forge?.version===3?"Level 2 takes 200 XP. Advanced studies and the second signature open at level 23. Masteries and the third signature open at level 67.":"This hero uses the earlier experience curve."} Discovery and encounter awards occur once per generated floor. Recovered death caches grant no additional XP. Defeat loses unbanked treasure XP.</p><p>XP is a dungeon-game adaptation of milestone advancement; DP and earned signatures are applied through training; mastery can be freely rebuilt in town.</p></details>${
    hero.xpHistory?.length
      ? `<div class="xp-history"><span class="eyebrow">RECENT EXPERIENCE</span>${hero.xpHistory
          .slice(-5)
          .reverse()
          .map(
            (e) =>
              `<p><b>+${e.amount} XP</b><span>${esc(e.reason)}<small>Depth ${e.depth} · Expedition ${e.expedition}</small></span></p>`,
          )
          .join("")}</div>`
      : ""
  }</section>`;
}
