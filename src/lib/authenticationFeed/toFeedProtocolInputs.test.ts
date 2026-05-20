import { describe, expect, it } from "vitest";
import type { SatProtocol } from "@prisma/client";
import { toFeedProtocolInputs } from "@/lib/authenticationFeed/toFeedProtocolInputs";

function row(over: Partial<SatProtocol> & Pick<SatProtocol, "id" | "protocolCode" | "protocolName" | "protocolCategory">): SatProtocol {
  return {
    protocolSlug: null,
    shortDescription: null,
    longDescription: null,
    protocolMemo: "",
    protocolUrlEnabled: false,
    protocolUrl: null,
    allowProtocolLink: false,
    securityClassification: "STANDARD",
    flagEnterprise: true,
    flagGovernment: true,
    flagTelco: true,
    flagConsumer: true,
    flagAiAgent: true,
    displayOrder: 0,
    iconKey: null,
    colorTheme: null,
    trustLevel: 4,
    riskReductionScore: 0,
    globalAvailability: true,
    apiReady: true,
    auditRequired: true,
    consentRequired: true,
    zeroKnowledgeCompatible: false,
    simOrEsimRequired: false,
    deviceBindingRequired: false,
    createdBySystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    active: true,
    percentageWeight: 60,
    homePercentage: 40,
    roamingPercentage: 60,
    ...over,
  };
}

describe("toFeedProtocolInputs", () => {
  it("drops inactive protocols", () => {
    const out = toFeedProtocolInputs([
      row({
        id: "a",
        protocolCode: "SAT-A",
        protocolName: "SAT A",
        protocolCategory: "Identity",
        active: false,
      }),
      row({
        id: "b",
        protocolCode: "SAT-B",
        protocolName: "SAT B",
        protocolCategory: "Identity",
        active: true,
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.protocolCode).toBe("SAT-B");
  });
});
