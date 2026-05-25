import type { PrismaClient } from "@prisma/client";
import { buildOnThisSiteLinksForApp } from "../src/lib/siteFooter/commonOnThisSiteLinks";
import {
  buildFooterSiteAppOptions,
  normalizeFooterSiteAppId,
} from "../src/lib/siteFooter/siteAppScope";

/** Idempotent: copy common “On this site” links to every footer app that has none yet. */
export async function ensureOnThisSiteLinksForAllApps(prisma: PrismaClient): Promise<number> {
  if (typeof prisma.siteFooterLink?.findMany !== "function") return 0;

  const deploymentApps = await prisma.deploymentApp.findMany({
    orderBy: [{ section: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
  const appOptions = buildFooterSiteAppOptions(deploymentApps);

  const existingRows = await prisma.siteFooterLink.findMany({
    where: { section: "ON_THIS_SITE" },
    select: { siteAppId: true },
    distinct: ["siteAppId"],
  });

  const appsWithLinks = new Set(
    existingRows.map((row) => normalizeFooterSiteAppId(row.siteAppId)),
  );

  let created = 0;

  for (const app of appOptions) {
    if (appsWithLinks.has(app.id)) continue;

    const result = await prisma.siteFooterLink.createMany({
      data: buildOnThisSiteLinksForApp(app.id),
    });
    created += result.count;
  }

  return created;
}
