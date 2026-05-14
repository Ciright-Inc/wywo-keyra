import { describe, expect, it } from "vitest";
import { validateCountryName, validatePercentageWeight } from "@/lib/authenticationFeed/countryPayload";

describe("countryPayload", () => {
  it("rejects non-numeric weight", () => {
    expect(validatePercentageWeight("x")).toMatchObject({ error: expect.any(String) });
  });
  it("rejects non-positive weight", () => {
    expect(validatePercentageWeight(0)).toMatchObject({ error: expect.any(String) });
  });
  it("accepts weight 5", () => {
    expect(validatePercentageWeight(5)).toBe(5);
  });
  it("validates country name", () => {
    expect(validateCountryName("")).toMatchObject({ error: expect.any(String) });
    expect(validateCountryName("Ireland")).toBe(true);
  });
});
