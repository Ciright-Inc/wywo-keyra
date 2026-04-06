/**
 * Env values like `auth.example.com` (no scheme) are treated by fetch as paths on the
 * current page origin. Normalize to an absolute http(s) origin for API/auth bases.
 */
export function ensureApiOriginUrl(raw: string | undefined): string {
  const s = String(raw || "")
    .trim()
    .replace(/\/+$/, "");
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const host = s.split("/")[0] || "";
  const isLocal =
    /^localhost(:\d+)?$/i.test(host) ||
    /^127\.0\.0\.1(:\d+)?$/i.test(host) ||
    /^\[::1\](:\d+)?$/i.test(host);
  return isLocal ? `http://${s}` : `https://${s}`;
}
