import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Telco catalog + demo access rules from deployment-seed.json (regions/countries live in regions-countries-seed.json). */
export type DeploymentSeedFile = {
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
