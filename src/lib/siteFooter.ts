import { KEYRA_LINKEDIN_URL, KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";
import {
  getKeyraEcosystemAppLinks,
  keyraMarketingOrigin,
  keyraMarketingPublicOrigin,
} from "@/lib/keyraAppUrls";

export type SiteFooterSettings = {
  id: string;
  logoSrc: string;
  description: string;
  onThisSiteLabel: string;
  keyraAppsLabel: string;
};

export type SiteFooterLink = {
  id: string;
  section: string;
  label: string;
  href: string;
  description: string | null;
  isExternal: boolean;
  internalPath: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterSocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterPayload = {
  settings: SiteFooterSettings;
  onThisSiteLinks: SiteFooterLink[];
  keyraAppLinks: SiteFooterLink[];
  socialLinks: SiteFooterSocialLink[];
};

const SITE_FOOTER_REVALIDATE_SECONDS = 60;

function publishedFooterLinks<T extends { isPublished: boolean; sortOrder: number }>(links: T[]): T[] {
  return links.filter((link) => link.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function fallbackSiteFooterPayload(): SiteFooterPayload {
  return {
    settings: {
      id: "default",
      logoSrc: KEYRA_LOGO_SRC,
      description:
        "Choose the experience that matches your context — consumer protection, enterprise deployment, or partner tooling.",
      onThisSiteLabel: "On this site",
      keyraAppsLabel: "Keyra apps",
    },
    onThisSiteLinks: [
      { id: "why-identity", section: "ON_THIS_SITE", label: "Why identity", href: "/#problem", description: null, isExternal: false, internalPath: null, sortOrder: 10, isPublished: true },
      { id: "the-shift", section: "ON_THIS_SITE", label: "The shift", href: "/#missing-layer", description: null, isExternal: false, internalPath: null, sortOrder: 20, isPublished: true },
      { id: "who-its-for", section: "ON_THIS_SITE", label: "Who it's for", href: "/#for", description: null, isExternal: false, internalPath: null, sortOrder: 30, isPublished: true },
      { id: "global", section: "ON_THIS_SITE", label: "Global", href: "/#global", description: null, isExternal: false, internalPath: null, sortOrder: 40, isPublished: true },
      { id: "faq", section: "ON_THIS_SITE", label: "FAQ", href: "/faq", description: null, isExternal: false, internalPath: null, sortOrder: 50, isPublished: true },
      { id: "contact", section: "ON_THIS_SITE", label: "Contact us", href: "/contact", description: null, isExternal: false, internalPath: null, sortOrder: 60, isPublished: true },
      { id: "privacy", section: "ON_THIS_SITE", label: "Privacy", href: "/privacy", description: null, isExternal: false, internalPath: null, sortOrder: 70, isPublished: true },
      { id: "terms", section: "ON_THIS_SITE", label: "Terms", href: "/terms", description: null, isExternal: false, internalPath: null, sortOrder: 80, isPublished: true },
    ],
    keyraAppLinks: getKeyraEcosystemAppLinks().map((item, index) => ({
      id: item.id,
      section: "KEYRA_APPS",
      label: item.label,
      href: item.href,
      description: item.description,
      isExternal: !item.internalPath,
      internalPath: item.internalPath ?? null,
      sortOrder: (index + 1) * 10,
      isPublished: true,
    })),
    socialLinks: [
      {
        id: "linkedin",
        platform: "LINKEDIN",
        label: "Keyra on LinkedIn",
        url: KEYRA_LINKEDIN_URL,
        sortOrder: 10,
        isPublished: true,
      },
    ],
  };
}

export function isSiteFooterPayload(value: unknown): value is SiteFooterPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as SiteFooterPayload;
  return (
    Boolean(payload.settings?.logoSrc) &&
    Array.isArray(payload.onThisSiteLinks) &&
    Array.isArray(payload.keyraAppLinks) &&
    Array.isArray(payload.socialLinks)
  );
}

/** Live CMS footer API (uses NEXT_PUBLIC_KEYRA_MARKETING_ORIGIN, e.g. https://keyra.ie). */
export function siteFooterApiUrl(): string {
  return `${keyraMarketingPublicOrigin()}/api/public/site-footer`;
}

/** Same-origin proxy (local dev → live keyra.ie CMS). Visible in browser Network tab. */
export function siteFooterClientApiPath(): string {
  return "/api/public/site-footer";
}

/** Absolute URL for server-side fetch in dev (relative paths are invalid in Node fetch). */
function siteFooterServerFetchUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return `${keyraMarketingOrigin()}${siteFooterClientApiPath()}`;
  }
  return siteFooterApiUrl();
}

export function normalizeSiteFooterPayload(data: SiteFooterPayload): SiteFooterPayload {
  const fallback = fallbackSiteFooterPayload();
  return {
    settings: { ...fallback.settings, ...data.settings },
    onThisSiteLinks: publishedFooterLinks(data.onThisSiteLinks),
    keyraAppLinks: publishedFooterLinks(data.keyraAppLinks),
    socialLinks: publishedFooterLinks(data.socialLinks),
  };
}

export async function fetchSiteFooter(): Promise<SiteFooterPayload> {
  const fallback = fallbackSiteFooterPayload();
  const isDev = process.env.NODE_ENV === "development";

  try {
    const res = await fetch(
      siteFooterServerFetchUrl(),
      isDev ? { cache: "no-store" } : { next: { revalidate: SITE_FOOTER_REVALIDATE_SECONDS } },
    );
    if (!res.ok) return fallback;

    const data: unknown = await res.json();
    if (!isSiteFooterPayload(data)) return fallback;

    return normalizeSiteFooterPayload(data);
  } catch {
    return fallback;
  }
}

export { publishedFooterLinks };
