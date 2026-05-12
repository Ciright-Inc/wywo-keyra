import type { AdminUser, CountryDeployment, DeploymentAdminRole, TelcoDeployment } from "@prisma/client";
import { DeploymentAdminRole as R } from "@prisma/client";

export type DeploymentAuth =
  | { kind: "legacy_super" }
  | { kind: "user"; user: AdminUser };

export type AdminScope = {
  regionIds?: string[];
  countryIds?: string[];
  telcoIds?: string[];
};

export function parseScope(json: unknown): AdminScope {
  if (!json || typeof json !== "object" || json === null) return {};
  const o = json as Record<string, unknown>;
  const arr = (v: unknown): string[] | undefined =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined;
  return {
    regionIds: arr(o.regionIds),
    countryIds: arr(o.countryIds),
    telcoIds: arr(o.telcoIds),
  };
}

export function denyIfReadOnly(auth: DeploymentAuth): Response | null {
  if (auth.kind === "legacy_super") return null;
  if (auth.user.role === R.READ_ONLY) {
    return new Response(JSON.stringify({ error: "Forbidden: read-only role." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

export function isReadOnlyRole(auth: DeploymentAuth): boolean {
  return auth.kind === "user" && auth.user.role === R.READ_ONLY;
}

export function isComplianceReviewer(auth: DeploymentAuth): boolean {
  return auth.kind === "user" && auth.user.role === R.COMPLIANCE_REVIEWER;
}

export function denyIfComplianceOnlyWriter(auth: DeploymentAuth): Response | null {
  if (auth.kind === "legacy_super") return null;
  if (auth.user.role === R.COMPLIANCE_REVIEWER) {
    return new Response(JSON.stringify({ error: "Forbidden: compliance role is limited to access reviews." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return denyIfReadOnly(auth);
}

function scopeRegions(auth: DeploymentAuth): string[] {
  if (auth.kind === "legacy_super") return [];
  return parseScope(auth.user.scopeJson).regionIds ?? [];
}

function scopeCountries(auth: DeploymentAuth): string[] {
  if (auth.kind === "legacy_super") return [];
  return parseScope(auth.user.scopeJson).countryIds ?? [];
}

function scopeTelcos(auth: DeploymentAuth): string[] {
  if (auth.kind === "legacy_super") return [];
  return parseScope(auth.user.scopeJson).telcoIds ?? [];
}

export function isGlobal(auth: DeploymentAuth): boolean {
  return auth.kind === "legacy_super" || auth.user.role === R.GLOBAL_ADMIN;
}

export function canCreateRegion(auth: DeploymentAuth): boolean {
  return isGlobal(auth);
}

export function canPatchRegion(auth: DeploymentAuth, regionId: string): boolean {
  if (isGlobal(auth)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role !== R.REGIONAL_ADMIN) return false;
  return scopeRegions(auth).includes(regionId);
}

export function canCreateCountry(auth: DeploymentAuth, regionId: string): boolean {
  if (isGlobal(auth)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role === R.REGIONAL_ADMIN) return scopeRegions(auth).includes(regionId);
  return false;
}

export function canPatchCountry(auth: DeploymentAuth, country: Pick<CountryDeployment, "id" | "regionId">): boolean {
  if (isGlobal(auth)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role === R.REGIONAL_ADMIN) return scopeRegions(auth).includes(country.regionId);
  if (auth.user.role === R.COUNTRY_ADMIN) return scopeCountries(auth).includes(country.id);
  return false;
}

export function canCreateTelco(auth: DeploymentAuth, country: Pick<CountryDeployment, "id" | "regionId">): boolean {
  if (canPatchCountry(auth, country)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role === R.TELCO_ADMIN) {
    // Telco admins may add sibling telcos only within scoped countries
    return scopeCountries(auth).includes(country.id);
  }
  return false;
}

export function canPatchTelco(
  auth: DeploymentAuth,
  telco: Pick<TelcoDeployment, "id" | "countryId">,
  country: Pick<CountryDeployment, "id" | "regionId">,
): boolean {
  if (canPatchCountry(auth, country)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role === R.TELCO_ADMIN) return scopeTelcos(auth).includes(telco.id);
  return false;
}

export function canReviewAccessRequest(
  auth: DeploymentAuth,
  targetType: "COUNTRY" | "TELCO",
  targetId: string,
): boolean {
  if (isGlobal(auth)) return true;
  if (auth.kind !== "user") return false;
  if (auth.user.role === R.COMPLIANCE_REVIEWER) return true;
  if (auth.user.role === R.COUNTRY_ADMIN && targetType === "COUNTRY") {
    return scopeCountries(auth).includes(targetId);
  }
  if (auth.user.role === R.TELCO_ADMIN && targetType === "TELCO") {
    return scopeTelcos(auth).includes(targetId);
  }
  if (auth.user.role === R.REGIONAL_ADMIN) {
    return scopeCountries(auth).includes(targetId);
  }
  return false;
}

/** For rules / server nodes keyed by targetType + targetId */
export async function canMutateServerAsset(
  auth: DeploymentAuth,
  targetType: "COUNTRY" | "TELCO",
  targetId: string,
  loaders: {
    country: (id: string) => Promise<Pick<CountryDeployment, "id" | "regionId"> | null>;
    telco: (id: string) => Promise<(Pick<TelcoDeployment, "id" | "countryId"> & { country: Pick<CountryDeployment, "id" | "regionId"> }) | null>;
  },
): Promise<boolean> {
  if (isGlobal(auth)) return true;
  if (targetType === "COUNTRY") {
    const c = await loaders.country(targetId);
    return c ? canPatchCountry(auth, c) : false;
  }
  const t = await loaders.telco(targetId);
  if (!t) return false;
  return canPatchTelco(auth, t, t.country);
}

/** List/read visibility for targets keyed by COUNTRY | TELCO + id (nodes, access rules). */
export async function canViewScopedTarget(
  auth: DeploymentAuth,
  targetType: "COUNTRY" | "TELCO",
  targetId: string,
  loaders: {
    country: (id: string) => Promise<Pick<CountryDeployment, "id" | "regionId"> | null>;
    telco: (id: string) => Promise<(Pick<TelcoDeployment, "id" | "countryId"> & { country: Pick<CountryDeployment, "id" | "regionId"> }) | null>;
  },
): Promise<boolean> {
  if (auth.kind === "legacy_super") return true;
  if (auth.kind === "user") {
    const r = auth.user.role;
    if (r === R.GLOBAL_ADMIN || r === R.READ_ONLY || r === R.COMPLIANCE_REVIEWER) return true;
  }
  return canMutateServerAsset(auth, targetType, targetId, loaders);
}

export function roleLabel(role: DeploymentAdminRole): string {
  switch (role) {
    case R.GLOBAL_ADMIN:
      return "Global Admin";
    case R.REGIONAL_ADMIN:
      return "Regional Admin";
    case R.COUNTRY_ADMIN:
      return "Country Admin";
    case R.TELCO_ADMIN:
      return "Telco Admin";
    case R.COMPLIANCE_REVIEWER:
      return "Compliance Reviewer";
    case R.READ_ONLY:
      return "Read Only";
    default: {
      const _e: never = role;
      return _e;
    }
  }
}
