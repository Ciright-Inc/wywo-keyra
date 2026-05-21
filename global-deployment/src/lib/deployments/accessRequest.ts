import type { AccessDomainRule } from "@prisma/client";

export function emailDomainFromAddress(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function normalizeEmailDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^\./, "");
}

/**
 * Returns the matched rule when the email domain equals an allowed domain
 * or is a subdomain of it (e.g. mail.uidai.gov.in → uidai.gov.in).
 */
export function matchAccessDomainRule(
  emailDomain: string,
  rules: Pick<AccessDomainRule, "allowedEmailDomain" | "isActive">[],
): { matched: true; allowedEmailDomain: string } | { matched: false } {
  const needle = normalizeEmailDomain(emailDomain);
  const active = rules.filter((r) => r.isActive);
  for (const r of active) {
    const hay = normalizeEmailDomain(r.allowedEmailDomain);
    if (needle === hay) return { matched: true, allowedEmailDomain: hay };
    if (needle.endsWith(`.${hay}`)) return { matched: true, allowedEmailDomain: hay };
  }
  return { matched: false };
}
