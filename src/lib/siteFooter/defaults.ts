import { KEYRA_LINKEDIN_URL, KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";
import { getKeyraEcosystemAppLinks } from "@/lib/keyraAppUrls";
import { buildOnThisSiteLinksForApp } from "./commonOnThisSiteLinks";
import { SITE_FOOTER_MARKETING_APP_ID } from "./siteAppScope";
import type { SiteFooterConfig, SiteFooterLinkView, SiteFooterSocialLinkView } from "./types";

const SETTINGS_ID = "default";

const DEFAULT_DESCRIPTION =
  "Choose the experience that matches your context — consumer protection, enterprise deployment, or partner tooling.";

function defaultOnThisSiteLinks(): SiteFooterLinkView[] {
  return buildOnThisSiteLinksForApp(SITE_FOOTER_MARKETING_APP_ID).map((row, index) => ({
    ...row,
    id: `default-site-${index}`,
  }));
}

function defaultKeyraAppLinks(): SiteFooterLinkView[] {
  return getKeyraEcosystemAppLinks().map((item, index) => ({
    id: `default-app-${item.id}`,
    section: "KEYRA_APPS" as const,
    siteAppId: null,
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
