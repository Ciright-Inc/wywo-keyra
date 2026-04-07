/**
 * Build OIDC authorize URL for mobile network phone verification (same contract as get-started).
 * Server: set IPIFICATION_* (runtime) or NEXT_PUBLIC_IPIFICATION_* (build). Prefer IPIFICATION_BASE_URL on the server
 * so stage/prod can be switched without rebuilding.
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

/** OAuth client settings from env (server sees IPIFICATION_* and NEXT_PUBLIC_*; browser bundle only sees NEXT_PUBLIC_*). */
export function resolveIpificationOAuthConfig(): {
  baseUrl: string;
  clientId: string;
  redirectUri: string;
} | null {
  const baseUrl =
    process.env.IPIFICATION_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_IPIFICATION_BASE_URL?.trim() ||
    "https://api.stage.ipification.com";
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
