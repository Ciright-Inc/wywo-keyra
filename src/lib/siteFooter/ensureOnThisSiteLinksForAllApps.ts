import "server-only";

import prisma from "@/lib/prisma";
import { ensureOnThisSiteLinksForAllApps as ensureOnThisSiteLinksForAllAppsWithClient } from "../../../prisma/ensureOnThisSiteLinksForAllApps";

/** Idempotent: copy common “On this site” links to every footer app that has none yet. */
export async function ensureOnThisSiteLinksForAllApps(): Promise<number> {
  return ensureOnThisSiteLinksForAllAppsWithClient(prisma);
}
