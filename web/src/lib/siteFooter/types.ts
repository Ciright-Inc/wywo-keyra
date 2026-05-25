export type SiteFooterLinkSection = "ON_THIS_SITE" | "KEYRA_APPS";

export type SiteSocialPlatform =
  | "LINKEDIN"
  | "TWITTER"
  | "INSTAGRAM"
  | "YOUTUBE"
  | "GITHUB"
  | "CUSTOM";

export type SiteFooterLinkView = {
  id: string;
  section: SiteFooterLinkSection;
  siteAppId: string | null;
  label: string;
  href: string;
  description: string | null;
  isExternal: boolean;
  internalPath: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterSocialLinkView = {
  id: string;
  platform: SiteSocialPlatform;
  label: string;
  url: string;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterSettingsView = {
  id: string;
  logoSrc: string | null;
  description: string;
  onThisSiteLabel: string;
  keyraAppsLabel: string;
};

export type SiteFooterConfig = {
  settings: SiteFooterSettingsView;
  onThisSiteLinks: SiteFooterLinkView[];
  keyraAppLinks: SiteFooterLinkView[];
  socialLinks: SiteFooterSocialLinkView[];
};
