import type { Prisma } from "@prisma/client";
import { DeploymentAdminRole as R } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  ADMIN_JWT_COOKIE,
  getTokenFromRequest,
  verifyAdminJwt,
} from "@/lib/adminJwt";
import type { DeploymentAuth } from "@/lib/deployments/adminAuthz";
import { parseScope } from "@/lib/deployments/adminAuthz";

export async function resolveDeploymentAuth(req: Request): Promise<DeploymentAuth | null> {
  const cookie = req.headers.get("cookie");
  let cookieJwt: string | null = null;
  if (cookie) {
    const parts = cookie.split(";").map((c) => c.trim());
    for (const p of parts) {
      if (p.startsWith(`${ADMIN_JWT_COOKIE}=`)) {
        cookieJwt = decodeURIComponent(p.slice(ADMIN_JWT_COOKIE.length + 1));
        break;
      }
    }
  }
  const raw = getTokenFromRequest(req, cookieJwt);
  if (!raw) return null;

  const legacy = process.env.KEYRA_ADMIN_TOKEN?.trim();
  if (legacy && raw === legacy) {
    return { kind: "legacy_super" };
  }

  const claims = await verifyAdminJwt(raw);
  if (!claims) return null;

  if (claims.svc === true || claims.sub === "legacy-service") {
    return { kind: "legacy_super" };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: claims.sub } });
  if (!user?.isActive) return null;
  return { kind: "user", user };
}

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

export async function countryWhereFromAuth(auth: DeploymentAuth): Promise<Prisma.CountryDeploymentWhereInput | undefined> {
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
}

export async function telcoWhereFromAuth(auth: DeploymentAuth): Promise<Prisma.TelcoDeploymentWhereInput | undefined> {
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
}

export async function regionWhereFromAuth(auth: DeploymentAuth): Promise<Prisma.RegionWhereInput | undefined> {
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
}

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

export async function resolveDeploymentAuthFromCookies(): Promise<DeploymentAuth | null> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const v = jar.get(ADMIN_JWT_COOKIE)?.value;
  if (!v) return null;
  const req = new Request("http://localhost", {
    headers: { cookie: `${ADMIN_JWT_COOKIE}=${v}` },
  });
  return resolveDeploymentAuth(req);
}
