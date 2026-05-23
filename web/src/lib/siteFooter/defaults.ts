import { KEYRA_LINKEDIN_URL, KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";
import { getKeyraEcosystemAppLinks } from "@/lib/keyraAppUrls";
import type { SiteFooterConfig, SiteFooterLinkView, SiteFooterSocialLinkView } from "./types";

const SETTINGS_ID = "default";

const DEFAULT_DESCRIPTION =
  "Choose the experience that matches your context — consumer protection, enterprise deployment, or partner tooling.";

function defaultOnThisSiteLinks(): SiteFooterLinkView[] {
  const rows: Omit<SiteFooterLinkView, "id">[] = [
    { section: "ON_THIS_SITE", label: "Why identity", href: "/#problem", description: null, isExternal: false, internalPath: null, sortOrder: 10, isPublished: true },
    { section: "ON_THIS_SITE", label: "The shift", href: "/#missing-layer", description: null, isExternal: false, internalPath: null, sortOrder: 20, isPublished: true },
    { section: "ON_THIS_SITE", label: "Who it's for", href: "/#for", description: null, isExternal: false, internalPath: null, sortOrder: 30, isPublished: true },
    { section: "ON_THIS_SITE", label: "Global", href: "/#global", description: null, isExternal: false, internalPath: null, sortOrder: 40, isPublished: true },
    { section: "ON_THIS_SITE", label: "FAQ", href: "/faq", description: null, isExternal: false, internalPath: null, sortOrder: 50, isPublished: true },
    { section: "ON_THIS_SITE", label: "Contact us", href: "/contact", description: null, isExternal: false, internalPath: null, sortOrder: 60, isPublished: true },
    { section: "ON_THIS_SITE", label: "Privacy", href: "/privacy", description: null, isExternal: false, internalPath: null, sortOrder: 70, isPublished: true },
    { section: "ON_THIS_SITE", label: "Terms", href: "/terms", description: null, isExternal: false, internalPath: null, sortOrder: 80, isPublished: true },
  ];
  return rows.map((row, index) => ({ ...row, id: `default-site-${index}` }));
}

function defaultKeyraAppLinks(): SiteFooterLinkView[] {
  return getKeyraEcosystemAppLinks().map((item, index) => ({
    id: `default-app-${item.id}`,
    section: "KEYRA_APPS" as const,
    label: item.label,
    href: item.href,
    description: item.description,
    isExternal: !item.internalPath,
    internalPath: item.internalPath ?? null,
    sortOrder: (index + 1) * 10,
    isPublished: true,
  }));
}

function defaultSocialLinks(): SiteFooterSocialLinkView[] {
  return [
    {
      id: "default-social-linkedin",
      platform: "LINKEDIN",
      label: "Keyra on LinkedIn",
      url: KEYRA_LINKEDIN_URL,
      sortOrder: 10,
      isPublished: true,
    },
  ];
}

export function getDefaultSiteFooterConfig(): SiteFooterConfig {
  return {
    settings: {
      id: SETTINGS_ID,
      logoSrc: KEYRA_LOGO_SRC,
      description: DEFAULT_DESCRIPTION,
      onThisSiteLabel: "On this site",
      keyraAppsLabel: "Keyra apps",
    },
    onThisSiteLinks: defaultOnThisSiteLinks(),
    keyraAppLinks: defaultKeyraAppLinks(),
    socialLinks: defaultSocialLinks(),
  };
}

export const SITE_FOOTER_SETTINGS_ID = SETTINGS_ID;
