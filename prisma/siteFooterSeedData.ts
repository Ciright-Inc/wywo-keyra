import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SiteFooterSeedLink = {
  id: string;
  section: "ON_THIS_SITE" | "KEYRA_APPS";
  siteAppId?: string | null;
  label: string;
  href: string;
  description: string | null;
  isExternal: boolean;
  internalPath: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterSeedSocialLink = {
  id: string;
  platform: "LINKEDIN" | "TWITTER" | "INSTAGRAM" | "YOUTUBE" | "GITHUB" | "CUSTOM";
  label: string;
  url: string;
  sortOrder: number;
  isPublished: boolean;
};

export type SiteFooterSeedFile = {
  version: number;
  settings: {
    id: string;
    logoSrc: string | null;
    description: string;
    onThisSiteLabel: string;
    keyraAppsLabel: string;
  };
  links: SiteFooterSeedLink[];
  socialLinks: SiteFooterSeedSocialLink[];
};

export function loadSiteFooterSeed(): SiteFooterSeedFile {
  const p = join(process.cwd(), "prisma", "data", "site-footer-seed.json");
  const raw = readFileSync(p, "utf8");
  return JSON.parse(raw) as SiteFooterSeedFile;
}
