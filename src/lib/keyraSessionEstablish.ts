import "server-only";

import {
  fetchAuthProfileHintByPhone,
  nameLooksLikePhone,
  pickDisplayNameFromSearchParams,
} from "@/lib/authProfileHint";
import type { KeyraSessionUser } from "@/lib/keyraSessionCookie";
import { isValidMobileE164 } from "@/lib/keyraRegistrationValidation";
import { buildKeyraSessionUser } from "@/lib/keyraSessionResponse";
import { fetchAuthSessionSnapshot } from "@/lib/keyraProtection";

export { pickDisplayNameFromSearchParams } from "@/lib/authProfileHint";

export async function resolveKeyraSessionUserFromAuth(
  req: Request,
): Promise<KeyraSessionUser | null> {
  const auth = await fetchAuthSessionSnapshot(req);
  if (!auth.authenticated || !auth.phoneE164) return null;
  return buildKeyraSessionUser(auth.phoneE164, auth);
}

export async function resolveKeyraSessionUserFromPhone(
  phone: string,
  hints?: { displayName?: string | null; email?: string | null },
  req?: Request,
): Promise<KeyraSessionUser | null> {
  const trimmed = phone.trim();
  if (!isValidMobileE164(trimmed)) return null;

  let displayName = hints?.displayName?.trim() || undefined;
  let email = hints?.email?.trim() || undefined;

  if (!displayName || nameLooksLikePhone(displayName, trimmed)) {
    const profile = await fetchAuthProfileHintByPhone(trimmed, req);
    if (profile?.displayName) {
      displayName = profile.displayName;
      if (!email && profile.email) email = profile.email;
    }
  }

  return buildKeyraSessionUser(trimmed, {
    displayName,
    fullName: displayName,
    email,
  });
}

export function pickPhoneFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): string | null {
  const read = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key)?.trim();
    }
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim();
  };

  for (const key of ["phone", "phoneNumber", "mobile", "msisdn"]) {
    const v = read(key);
    if (v?.startsWith("+")) return v;
  }
  return null;
}

/** Dev-only: establish localhost session after Get Started when auth cookies cannot cross origins. */
export function devSessionPhoneFallback(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const phone = process.env.KEYRA_DEV_SESSION_PHONE?.trim();
  return phone?.startsWith("+") ? phone : null;
}

export function safeSessionContinueNext(raw: string | null | undefined): string {
  const next = raw?.trim() || "/";
  return next.startsWith("/") ? next : "/";
}
