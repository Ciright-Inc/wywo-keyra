import { describe, expect, it } from "vitest";
import { deploymentStatusPresentation, legendStatuses } from "@/lib/deployments/status";

describe("deploymentStatusPresentation", () => {
  it("maps TVIP to combined label", () => {
    const p = deploymentStatusPresentation("TVIP");
    expect(p.label).toContain("Testing");
    expect(p.description.length).toBeGreaterThan(10);
  });

  it("legend lists exactly four statuses", () => {
    expect(legendStatuses()).toHaveLength(4);
  });
});
