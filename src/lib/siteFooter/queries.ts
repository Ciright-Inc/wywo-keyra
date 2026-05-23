import "server-only";

import type { SiteFooterLink, SiteFooterSettings, SiteFooterSocialLink } from "@prisma/client";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { SITE_FOOTER_CACHE_TAG } from "./cacheTags";
import { loadSiteFooterSeed } from "../../../prisma/siteFooterSeedData";
import { getDefaultSiteFooterConfig, SITE_FOOTER_SETTINGS_ID } from "./defaults";
import type {
  SiteFooterConfig,
  SiteFooterLinkSection,
  SiteFooterLinkView,
  SiteFooterSettingsView,
  SiteFooterSocialLinkView,
} from "./types";

function mapSettings(row: SiteFooterSettings): SiteFooterSettingsView {
  return {
    id: row.id,
    logoSrc: row.logoSrc,
    description: row.description,
    onThisSiteLabel: row.onThisSiteLabel,
    keyraAppsLabel: row.keyraAppsLabel,
  };
}

function mapLink(row: SiteFooterLink): SiteFooterLinkView {
  return {
    id: row.id,
    section: row.section as SiteFooterLinkSection,
    label: row.label,
    href: row.href,
    description: row.description,
    isExternal: row.isExternal,
    internalPath: row.internalPath,
    sortOrder: row.sortOrder,
    isPublished: row.isPublished,
  };
}

function mapSocial(row: SiteFooterSocialLink): SiteFooterSocialLinkView {
  return {
    id: row.id,
    platform: row.platform,
    label: row.label,
    url: row.url,
    sortOrder: row.sortOrder,
    isPublished: row.isPublished,
  };
}

function splitLinks(links: SiteFooterLinkView[]): Pick<SiteFooterConfig, "onThisSiteLinks" | "keyraAppLinks"> {
  const onThisSiteLinks = links
    .filter((link) => link.section === "ON_THIS_SITE")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  const keyraAppLinks = links
    .filter((link) => link.section === "KEYRA_APPS")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));
  return { onThisSiteLinks, keyraAppLinks };
}

function siteFooterDbReady(): boolean {
  return (
    typeof prisma.siteFooterSettings?.count === "function" &&
    typeof prisma.siteFooterLink?.count === "function" &&
    typeof prisma.siteFooterSocialLink?.count === "function"
  );
}

export async function ensureSiteFooterDefaults(): Promise<boolean> {
  if (!siteFooterDbReady()) return false;

  const [settingsCount, linkCount, socialCount] = await Promise.all([
    prisma.siteFooterSettings.count(),
    prisma.siteFooterLink.count(),
    prisma.siteFooterSocialLink.count(),
  ]);

  if (settingsCount > 0 && linkCount > 0 && socialCount > 0) return true;

  const seed = loadSiteFooterSeed();

  if (settingsCount === 0) {
    await prisma.siteFooterSettings.create({
      data: {
        id: seed.settings.id || SITE_FOOTER_SETTINGS_ID,
        logoSrc: seed.settings.logoSrc,
        description: seed.settings.description,
        onThisSiteLabel: seed.settings.onThisSiteLabel,
        keyraAppsLabel: seed.settings.keyraAppsLabel,
      },
    });
  }

  if (linkCount === 0) {
    await prisma.siteFooterLink.createMany({
      data: seed.links,
      skipDuplicates: true,
    });
  }

  if (socialCount === 0) {
    await prisma.siteFooterSocialLink.createMany({
      data: seed.socialLinks,
      skipDuplicates: true,
    });
  }

  return true;
}

async function loadSiteFooterConfig(publishedOnly: boolean): Promise<SiteFooterConfig> {
  let ready = false;
  try {
    ready = await ensureSiteFooterDefaults();
  } catch {
    ready = false;
  }

  if (!ready) return getDefaultSiteFooterConfig();

  const [settings, links, socialLinks] = await Promise.all([
    prisma.siteFooterSettings.findUnique({ where: { id: SITE_FOOTER_SETTINGS_ID } }),
    prisma.siteFooterLink.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.siteFooterSocialLink.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
  ]);

  if (!settings) return getDefaultSiteFooterConfig();

  const mappedLinks = links.map(mapLink);
  const { onThisSiteLinks, keyraAppLinks } = splitLinks(mappedLinks);

  return {
    settings: mapSettings(settings),
    onThisSiteLinks,
    keyraAppLinks,
    socialLinks: socialLinks.map(mapSocial),
  };
}

const getCachedPublicSiteFooter = unstable_cache(
  async () => loadSiteFooterConfig(true),
  ["site-footer-public-v1"],
  { tags: [SITE_FOOTER_CACHE_TAG] },
);

export async function getPublicSiteFooterConfig(): Promise<SiteFooterConfig> {
  return getCachedPublicSiteFooter();
}

export async function getAdminSiteFooterConfig(): Promise<SiteFooterConfig> {
  return loadSiteFooterConfig(false);
}
