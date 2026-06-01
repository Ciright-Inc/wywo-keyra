import "server-only";

import { resolveAuthBackendUrl } from "@/lib/resolveAuthBackendUrl";

export type AuthProfileHint = {
  displayName?: string | null;
  fullName?: string | null;
  email?: string | null;
};

export function nameLooksLikePhone(name: string, phoneE164: string): boolean {
  const n = name.replace(/\s+/g, "");
  const p = phoneE164.replace(/\s+/g, "");
  if (n === p) return true;
  return n.replace(/\D/g, "") === p.replace(/\D/g, "") && n.replace(/\D/g, "").length >= 9;
}

export async function fetchAuthProfileHintByPhone(
  phoneE164: string,
  req?: Request,
): Promise<AuthProfileHint | null> {
  try {
    const base = resolveAuthBackendUrl(req);
    const res = await fetch(
      `${base}/auth/ecosystem/profile-hint?phone=${encodeURIComponent(phoneE164)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as AuthProfileHint;
    const displayName = json.displayName?.trim() || json.fullName?.trim() || null;
    if (!displayName || nameLooksLikePhone(displayName, phoneE164)) return null;
    return {
      displayName,
      fullName: json.fullName?.trim() || displayName,
      email: json.email?.trim() || null,
    };
  } catch {
    return null;
  }
}

export function pickDisplayNameFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): string | null {
  const read = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key)?.trim();
    }
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim();
  };

  for (const key of ["displayName", "fullName", "name"]) {
    const v = read(key);
    if (v && v.length >= 2 && !v.startsWith("+")) return v;
  }
  return null;
}
