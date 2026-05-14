/** Browser helpers for obfuscated / sealed public feed JSON. */

function b64ToUtf8(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export type FeedResolveResult =
  | { ok: true; json: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Expands v1 base64-wrapped or v2 AES-sealed payloads from session/batch endpoints.
 */
export async function resolvePublicFeedJson(
  data: unknown,
  kind: "session" | "batch",
): Promise<FeedResolveResult> {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "Invalid response." };
  }
  const o = data as Record<string, unknown>;
  if (o.v === 2 && o.enc === true && typeof o.blob === "string") {
    const res = await fetch("/api/keyra/latest-authentications/unseal", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blob: o.blob, kind }),
    });
    const inner = (await res.json()) as { error?: string } & Record<string, unknown>;
    if (!res.ok) {
      return { ok: false, error: typeof inner.error === "string" ? inner.error : "Unseal failed." };
    }
    return { ok: true, json: inner };
  }
  if (o.v === 1 && o.enc === true && typeof o.d === "string") {
    try {
      const parsed: unknown = JSON.parse(b64ToUtf8(o.d));
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return { ok: true, json: parsed as Record<string, unknown> };
      }
    } catch {
      /* fallthrough */
    }
    return { ok: false, error: "Could not decode feed payload." };
  }
  return { ok: true, json: o };
}
