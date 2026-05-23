/** Cryptographic RNG — works in Node and modern browsers. */
export function makeFeedRng(): () => number {
  return () => {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0]! / 0xffff_ffff;
  };
}

/** Fisher–Yates shuffle (mutates array). */
export function shuffleInPlace<T>(items: T[], random: () => number = makeFeedRng()): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

export function shuffledCopy<T>(items: T[], random: () => number = makeFeedRng()): T[] {
  return shuffleInPlace([...items], random);
}

export function pickRandom<T>(items: T[], random: () => number = makeFeedRng()): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(random() * items.length)]!;
}
