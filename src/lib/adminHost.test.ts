import { afterEach, describe, expect, it } from "vitest";
import { resolveKeyraRedirectOrigin } from "@/lib/adminHost";

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request("http://0.0.0.0:8080/api/keyra/session/continue?next=%2Fadmin%2Fdeployments%2Fserver-nodes", {
    headers,
  });
}

describe("resolveKeyraRedirectOrigin", () => {
  afterEach(() => {
    delete process.env.KEYRA_ADMIN_HOST;
    delete process.env.KEYRA_ADMIN_PUBLIC_ORIGIN;
  });

  it("uses configured admin origin for admin next paths on internal bind addresses", () => {
    process.env.KEYRA_ADMIN_HOST = "admin.keyra.ie";
    process.env.NODE_ENV = "production";

    const origin = resolveKeyraRedirectOrigin(
      requestWithHeaders({ host: "0.0.0.0:8080" }),
      "/admin/deployments/server-nodes",
    );

    expect(origin).toBe("https://admin.keyra.ie");
  });

  it("uses forwarded host when admin origin is not configured", () => {
    process.env.NODE_ENV = "production";

    const origin = resolveKeyraRedirectOrigin(
      requestWithHeaders({
        host: "0.0.0.0:8080",
        "x-forwarded-host": "keyra.ie",
        "x-forwarded-proto": "https",
      }),
      "/app",
    );

    expect(origin).toBe("https://keyra.ie");
  });
});
