import { keyraMarketingOrigin } from "@/lib/keyraAppUrls";

/** Default app id for keyra.ie marketing footer links (legacy rows and fallback). */
export const SITE_FOOTER_MARKETING_APP_ID = "keyra-ie";

export type FooterSiteAppOption = {
  id: string;
  label: string;
  href: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function hostnameFromHref(href: string): string | null {
  try {
    return new URL(href).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function normalizeFooterSiteAppId(
  value: string | null | undefined,
  defaultId: string = SITE_FOOTER_MARKETING_APP_ID,
): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : defaultId;
}

export function matchesFooterSiteApp(
  linkSiteAppId: string | null | undefined,
  selectedSiteAppId: string,
  defaultId: string = SITE_FOOTER_MARKETING_APP_ID,
): boolean {
  return normalizeFooterSiteAppId(linkSiteAppId, defaultId) === selectedSiteAppId;
}

export function buildFooterSiteAppOptions(
  deploymentApps: { id: string; label: string; href: string }[],
  marketingOrigin: string = keyraMarketingOrigin(),
): FooterSiteAppOption[] {
  const marketingHost = hostnameFromHref(marketingOrigin);
  const options: FooterSiteAppOption[] = [];
  const seen = new Set<string>();
  let hasMarketingHost = false;

  for (const app of deploymentApps) {
    if (seen.has(app.id)) continue;
    seen.add(app.id);

    const host = hostnameFromHref(app.href);
    if (marketingHost && host === marketingHost) hasMarketingHost = true;

    options.push({ id: app.id, label: app.label, href: app.href });
  }

  if (marketingHost && !hasMarketingHost) {
    options.unshift({
      id: SITE_FOOTER_MARKETING_APP_ID,
      label: marketingHost,
      href: trimSlash(marketingOrigin),
    });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function resolveFooterSiteAppIdFromHost(
  hostname: string,
  options: FooterSiteAppOption[],
  defaultId: string = SITE_FOOTER_MARKETING_APP_ID,
): string {
  const normalizedHost = hostname.trim().toLowerCase().replace(/^www\./, "");
  if (!normalizedHost) return defaultId;

  for (const option of options) {
    const host = hostnameFromHref(option.href)?.replace(/^www\./, "");
    if (host && host === normalizedHost) return option.id;
  }

  return defaultId;
}

export function resolveFooterSiteAppIdFromRequest(
  requestUrl: string,
  headers: Headers,
  options: FooterSiteAppOption[],
  explicitSiteAppId?: string | null,
): string {
  const trimmed = explicitSiteAppId?.trim();
  if (trimmed) return trimmed;

  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = headers.get("host")?.trim();
  const requestHost = (() => {
    try {
      return new URL(requestUrl).hostname;
    } catch {
      return null;
    }
  })();

  const host = forwardedHost || hostHeader || requestHost || "";
  return resolveFooterSiteAppIdFromHost(host, options, SITE_FOOTER_MARKETING_APP_ID);
}
