import {
  KEYRA_SESSION_COOKIE,
  parseSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { fetchAuthSessionSnapshot } from "@/lib/keyraProtection";
import { loadSavedProfileFields } from "@/lib/keyraSiteUserProfileDb";
import { cookies } from "next/headers";

export async function requireKeyraSessionUser(
  req: Request,
): Promise<KeyraSessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(KEYRA_SESSION_COOKIE)?.value;
  if (raw) {
    const parsed = parseSession(raw);
    if (parsed) return parsed;
  }

  const auth = await fetchAuthSessionSnapshot(req);
  if (!auth.authenticated || !auth.phoneE164) {
    return null;
  }

  const saved = await loadSavedProfileFields(auth.phoneE164);
  const displayName =
    saved.displayName ??
    auth.displayName ??
    auth.username ??
    auth.fullName ??
    undefined;

  return {
    phoneE164: auth.phoneE164,
    displayName: displayName || undefined,
    email: saved.email ?? auth.email ?? undefined,
    country: saved.country,
  };
}
