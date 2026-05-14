import { describe, expect, it } from "vitest";
import { generateLatestAuthBatch } from "@/lib/authenticationFeed/generate";
import { normalizeActiveWeights, weightedPickById } from "@/lib/authenticationFeed/weights";

describe("normalizeActiveWeights", () => {
  it("normalizes active rows to 100", () => {
    const rows = [
      { id: "a", active: true, percentageWeight: 30 },
      { id: "b", active: true, percentageWeight: 70 },
      { id: "c", active: false, percentageWeight: 99 },
    ];
    const m = normalizeActiveWeights(rows);
    expect(m.get("a")).toBeCloseTo(30, 5);
    expect(m.get("b")).toBeCloseTo(70, 5);
    expect(m.has("c")).toBe(false);
  });
});

describe("weightedPickById", () => {
  it("deterministic with fixed random", () => {
    const items = [{ id: "x" }, { id: "y" }];
    const w = new Map([
      ["x", 100],
      ["y", 0],
    ]);
    const rnd = () => 0.0001;
    expect(weightedPickById(items, w, rnd).id).toBe("x");
  });
});

describe("generateLatestAuthBatch uniqueness", () => {
  it("does not emit duplicate pair before pool reset when under limit", () => {
    const countries = [
      { id: "c1", iso2: "US", countryName: "United States", region: "NA", active: true, percentageWeight: 50 },
      { id: "c2", iso2: "IE", countryName: "Ireland", region: "EU", active: true, percentageWeight: 50 },
    ];
    const protocols = [
      {
        id: "p1",
        protocolCode: "SAT-ID",
        protocolName: "SAT-ID",
        protocolCategory: "ID",
        active: true,
        percentageWeight: 100,
        homePercentage: 50,
        roamingPercentage: 50,
      },
    ];
    const pairs = new Set<string>();
    const { records } = generateLatestAuthBatch({
      countries,
      protocols,
      limit: 2,
      uniquenessLimit: 10,
      maskingEnabled: true,
      pairsUsed: pairs,
    });
    expect(records.length).toBe(2);
    const keys = records.map((r) => {
      const iso = r.c === "United States" ? "US" : "IE";
      return `${iso}:${r.pl}`;
    });
    expect(new Set(keys).size).toBe(2);
  });

  it("excludes countries with authenticationEnabled false even when active", () => {
    const countries = [
      { id: "c1", iso2: "US", countryName: "United States", region: "NA", active: true, authenticationEnabled: false, percentageWeight: 50 },
      { id: "c2", iso2: "IE", countryName: "Ireland", region: "EU", active: true, authenticationEnabled: true, percentageWeight: 50 },
    ];
    const protocols = [
      {
        id: "p1",
        protocolCode: "SAT-ID",
        protocolName: "SAT-ID",
        protocolCategory: "ID",
        active: true,
        percentageWeight: 100,
        homePercentage: 50,
        roamingPercentage: 50,
      },
    ];
    const { records } = generateLatestAuthBatch({
      countries,
      protocols,
      limit: 3,
      uniquenessLimit: 20,
      maskingEnabled: true,
      pairsUsed: new Set(),
    });
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r) => r.c === "Ireland")).toBe(true);
  });
});
