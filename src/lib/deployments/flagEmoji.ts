export function flagEmojiFromIso2(iso2: string): string {
  const iso = iso2.toUpperCase();
  if (iso.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const pts = [...iso].map((ch) => {
    const cp = ch.codePointAt(0);
    if (!cp) return A;
    return A + (cp - 65);
  });
  return String.fromCodePoint(...pts);
}
