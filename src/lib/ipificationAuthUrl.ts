/**
 * Build OIDC authorize URL for mobile network phone verification (same contract as get-started).
 * Requires NEXT_PUBLIC_IPIFICATION_* at build time.
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

export function buildIpificationAuthUrl({ phone, linkId, returnUrl }: BuildArgs): string | null {
  const clientId = process.env.NEXT_PUBLIC_IPIFICATION_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_IPIFICATION_REDIRECT_URI;
  const baseUrl = process.env.NEXT_PUBLIC_IPIFICATION_BASE_URL ?? "https://api.ipification.com";

  if (!clientId || !redirectUri) return null;

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
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid ip:phone_verify",
    state,
    login_hint: loginHint || "999123456789",
  });

  return `${String(baseUrl).replace(/\/+$/, "")}/auth/realms/ipification/protocol/openid-connect/auth?${params.toString()}`;
}
