import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { GlobalDeploymentView } from "@/components/global-deployment/GlobalDeploymentView";
import type { PublicDeploymentTree } from "@/lib/deployments/publicTree";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

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

describe("GlobalDeploymentView", () => {
  it("expands a country row to show telcos", () => {
    render(<GlobalDeploymentView initialTree={tree} />);

    const countryBtn = screen.getByRole("button", { name: /Testland/i });
    expect(countryBtn.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(countryBtn);
    expect(countryBtn.getAttribute("aria-expanded")).toBe("true");

    const table = screen.getByRole("table");
    expect(within(table).getByText("TestTelco")).toBeTruthy();
  });
});
