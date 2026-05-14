/**
 * Idempotent sovereign-country upsert for AuthenticationCountry (ISO independent states).
 * Preserves admin-edited weight, active, authenticationEnabled, displayPriority, notes on re-run.
 * Run: npx tsx prisma/seedWorldAuthenticationCountries.ts
 * Force reset all weights to 5: RESET_AUTH_COUNTRY_WEIGHTS=1 npx tsx prisma/seedWorldAuthenticationCountries.ts
 */
import { PrismaClient } from "@prisma/client";
import countries from "world-countries";

const prisma = new PrismaClient();

const DEFAULT_WEIGHT = 5;
const FORCE_RESET_WEIGHTS = process.env.RESET_AUTH_COUNTRY_WEIGHTS === "1";

function flagEmojiFromIso2(iso: string): string | null {
  const u = iso.toUpperCase();
  if (u.length !== 2 || !/^[A-Z]{2}$/.test(u)) return null;
  const A = 0x1f1e6;
  const cp = (ch: string) => A + (ch.charCodeAt(0) - 65);
  try {
    return String.fromCodePoint(cp(u[0]!), cp(u[1]!));
  } catch {
    return null;
  }
}

function phoneFromIdd(idd: { root?: string; suffixes?: string[] } | undefined): string | null {
  if (!idd?.root) return null;
  const suf = idd.suffixes?.[0] ?? "";
  return `${idd.root}${suf}`.replace(/\s+/g, "");
}

function primaryLang(langs: Record<string, string> | undefined): string | null {
  if (!langs || typeof langs !== "object") return null;
  const vals = Object.values(langs);
  return vals[0] ?? null;
}

function currencyPair(cur: Record<string, { name: string; symbol?: string }> | undefined): {
  code: string | null;
  name: string | null;
} {
  if (!cur || typeof cur !== "object") return { code: null, name: null };
  const keys = Object.keys(cur);
  if (!keys.length) return { code: null, name: null };
  const code = keys[0]!;
  const meta = cur[code];
  return { code, name: meta?.name ?? null };
}

type Stats = { inserted: number; updated: number; skipped: number; failed: number };

export async function seedWorldAuthenticationCountries(db: PrismaClient): Promise<Stats> {
  const stats: Stats = { inserted: 0, updated: 0, skipped: 0, failed: 0 };
  const sovereign = countries.filter((c) => c.independent === true);

  for (const c of sovereign) {
    const iso2 = (c.cca2 ?? "").toUpperCase();
    if (iso2.length !== 2) {
      stats.skipped += 1;
      continue;
    }
    const countryName = c.name.common;
    const officialName = c.name.official;
    const iso3 = c.cca3 ?? null;
    const isoNumeric = c.ccn3 ? String(c.ccn3) : null;
    const region = c.region || "Unknown";
    const subRegion = c.subregion ?? null;
    const capitalCity = Array.isArray(c.capital) && c.capital[0] ? c.capital[0] : null;
    const flagEmoji = flagEmojiFromIso2(iso2);
    const phoneCountryCode = phoneFromIdd(c.idd);
    const { code: currencyCode, name: currencyName } = currencyPair(
      c.currencies as Record<string, { name: string }> | undefined,
    );
    const primaryLanguage = primaryLang(c.languages as Record<string, string> | undefined);

    try {
      const existing = await db.authenticationCountry.findUnique({ where: { iso2 } });
      if (!existing) {
        await db.authenticationCountry.create({
          data: {
            countryName,
            officialName,
            iso2,
            iso3,
            isoNumeric,
            region,
            subRegion,
            capitalCity,
            flagEmoji,
            flagAssetPath: null,
            phoneCountryCode,
            currencyCode,
            currencyName,
            primaryLanguage,
            active: true,
            authenticationEnabled: true,
            percentageWeight: DEFAULT_WEIGHT,
            displayPriority: 0,
            notes: "Seeded from world-countries (independent).",
          },
        });
        stats.inserted += 1;
        continue;
      }

      const nextWeight = FORCE_RESET_WEIGHTS ? DEFAULT_WEIGHT : existing.percentageWeight;

      await db.authenticationCountry.update({
        where: { iso2 },
        data: {
          countryName: existing.countryName?.trim() ? existing.countryName : countryName,
          officialName: existing.officialName?.trim() ? existing.officialName : officialName,
          iso3: existing.iso3?.trim() ? existing.iso3 : iso3,
          isoNumeric: existing.isoNumeric?.trim() ? existing.isoNumeric : isoNumeric,
          region: existing.region?.trim() ? existing.region : region,
          subRegion: existing.subRegion?.trim() ? existing.subRegion : subRegion,
          capitalCity: existing.capitalCity?.trim() ? existing.capitalCity : capitalCity,
          flagEmoji: existing.flagEmoji?.trim() ? existing.flagEmoji : flagEmoji,
          phoneCountryCode: existing.phoneCountryCode?.trim() ? existing.phoneCountryCode : phoneCountryCode,
          currencyCode: existing.currencyCode?.trim() ? existing.currencyCode : currencyCode,
          currencyName: existing.currencyName?.trim() ? existing.currencyName : currencyName,
          primaryLanguage: existing.primaryLanguage?.trim() ? existing.primaryLanguage : primaryLanguage,
          percentageWeight: nextWeight,
        },
      });
      stats.updated += 1;
    } catch (e) {
      stats.failed += 1;
      console.error(`[seedWorld] failed ${iso2}:`, e);
    }
  }

  return stats;
}

async function main() {
  const s = await seedWorldAuthenticationCountries(prisma);
  console.log(
    JSON.stringify(
      {
        ...s,
        totalIndependentSource: countries.filter((c) => c.independent === true).length,
        message: "World sovereign seed complete.",
        hint: "Set RESET_AUTH_COUNTRY_WEIGHTS=1 to force percentageWeight=5 on every row.",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
