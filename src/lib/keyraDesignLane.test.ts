import { describe, expect, it } from "vitest";
import { keyraDesignLaneFromPathname, parseKeyraDesignLaneHeader } from "@/lib/keyraDesignLane";

describe("keyraDesignLaneFromPathname", () => {
  it("maps admin to enterprise", () => {
    expect(keyraDesignLaneFromPathname("/admin/deployments")).toBe("enterprise");
  });
  it("maps global deployment to enterprise", () => {
    expect(keyraDesignLaneFromPathname("/global-deployment")).toBe("enterprise");
  });
  it("maps developers to developer", () => {
    expect(keyraDesignLaneFromPathname("/developers")).toBe("developer");
  });
  it("defaults consumer for marketing", () => {
    expect(keyraDesignLaneFromPathname("/")).toBe("consumer");
    expect(keyraDesignLaneFromPathname("/login")).toBe("consumer");
  });
});

describe("parseKeyraDesignLaneHeader", () => {
  it("parses valid values", () => {
    expect(parseKeyraDesignLaneHeader("enterprise")).toBe("enterprise");
    expect(parseKeyraDesignLaneHeader("developer")).toBe("developer");
  });
  it("falls back to consumer", () => {
    expect(parseKeyraDesignLaneHeader(null)).toBe("consumer");
    expect(parseKeyraDesignLaneHeader("")).toBe("consumer");
    expect(parseKeyraDesignLaneHeader("nope")).toBe("consumer");
  });
});
