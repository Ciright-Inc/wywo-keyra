import prisma from "@/lib/prisma";
import { ensureDefaultFeedSettings } from "@/lib/authenticationFeed/feedSessionDb";

export async function loadFeedGenerationAssets() {
  await ensureDefaultFeedSettings();
  const [settings, countries, protocols] = await Promise.all([
    prisma.authenticationFeedSetting.findUnique({ where: { id: "default" } }),
    prisma.authenticationCountry.findMany({
      orderBy: [{ displayPriority: "asc" }, { countryName: "asc" }],
    }),
    prisma.satProtocol.findMany({ orderBy: { protocolName: "asc" } }),
  ]);
  return {
    settings,
    countries,
    protocols,
  };
}
