/** Decodes OIDC state from POST /auth/phone-verify/browser-start (Base64 JSON, server-issued). */
export type IpificationStatePayload = {
  nonce: string;
  phone: string;
  linkId?: string;
  returnUrl?: string;
};

export function decodeIpificationState(rawState: string): IpificationStatePayload | null {
  if (!rawState) return null;
  try {
    const decoded = atob(rawState);
    const parsed = JSON.parse(decoded) as Partial<IpificationStatePayload>;
    if (!parsed.phone || typeof parsed.phone !== "string") {
      return null;
    }
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
