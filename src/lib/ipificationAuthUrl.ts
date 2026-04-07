/**
 * Build OIDC authorize URL for mobile network phone verification (same contract as get-started).
 *
 * Base URL uses only IPIFICATION_BASE_URL (server/runtime). We intentionally do not read
 * NEXT_PUBLIC_IPIFICATION_BASE_URL for the host: it is easy to leave set to prod in Railway and it is
 * available at runtime on the server too, which blocked stage. Default is stage; for prod Keyra set
 * IPIFICATION_BASE_URL=https://api.ipification.com.
 *
 * Client id / redirect: IPIFICATION_* first, then NEXT_PUBLIC_*.
 */

export type IpificationStatePayload = {
  nonce: string;
  phone: string;
  linkId?: string;
  returnUrl?: string;
};

export function encodeIpificationState(payload: IpificationStatePayload): string {
  return btoa(JSON.stringify(payload));
}

export function decodeIpificationState(rawState: string): IpificationStatePayload | null {
  if (!rawState) return null;
  try {
    const decoded = atob(rawState);
    const parsed = JSON.parse(decoded) as Partial<IpificationStatePayload>;
    if (!parsed.phone || typeof parsed.phone !== "string") return null;
    return {
      nonce: typeof parsed.nonce === "string" ? parsed.nonce : "",
      phone: parsed.phone,
      linkId: typeof parsed.linkId === "string" ? parsed.linkId : undefined,
      returnUrl: typeof parsed.returnUrl === "string" ? parsed.returnUrl : undefined,
    };
  } catch {
    return null;
  }
}

type BuildArgs = { phone: string; linkId?: string; returnUrl?: string };

/** OAuth client settings from env (server: set IPIFICATION_* on Keyra for base URL + optional client/redirect). */
export function resolveIpificationOAuthConfig(): {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
} | null {
  const baseUrl = process.env.IPIFICATION_BASE_URL?.trim() || "https://api.stage.ipification.com";
  const clientId =
    process.env.IPIFICATION_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_IPIFICATION_CLIENT_ID?.trim() ||
    "";
  const redirectUri =
    process.env.IPIFICATION_REDIRECT_URI?.trim() ||
    process.env.NEXT_PUBLIC_IPIFICATION_REDIRECT_URI?.trim() ||
    "";
  if (!clientId || !redirectUri) return null;
  return { baseUrl, clientId, redirectUri };
}

export function buildIpificationAuthUrlFromConfig(
  cfg: { baseUrl: string; clientId: string; redirectUri: string },
  { phone, linkId, returnUrl }: BuildArgs,
): string {
  const nonce =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const state = encodeIpificationState({
    nonce,
    phone,
    linkId,
    returnUrl,
  });

  const loginHint = phone.replace(/\D/g, "");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    scope: "openid ip:phone_verify",
    state,
    login_hint: loginHint || "999123456789",
  });

  return `${String(cfg.baseUrl).replace(/\/+$/, "")}/auth/realms/ipification/protocol/openid-connect/auth?${params.toString()}`;
}

export function buildIpificationAuthUrl(args: BuildArgs): string | null {
  const cfg = resolveIpificationOAuthConfig();
  if (!cfg) return null;
  return buildIpificationAuthUrlFromConfig(cfg, args);
}
