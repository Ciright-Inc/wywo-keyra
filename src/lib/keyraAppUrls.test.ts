import { describe, expect, it } from "vitest";
import {
  buildGetStartedAccessUrl,
  buildKeyraSessionContinueUrl,
  keyraGlobalDeploymentUrl,
  normalizeKeyraReturnUrl,
} from "@/lib/keyraAppUrls";

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

describe("buildKeyraSessionContinueUrl", () => {
  it("routes Get Started returns through the session bridge API", () => {
    process.env.NEXT_PUBLIC_KEYRA_SITE_URL = "http://localhost:3030";
    const url = buildKeyraSessionContinueUrl("/admin/deployments");
    expect(url).toBe(
      "http://localhost:3030/api/keyra/session/continue?next=%2Fadmin%2Fdeployments",
    );
  });
});

describe("keyraGlobalDeploymentUrl", () => {
  it("defaults to governments.keyra.ie", () => {
    delete process.env.NEXT_PUBLIC_GOVERNMENTS_URL;
    expect(keyraGlobalDeploymentUrl()).toBe("https://governments.keyra.ie");
  });

  it("respects NEXT_PUBLIC_GOVERNMENTS_URL", () => {
    process.env.NEXT_PUBLIC_GOVERNMENTS_URL = "https://governments.example.test";
    expect(keyraGlobalDeploymentUrl()).toBe("https://governments.example.test");
  });
});
