export const TORCH_BURN_INTERVAL = 3600;

// Retire the old, party-wide step and stationary-work meters once per saved run.
export function prepareProvisions(campaign) {
  if (!campaign.provisionTrail) return;
  const now = campaign.clockSeconds ?? (campaign.hours ?? 0) * 3600;
  for (const hero of [
    ...campaign.party,
    ...(campaign.reserve ?? []),
    ...(campaign.fallenHeroes ?? []).map((e) => e.hero).filter(Boolean),
  ]) {
    const needs = hero.needs;
    if (!needs) continue;
    for (const [last, due] of [
      ["ateAt", "foodDue"],
      ["drankAt", "waterDue"],
    ]) {
      if (needs[due] && now - needs[last] < 86400) {
        delete needs[due];
        needs.warned = (needs.warned ?? []).filter((key) => key !== last);
      }
    }
  }
  delete campaign.provisionTrail;
}

export const provisionMethods = {
  burnTorches(seconds) {
    for (const hero of this.party) {
      if (!hero.torch?.lit) continue;
      hero.torch.seconds += seconds;
      while (hero.torch.seconds >= TORCH_BURN_INTERVAL) {
        const item = this.supplyItem(hero, "item-lighting-bundle");
        if (!item) break;
        hero.torch.seconds -= TORCH_BURN_INTERVAL;
        this.checkSupply(hero, item, "an hour of torchlight");
      }
      if (!this.supplyItem(hero, "item-lighting-bundle")) {
        hero.torch.seconds = 0;
        this.syncTorches();
      }
    }
  },
};
