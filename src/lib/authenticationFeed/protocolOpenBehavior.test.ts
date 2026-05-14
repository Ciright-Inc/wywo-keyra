import { describe, expect, it } from "vitest";
import { protocolOpenAction } from "@/lib/authenticationFeed/protocolOpenBehavior";

describe("protocolOpenAction", () => {
  it("external when link allowed and URL present", () => {
    expect(
      protocolOpenAction({
        allowProtocolLink: true,
        protocolUrlEnabled: true,
        protocolUrl: "https://example.com",
      }),
    ).toBe("external");
  });

  it("modal when link disallowed", () => {
    expect(
      protocolOpenAction({
        allowProtocolLink: false,
        protocolUrlEnabled: true,
        protocolUrl: "https://example.com",
      }),
    ).toBe("modal");
  });

  it("modal when URL empty", () => {
    expect(
      protocolOpenAction({
        allowProtocolLink: true,
        protocolUrlEnabled: true,
        protocolUrl: "  ",
      }),
    ).toBe("modal");
  });

  it("modal when URL disabled", () => {
    expect(
      protocolOpenAction({
        allowProtocolLink: true,
        protocolUrlEnabled: false,
        protocolUrl: "https://example.com",
      }),
    ).toBe("modal");
  });
});
