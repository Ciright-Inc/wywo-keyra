import "server-only";

import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { DeploymentAdminRole as R, RequestApprovalStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { normalizePhoneE164 } from "@/lib/adminUserPhone";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";
import { parseScope } from "@/lib/deployments/adminAuthz";
import {
  resolveKeyraSessionFromCookies,
  resolveKeyraSessionFromRequest,
} from "@/lib/keyraSessionServer";

export type AdminAccessState =
  | { status: "authorized"; auth: DeploymentAuth }
  | { status: "unsigned" }
  | { status: "no_access"; phoneE164: string };

export const resolveAdminAuthForPhone = cache(async (phoneE164: string): Promise<DeploymentAuth | null> => {
  const phone = normalizePhoneE164(phoneE164);
  if (!phone) return null;

  const user = await prisma.adminUser.findFirst({
    where: { phoneE164: phone, isActive: true },
  });
  if (!user) return null;
  return { kind: "user", user };
});

export async function resolveDeploymentAuth(req: Request): Promise<DeploymentAuth | null> {
  const session = await resolveKeyraSessionFromRequest(req);
  if (!session?.phoneE164) return null;
  return resolveAdminAuthForPhone(session.phoneE164);
}

export const resolveDeploymentAuthFromCookies = cache(async (): Promise<DeploymentAuth | null> => {
  const session = await resolveKeyraSessionFromCookies();
  if (!session?.phoneE164) return null;
  return resolveAdminAuthForPhone(session.phoneE164);
});

export const resolveAdminAccessState = cache(async (): Promise<AdminAccessState> => {
  const session = await resolveKeyraSessionFromCookies();
  if (!session?.phoneE164) return { status: "unsigned" };

  const auth = await resolveAdminAuthForPhone(session.phoneE164);
  if (!auth) return { status: "no_access", phoneE164: session.phoneE164 };
  return { status: "authorized", auth };
});

export async function requireDeploymentAuth(req: Request): Promise<DeploymentAuth | Response> {
  const auth = await resolveDeploymentAuth(req);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return auth;
}

export const countryWhereFromAuth = cache(
  async (auth: DeploymentAuth): Promise<Prisma.CountryDeploymentWhereInput | undefined> => {
  if (auth.kind === "legacy_super") return undefined;
  const role = auth.user.role;
  if (role === R.GLOBAL_ADMIN || role === R.READ_ONLY || role === R.COMPLIANCE_REVIEWER) return undefined;
  const scope = parseScope(auth.user.scopeJson);
  if (role === R.REGIONAL_ADMIN && scope.regionIds?.length) {
    return { regionId: { in: scope.regionIds } };
  }
  if (role === R.COUNTRY_ADMIN && scope.countryIds?.length) {
    return { id: { in: scope.countryIds } };
  }
  if (role === R.TELCO_ADMIN && scope.telcoIds?.length) {
    const telcos = await prisma.telcoDeployment.findMany({
      where: { id: { in: scope.telcoIds } },
      select: { countryId: true },
    });
    const ids = Array.from(new Set(telcos.map((t) => t.countryId)));
    if (!ids.length) return { id: { in: [] } };
    return { id: { in: ids } };
  }
  return undefined;
  },
);

export const telcoWhereFromAuth = cache(
  async (auth: DeploymentAuth): Promise<Prisma.TelcoDeploymentWhereInput | undefined> => {
  const cw = await countryWhereFromAuth(auth);
  if (!cw) return undefined;
  if ("id" in cw && cw.id && typeof cw.id === "object" && "in" in cw.id && Array.isArray((cw.id as { in: string[] }).in)) {
    return { countryId: { in: (cw.id as { in: string[] }).in } };
  }
  if ("regionId" in cw && cw.regionId && typeof cw.regionId === "object" && "in" in cw.regionId) {
    const regionIds = (cw.regionId as { in: string[] }).in;
    return { country: { regionId: { in: regionIds } } };
  }
  return undefined;
  },
);

export const regionWhereFromAuth = cache(
  async (auth: DeploymentAuth): Promise<Prisma.RegionWhereInput | undefined> => {
  if (auth.kind === "legacy_super") return undefined;
  const role = auth.user.role;
  if (role === R.GLOBAL_ADMIN || role === R.READ_ONLY || role === R.COMPLIANCE_REVIEWER || role === R.COUNTRY_ADMIN) {
    return undefined;
  }
  if (role === R.REGIONAL_ADMIN) {
    const scope = parseScope(auth.user.scopeJson);
    if (scope.regionIds?.length) return { id: { in: scope.regionIds } };
  }
  if (role === R.TELCO_ADMIN) {
    const scope = parseScope(auth.user.scopeJson);
    if (!scope.telcoIds?.length) return { id: { in: [] } };
    const telcos = await prisma.telcoDeployment.findMany({
      where: { id: { in: scope.telcoIds } },
      select: { country: { select: { regionId: true } } },
    });
    const rids = Array.from(new Set(telcos.map((t) => t.country.regionId)));
    if (!rids.length) return { id: { in: [] } };
    return { id: { in: rids } };
  }
  return undefined;
  },
);

export async function canApproveAccessRequestRow(
  auth: DeploymentAuth,
  row: { targetType: "COUNTRY" | "TELCO"; targetId: string },
): Promise<boolean> {
  if (auth.kind === "legacy_super") return true;
  if (auth.kind !== "user") return false;
  if (
    auth.user.role === R.GLOBAL_ADMIN ||
    auth.user.role === R.COMPLIANCE_REVIEWER ||
    auth.user.role === R.READ_ONLY
  ) {
    return true;
  }
  const scope = parseScope(auth.user.scopeJson);
  if (row.targetType === "COUNTRY") {
    if (auth.user.role === R.COUNTRY_ADMIN) return scope.countryIds?.includes(row.targetId) ?? false;
    if (auth.user.role === R.REGIONAL_ADMIN) {
      const c = await prisma.countryDeployment.findUnique({
        where: { id: row.targetId },
        select: { regionId: true },
      });
      return c ? (scope.regionIds?.includes(c.regionId) ?? false) : false;
    }
    return false;
  }
  if (row.targetType === "TELCO") {
    if (auth.user.role === R.TELCO_ADMIN) return scope.telcoIds?.includes(row.targetId) ?? false;
    if (auth.user.role === R.COUNTRY_ADMIN) {
      const t = await prisma.telcoDeployment.findUnique({
        where: { id: row.targetId },
        select: { countryId: true },
      });
      return t ? (scope.countryIds?.includes(t.countryId) ?? false) : false;
    }
    if (auth.user.role === R.REGIONAL_ADMIN) {
      const t = await prisma.telcoDeployment.findUnique({
        where: { id: row.targetId },
        select: { country: { select: { regionId: true } } },
      });
      return t ? (scope.regionIds?.includes(t.country.regionId) ?? false) : false;
    }
  }
  return false;
}

const ACCESS_REQUEST_LIST_SELECT = {
  id: true,
  workEmail: true,
  targetType: true,
  targetId: true,
  verificationStatus: true,
  approvalStatus: true,
  createdAt: true,
} as const;

export type AdminAccessRequestRow = {
  id: string;
  workEmail: string;
  targetType: string;
  targetId: string;
  verificationStatus: string;
  approvalStatus: string;
  createdAt: Date;
};

function accessRequestsVisibleToAuth(
  auth: DeploymentAuth,
  rows: AdminAccessRequestRow[],
  maps: {
    countryRegion: Map<string, string>;
    telcoCountry: Map<string, string>;
    telcoRegion: Map<string, string>;
  },
): AdminAccessRequestRow[] {
  if (auth.kind === "legacy_super") return rows;
  if (auth.kind !== "user") return [];
  if (
    auth.user.role === R.GLOBAL_ADMIN ||
    auth.user.role === R.COMPLIANCE_REVIEWER ||
    auth.user.role === R.READ_ONLY
  ) {
    return rows;
  }

  const scope = parseScope(auth.user.scopeJson);
  const countryIds = new Set(scope.countryIds ?? []);
  const regionIds = new Set(scope.regionIds ?? []);
  const telcoIds = new Set(scope.telcoIds ?? []);

  return rows.filter((row) => {
    if (row.targetType === "COUNTRY") {
      if (auth.user.role === R.COUNTRY_ADMIN) return countryIds.has(row.targetId);
      if (auth.user.role === R.REGIONAL_ADMIN) {
        const regionId = maps.countryRegion.get(row.targetId);
        return regionId != null && regionIds.has(regionId);
      }
      return false;
    }
    if (row.targetType === "TELCO") {
      if (auth.user.role === R.TELCO_ADMIN) return telcoIds.has(row.targetId);
      if (auth.user.role === R.COUNTRY_ADMIN) {
        const countryId = maps.telcoCountry.get(row.targetId);
        return countryId != null && countryIds.has(countryId);
      }
      if (auth.user.role === R.REGIONAL_ADMIN) {
        const regionId = maps.telcoRegion.get(row.targetId);
        return regionId != null && regionIds.has(regionId);
      }
    }
    return false;
  });
}

export async function listAccessRequestsForAdmin(
  auth: DeploymentAuth,
  approvalStatus?: RequestApprovalStatus,
): Promise<AdminAccessRequestRow[]> {
  const rows = await prisma.serverAccessRequest.findMany({
    where: approvalStatus ? { approvalStatus } : {},
    orderBy: { createdAt: "desc" },
    take: 300,
    select: ACCESS_REQUEST_LIST_SELECT,
  });

  if (
    auth.kind === "legacy_super" ||
    (auth.kind === "user" &&
      (auth.user.role === R.GLOBAL_ADMIN ||
        auth.user.role === R.COMPLIANCE_REVIEWER ||
        auth.user.role === R.READ_ONLY))
  ) {
    return rows;
  }

  const countryTargetIds = Array.from(
    new Set(rows.filter((r) => r.targetType === "COUNTRY").map((r) => r.targetId)),
  );
  const telcoTargetIds = Array.from(
    new Set(rows.filter((r) => r.targetType === "TELCO").map((r) => r.targetId)),
  );

  const [countries, telcos] = await Promise.all([
    countryTargetIds.length
      ? prisma.countryDeployment.findMany({
          where: { id: { in: countryTargetIds } },
          select: { id: true, regionId: true },
        })
      : Promise.resolve([]),
    telcoTargetIds.length
      ? prisma.telcoDeployment.findMany({
          where: { id: { in: telcoTargetIds } },
          select: { id: true, countryId: true, country: { select: { regionId: true } } },
        })
      : Promise.resolve([]),
  ]);

  const countryRegion = new Map(countries.map((c) => [c.id, c.regionId]));
  const telcoCountry = new Map(telcos.map((t) => [t.id, t.countryId]));
  const telcoRegion = new Map(telcos.map((t) => [t.id, t.country.regionId]));

  return accessRequestsVisibleToAuth(auth, rows, { countryRegion, telcoCountry, telcoRegion });
}

export { resolveKeyraSessionFromCookies, resolveKeyraSessionFromRequest };
