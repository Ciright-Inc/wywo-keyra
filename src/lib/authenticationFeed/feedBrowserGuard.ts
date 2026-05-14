/**
 * Optional hardening for public feed endpoints (reduces drive-by scraping).
 * Set KEYRA_FEED_STRICT_BROWSER=1 to require Sec-Fetch-Site: same-origin when present.
 */
export function feedBrowserGuard(req: Request): Response | null {
  if (process.env.KEYRA_FEED_STRICT_BROWSER !== "1") return null;
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }
  return null;
}
