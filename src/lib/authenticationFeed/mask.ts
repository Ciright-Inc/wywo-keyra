import { randomBytes } from "node:crypto";

const CHARSET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomChar(random: () => number): string {
  return CHARSET[Math.floor(random() * CHARSET.length)] ?? "X";
}

const KINDS = ["USR", "DEV", "SIM", "SAT-TXN"] as const;

export function nextMaskedReference(random: () => number): string {
  const kind = KINDS[Math.floor(random() * KINDS.length)]!;
  if (kind === "SAT-TXN") {
    const a = randomChar(random) + randomChar(random);
    const b = randomChar(random) + randomChar(random);
    return `SAT-TXN-${a}***${b}`;
  }
  const mid = `${randomChar(random)}${randomChar(random)}${randomChar(random)}`;
  const tail = String(Math.floor(random() * 90) + 10);
  return `${kind}-${mid}***${tail}`;
}

export function fingerprintFromRequest(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "0";
  const ua = req.headers.get("user-agent")?.trim() || "";
  const raw = `${ip}|${ua.slice(0, 400)}`;
  return Buffer.from(raw, "utf8").toString("base64url").slice(0, 64);
}
