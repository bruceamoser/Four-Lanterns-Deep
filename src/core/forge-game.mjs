import { digitalEquivalent, convertedProgress, trainingTarget } from "./experience.mjs";
import { fieldOf } from "./deeds-origins.mjs";
import { deedsHero, signatureLevel } from "./deeds-development.mjs";
import { FORGE_NODE, FORGE_LEVEL_CAP } from "./forge-catalog.mjs";
import {
  forgeCharacter,
  forgeRequirements,
  forgeRefundPlan,
  newForgeDraft, missingSignatures,
} from "./forge.mjs";
import { gearPreview } from "./treasure.mjs";
export const forgeGameMethods = {
  forgeFavorites(h) {
    const actions = this.availableActions(h),
      score = (c) =>
        ["power-forge-strike", "power-forge-shot"].includes(c.id)
          ? (this.held(h, c.id === "power-forge-shot" ? "item-ordinary-ranged-weapon" : "item-ordinary-melee-weapon") ? 0 : 4)
          : this.powerSpec(c.id, h)?.effects?.some((e) => e.kind === "damage")
            ? 1
            : this.powerSpec(c.id, h)?.effects?.some((e) => e.kind === "survey")
              ? 3
              : 2;
    const learned = actions
      .filter((c) => !c.universal)
      .sort((a, b) => score(a) - score(b))
      .map((c) => c.id);
    return [
      ...new Set([
        ...learned,
        ...(!learned.length ? ["power-forge-unarmed"] : []),
        "ability-defend",
        "ability-disengage",
        "ability-use-a-healing-potion",
        "ability-aid",
        "ability-reduce-a-condition",
      ]),
    ]
      .filter((id) => actions.some((c) => c.id === id))
      .slice(0, 6);
  },
  forgeReason(index) {
    const h = this.party[index];
    if (this.mode !== "town")
      return "Return to Greyhaven to develop your paths.";
    if (!h || h.survival.status !== "active")
      return "Choose a living, active hero.";
    if (this.busy || this.pendingDefense || this.pendingProvocation)
      return "Finish the current event first.";
    return "";
  },
  forgeCommit(index, draft, { respec = false, expectedHeroId } = {}) {
    const why = this.forgeReason(index);
    if (why) throw new Error(why);
    const h = this.party[index];
    if (expectedHeroId && h.heroId !== expectedHeroId)
      throw new Error("The party slot changed. Reopen this hero’s forge.");
    if (respec && missingSignatures(draft).length) throw new Error("Choose all earned class signatures before confirming the respec.");
    if (!respec && h.draft.forge?.version !== draft.forge.version) throw new Error("Rebuild in Greyhaven to change editions.");
    if (!respec) for (const [level,selected] of Object.entries(h.draft.signatures ?? {}))
      if (selected !== draft.signatures?.[level]) throw new Error("Respec in Greyhaven to replace a chosen signature.");
    const p = forgeCharacter(draft, this.C);
    if (!p.valid) throw new Error(p.errors.map((e) => e.text).join("\n"));
    const level = p.state.level;
    const adopting = h.draft.forge?.version !== 3 && draft.forge.version === 3;
    const convertedLevel = adopting ? digitalEquivalent(h.draft,h.preview.state.level) : null;
    if (
      (adopting ? level !== convertedLevel : level > trainingTarget(h)) ||
      level < h.preview.state.level ||
      level > (draft.forge.version === 3 ? 100 : FORGE_LEVEL_CAP)
    )
      throw new Error("Train only earned levels.");
    const next = structuredClone(h);
    next.draft = structuredClone(draft);
    if (adopting) {
      const progress = convertedProgress(h);
      next.xpOffset = progress.offset;
      next.earnedLevel = progress.earnedLevel;
    }
    // Progression never changes possessions, the campaign purse or remaining supplies.
    for (const k of ["kit", "shopping", "loadout"])
      next.draft[k] = structuredClone(
        h.draft[k] ?? (k === "shopping" ? [] : {}),
      );
    if (respec) {
      delete next.build;
      next.preparedTraits = [];
      next.tactics = [];
      next.buffs = {};
      next.powerEffects = (next.powerEffects ?? []).filter((e) =>
        Object.values(e.stats).some((v) => typeof v === "number" && v < 0),
      );
      next.powerPendingManeuver = false;
    }
    next.preview = gearPreview(this.R, this.C, next);
    if (!next.preview.valid)
      throw new Error(next.preview.errors.map((e) => e.text).join("\n"));
    // No healing or Grit cycling when rebuilding to smaller/larger maximums.
    next.survival.maxHp = Math.max(
      1,
      h.survival.maxHp +
        next.preview.summary.maximumHp -
        h.preview.summary.maximumHp,
    );
    const growth = !respec && deedsHero(draft) && level > h.preview.state.level && h.survival.hp > 0
      ? Math.max(0, next.survival.maxHp - h.survival.maxHp) : 0;
    next.survival.hp = Math.min(h.survival.hp + growth, next.survival.maxHp);
    if (deedsHero(draft)) next.sp = Math.min(h.sp ?? next.preview.summary.maximumSp, next.preview.summary.maximumSp);
    next.respecGritSpent = Math.max(
      h.respecGritSpent ?? 0,
      h.preview.summary.gritGranted - h.survival.gritAvailable,
    );
    next.survival.gritAvailable = Math.max(
      0,
      next.preview.summary.gritGranted - next.respecGritSpent,
    );
    next.name = next.draft.name;
    if (respec) {
      const shell = this.hero(next.draft, index);
      next.model = shell.model;
      next.draft.appearance = shell.draft.appearance;
      next.respecHistory = [
        ...(h.respecHistory ?? []),
        {
          at: this.clock().seconds,
          level,
          from: h.draft.classId,
          to: next.draft.classId,
        },
      ].slice(-20);
    }
    // Unequip portable armor if its training was refunded, without removing the item.
    for (const item of next.treasure ?? []) {
      const tier = item.catalogId.match(
        /item-ordinary-(light|medium|heavy)-armor/,
      )?.[1];
      if (
        tier && !deedsHero(draft) &&
        !next.preview.state.abilities.includes(`ability-wear-${tier}-armor`)
      )
        item.worn = false;
    }
    if (respec && deedsHero(draft) && !deedsHero(h.draft)) {
      next.scars = [...(h.scars ?? []), ...h.wounds.map(w => ({text:w.record.injury, source:w.id, depth:this.campaign.depth}))];
      next.injuryHistory = [...(h.injuryHistory ?? []), ...structuredClone(h.wounds)];
      next.conditions = next.conditions.filter(c => !c.woundId);
      next.wounds = [];
      next.survival.wounds = next.scars.length;
      delete next.survival.recovery;
    }
    next.preview = gearPreview(this.R, this.C, next);
    this.R.validateSurvival(next.survival);
    const available = this.availableActions(next);
    next.favorites = [
      ...new Set([
        ...(respec ? this.forgeFavorites(next) : (next.favorites ?? [])).filter(
          (id) => available.some((a) => a.id === id),
        ),
        ...(draft.forge.version === 3 ? [] : available.filter((a) => !a.universal).map((a) => a.id)),
      ]),
    ].slice(0, 8);
    this.party[index] = next;
    this.syncTorches();
    this.note(
      `${next.name}: ${respec ? "rebuilt their disciplines" : `forge updated at level ${level}`} · ${next.preview.development.current} DP available.`,
    );
    this.emit("party");
    this.emit("change");
    return next;
  },
  editForge(index, { buy, refund, reset = false } = {}) {
    const h = this.party[index],
      draft = structuredClone(h.draft);
    if (buy) {
      const why = forgeRequirements(FORGE_NODE[buy], draft, this.C);
      if (why.length) throw new Error(why.join(" "));
      draft.forge.nodes.push(buy);
    } else if (refund || reset) {
      const plan = forgeRefundPlan(draft, this.C, reset ? null : refund);
      draft.forge.nodes = plan.draft.forge.nodes;
    } else throw new Error("Choose a node to buy or refund.");
    return this.forgeCommit(index, draft);
  },
  trainForge(index) {
    const h = this.party[index],
      draft = structuredClone(h.draft);
    draft.progression.level = trainingTarget(h);
    if (draft.progression.level <= h.preview.state.level)
      throw new Error("No untrained level is available.");
    return this.forgeCommit(index, draft);
  },
  forgeRespecDraft(index) {
    const why = this.forgeReason(index);
    if (why) throw new Error(why);
    const h = this.party[index],
      draft = newForgeDraft();
    draft.name = h.name;
    draft.appearance = structuredClone(h.draft.appearance);
    draft.progression.level = h.draft.forge.version === 3 ? h.preview.state.level : digitalEquivalent(h.draft,h.preview.state.level);
    if (h.draft.forge?.version === 2) {
      for (const k of ["attributes","traitIds","borrowedTraitId","ancestryId","classId","languages","culture","background","classDisciplines"])
        if (h.draft[k] !== undefined) draft[k] = structuredClone(h.draft[k]);
      const toField = id => "discipline-" + fieldOf(id.slice(11));
      draft.classDisciplines = draft.classDisciplines.map(toField);
      for (const key of ["culture","background"]) draft[key].discipline = toField(draft[key].discipline);
      draft.signatures = Object.fromEntries(Object.entries(h.draft.signatures ?? {}).filter(([tier])=>signatureLevel(draft,tier)<=draft.progression.level));
    }
    for (const k of ["kit", "shopping", "loadout"])
      draft[k] = structuredClone(h.draft[k]);
    return draft;
  },
};
