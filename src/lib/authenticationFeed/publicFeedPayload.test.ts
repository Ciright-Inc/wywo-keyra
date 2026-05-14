import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sealFeedPayload, unsealFeedPayload, wrapPublicFeedJson } from "@/lib/authenticationFeed/publicFeedPayload";

describe("publicFeedPayload", () => {
  beforeEach(() => {
    process.env.KEYRA_FEED_PAYLOAD_SECRET = "test-secret-for-sealing";
  });
  afterEach(() => {
    delete process.env.KEYRA_FEED_PAYLOAD_SECRET;
  });

  it("seal/unseal roundtrips JSON", () => {
    const inner = { feedEnabled: true, records: [{ t: "x" }], nextCursor: 1 };
    const blob = sealFeedPayload("sess-a", inner);
    expect(unsealFeedPayload("sess-a", blob)).toEqual(inner);
  });

  it("rejects wrong session uuid", () => {
    const blob = sealFeedPayload("sess-a", { ok: true });
    expect(() => unsealFeedPayload("sess-b", blob)).toThrow();
  });

  it("wrap v2 when obfuscation + secret", () => {
    const inner = { feedEnabled: true, records: [] };
    const out = wrapPublicFeedJson({
      obfuscationEnabled: true,
      sessionUuid: "u1",
      inner,
    });
    expect(out).toMatchObject({ v: 2, enc: true });
    expect(typeof (out as { blob?: string }).blob).toBe("string");
  });

  it("wrap v1 when obfuscation without secret", () => {
    delete process.env.KEYRA_FEED_PAYLOAD_SECRET;
    const inner = { feedEnabled: true, records: [] };
    const out = wrapPublicFeedJson({
      obfuscationEnabled: true,
      sessionUuid: "u1",
      inner,
    });
    expect(out).toMatchObject({ v: 1, enc: true });
    expect(typeof (out as { d?: string }).d).toBe("string");
  });

  it("pass-through when obfuscation disabled", () => {
    const inner = { feedEnabled: true, records: [] };
    const out = wrapPublicFeedJson({
      obfuscationEnabled: false,
      sessionUuid: "u1",
      inner,
    });
    expect(out).toEqual(inner);
  });
});
