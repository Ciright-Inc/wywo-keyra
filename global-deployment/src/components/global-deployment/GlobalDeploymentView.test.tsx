import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { GlobalDeploymentView } from "@/components/global-deployment/GlobalDeploymentView";
import type { PublicDeploymentTree } from "@/lib/deployments/publicTree";

const tree: PublicDeploymentTree = {
  mapKeys: ["EUROPE"],
  regions: [
    {
      id: "r1",
      continentCode: "150",
      subregionCode: "154",
      name: "Test Region",
      slug: "test-region",
      mapKey: "EUROPE",
      sortOrder: 0,
      countries: [
        {
          id: "c1",
          name: "Testland",
          iso2: "TL",
          iso3: "TLS",
          flagAssetKey: "tl",
          population: 1000,
          populationDisplay: "1k",
          countrySubdomain: "testland.example.com",
          officialReferenceDomain: "https://example.com",
          status: "OPERATIONAL",
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
          publicSlug: "testland",
          telcos: [
            {
              id: "t1",
              name: "TestTelco",
              slug: "test-telco",
              subscribers: 500,
              subscribersDisplay: "500",
              telcoSubdomain: "tt.testland.example.com",
              officialDomain: "https://telco.example.com",
              status: "TVIP",
              statusNote: null,
              sourceLabel: null,
              sourceUrl: null,
              sourceVerifiedAt: null,
              sortOrder: 0,
            },
          ],
        },
      ],
    },
  ],
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(tree),
      }),
    ) as unknown as typeof fetch,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GlobalDeploymentView", () => {
  it("expands a country row to show telcos", () => {
    render(<GlobalDeploymentView initialTree={tree} />);

    const countryBtn = screen.getByRole("button", { name: /Registry row: Testland/i });
    expect(countryBtn.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(countryBtn);
    expect(countryBtn.getAttribute("aria-expanded")).toBe("true");

    const table = screen.getByRole("table");
    expect(within(table).getByText("TestTelco")).toBeTruthy();
  });
});
