import type { DeploymentStatus } from "@prisma/client";
import { deploymentStatusPresentation } from "@/lib/deployments/status";
import type { PublicCountry, PublicTelco } from "@/lib/deployments/publicTree";
import type { DeploymentMapFlatNode } from "@/lib/deployments/deployment-map-utils";

function countTelcosByStatus(telcos: PublicTelco[], status: DeploymentStatus): number {
  return telcos.filter((t) => t.status === status).length;
}

const STATUS_RANK: Record<DeploymentStatus, number> = {
  IDENTIFIED: 0,
  INSTITUTIONAL_AWARENESS: 1,
  TVIP: 2,
  OPERATIONAL: 3,
};

function worstTelcoStatus(telcos: PublicTelco[]): DeploymentStatus | null {
  if (!telcos.length) return null;
  let worst: DeploymentStatus = telcos[0]!.status;
  let rank = STATUS_RANK[worst] ?? 0;
  for (const t of telcos) {
    const r = STATUS_RANK[t.status] ?? 0;
    if (r < rank) {
      rank = r;
      worst = t.status;
    }
  }
  return worst;
}

function sumSubscribers(telcos: PublicTelco[]): number | null {
  let any = false;
  let sum = 0;
  for (const t of telcos) {
    if (t.subscribers != null) {
      any = true;
      sum += t.subscribers;
    }
  }
  return any ? sum : null;
}

export type PublicCountryMapKpis = {
  operatorCount: number;
  carrierRegistryLabel: string;
  telcoStatusLine: string;
  subscribersSummedDisplay: string;
  satCoverageDisplay: string;
  simEsimDisplay: string;
  govIntegrationDisplay: string;
  apiStatusDisplay: string;
  regulatoryDisplay: string;
  riskDisplay: string;
  authEventsDisplay: string;
  connectedAppsDisplay: string;
  /** True when admin has populated at least one telemetry-heavy field. */
  hasExplicitTelemetry: boolean;
  complianceReadinessDisplay: string;
  strategicPartnersLine: string;
};

export function buildPublicCountryMapKpis(country: PublicCountry): PublicCountryMapKpis {
  const telcos = country.telcos;
  const operatorCount = telcos.length;
  const op = countTelcosByStatus(telcos, "OPERATIONAL");
  const tvip = countTelcosByStatus(telcos, "TVIP");
  const ia = countTelcosByStatus(telcos, "INSTITUTIONAL_AWARENESS");
  const id = countTelcosByStatus(telcos, "IDENTIFIED");

  const telcoStatusLine =
    operatorCount === 0
      ? "No published operators on this country record"
      : `Published operators — operational ${op}, validation ${tvip}, awareness ${ia}, identified ${id}`;

  const subs = sumSubscribers(telcos);
  const subscribersSummedDisplay =
    subs != null ? subs.toLocaleString("en-IE") + " (summed subscriber integers where present)" : "—";

  const hasExplicitTelemetry = Boolean(
    country.authVolume != null ||
      country.uptimePercentage != null ||
      country.nodeHealth != null ||
      country.infrastructureHealth != null ||
      country.lastSyncAt != null ||
      (country.satProtocolCoverage && country.satProtocolCoverage.trim().length > 0) ||
      (country.simEsimStatus && country.simEsimStatus.trim().length > 0) ||
      (country.govIntegrationStatus && country.govIntegrationStatus.trim().length > 0) ||
      (country.apiStatus && country.apiStatus.trim().length > 0) ||
      country.connectedAppsCount != null,
  );

  const worst = worstTelcoStatus(telcos);
  const worstLabel = worst ? deploymentStatusPresentation(worst).label : null;

  const satCoverageDisplay =
    country.satProtocolCoverage?.trim() ||
    (operatorCount ? "See operator-level posture; country-level SAT string not set." : "—");

  const simEsimDisplay =
    country.simEsimStatus?.trim() ||
    (operatorCount ? "See operator records for SIM / eSIM posture." : "—");

  const govIntegrationDisplay =
    country.govIntegrationStatus?.trim() ||
    (country.officialReferenceDomain ? "Official reference domain is published (see below)." : "—");

  const apiStatusDisplay =
    country.apiStatus?.trim() ||
    (operatorCount === 0
      ? "—"
      : op === operatorCount
        ? "Derived: all published operators operational"
        : tvip > 0
          ? "Derived: validation pending on one or more operators"
          : "Derived: mixed operator API readiness (see list)");

  const regulatoryDisplay =
    country.regulatoryReadiness?.trim() ||
    (country.status === "OPERATIONAL"
      ? "Country status operational (registry)"
      : `Country status: ${deploymentStatusPresentation(country.status).label}`);

  const riskDisplay =
    country.riskStatus?.trim() ||
    (worstLabel ? `Derived floor from operators: ${worstLabel}` : "No operator risk floor (no operators)");

  const authEventsDisplay =
    country.authVolume != null ? country.authVolume.toLocaleString("en-IE") : "Not published on this record";

  const connectedAppsDisplay =
    country.connectedAppsCount != null
      ? country.connectedAppsCount.toLocaleString("en-IE")
      : operatorCount > 0
        ? "Not published — see operator integrations"
        : "—";

  const complianceReadinessDisplay =
    country.regulatoryReadiness?.trim() ||
    (country.status === "OPERATIONAL" && op === operatorCount && operatorCount > 0
      ? "Strong alignment: country + all operators operational"
      : `Registry posture: ${deploymentStatusPresentation(country.status).label}`);

  const strategicPartnersLine =
    operatorCount === 0
      ? "No linked operators in published registry."
      : `${operatorCount} operator node(s) in this country’s published slice.`;

  return {
    operatorCount,
    carrierRegistryLabel: `${operatorCount} published operator record(s)`,
    telcoStatusLine,
    subscribersSummedDisplay,
    satCoverageDisplay,
    simEsimDisplay,
    govIntegrationDisplay,
    apiStatusDisplay,
    regulatoryDisplay,
    riskDisplay,
    authEventsDisplay,
    connectedAppsDisplay,
    hasExplicitTelemetry,
    complianceReadinessDisplay,
    strategicPartnersLine,
  };
}

/** Aggregate KPIs for clustered map nodes (same map region / cell). */
export function buildClusterMapKpis(members: DeploymentMapFlatNode[]): {
  operatorCount: number;
  countryCount: number;
  summaryLine: string;
} {
  const countryCount = members.length;
  let operatorCount = 0;
  for (const m of members) {
    operatorCount += m.country.telcos.length;
  }
  const summaryLine = `${countryCount} countries · ${operatorCount} published operators (summed)`;
  return { operatorCount, countryCount, summaryLine };
}
