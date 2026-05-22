import { describe, expect, it } from "vitest";
import { buildGetStartedAccessUrl, normalizeKeyraReturnUrl } from "@/lib/keyraAppUrls";

describe("normalizeKeyraReturnUrl", () => {
  it("strips www from keyra.ie return URLs", () => {
    expect(normalizeKeyraReturnUrl("https://www.keyra.ie/admin/deployments")).toBe(
      "https://keyra.ie/admin/deployments",
    );
  });

  it("leaves other hosts unchanged", () => {
    expect(normalizeKeyraReturnUrl("https://admin.keyra.ie/admin/deployments")).toBe(
      "https://admin.keyra.ie/admin/deployments",
    );
  });
});

describe("buildGetStartedAccessUrl", () => {
  it("encodes canonical keyra.ie admin return URLs", () => {
    const url = buildGetStartedAccessUrl("https://www.keyra.ie/admin/deployments");
    expect(url).toContain("return=");
    expect(url).toContain(encodeURIComponent("https://keyra.ie/admin/deployments"));
    expect(url).not.toContain(encodeURIComponent("https://www.keyra.ie/admin/deployments"));
  });
});
