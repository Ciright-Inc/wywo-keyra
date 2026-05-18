import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "keyra_events_admin";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function createAdminToken(): string {
  const exp = Date.now() + 7 * 24 * 3600 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const secret = getSecret();
  if (!secret || secret.length < 16) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  return Boolean(raw && verifyAdminToken(raw));
}

export function adminPasswordMatches(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return Boolean(expected && pw === expected);
}
