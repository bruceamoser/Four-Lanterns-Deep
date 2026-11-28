import {
  strongest,
  weaponBonus,
  protectCondition,
} from "./equipment-bonuses.mjs";
import { deedsHero } from "./deeds-development.mjs";
import { deedsDamage, coverBetween } from "./deeds-damage.mjs";
import { POWERS, mappedPower } from "./powers.mjs";
import { distance, key, lineOfSight, pathfind } from "./dungeon.mjs";
import { surfaceAt, wallAt } from "./battlefield.mjs";
import { activeItemEffects } from "./treasure.mjs";
const alive = (h) =>
  h.survival ? !["dead", "lastWords"].includes(h.survival.status) : h.hp > 0;
const value = (n, tier) => (Array.isArray(n) ? n[tier] : n);
export const powerMethods = {
  powerForceMove(actor, dir, amount, source = null) {
    if (!dir.x && !dir.z) return;
    if (deedsHero(source?.draft)) return this.forceMove(actor, dir, amount, source);
    for (let i = 0; i < amount; i++) {
      const next = { x: actor.x + dir.x, z: actor.z + dir.z };
      const wall =
        !this.map.tiles[key(next.x, next.z)] ||
        this.map.obstacles[key(next.x, next.z)] ||
        wallAt(this.map, next.x, next.z) ||
        !lineOfSight(this.map, actor, next);
      if (wall) {
        const impact =
          2 +
          (amount - i) +
          (source ? (this.buildStat?.(source, "impact") ?? 0) : 0);
        const dealt = this.powerDamage(actor, impact, "physical", source);
        this.emit("feedback", {
          id: actor.id,
          kind: "damage",
          text: `WALL SLAM · ${dealt}`,
        });
        this.note(
          `${actor.name} slams into a wall (${impact} physical impact before resistance).`,
        );
        break;
      }
      if (this.occupied(actor.id).has(key(next.x, next.z))) break;
      if (
        dir.x &&
        dir.z &&
        [
          { x: actor.x + dir.x, z: actor.z },
          { x: actor.x, z: actor.z + dir.z },
        ].some(
          (p) =>
            !this.map.tiles[key(p.x, p.z)] ||
            this.map.obstacles[key(p.x, p.z)] ||
            wallAt(this.map, p.x, p.z),
        )
      )
        break;
      Object.assign(actor, next);
      this.surfaceContact(actor, { entry: true });
      if (!alive(actor)) break;
    }
    this.emit("move");
  },
  powerIds(h) {
    if (h.draft?.forge) return [...h.preview.state.abilities];
    return [
      ...new Set(
        h.preview.state.abilities.map((id) =>
          this.C.gamePowers ? mappedPower(id, this.C) : id,
        ),
      ),
    ];
  },
  powerStat(h, name) {
    const xs = (h.powerEffects ?? []).filter(
      (e) =>
        e.expiresAt > this.clock().seconds &&
        (this.mode !== "combat" || e.expiresTurn >= (h.powerTurn ?? 0)),
    );
    return (
      (["attack", "defense", "movement", "dr", "reduction"].includes(name)
        ? (this.buildStat?.(h, name) ?? 0)
        : 0) +
      Math.max(0, ...xs.map((e) => Number(e.stats[name]) || 0)) +
      Math.min(0, ...xs.map((e) => Number(e.stats[name]) || 0))
    );
  },
  endWard(h) {
    if (!h?.sustainedWard) return;
    for (const ally of this.party)
      ally.powerEffects = (ally.powerEffects ?? []).filter(e => e.id !== "ward:" + h.id);
    delete h.sustainedWard;
  },
  sustainDue(h) {
    const ward = h?.sustainedWard;
    if (!ward || h.survival.status !== "active" || this.encounter?.current !== h.id || this.mode !== "combat") return false;
    return h.powerTurn === ward.due && this.clock().seconds < ward.until &&
      this.party.some(ally => ally.powerEffects?.some(e => e.id === "ward:" + h.id && e.stats.absorb > 0));
  },
  sustainWard() {
    const h = this.active;
    if (!this.sustainDue(h) || this.busy || this.pendingProvocation || this.pendingDefense || this.pendingCue)
      throw new Error("No ward is due for upkeep now.");
    this.spend("maneuver", "sustain-ward");
    h.sustainedWard.due++;
    this.note(h.name + " sustains the ward.");
    this.emit("change");
  },
  powerBuff(actor, target, stats, turns = 2, id = "effect") {
    target.powerEffects = (target.powerEffects ?? []).filter(
      (e) => e.id !== id,
    );
    target.powerEffects.push({
      id,
      source: actor.id,
      stats: { ...stats },
      expiresTurn:
        (target.powerTurn ?? 0) + turns - 1 + (target !== actor ? 1 : 0),
      expiresAt: this.clock().seconds + Math.max(60, turns * 6),
    });
    this.emit("feedback", {
      id: target.id,
      kind: "recovery",
      text:
        this.C.choices.find((c) => c.id === id.split(":")[0])?.name ??
        "Power effect",
    });
    if (stats.movement && target === this.active && this.budget)
      this.budget.bonusMovement = Math.max(
        this.budget.bonusMovement ?? 0,
        stats.movement,
      );
    if (stats.disengage && target === this.active && this.budget)
      this.budget.disengaged = true;
  },
  consumeDamageBonus(h) {
    const n = this.powerStat(h, "damage");
    for (const e of h.powerEffects ?? []) delete e.stats.damage;
    return n;
  },
  breakConcealment(h) {
    for (const e of h.powerEffects ?? []) delete e.stats.hidden;
  },
  powerTargetable(h, observer) {
    return (
      !this.powerStat(h, "hidden") ||
      distance(h, observer) <= 1 ||
      surfaceAt(this.map, h, "light")
    );
  },
  powerCondition(target, condition, rating, source) {
    if (
      !alive(target) ||
      (!target.survival &&
        this.creature(target)?.immunities?.some(
          (i) => i.toLowerCase() === condition,
        ))
    )
      return;
    rating = protectCondition(target, condition, rating);
    if (rating <= 0) return;
    target.conditions ??= [];
    const id = `power-condition-${source}-${condition}`;
    const previous = target.conditions.find((c) => c.id === id);
    const severity = [
      "burning",
      "freezing",
      "bleeding",
      "poisoned",
      "frightened",
      "slowed",
      "dazed",
    ].includes(condition);
    if (severity) rating += previous?.rating ?? 0;
    target.conditions = target.conditions.filter((c) => c.id !== id);
    target.conditions.push({
      id,
      key: condition,
      rating,
      source,
      order: this.encounter?.serial ?? 0,
      persistence: condition === "prone" ? "binary" : "temporary",
    });
  },
  powerHeal(target, amount) {
    if (!alive(target) || !target.survival) return 0;
    const healed = this.R.healingPlan({
      amount,
      current: target.survival.hp,
      max: this.healingMaximum(target),
      lifeResistances: [target.preview.resistances.life ?? 0],
    }).restored;
    target.survival = this.R.receiveHealing(target.survival, healed);
    return healed;
  },
  powerResistances(target, base) {
    const delta =
      this.powerStat(target, "dr") +
      (target.buffs?.shield ? strongest(target, "blockDR") : 0);
    if (!delta) return base;
    const physical = Math.max(
      0,
      ...base.filter((r) => r.type === "physical").map((r) => r.value),
    );
    return [
      ...base.filter((r) => r.type !== "physical"),
      { type: "physical", value: Math.max(0, Math.min(3, physical + delta)) },
    ];
  },
  absorbPowerDamage(target, amount, type, minimum = false) {
    if (amount <= 0) return 0;
    let result = Math.max(minimum ? 1 : 0, amount - this.powerStat(target, "reduction"));
    for (const caster of this.party) {
      if (caster.sustainedWard && (caster.survival.status !== "active" || this.restrictions(caster).asleep || this.restrictions(caster).unconscious || this.clock().seconds >= caster.sustainedWard.until)) this.endWard(caster);
    }
    const shield = (target.powerEffects ?? [])
      .filter(
        (e) =>
          e.expiresAt > this.clock().seconds &&
          e.expiresTurn >= (target.powerTurn ?? 0) &&
          e.stats.absorb > 0,
      )
      .sort((a, b) => b.stats.absorb - a.stats.absorb)[0];
    if (shield) {
      const used = Math.min(result, shield.stats.absorb);
      shield.stats.absorb -= used;
      result -= used;
    }
    if (amount > 0) this.breakConcealment(target);
    return result;
  },
  powerDamage(target, amount, type, actor, attack = true) {
    return this.powerDamageComponents(target, [{type, amount:Math.max(0,amount)}], actor, attack);
  },
  powerDamageComponents(target, components, actor, attack = true, defense = null) {
    const type = components[0].type;
    if (!alive(target)) return 0;
    const resistances = defense?.resistances ?? (target.survival
      ? this.powerResistances(
          target,
          Object.entries(target.preview.resistances).map(([type, value]) => ({
            type,
            value,
          })),
        )
      : this.creatureResistances(target));
    const modern = deedsHero(actor?.draft) || deedsHero(target.draft);
    let damage = (modern ? deedsDamage : this.R.damageEvent)({
      components, attack, immunities: target.survival ? [] : this.creature(target)?.immunities ?? [],
      resistances,
      weaknesses: target.survival ? [] : this.creatureWeaknesses(target),
    }).total;
    if (target.survival) damage = this.suffer(target, damage, type, actor, modern && attack).applied;
    else {
      damage = this.absorbPowerDamage(target, damage, type, modern && attack);
      target.hp = Math.max(0, target.hp - damage);
      if (actor) this.creatureAfterHit(target, actor, { type }, damage);
      this.defeatEnemy(target);
    }
    return damage;
  },
  powerCells(spec, actor, point) {
    const origin = spec.target === "self" ? actor : point;
    const dx = point.x - actor.x,
      dz = point.z - actor.z,
      len = Math.hypot(dx, dz) || 1;
    return Object.values(this.map.tiles).filter((p) => {
      if (wallAt(this.map, p.x, p.z)) return false;
      if (spec.shape === "line") {
        const along = ((p.x - actor.x) * dx + (p.z - actor.z) * dz) / len,
          side = Math.abs((p.x - actor.x) * dz - (p.z - actor.z) * dx) / len;
        return (
          along > 0 &&
          along <= len + 0.1 &&
          side < 0.55 &&
          lineOfSight(this.map, actor, p)
        );
      }
      if (spec.shape === "cone") {
        const px = p.x - actor.x,
          pz = p.z - actor.z;
        return (
          distance(actor, p) > 0 &&
          distance(actor, p) <= spec.range &&
          (px * dx + pz * dz) / (Math.hypot(px, pz) * len) >= 0.7 &&
          lineOfSight(this.map, actor, p)
        );
      }
      if (spec.shape === "wall") {
        const sx = Math.sign(dx),
          sz = Math.sign(dz);
        return [-1, 0, 1].some(
          (n) => p.x === point.x - sz * n && p.z === point.z + sx * n,
        );
      }
      return (
        distance(p, origin) <= (spec.radius ?? 0) &&
        lineOfSight(this.map, origin, p)
      );
    });
  },
  powerPlan(id, target, actor = this.active) {
    const spec = this.powerSpec(id, actor);
    if (!spec) throw new Error("Unknown game power.");
    const point =
      spec.target === "self"
        ? actor
        : typeof target === "string"
          ? [...this.party, ...this.enemies].find((p) => p.id === target)
          : target;
    if (
      !point ||
      !Number.isInteger(point.x) ||
      !Number.isInteger(point.z) ||
      !this.map.tiles[key(point.x, point.z)]
    )
      throw new Error("Choose a valid target on the dungeon floor.");
    if (
      spec.effects.some((e) => e.kind === "clearNpcTerrain") &&
      !(this.map.zones ?? []).some(
        (z) =>
          z.caltrops && z.cells.some((p) => p.x === point.x && p.z === point.z),
      )
    )
      throw new Error("Choose a caltrop patch within reach.");
    if (spec.otherOnly && point.id === actor.id)
      throw new Error("Choose another companion.");
    if (
      spec.target === "enemy" &&
      (!this.enemies.includes(point) ||
        point.hp <= 0 ||
        !this.encounter?.roster.some((p) => p.id === point.id && !p.withdrawn))
    )
      throw new Error("Choose a living enemy in this encounter.");
    if (
      spec.target === "ally" &&
      (!this.party.includes(point) || !alive(point))
    )
      throw new Error("Choose a living companion.");
    const relocating = spec.effects.some((e) => e.kind === "move");
    if (distance(actor, point) > (spec.range ?? 0) && spec.target !== "self")
      throw new Error(`Choose a target within ${spec.range} squares.`);
    if (spec.target !== "self" && !lineOfSight(this.map, actor, point))
      throw new Error("The path or line of sight is blocked.");
    if (
      (spec.target === "enemy" || spec.target === "ground") &&
      !this.heroCanSee(actor, point)
    )
      throw new Error("The target is hidden. Bring light or reveal it first.");
    let route = [];
    if (relocating) {
      if (
        this.occupied(actor.id).has(key(point.x, point.z)) ||
        this.map.obstacles[key(point.x, point.z)] ||
        wallAt(this.map, point.x, point.z) ||
        distance(actor, point) === 0
      )
        throw new Error("Choose empty, reachable ground.");
      if (spec.effects.find((e) => e.kind === "move").mode === "route") {
        route = pathfind(this.map, actor, point, this.occupied(actor.id));
        if (!route.length || route.length > spec.range)
          throw new Error("No clear walking route within range.");
      }
    }
    const cells = this.powerCells(spec, actor, point),
      cellSet = new Set(cells.map((p) => key(p.x, p.z)));
    if (
      spec.effects.some((e) => e.kind === "zone" && e.surface === "wall") &&
      (!cells.length ||
        cells.some(
          (p) =>
            this.occupied().has(key(p.x, p.z)) ||
            this.map.obstacles[key(p.x, p.z)] ||
            [this.map.entrance, this.map.exit].some(
              (s) => s && s.x === p.x && s.z === p.z,
            ),
        ))
    )
      throw new Error("A barrier needs empty ground away from stairs.");
    const hostile =
      spec.target === "enemy" ||
      spec.effects.some((e) => ["damage", "condition"].includes(e.kind));
    let recipients = relocating
      ? [actor]
      : spec.target === "ground" || spec.radius || spec.shape
        ? [...(spec.allCreatures ? [...this.party,...this.enemies] : hostile ? this.enemies : this.party)].filter(
            (p) => alive(p) && cellSet.has(key(p.x, p.z)),
          )
        : [point];
    if (spec.target === "self" && !spec.radius) recipients = [actor];
    if (hostile)
      recipients = recipients.filter((p) =>
        this.encounter?.roster.some((r) => r.id === p.id && !r.withdrawn),
      );
    if (spec.maxTargets) {
      recipients = recipients.filter(r=>!spec.volley || (distance(actor,r)<=spec.range && this.heroCanSee(actor,r) && lineOfSight(this.map,actor,r)))
        .sort((a,b)=>Number(b===point)-Number(a===point)||distance(point,a)-distance(point,b)||a.id.localeCompare(b.id)).slice(0,spec.maxTargets);
    }
    for (const e of spec.effects) {
      if (e.kind === "refill" && !point.preview?.inventory.items.some(i=>i.carried && i.catalogId==="item-water-flask" && this.supplyValue(point,i)<8))
        throw Error("Choose a companion with a partly empty water flask.");
      if (e.kind === "transferSP") {
        const donor = e.draw ? point : actor, receiver = e.draw ? actor : point;
        if (!(donor.sp - (donor===actor?spec.spCost:0)>0) || !(receiver.sp - (receiver===actor?spec.spCost:0)<receiver.preview.summary.maximumSp))
          throw Error("Choose a donor with SP and a recipient with room in their reserve.");
      }
    }
    if (spec.effects.some((e) => e.kind === "damage") && !recipients.length)
      throw new Error("No enemies in the affected area.");
    if (
      spec.effects.some((e) => e.kind === "wound") &&
      !recipients.some((p) =>
        p.wounds?.some(
          (w) => !w.treatment?.completed && w.record.recoveryValue,
        ),
      )
    )
      throw new Error("No recoverable wound on this target.");
    for (const effect of spec.effects.filter((e) => e.kind === "resource")) {
      const budget = this.budgets?.[point.id];
      if (
        !this.canAct(point) ||
        (effect.resource === "maneuver" && point.powerPendingManeuver)
      )
        throw new Error(
          "Choose a capable companion without a queued bonus Maneuver.",
        );
      if (
        effect.resource !== "maneuver" &&
        (!budget ||
          !budget.retained.includes(effect.resource) ||
          budget.remaining[effect.resource] > 0)
      )
        throw new Error("Choose a companion with a spent, retained Reaction.");
    }
    if (spec.effects.every(e=>e.kind==="stabilize") && !recipients.some(p=>p.survival?.status==="dying"))
      throw Error("Choose a dying companion.");
    const canCleanse = spec.effects.some(
      (effect) =>
        effect.kind === "cleanse" &&
        (effect.self ? [actor] : recipients).some((p) =>
          p.conditions?.some(
            (c) => c.persistence === "temporary" && effect.keys.includes(c.key),
          ),
        ),
    );
    if (spec.effects.every((e) => e.kind === "cleanse") && !canCleanse)
      throw new Error(
        "Choose a companion with a temporary condition this power can remove.",
      );
    if (
      spec.effects.some((e) => e.kind === "heal") &&
      !spec.effects.some((e) => ["damage", "wound", "stabilize"].includes(e.kind)) &&
      !canCleanse &&
      recipients.every((p) => p.survival.hp >= this.healingMaximum(p))
    )
      throw new Error("The selected companions are already at full HP.");
    return { spec, point, cells, recipients, route };
  },
  powerReason(id, h = this.active) {
    const p = this.powerSpec(id, h);
    if (!p) return "This power is unavailable.";
    if (p.deedsOnly && !deedsHero(h.draft)) return "Adopt Deeds rules in Greyhaven first.";
    if (!p.universal && !this.powerIds(h).includes(id)) return "Not learned.";
    if (this.pendingCue) return "Resolve the optional tactical step first.";
    if (p.ritualMinutes && this.mode==="combat") return "Rituals require uninterrupted time outside combat.";
    if (p.effects.some(e=>e.kind==="recall") && this.recallReason(this.party.indexOf(h))) return "Gather the company in a quiet dungeon chamber to open a return passage.";
    if (p.effects.some(e=>e.kind==="unlockVault")) {
      const door=this.map.vault?.door;
      if(this.mode!=="exploration" || !door || door.open || distance(h,door)>p.range)
        return "Move within "+p.range+" squares of a closed dungeon postern.";
    }
    if (p.context==="shrine" && this.mode!=="town") return "Visit the Shrine in Greyhaven.";
    if (p.oneHand && this.held(h,"item-ordinary-melee-weapon")?.hands !== 1) return "Ready a melee weapon in one hand.";
    if (p.effects.some(e=>e.kind==="sense") && this.mode==="town") return "Use this sense on a dungeon floor.";
    if (p.spell && deedsHero(h.draft)) {
      if (h.sp < p.spCost) return "Requires " + p.spCost + " SP.";
      if (!p.weapon && !p.shield && this.freeHands(h) < 1) return "Free one hand to cast.";
    }
    if (p.supply && !this.supplyItem(h, p.supply))
      return (
        "Carry a usable " +
        p.supply.replace("item-", "").replaceAll("-", " ") +
        "."
      );
    if (
      this.mode !== "combat" &&
      p.fieldSupply &&
      !this.supplyItem(h, p.fieldSupply)
    )
      return "Outside combat, carry a usable field dressing for this power.";
    if (p.category === "passive")
      return "Automatic benefit. Open the recipe book for crafting.";
    if (
      !this.canAct(h) ||
      this.busy ||
      this.pendingDefense ||
      this.pendingProvocation ||
      this.woundNotices?.length
    )
      return "Finish the current event first.";
    if (
      !this.continuingProvocation &&
      p.limit &&
      (h.powerUses?.[id] ?? 0) >= p.limit
    )
      return "No uses remain this encounter.";
    if (
      !this.continuingProvocation &&
      p.restLimit &&
      (h.restPowerUses?.[id] ?? 0) >= p.restLimit
    )
      return "No uses remain. Complete 8 hours of sleep to recover charges.";
    if (this.mode !== "combat") {
      if (!p.field || !["town", "exploration"].includes(this.mode))
        return "Available on your combat turn.";
      if (this.mode === "town" && p.effects.some((e) => e.kind === "zone"))
        return "Use on a dungeon battlefield.";
    } else {
      if (
        h !== this.active ||
        this.encounter.nextSide !== "players" ||
        (this.encounter.current && this.encounter.current !== h.id)
      )
        return "Wait for this hero’s turn.";
      if (this.paths.get(h.id)?.length) return "Wait until movement finishes.";
      if (
        !this.encounter.current &&
        !this.R.availableParticipants(this.encounter).some((p) => p.id === h.id)
      )
        return "This hero has already acted.";
      if (
        !this.continuingProvocation &&
        this.encounter.current === h.id &&
        !this.budget?.remaining[p.category]
      )
        return `No ${p.category} remains.`;
    }
    if (
      p.effects.some((e) => e.kind === "breakHold") &&
      !(h.conditions ?? []).some((c) => c.heldTarget === h.id && c.holder)
    )
      return "No creature is holding this hero.";
    if (
      p.effects.some((e) => e.kind === "clearNpcTerrain") &&
      !(this.map.zones ?? []).some(
        (z) => z.caltrops && z.cells.some((p) => distance(h, p) <= 1),
      )
    )
      return "No caltrops within reach.";
    if (p.shield && !this.held(h, "item-ordinary-shield"))
      return "Ready a shield first.";
    if (p.weapon && !this.held(h, `item-ordinary-${p.weapon}-weapon`))
      return `Ready a ${p.weapon === "ranged" ? "bow" : "melee weapon"} first.`;
    if (p.weapon === "ranged" && !this.supplyItem(h, "item-ammunition-bundle"))
      return "Ammunition exhausted.";
    return "";
  },
  usePower(id, target, options = {}) {
    const h = this.active,
      reason = this.powerReason(id, h);
    if (reason) throw new Error(reason);
    if (this.powerSpec(id,h).context) return this.castBookRitual(id,options.subject,h);
    const { spec, point, cells, recipients, route } = this.powerPlan(
      id,
      target,
      h,
    );
    if (this.checkPowerMovement(id, target, { spec, point, route }, options))
      return;
    if (this.mode === "combat") {
      this.spend(spec.category, id);
      if (
        (spec.spell || spec.supply) &&
        this.provoke(h, {
          kind: "ability",
          id,
          target,
          options,
          label: spec.spell ? "casting" : "retrieving a supply",
        })
      )
        return;
    }
    if (spec.spell && deedsHero(h.draft)) h.sp -= spec.spCost;
    if (this.mode !== "combat") {
      const mode = this.mode;
      this.advanceTime(60 * (spec.ritualMinutes || 1), { provisions: true });
      if (this.mode !== mode || !this.canAct(h)) { this.note(spec.name+" was interrupted."); return; }
    }
    h.powerUses ??= {};
    h.restPowerUses ??= {};
    if (spec.limit) h.powerUses[id] = (h.powerUses[id] ?? 0) + 1;
    if (spec.restLimit) h.restPowerUses[id] = (h.restPowerUses[id] ?? 0) + 1;
    const damaging = spec.effects.some((e) => e.kind === "damage");
    const extra = damaging ? this.consumeDamageBonus(h) : 0;
    const hidden = !!this.powerStat(h, "hidden");
    if (damaging) this.breakConcealment(h);
    const resolvedEffects = spec.effects.flatMap((effect) =>
      effect.kind === "damage"
        ? Array.from({ length: spec.shots ?? 1 }, (_, shot) => ({
            ...effect,
            shot,
          }))
        : [effect],
    );
    const bands = new Map(), band = result => ["weak","standard","strong"].indexOf(result.tier);
    const defenses = new Map();
    const defenseFor = (target,type) => {
      if (defenses.has(target)) return defenses.get(target);
      const base = target.survival ? {boons:0,banes:0} : this.creatureDefense(target,h,{type,weapon:spec.weapon,spell:spec.spell});
      const cover = deedsHero(h.draft) ? coverBetween(this.map,h,target) : 0;
      const extreme = Number(spec.normalRange != null && distance(h,target) > spec.normalRange);
      const defense = {...base,boons:base.boons+(spec.trainingBoon ?? 0), banes:base.banes + cover + extreme};
      defenses.set(target,defense);
      return defense;
    };
    const rollAgainst = (target,type) => {
      const d = defenseFor(target,type);
      return band(this.heroRoll(h,spec.attribute ?? "knowledge","attack",{target,
        spec:{...spec,push:spec.effects.some(e => e.kind === "push") ? [1] : null},
        sources:[{kind:"boon",amount:d.boons},{kind:"bane",amount:d.banes}]}));
    };
    let sharedSpellTier;
    if ((spec.spell || spec.volley) && deedsHero(h.draft) && recipients.length) {
      const primary = spec.effects.find(e => e.kind === "damage");
      if (primary) {
        const least = recipients.map(target => ({target,...defenseFor(target,primary.type)}))
          .sort((a,b) => (b.banes-b.boons)-(a.banes-a.boons))[0].target;
        sharedSpellTier = rollAgainst(least,primary.type);
      } else if (spec.effects.some(e => e.kind === "heal"))
        sharedSpellTier = band(this.heroRoll(h,spec.attribute,"attribute",{spec}));
    }
    for (const effect of resolvedEffects) {
      if (
        effect.kind === "damage" &&
        spec.weapon === "ranged" &&
        !this.supplyItem(h, "item-ammunition-bundle")
      )
        continue;
      if (effect.kind === "clearNpcTerrain") {
        this.clearCreatureTerrain(h, point);
        continue;
      }
      if (effect.kind === "breakHold") {
        this.breakCreatureHold(h);
        continue;
      }
      if (effect.kind === "zone") {
        this.createSurface(
          effect.surface,
          cells,
          h,
          effect.rounds +
            (spec.supply && this.traits(h).some((t) => t.device) ? 1 : 0),
        );
        continue;
      }
      if (effect.kind === "sense") { this.senseDungeon(h,effect.sense,effect.range); continue; }
      if (effect.kind === "survey") {
        this.addTactic(h, h, { reveal: true }, id);
        continue;
      }
      for (const recipient of effect.self ? [h] : recipients) {
        if (effect.minimumBand && (sharedSpellTier ?? bands.get(recipient.id) ?? 0) < effect.minimumBand) continue;
        switch (effect.kind) {
          case "damage": {
            if (!alive(recipient)) break;
            if (spec.volley && !this.supplyItem(h,"item-ammunition-bundle")) break;
            if (!spec.spell && !spec.volley) defenses.delete(recipient);
            const tier = sharedSpellTier ?? rollAgainst(recipient, effect.type);
            bands.set(recipient.id,tier);
            const weapon = spec.weapon && this.held(h, "item-ordinary-" + spec.weapon + "-weapon");
            const enchantments = weapon ? activeItemEffects(h, weapon).filter(e => e.effect === "damage") : [];
            const base = Math.max(0, value(effect.amount,tier) + (effect.shot ? 0 : extra) +
              this.buildDamage(h,recipient,spec,effect.type,tier,hidden && !effect.shot));
            const components = [{type:effect.type, amount:base}, ...enchantments.map(e => ({
              type:e.type, amount:this.enchantmentDamage(h,e,effect.type)
            }))];
            const defense=defenses.get(recipient);
            const finalDefense=spec.piercePhysical && defense?.resistances ? {...defense,resistances:defense.resistances.map(r=>r.type==="physical"?{...r,value:Math.max(0,r.value-spec.piercePhysical)}:r)} : defense;
            const originalHp=recipient.hp;
            const damage = this.powerDamageComponents(recipient,components,h,true,finalDefense);
            if(spec.volley) this.checkSupply(h,this.supplyItem(h,"item-ammunition-bundle"),"ammunition after shot");
            if (tier===2 && recipient.hp<originalHp && weaponBonus(h,spec,"leech")) this.powerHeal(h,weaponBonus(h,spec,"leech"));
            for (const enchant of enchantments) if (tier === 2 && enchant.condition)
              this.powerCondition(recipient,enchant.condition,1+this.buildStat(h,enchant.condition),h.id);
            if (
              tier === 2 &&
              recipient.hp > 0 &&
              weaponBonus(h, spec, "push") &&
              !spec.effects.some((e) => e.kind === "push" && e.amount >= 1)
            )
              this.powerForceMove(
                recipient,
                {
                  x: Math.sign(recipient.x - h.x),
                  z: Math.sign(recipient.z - h.z),
                },
                1,
                h,
              );
            if (!recipient.survival) this.buildAfterHit(h, recipient, spec, effect.type, enchantments);
            this.emit("attack", {
              attacker: h.id,
              target: recipient.id,
              ability: id,
              damage,
              element: effect.type,
              spell: spec.spell,
              ranged: spec.weapon === "ranged",
              shot: effect.shot ?? 0,
            });
            break;
          }
          case "heal": {
            const tier = sharedSpellTier ?? (spec.attribute
              ? ["weak", "standard", "strong"].indexOf(
                  this.heroRoll(h, spec.attribute, "attribute", { spec }).tier,
                )
              : 1);
            this.powerHeal(
              recipient,
              Math.max(
                0,
                value(effect.amount, tier) + this.buildStat(h, "heal"),
              ),
            );
            if (this.buildStat(h, "healingWard") > 0)
              this.powerBuff(
                h,
                recipient,
                { absorb: this.buildStat(h, "healingWard") },
                2,
                "build-healing-ward",
              );
            if (this.buildStat(h, "rallyMove") > 0)
              this.powerBuff(
                h,
                recipient,
                { movement: this.buildStat(h, "rallyMove") },
                1,
                "build-rallying-care",
              );
            break;
          }
          case "cue": {
            const cue={owner:h.id,enemy:point.id,ally:!!effect.ally,safe:!!effect.safe,ignoreTarget:!!effect.ignoreTarget,aid:!!effect.aid,
              steps:bands.get(recipient.id)===2 ? (effect.strongSteps ?? effect.steps ?? 1) : (effect.steps ?? 1)};
            if (this.cueOptions(cue).length) this.pendingCue=cue;
            break;
          }
          case "condition":
            this.powerCondition(
              recipient,
              effect.key,
              effect.rating + this.buildStat(h, effect.key),
              h.id,
            );
            break;
          case "cleanse":
            for (const k of effect.keys)
              recipient.conditions = this.R.reduceTemporary(
                recipient.conditions ?? [],
                k,
                effect.amount,
              );
            break;
          case "recall":
            this.openReturnPassage(spec.name);
            break;
          case "unlockVault": {
            const door=this.map.vault.door;
            delete this.map.obstacles[key(door.x,door.z)];
            door.open=true;
            this.seen[key(door.x,door.z)]=true;
            this.note("The ironbound postern opens quietly.");
            this.emit("world-objects");this.emit("map");
            break;
          }
          case "refill": {
            const flask=recipient.preview.inventory.items.find(i=>i.carried && i.catalogId==="item-water-flask" && this.supplyValue(recipient,i)<8);
            if(flask) recipient.supplies[flask.instanceId]=8;
            break;
          }
          case "transferSP": {
            const donor=effect.draw?recipient:h, receiver=effect.draw?h:recipient;
            const amount=Math.min(effect.amount,donor.sp,receiver.preview.summary.maximumSp-receiver.sp);
            donor.sp-=amount;receiver.sp+=amount;
            break;
          }
          case "stabilize":
            if (recipient.survival.status === "dying")
              recipient.survival = this.R.stabilize(recipient.survival);
            break;
          case "buff":
            this.powerBuff(
              h,
              recipient,
              effect.stats,
              effect.turns,
              spec.effects.some((e) => e.kind === "barrier")
                ? id + ":buff"
                : id,
            );
            break;
          case "barrier":
            if (spec.sustained && this.mode === "combat") {
              this.endWard(h);
              this.powerBuff(h, recipient, { absorb: effect.amount + this.buildStat(h, "barrier") }, 10, "ward:" + h.id);
              h.sustainedWard = { due: (h.powerTurn ?? 0) + 1, until: this.clock().seconds + 60 };
              break;
            }
            this.powerBuff(
              h,
              recipient,
              {
                absorb:
                  effect.amount +
                  this.buildStat(h, "barrier") +
                  (spec.supply && this.traits(h).some((t) => t.device) ? 2 : 0),
              },
              effect.turns,
              spec.effects.some((e) => e.kind === "buff")
                ? id + ":barrier"
                : id,
            );
            break;
          case "guard":
            this.addTactic(h, recipient, { guard: true }, id);
            break;
          case "counter":
            this.addTactic(h, recipient, { riposte: true }, id);
            break;
          case "push":
          case "pull": {
            const sign = effect.kind === "push" ? 1 : -1;
            this.powerForceMove(
              recipient,
              {
                x: Math.sign(recipient.x - h.x) * sign,
                z: Math.sign(recipient.z - h.z) * sign,
              },
              effect.amount,
              h,
            );
            break;
          }
          case "swap": {
            const from = { x: h.x, z: h.z };
            Object.assign(h, { x: recipient.x, z: recipient.z });
            Object.assign(recipient, from);
            this.surfaceContact(h, { entry: true });
            this.surfaceContact(recipient, { entry: true });
            break;
          }
          case "move": {
            const from = { x: h.x, z: h.z };
            if (effect.mode === "route")
              for (const p of route) {
                Object.assign(h, p);
                this.surfaceContact(h, { entry: true });
                if (!this.canAct(h)) break;
              }
            else {
              Object.assign(h, { x: point.x, z: point.z });
              this.surfaceContact(h, { entry: true });
            }
            this.emit("move", {
              steps: [
                {
                  heroId: h.id,
                  points:
                    effect.mode === "route"
                      ? route
                      : [from, { x: h.x, z: h.z }],
                },
              ],
            });
            break;
          }
          case "reveal":
            this.breakConcealment(recipient);
            break;
          case "resource":
            if (effect.resource === "maneuver")
              recipient.powerPendingManeuver = true;
            else this.budgets[recipient.id].remaining[effect.resource] = 1;
            (recipient.powerResourceUsed ??= []).push(effect.resource);
            break;
          case "wound": {
            const w = recipient.wounds.find(
              (w) => !w.treatment?.completed && w.record.recoveryValue,
            );
            if (w) this.completeWound(recipient, w, "Restorative magic");
            break;
          }
        }
      }
      if (effect.kind === "damage" && spec.weapon === "ranged" && !spec.volley) {
        const ammunition = this.supplyItem(h, "item-ammunition-bundle");
        if (ammunition)
          this.checkSupply(h, ammunition, "ammunition after shot");
      }
    }
    if (spec.supply) {
      const item = this.supplyItem(h, spec.supply);
      if (spec.consume) {
        h.supplies[item.instanceId] = 0;
        this.supplyNotice(h, item, `${item.definition.name} was used.`);
      } else this.checkSupply(h, item, "supply after use");
    }
    if (this.mode !== "combat" && spec.fieldSupply)
      this.checkSupply(
        h,
        this.supplyItem(h, spec.fieldSupply),
        "field care after use",
      );
    this.note(
      `${h.name} · ${spec.name}${recipients.length ? `: ${recipients.map((p) => p.name).join(", ")}` : ""}.`,
    );
    this.emit("battlefield");
    this.emit("change");
    if (this.pendingCue) this.emit("tactical-step");
    if (this.mode === "combat") this.advance();
  },
};
