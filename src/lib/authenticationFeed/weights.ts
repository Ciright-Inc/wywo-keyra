export function normalizeActiveWeights<T extends { id: string; active: boolean; percentageWeight: number }>(
  rows: T[],
): Map<string, number> {
  const active = rows.filter((r) => r.active);
  const sum = active.reduce((s, r) => s + Math.max(0, r.percentageWeight), 0);
  const m = new Map<string, number>();
  if (!active.length) return m;
  if (sum <= 0) {
    const u = 100 / active.length;
    for (const r of active) m.set(r.id, u);
    return m;
  }
  for (const r of active) {
    m.set(r.id, (Math.max(0, r.percentageWeight) / sum) * 100);
  }
  return m;
}

export function weightedPickById<T extends { id: string }>(
  items: T[],
  weights: Map<string, number>,
  random: () => number,
): T {
  if (!items.length) {
    throw new Error("weightedPickById: empty items");
  }
  let sum = 0;
  for (const it of items) {
    sum += Math.max(0, weights.get(it.id) ?? 0);
  }
  if (sum <= 0) {
    return items[Math.floor(random() * items.length)]!;
  }
  let r = random() * sum;
  for (const it of items) {
    const w = Math.max(0, weights.get(it.id) ?? 0);
    r -= w;
    if (r <= 0) return it;
  }
  return items[items.length - 1]!;
}
