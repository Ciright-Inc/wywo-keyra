/**
 * Idempotent seed for site footer (public API + admin Site manage → Footer).
 *
 * Data: `prisma/data/site-footer-seed.json`
 * - Upserts settings row `default` when missing.
 * - Inserts links and social rows only when those tables are empty.
 *
 * Runs automatically via `npm run db:seed:deploy-catalog` on production start.
 * Manual: `npm run db:seed:site-footer`
 */
import { PrismaClient } from "@prisma/client";
import { loadSiteFooterSeed } from "./siteFooterSeedData";
import { ensureOnThisSiteLinksForAllApps } from "./ensureOnThisSiteLinksForAllApps";

export type SiteFooterSeedStats = {
  settingsCreated: boolean;
  linksCreated: number;
  socialCreated: number;
  onThisSitePerAppCreated: number;
  skipped?: boolean;
};

function siteFooterTablesReady(prisma: PrismaClient): boolean {
  return (
    typeof prisma.siteFooterSettings?.count === "function" &&
    typeof prisma.siteFooterLink?.count === "function" &&
    typeof prisma.siteFooterSocialLink?.count === "function"
  );
}

export async function seedSiteFooter(
  prisma: PrismaClient,
  options?: { force?: boolean },
): Promise<SiteFooterSeedStats> {
  if (!siteFooterTablesReady(prisma)) {
    return {
      settingsCreated: false,
      linksCreated: 0,
      socialCreated: 0,
      onThisSitePerAppCreated: 0,
      skipped: true,
    };
  }

  const force = options?.force === true;
  const [settingsCount, linkCount, socialCount] = await Promise.all([
    prisma.siteFooterSettings.count(),
    prisma.siteFooterLink.count(),
    prisma.siteFooterSocialLink.count(),
  ]);

  if (!force && settingsCount > 0 && linkCount > 0 && socialCount > 0) {
    const onThisSitePerAppCreated = await ensureOnThisSiteLinksForAllApps(prisma);
    return {
      settingsCreated: false,
      linksCreated: 0,
      socialCreated: 0,
      onThisSitePerAppCreated,
      skipped: onThisSitePerAppCreated === 0,
    };
  }

  const seed = loadSiteFooterSeed();
  let settingsCreated = false;
  let linksCreated = 0;
  let socialCreated = 0;

  if (settingsCount === 0 || force) {
    await prisma.siteFooterSettings.upsert({
      where: { id: seed.settings.id },
      create: {
        id: seed.settings.id,
        logoSrc: seed.settings.logoSrc,
        description: seed.settings.description,
        onThisSiteLabel: seed.settings.onThisSiteLabel,
        keyraAppsLabel: seed.settings.keyraAppsLabel,
      },
      update: force
        ? {
            logoSrc: seed.settings.logoSrc,
            description: seed.settings.description,
            onThisSiteLabel: seed.settings.onThisSiteLabel,
            keyraAppsLabel: seed.settings.keyraAppsLabel,
          }
        : {},
    });
    settingsCreated = settingsCount === 0;
  }

  if (linkCount === 0 || force) {
    if (force && linkCount > 0) {
      await prisma.siteFooterLink.deleteMany();
    }
    if (linkCount === 0 || force) {
      const result = await prisma.siteFooterLink.createMany({
        data: seed.links,
        skipDuplicates: true,
      });
      linksCreated = result.count;
    }
  }

  if (socialCount === 0 || force) {
    if (force && socialCount > 0) {
      await prisma.siteFooterSocialLink.deleteMany();
    }
    if (socialCount === 0 || force) {
      const result = await prisma.siteFooterSocialLink.createMany({
        data: seed.socialLinks,
        skipDuplicates: true,
      });
      socialCreated = result.count;
    }
  }

  const onThisSitePerAppCreated = await ensureOnThisSiteLinksForAllApps(prisma);

  return { settingsCreated, linksCreated, socialCreated, onThisSitePerAppCreated };
}

async function main() {
  const force = process.env.FORCE_SITE_FOOTER_SEED === "1";
  const prisma = new PrismaClient();
  try {
    const stats = await seedSiteFooter(prisma, { force });
    console.info("[seedSiteFooter]", stats);
  } finally {
    await prisma.$disconnect();
  }
}

const runStandalone =
  typeof process !== "undefined" && process.argv[1]?.includes("seedSiteFooter");
if (runStandalone) {
  void main().catch((e) => {
    console.error("[seedSiteFooter]", e);
    process.exit(1);
  });
}
