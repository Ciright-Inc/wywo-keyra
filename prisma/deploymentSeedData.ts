import { readFileSync } from "node:fs";
import { join } from "node:path";

export type DeploymentSeedFile = {
  regions: Array<{
    continentCode: string;
    subregionCode: string;
    name: string;
    slug: string;
    mapKey: string;
    sortOrder: number;
    isPublished: boolean;
  }>;
  countries: Array<{
    regionSlug: string;
    name: string;
    iso2: string;
    iso3: string;
    flagAssetKey: string;
    population: number | null;
    populationDisplay: string | null;
    countrySubdomain: string;
    officialReferenceDomain: string | null;
    status: string;
    statusNote: string | null;
    sourceLabel: string | null;
    sourceUrl: string | null;
    sourceVerifiedAt: string | null;
    sortOrder: number;
    isPublished: boolean;
  }>;
  telcos: Array<{
    countryIso2: string;
    name: string;
    slug: string;
    subscribers: number | null;
    subscribersDisplay: string | null;
    officialDomain: string | null;
    status: string;
    sortOrder: number;
    isPublished: boolean;
  }>;
  accessDomainRules: Array<{
    target:
      | { type: "COUNTRY"; iso2: string }
      | { type: "TELCO"; countryIso2: string; slug: string };
    allowedEmailDomain: string;
    verificationMethod: string;
    isActive: boolean;
  }>;
  serverNodes: Array<{
    countryIso2: string;
    fqdn: string;
    environment: string;
    healthcheckUrl: string | null;
    status: string;
  }>;
};

export function loadDeploymentSeed(): DeploymentSeedFile {
  const p = join(process.cwd(), "prisma", "data", "deployment-seed.json");
  const raw = readFileSync(p, "utf8");
  return JSON.parse(raw) as DeploymentSeedFile;
}

/** Same convention as `seed.ts` / admin subdomain helpers: `{slug}.{countrySubdomain}`. */
export function buildTelcoSubdomainForSeed(countrySubdomain: string, telcoSlug: string): string {
  return `${telcoSlug}.${countrySubdomain}`;
}
