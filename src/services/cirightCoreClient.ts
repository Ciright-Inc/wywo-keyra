/**
 * Ciright Core HTTP client — server-only.
 *
 * TODO: Replace placeholder methods with real Ciright Core REST endpoints once
 * URL paths and auth scheme are finalized. Never expose keys to the browser.
 *
 * Expected env:
 * - CIRIGHT_CORE_API_BASE_URL — base URL with no trailing slash
 * - CIRIGHT_CORE_API_KEY — bearer / API key as required by Core
 */

export type CirightCoreClientConfig = {
  baseUrl: string | null;
  apiKey: string | null;
};

export function getCirightCoreConfig(): CirightCoreClientConfig {
  const baseUrl = process.env.CIRIGHT_CORE_API_BASE_URL?.trim() || null;
  const apiKey = process.env.CIRIGHT_CORE_API_KEY?.trim() || null;
  return { baseUrl, apiKey };
}

export function isCirightCoreConfigured(): boolean {
  const { baseUrl, apiKey } = getCirightCoreConfig();
  return Boolean(baseUrl && apiKey);
}

/** Minimal typed helper — extend when endpoints exist. */
export async function cirightCorePostJson<TBody extends object, TResp = unknown>(
  path: string,
  body: TBody,
): Promise<{ ok: true; data: TResp } | { ok: false; status: number; message: string }> {
  const { baseUrl, apiKey } = getCirightCoreConfig();

  // TODO: Remove this guard when Ciright Core is wired; keeps local/dev flows safe.
  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      status: 503,
      message: "Ciright Core is not configured on this environment.",
    };
  }

  const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  // TODO: Align headers with Ciright Core auth (Bearer, tenant id, etc.).
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      message: text.slice(0, 500) || "Ciright Core request failed.",
    };
  }

  const data = (await res.json().catch(() => ({}))) as TResp;
  return { ok: true, data };
}
