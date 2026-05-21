import { describe, expect, it } from "vitest";
import { buildPublicCountryMapKpis, buildClusterMapKpis } from "@/lib/deployments/countryMapKpis";
import type { PublicCountry, PublicTelco } from "@/lib/deployments/publicTree";
import type { DeploymentMapFlatNode } from "@/lib/deployments/deployment-map-utils";

const telco = (status: PublicTelco["status"]): PublicTelco => ({
  id: "t1",
  name: "Op",
  slug: "op",
  subscribers: 100,
  subscribersDisplay: null,
  telcoSubdomain: "op.example.com",
  officialDomain: null,
  status,
  statusNote: null,
  sourceLabel: null,
  sourceUrl: null,
  sourceVerifiedAt: null,
  sortOrder: 0,
});

const baseCountry = (): PublicCountry => ({
  id: "c1",
  name: "Land",
  iso2: "LD",
  iso3: "LND",
  flagAssetKey: "ld",
  population: null,
  populationDisplay: null,
  countrySubdomain: "land.example.com",
  officialReferenceDomain: null,
  status: "TVIP",
  statusNote: null,
  sourceLabel: null,
  sourceUrl: null,
  sourceVerifiedAt: null,
  sortOrder: 0,
  latitude: null,
  longitude: null,
  visualOffsetX: 0,
  visualOffsetY: 0,
  deploymentStage: null,
  infrastructureHealth: null,
  uptimePercentage: null,
  nodeHealth: null,
  authVolume: null,
  clusterRegion: null,
  lastSyncAt: null,
  aiAgentEnabled: false,
  deploymentScore: null,
  satProtocolCoverage: null,
  simEsimStatus: null,
  govIntegrationStatus: null,
  apiStatus: null,
  regulatoryReadiness: null,
  riskStatus: null,
  connectedAppsCount: null,
  publicSlug: "land",
  telcos: [telco("OPERATIONAL"), telco("TVIP")],
});

describe("countryMapKpis", () => {
  it("derives API line when explicit apiStatus absent", () => {
    const k = buildPublicCountryMapKpis(baseCountry());
    expect(k.apiStatusDisplay).toContain("Derived");
  });

  it("aggregates cluster members", () => {
    const c = baseCountry();
    const n1: DeploymentMapFlatNode = {
      id: "1",
      iso2: "A",
      name: "A",
      status: "OPERATIONAL",
      mapKey: "EUROPE",
      regionName: "R",
      regionId: "r",
      x: 0,
      y: 0,
      country: { ...c, id: "1", telcos: [telco("OPERATIONAL")] },
    };
    const n2: DeploymentMapFlatNode = {
      ...n1,
      id: "2",
      iso2: "B",
      name: "B",
      country: { ...c, id: "2", telcos: [telco("TVIP"), telco("OPERATIONAL")] },
    };
    const agg = buildClusterMapKpis([n1, n2]);
    expect(agg.countryCount).toBe(2);
    expect(agg.operatorCount).toBe(3);
  });
});
