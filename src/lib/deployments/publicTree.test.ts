import { describe, expect, it } from "vitest";
import type { PublicDeploymentTree } from "@/lib/deployments/publicTreeShared";
import { filterPublicTree } from "@/lib/deployments/publicTreeShared";

describe("filterPublicTree", () => {
  it("filters by mapKey without mutating original tree object fields deeply", () => {
    const tree: PublicDeploymentTree = {
      mapKeys: ["EUROPE", "AFRICA"],
      regions: [
        {
          id: "r1",
          continentCode: "150",
          subregionCode: "154",
          name: "Northern Europe",
          slug: "ne",
          mapKey: "EUROPE",
          sortOrder: 1,
          countries: [],
        },
        {
          id: "r2",
          continentCode: "002",
          subregionCode: "011",
          name: "Western Africa",
          slug: "wf",
          mapKey: "AFRICA",
          sortOrder: 2,
          countries: [],
        },
      ],
    };

    const filtered = filterPublicTree(tree, { mapKey: "EUROPE" });
    expect(filtered.regions).toHaveLength(1);
    expect(filtered.regions[0]?.mapKey).toBe("EUROPE");
    expect(tree.regions).toHaveLength(2);
  });
});
