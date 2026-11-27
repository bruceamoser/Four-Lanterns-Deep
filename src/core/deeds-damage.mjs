const types = new Set([
  "physical",
  "fire",
  "cold",
  "lightning",
  "poison",
  "life",
  "radiant",
  "mental",
  "force",
]);

// The minimum belongs to the entire immediate attack after matching defenses.
export function deedsDamage({
  components,
  resistances = [],
  weaknesses = [],
  immunities = [],
  attack = true,
}) {
  const immune = new Set(immunities.map((value) => value.toLowerCase()));
  const values = new Map();
  for (const { type, amount } of components) {
    if (!types.has(type) || !Number.isSafeInteger(amount) || amount < 0)
      throw new Error("Invalid damage component.");
    if (amount && !immune.has(type))
      values.set(type, (values.get(type) ?? 0) + amount);
  }
  const highest = (list, type) =>
    Math.min(
      3,
      Math.max(
        0,
        ...list
          .filter((entry) => entry.type === type)
          .map((entry) => entry.value),
      ),
    );
  const breakdown = [...values].map(([type, original]) => {
    const weakness = highest(weaknesses, type),
      resistance = highest(resistances, type);
    return {
      type,
      original,
      weakness,
      resistance,
      afterResistance: Math.max(0, original + weakness - resistance),
    };
  });
  const subtotal = breakdown.reduce((sum, c) => sum + c.afterResistance, 0);
  return {
    breakdown,
    subtotal,
    total: Math.max(attack && breakdown.length ? 1 : 0, subtotal),
  };
}

export function coverBetween(map, attacker, defender) {
  const dx = attacker.x - defender.x,
    dz = attacker.z - defender.z;
  if (Math.max(Math.abs(dx), Math.abs(dz)) <= 1) return 0;
  const signX = Math.sign(dx),
    signZ = Math.sign(dz);
  const cells = [[signX, signZ]];
  if (signX && signZ) cells.push([signX, 0], [0, signZ]);
  return Math.max(
    0,
    ...cells.map(([x, z]) => {
      const key = [defender.x + x, defender.z + z].join(",");
      return map.obstacles?.[key] ? 3 : map.tiles[key]?.low ? 1 : 0;
    }),
  );
}
