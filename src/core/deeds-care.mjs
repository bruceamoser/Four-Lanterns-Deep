import { deedsHero } from "./deeds-development.mjs";
import { distance } from "./dungeon.mjs";

export function spendDeedsGrit(state) {
  if (!["dying", "stable"].includes(state.status) || !state.gritAvailable) throw new Error("Grit requires a living hero at 0 HP and an unspent point.");
  return { ...state, gritAvailable: state.gritAvailable - 1, hp: Math.ceil(state.maxHp / 2), status: "active", marks: 0, successes: 0, due: null };
}
export function deathBand(state, tier, avert) {
  if (state.status !== "dying" || !["weak","standard","strong"].includes(tier)) throw new Error("Invalid death roll.");
  const next = { ...state, marks: state.marks + Number(tier === "weak"), successes: (state.successes ?? 0) + Number(tier === "strong") };
  if (next.successes === 3) return { ...next, status: "stable", due: null, marks: 0, successes: 0 };
  if (next.marks === 3) return avert && next.gritAvailable ? spendDeedsGrit(next) : { ...next, status: "dead", due: null };
  return next;
}
export const deedsCareMethods = {
  deedsHarm(h, amount, type) {
    const s = h.survival;
    if (!amount || ["dead","lastWords"].includes(s.status)) return { state:s, wound:false };
    if (s.hp > 0) {
      s.hp = Math.max(0, s.hp - amount);
      if (!s.hp) {
        Object.assign(s, {status:"dying", marks:0, successes:0, due:null, choice:null});
        h.pendingScar ??= h.lastHarm ?? ("Survived " + type + " harm");
        if (!h.conditions.some(c => c.key === "prone")) this.powerCondition(h, "prone", 1, h.id);
        this.note(h.name + " falls prone and is Dying.");
      }
    } else {
      if (s.status === "stable") Object.assign(s, {status:"dying", marks:0, successes:0});
      h.survival = deathBand(s, this.heroRoll(h, "fortitude", "death").tier, h.avertDeath !== false);
      this.note(h.name + " suffers further harm at 0 HP · " + this.deathSummary(h));
    }
    return {state:h.survival, wound:false};
  },
  deathSummary(h) {
    const s = h.survival;
    return s.status === "dying" ? (s.successes ?? 0) + "/3 successes · " + s.marks + "/3 failures" : s.status + " · " + s.hp + " HP";
  },
  useGrit(h) {
    if (!this.party.includes(h) || !deedsHero(h.draft)) throw new Error("Choose a Deeds hero.");
    h.survival = spendDeedsGrit(h.survival);
    this.note(h.name + " spends Grit and rises to " + h.survival.hp + " HP.");
    this.emit("party"); this.emit("change");
  },
  recordScars() {
    for (const h of this.party) if (h.pendingScar && ["active","stable"].includes(h.survival.status)) {
      (h.scars ??= []).push({ text:h.pendingScar, depth:this.campaign.depth, at:this.clock().seconds });
      delete h.pendingScar;
    }
  },
  recoverBrief(h) {
    if (!deedsHero(h.draft) || h.briefRestDay === this.clock().day || !["active","stable"].includes(h.survival.status)) return false;
    h.survival = this.R.receiveHealing(h.survival, 6);
    h.sp = Math.min(h.preview.summary.maximumSp, h.sp + 3);
    h.briefRestDay = this.clock().day;
    return true;
  },
  recoverNight(h) {
    if (!deedsHero(h.draft) || !["active","stable"].includes(h.survival.status)) return false;
    const now = this.clock().seconds;
    if (h.lastNight != null && now - h.lastNight < 86400) return false;
    if (this.mode !== "town" && !["item-food-bundle","item-water-flask"].every(id => this.party.some(p => this.supplyItem(p, id)))) return false;
    h.survival = this.R.receiveHealing(h.survival, h.survival.maxHp);
    h.sp = h.preview.summary.maximumSp;
    h.firstAidSpent = false;
    h.lastNight = now;
    return true;
  },
  firstAid(healer, patient, { atCamp = false } = {}) {
    if (!this.party.includes(healer) || !this.party.includes(patient) || !deedsHero(patient.draft) || !this.canAct(healer) || !["town","exploration"].includes(this.mode) || !["stable","active"].includes(patient.survival.status)) throw new Error("Stabilize the patient and find ten quiet minutes first.");
    if (!atCamp && this.mode !== "town" && distance(healer,patient) > this.touchRange(healer)) throw new Error("Move beside the patient.");
    if (patient.firstAidSpent) throw new Error("This patient needs a safe night before more first aid.");
    if (patient.survival.hp >= patient.survival.maxHp) throw new Error("The patient is already at full HP.");
    const supply = this.campMedicalSupply("item-field-dressing");
    if (!supply) throw new Error("The company needs clean dressings.");
    patient.firstAidSpent = true;
    this.checkSupply(supply.hero,supply.item,"first aid");
    if (!atCamp) this.advanceTime(600, {provisions:true});
    const tier = this.heroRoll(healer,"knowledge").tier;
    const before = patient.survival.hp;
    patient.survival = this.R.receiveHealing(patient.survival, {weak:2,standard:4,strong:6}[tier]);
    this.note(healer.name + " treats " + patient.name + " for " + (patient.survival.hp-before) + " HP.");
    this.emit("party"); this.emit("change");
  },
};
