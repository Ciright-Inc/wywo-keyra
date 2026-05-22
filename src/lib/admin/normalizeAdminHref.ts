/** Canonical pathname + search for comparing admin list URLs (stable param order). */
export function normalizeAdminHref(href: string): string {
  try {
    const url = new URL(href, "http://admin.local");
    const qs = new URLSearchParams(url.searchParams).toString();
    return `${url.pathname}${qs ? `?${qs}` : ""}`;
  } catch {
    return href;
  }
}
