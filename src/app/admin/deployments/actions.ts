"use server";

import { forbidden, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ServerEnvironment,
  StatusHistoryTargetType,
  TargetType,
  VerificationMethod,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { assertAdminServer } from "@/lib/assertAdminServer";
import { revalidatePublicDeployments } from "@/lib/deployments/revalidatePublicDeployments";
import {
  notifyDeploymentStatusChanged,
  writeAudit,
  writeStatusHistory,
} from "@/app/api/admin/deployments/_audit";
import { parseBoolean, parseDeploymentStatus, parseIntOrNull } from "@/app/api/admin/deployments/_parse";
import { telcoSubdomainFromCountry } from "@/lib/deployments/subdomains";
import {
  canCreateCountry,
  canCreateTelco,
  canMutateServerAsset,
  canPatchCountry,
  canPatchRegion,
  canPatchTelco,
  canCreateRegion,
  isComplianceReviewer,
  isReadOnlyRole,
} from "@/lib/deployments/adminAuthz";

export async function createRegion(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();
  if (!canCreateRegion(auth)) forbidden();

  const continentCode = String(formData.get("continentCode") ?? "").trim();
  const subregionCode = String(formData.get("subregionCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const mapKey = String(formData.get("mapKey") ?? "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isPublished = formData.get("isPublished") === "on";

  if (!continentCode || !subregionCode || !name || !slug || !mapKey) {
    return;
  }

  const created = await prisma.region.create({
    data: { continentCode, subregionCode, name, slug, mapKey, sortOrder, isPublished },
  });
  await writeAudit({
    entityType: "Region",
    entityId: created.id,
    action: "CREATE",
    payload: { slug: created.slug },
  });
  revalidatePublicDeployments();
  revalidatePath("/admin/deployments/regions");
}

export async function updateRegion(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  if (!canPatchRegion(auth, id)) forbidden();

  const continentCode = String(formData.get("continentCode") ?? "").trim();
  const subregionCode = String(formData.get("subregionCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const mapKey = String(formData.get("mapKey") ?? "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isPublished = formData.get("isPublished") === "on";

  await prisma.region.update({
    where: { id },
    data: { continentCode, subregionCode, name, slug, mapKey, sortOrder, isPublished },
  });
  await writeAudit({ entityType: "Region", entityId: id, action: "UPDATE", payload: { slug } });
  revalidatePublicDeployments();
  revalidatePath("/admin/deployments/regions");
}

const assetLoaders = {
  country: (cid: string) =>
    prisma.countryDeployment.findUnique({ where: { id: cid }, select: { id: true, regionId: true } }),
  telco: (tid: string) =>
    prisma.telcoDeployment.findUnique({
      where: { id: tid },
      select: { id: true, countryId: true, country: { select: { id: true, regionId: true } } },
    }),
};

function parseMetadataJson(formData: FormData): Record<string, unknown> | undefined {
  const raw = String(formData.get("metadataJson") ?? "").trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function revalidateDeploymentSurfaces() {
  revalidatePublicDeployments();
  revalidatePath("/admin/deployments");
  revalidatePath("/admin/deployments/countries");
  revalidatePath("/admin/deployments/telcos", "page");
  revalidatePath("/admin/deployments/server-nodes");
  revalidatePath("/admin/deployments/access-domain-rules");
}

/** Telcos list default page size (must stay in sync with `telcos/page.tsx`). */
const TELCOS_DEFAULT_PAGE_SIZE = 25;

function parseTelcosListPerPage(formData: FormData): number {
  const raw = parseInt(String(formData.get("_telcosPageSize") ?? "").trim(), 10);
  if (raw === 25 || raw === 50 || raw === 100) return raw;
  return TELCOS_DEFAULT_PAGE_SIZE;
}

/** After create — page 1 so the new row (sorted by newest) is visible immediately. */
function redirectToTelcosListPageOne(perPage: number): never {
  if (perPage === TELCOS_DEFAULT_PAGE_SIZE) {
    redirect("/admin/deployments/telcos");
  }
  redirect(`/admin/deployments/telcos?perPage=${perPage}`);
}

export async function createCountry(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const regionId = String(formData.get("regionId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const iso2 = String(formData.get("iso2") ?? "").trim().toUpperCase();
  const iso3 = String(formData.get("iso3") ?? "").trim().toUpperCase();
  const flagAssetKey = String(formData.get("flagAssetKey") ?? "").trim();
  const countrySubdomain = String(formData.get("countrySubdomain") ?? "").trim().toLowerCase();
  const status = parseDeploymentStatus(formData.get("status")) ?? "IDENTIFIED";

  if (!regionId || !name || !iso2 || !iso3 || !flagAssetKey || !countrySubdomain) return;
  if (!canCreateCountry(auth, regionId)) forbidden();

  const region = await prisma.region.findUnique({ where: { id: regionId } });
  if (!region) return;

  const population = parseIntOrNull(formData.get("population"));
  const populationDisplay = String(formData.get("populationDisplay") ?? "").trim() || null;
  const officialReferenceDomain = String(formData.get("officialReferenceDomain") ?? "").trim() || null;
  const statusNote = String(formData.get("statusNote") ?? "").trim() || null;
  const sourceLabel = String(formData.get("sourceLabel") ?? "").trim() || null;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const sv = String(formData.get("sourceVerifiedAt") ?? "").trim();
  const sourceVerifiedAt = sv.length ? new Date(sv) : null;
  const sortOrder = parseIntOrNull(formData.get("sortOrder")) ?? 0;
  const isPublished = parseBoolean(formData.get("isPublished")) ?? false;

  const created = await prisma.countryDeployment.create({
    data: {
      regionId,
      name,
      iso2,
      iso3,
      flagAssetKey,
      population: population === undefined ? null : population,
      populationDisplay,
      countrySubdomain,
      officialReferenceDomain,
      status,
      statusNote,
      sourceLabel,
      sourceUrl,
      sourceVerifiedAt,
      sortOrder,
      isPublished,
    },
  });

  await writeStatusHistory({
    targetType: StatusHistoryTargetType.COUNTRY,
    targetId: created.id,
    previousStatus: null,
    nextStatus: status,
    reason: "Created",
  });
  await writeAudit({
    entityType: "CountryDeployment",
    entityId: created.id,
    action: "CREATE",
    payload: { iso2, countrySubdomain },
  });
  revalidateDeploymentSurfaces();
}

export async function updateCountry(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.countryDeployment.findUnique({ where: { id } });
  if (!existing) return;
  if (!canPatchCountry(auth, existing)) forbidden();

  const data: Record<string, unknown> = {};
  if (String(formData.get("regionId") ?? "").trim()) data.regionId = String(formData.get("regionId")).trim();
  if (String(formData.get("name") ?? "").trim()) data.name = String(formData.get("name")).trim();
  if (String(formData.get("iso2") ?? "").trim()) data.iso2 = String(formData.get("iso2")).trim().toUpperCase();
  if (String(formData.get("iso3") ?? "").trim()) data.iso3 = String(formData.get("iso3")).trim().toUpperCase();
  if (String(formData.get("flagAssetKey") ?? "").trim()) data.flagAssetKey = String(formData.get("flagAssetKey")).trim();
  if (String(formData.get("countrySubdomain") ?? "").trim()) {
    data.countrySubdomain = String(formData.get("countrySubdomain")).trim().toLowerCase();
  }
  const population = parseIntOrNull(formData.get("population"));
  if (population !== undefined) data.population = population;
  if (formData.has("populationDisplay")) {
    data.populationDisplay = String(formData.get("populationDisplay") ?? "").trim();
  }
  if (formData.has("officialReferenceDomain")) {
    data.officialReferenceDomain = String(formData.get("officialReferenceDomain") ?? "").trim() || null;
  }
  if (formData.has("statusNote")) data.statusNote = String(formData.get("statusNote") ?? "").trim();
  if (formData.has("sourceLabel")) data.sourceLabel = String(formData.get("sourceLabel") ?? "").trim();
  if (formData.has("sourceUrl")) data.sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const svu = String(formData.get("sourceVerifiedAt") ?? "").trim();
  if (formData.has("sourceVerifiedAt")) {
    data.sourceVerifiedAt = svu.length ? new Date(svu) : null;
  }
  const sortOrder = parseIntOrNull(formData.get("sortOrder"));
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  data.isPublished = formData.get("isPublished") === "on";

  if (formData.get("countryMapFields") === "1") {
    if (formData.has("latitude")) {
      const s = String(formData.get("latitude") ?? "").trim();
      data.latitude = s.length ? Number.parseFloat(s) : null;
    }
    if (formData.has("longitude")) {
      const s = String(formData.get("longitude") ?? "").trim();
      data.longitude = s.length ? Number.parseFloat(s) : null;
    }
    if (formData.has("visualOffsetX")) {
      const s = String(formData.get("visualOffsetX") ?? "").trim();
      data.visualOffsetX = s.length ? Number.parseFloat(s) : 0;
    }
    if (formData.has("visualOffsetY")) {
      const s = String(formData.get("visualOffsetY") ?? "").trim();
      data.visualOffsetY = s.length ? Number.parseFloat(s) : 0;
    }
    if (formData.has("deploymentStage")) {
      data.deploymentStage = String(formData.get("deploymentStage") ?? "").trim() || null;
    }
    const infraHealth = parseIntOrNull(formData.get("infrastructureHealth"));
    if (infraHealth !== undefined) data.infrastructureHealth = infraHealth;
    const uptime = String(formData.get("uptimePercentage") ?? "").trim();
    if (formData.has("uptimePercentage")) {
      data.uptimePercentage = uptime.length ? Number.parseFloat(uptime) : null;
    }
    const nodeH = parseIntOrNull(formData.get("nodeHealth"));
    if (nodeH !== undefined) data.nodeHealth = nodeH;
    const authVol = parseIntOrNull(formData.get("authVolume"));
    if (authVol !== undefined) data.authVolume = authVol;
    if (formData.has("clusterRegion")) {
      data.clusterRegion = String(formData.get("clusterRegion") ?? "").trim() || null;
    }
    const ls = String(formData.get("lastSyncAt") ?? "").trim();
    if (formData.has("lastSyncAt")) {
      data.lastSyncAt = ls.length ? new Date(ls) : null;
    }
    data.aiAgentEnabled = formData.get("aiAgentEnabled") === "on";
    const dScore = parseIntOrNull(formData.get("deploymentScore"));
    if (dScore !== undefined) data.deploymentScore = dScore;
    if (formData.has("satProtocolCoverage")) {
      data.satProtocolCoverage = String(formData.get("satProtocolCoverage") ?? "").trim() || null;
    }
    if (formData.has("simEsimStatus")) {
      data.simEsimStatus = String(formData.get("simEsimStatus") ?? "").trim() || null;
    }
    if (formData.has("govIntegrationStatus")) {
      data.govIntegrationStatus = String(formData.get("govIntegrationStatus") ?? "").trim() || null;
    }
    if (formData.has("apiStatus")) {
      data.apiStatus = String(formData.get("apiStatus") ?? "").trim() || null;
    }
    if (formData.has("regulatoryReadiness")) {
      data.regulatoryReadiness = String(formData.get("regulatoryReadiness") ?? "").trim() || null;
    }
    if (formData.has("riskStatus")) {
      data.riskStatus = String(formData.get("riskStatus") ?? "").trim() || null;
    }
    const apps = parseIntOrNull(formData.get("connectedAppsCount"));
    if (apps !== undefined) data.connectedAppsCount = apps;
  }

  const nextStatus = parseDeploymentStatus(formData.get("status"));
  if (nextStatus && nextStatus !== existing.status) {
    data.status = nextStatus;
  }

  const mergedRegionId = (data.regionId as string | undefined) ?? existing.regionId;
  if (!canPatchCountry(auth, { id: existing.id, regionId: mergedRegionId })) forbidden();

  await prisma.countryDeployment.update({
    where: { id },
    data: data as Prisma.CountryDeploymentUpdateInput,
  });

  if (nextStatus && nextStatus !== existing.status) {
    await writeStatusHistory({
      targetType: StatusHistoryTargetType.COUNTRY,
      targetId: id,
      previousStatus: existing.status,
      nextStatus,
      reason: String(formData.get("statusChangeReason") ?? "").trim() || null,
    });
    notifyDeploymentStatusChanged({
      entityType: "CountryDeployment",
      entityId: id,
      previousStatus: existing.status,
      nextStatus,
    });
  }

  await writeAudit({ entityType: "CountryDeployment", entityId: id, action: "PATCH", payload: data });
  revalidateDeploymentSurfaces();
  revalidatePath(`/admin/deployments/countries/${id}`);
}

export async function createTelco(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const countryId = String(formData.get("countryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const status = parseDeploymentStatus(formData.get("status")) ?? "IDENTIFIED";
  if (!countryId || !name || !slug) return;

  const country = await prisma.countryDeployment.findUnique({ where: { id: countryId } });
  if (!country) return;
  if (!canCreateTelco(auth, country)) forbidden();

  const telcoSubdomainRaw = String(formData.get("telcoSubdomain") ?? "").trim();
  const telcoSubdomain =
    telcoSubdomainRaw.length > 0 ? telcoSubdomainRaw.toLowerCase() : telcoSubdomainFromCountry(country.countrySubdomain, slug);

  const subscribers = parseIntOrNull(formData.get("subscribers"));
  const subscribersDisplay = String(formData.get("subscribersDisplay") ?? "").trim() || null;
  const officialDomain = String(formData.get("officialDomain") ?? "").trim() || null;
  const statusNote = String(formData.get("statusNote") ?? "").trim() || null;
  const sourceLabel = String(formData.get("sourceLabel") ?? "").trim() || null;
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const sv = String(formData.get("sourceVerifiedAt") ?? "").trim();
  const sourceVerifiedAt = sv.length ? new Date(sv) : null;
  const sortOrder = parseIntOrNull(formData.get("sortOrder")) ?? 0;
  const isPublished = parseBoolean(formData.get("isPublished")) ?? false;

  const created = await prisma.telcoDeployment.create({
    data: {
      countryId,
      name,
      slug,
      subscribers: subscribers === undefined ? null : subscribers,
      subscribersDisplay,
      telcoSubdomain,
      officialDomain,
      status,
      statusNote,
      sourceLabel,
      sourceUrl,
      sourceVerifiedAt,
      sortOrder,
      isPublished,
    },
  });

  const creationReason =
    String(formData.get("statusChangeReason") ?? "").trim() || null;
  await writeStatusHistory({
    targetType: StatusHistoryTargetType.TELCO,
    targetId: created.id,
    previousStatus: null,
    nextStatus: status,
    reason: creationReason ?? "Created",
  });
  await writeAudit({
    entityType: "TelcoDeployment",
    entityId: created.id,
    action: "CREATE",
    payload: { slug, telcoSubdomain },
  });
  const listPerPage = parseTelcosListPerPage(formData);
  revalidateDeploymentSurfaces();
  redirectToTelcosListPageOne(listPerPage);
}

export async function updateTelco(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.telcoDeployment.findUnique({
    where: { id },
    include: { country: { select: { id: true, regionId: true } } },
  });
  if (!existing) return;
  if (!canPatchTelco(auth, existing, existing.country)) forbidden();

  const data: Record<string, unknown> = {};
  if (String(formData.get("countryId") ?? "").trim()) data.countryId = String(formData.get("countryId")).trim();
  if (String(formData.get("name") ?? "").trim()) data.name = String(formData.get("name")).trim();
  if (String(formData.get("slug") ?? "").trim()) data.slug = String(formData.get("slug")).trim().toLowerCase();
  if (String(formData.get("telcoSubdomain") ?? "").trim()) {
    data.telcoSubdomain = String(formData.get("telcoSubdomain")).trim().toLowerCase();
  }
  const subscribers = parseIntOrNull(formData.get("subscribers"));
  if (subscribers !== undefined) data.subscribers = subscribers;
  if (formData.has("subscribersDisplay")) {
    data.subscribersDisplay = String(formData.get("subscribersDisplay") ?? "").trim();
  }
  if (formData.has("officialDomain")) data.officialDomain = String(formData.get("officialDomain") ?? "").trim();
  if (formData.has("statusNote")) data.statusNote = String(formData.get("statusNote") ?? "").trim();
  if (formData.has("sourceLabel")) data.sourceLabel = String(formData.get("sourceLabel") ?? "").trim();
  if (formData.has("sourceUrl")) data.sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const svu = String(formData.get("sourceVerifiedAt") ?? "").trim();
  if (formData.has("sourceVerifiedAt")) {
    data.sourceVerifiedAt = svu.length ? new Date(svu) : null;
  }
  const sortOrder = parseIntOrNull(formData.get("sortOrder"));
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  data.isPublished = formData.get("isPublished") === "on";

  const nextStatus = parseDeploymentStatus(formData.get("status"));
  if (nextStatus && nextStatus !== existing.status) {
    data.status = nextStatus;
  }

  await prisma.telcoDeployment.update({ where: { id }, data });

  if (nextStatus && nextStatus !== existing.status) {
    await writeStatusHistory({
      targetType: StatusHistoryTargetType.TELCO,
      targetId: id,
      previousStatus: existing.status,
      nextStatus,
      reason: String(formData.get("statusChangeReason") ?? "").trim() || null,
    });
    notifyDeploymentStatusChanged({
      entityType: "TelcoDeployment",
      entityId: id,
      previousStatus: existing.status,
      nextStatus,
    });
  }

  await writeAudit({ entityType: "TelcoDeployment", entityId: id, action: "PATCH", payload: data });
  revalidateDeploymentSurfaces();
  revalidatePath(`/admin/deployments/telcos/${id}`);
}

export async function createServerNode(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const targetTypeRaw = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const fqdn = String(formData.get("fqdn") ?? "").trim();
  const envRaw = String(formData.get("environment") ?? "").trim();
  const healthcheckUrl = String(formData.get("healthcheckUrl") ?? "").trim() || null;
  const status = parseDeploymentStatus(formData.get("status")) ?? "IDENTIFIED";

  if (targetTypeRaw !== "COUNTRY" && targetTypeRaw !== "TELCO") return;
  if (!targetId || !fqdn) return;
  if (envRaw !== "PROD" && envRaw !== "STAGE" && envRaw !== "TEST") return;

  const targetType = targetTypeRaw as TargetType;
  const environment = envRaw as ServerEnvironment;

  const allowed = await canMutateServerAsset(auth, targetType, targetId, assetLoaders);
  if (!allowed) forbidden();

  const metadataJson = parseMetadataJson(formData);

  const created = await prisma.serverNode.create({
    data: {
      targetType,
      targetId,
      fqdn,
      environment,
      healthcheckUrl,
      status,
      metadataJson: metadataJson as Prisma.InputJsonValue | undefined,
    },
  });
  await writeAudit({ entityType: "ServerNode", entityId: created.id, action: "CREATE", payload: { fqdn } });
  revalidateDeploymentSurfaces();
}

export async function createServerNodeFromForm(formData: FormData) {
  const targetType = String(formData.get("targetType") ?? "").trim();
  const c = String(formData.get("targetIdCountry") ?? "").trim();
  const t = String(formData.get("targetIdTelco") ?? "").trim();
  const targetId = targetType === "TELCO" ? t : c;
  formData.delete("targetIdCountry");
  formData.delete("targetIdTelco");
  formData.set("targetId", targetId);
  return createServerNode(formData);
}

export async function updateServerNode(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.serverNode.findUnique({ where: { id } });
  if (!existing) return;

  const allowed = await canMutateServerAsset(auth, existing.targetType, existing.targetId, assetLoaders);
  if (!allowed) forbidden();

  const data: Record<string, unknown> = {};
  if (String(formData.get("fqdn") ?? "").trim()) data.fqdn = String(formData.get("fqdn")).trim();
  const envRaw = String(formData.get("environment") ?? "").trim();
  if (envRaw === "PROD" || envRaw === "STAGE" || envRaw === "TEST") {
    data.environment = envRaw as ServerEnvironment;
  }
  if (formData.has("healthcheckUrl")) {
    const h = String(formData.get("healthcheckUrl") ?? "").trim();
    data.healthcheckUrl = h.length ? h : null;
  }
  const st = parseDeploymentStatus(formData.get("status"));
  if (st) data.status = st;
  const hb = String(formData.get("lastHeartbeatAt") ?? "").trim();
  if (formData.has("lastHeartbeatAt")) {
    data.lastHeartbeatAt = hb.length ? new Date(hb) : null;
  }
  if (formData.has("metadataJson")) {
    const mj = parseMetadataJson(formData);
    if (mj !== undefined) data.metadataJson = mj as Prisma.InputJsonValue;
  }

  await prisma.serverNode.update({ where: { id }, data });
  await writeAudit({ entityType: "ServerNode", entityId: id, action: "PATCH", payload: data });
  revalidateDeploymentSurfaces();
  revalidatePath(`/admin/deployments/server-nodes/${id}`);
}

export async function createAccessDomainRule(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const targetTypeRaw = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();
  const allowedEmailDomain = String(formData.get("allowedEmailDomain") ?? "").trim().toLowerCase();
  const methodRaw = String(formData.get("verificationMethod") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (targetTypeRaw !== "COUNTRY" && targetTypeRaw !== "TELCO") return;
  if (!targetId || !allowedEmailDomain) return;

  const targetType = targetTypeRaw as TargetType;
  const ok = await canMutateServerAsset(auth, targetType, targetId, assetLoaders);
  if (!ok) forbidden();

  let verificationMethod: VerificationMethod = VerificationMethod.EMAIL_OTP;
  if (methodRaw === "SSO") verificationMethod = VerificationMethod.SSO;
  if (methodRaw === "INVITE_ONLY") verificationMethod = VerificationMethod.INVITE_ONLY;

  const created = await prisma.accessDomainRule.create({
    data: { targetType, targetId, allowedEmailDomain, verificationMethod, isActive },
  });
  await writeAudit({
    entityType: "AccessDomainRule",
    entityId: created.id,
    action: "CREATE",
    payload: { allowedEmailDomain },
  });
  revalidateDeploymentSurfaces();
}

export async function createAccessDomainRuleFromForm(formData: FormData) {
  const targetType = String(formData.get("targetType") ?? "").trim();
  const c = String(formData.get("targetIdCountry") ?? "").trim();
  const t = String(formData.get("targetIdTelco") ?? "").trim();
  const targetId = targetType === "TELCO" ? t : c;
  formData.delete("targetIdCountry");
  formData.delete("targetIdTelco");
  formData.set("targetId", targetId);
  return createAccessDomainRule(formData);
}

export async function updateAccessDomainRule(formData: FormData) {
  const auth = await assertAdminServer();
  if (isReadOnlyRole(auth) || isComplianceReviewer(auth)) forbidden();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const existing = await prisma.accessDomainRule.findUnique({ where: { id } });
  if (!existing) return;

  const ok = await canMutateServerAsset(auth, existing.targetType, existing.targetId, assetLoaders);
  if (!ok) forbidden();

  const data: Record<string, unknown> = {};
  if (String(formData.get("allowedEmailDomain") ?? "").trim()) {
    data.allowedEmailDomain = String(formData.get("allowedEmailDomain")).trim().toLowerCase();
  }
  const methodRaw = String(formData.get("verificationMethod") ?? "").trim();
  if (methodRaw === "EMAIL_OTP" || methodRaw === "SSO" || methodRaw === "INVITE_ONLY") {
    data.verificationMethod = methodRaw as VerificationMethod;
  }
  data.isActive = formData.get("isActive") === "on";

  await prisma.accessDomainRule.update({ where: { id }, data });
  await writeAudit({ entityType: "AccessDomainRule", entityId: id, action: "PATCH", payload: data });
  revalidateDeploymentSurfaces();
  revalidatePath(`/admin/deployments/access-domain-rules/${id}`);
}
