import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function payloadSecret(): string | null {
  const s = process.env.KEYRA_FEED_PAYLOAD_SECRET?.trim();
  return s && s.length > 0 ? s : null;
}

function aesKeyForSession(sessionUuid: string): Buffer {
  const secret = payloadSecret();
  if (!secret) {
    throw new Error("KEYRA_FEED_PAYLOAD_SECRET is required for sealed feed payloads.");
  }
  return createHash("sha256").update(secret, "utf8").update("\0").update(sessionUuid, "utf8").digest();
}

/** AES-256-GCM: base64url(iv12 || ciphertext || tag16) */
export function sealFeedPayload(sessionUuid: string, inner: Record<string, unknown>): string {
  const key = aesKeyForSession(sessionUuid);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const json = JSON.stringify(inner);
  const enc = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString("base64url");
}

export function unsealFeedPayload(sessionUuid: string, blob: string): Record<string, unknown> {
  const raw = Buffer.from(blob, "base64url");
  if (raw.length < 12 + 16 + 1) {
    throw new Error("Invalid sealed payload.");
  }
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(raw.length - 16);
  const enc = raw.subarray(12, raw.length - 16);
  const key = aesKeyForSession(sessionUuid);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  const parsed: unknown = JSON.parse(plain);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Invalid inner payload.");
  }
  return parsed as Record<string, unknown>;
}

export function wrapPublicFeedJson(params: {
  obfuscationEnabled: boolean;
  sessionUuid: string;
  inner: Record<string, unknown>;
}): Record<string, unknown> {
  if (!params.obfuscationEnabled) {
    return params.inner;
  }
  if (payloadSecret()) {
    return {
      v: 2,
      enc: true,
      blob: sealFeedPayload(params.sessionUuid, params.inner),
    };
  }
  const d = Buffer.from(JSON.stringify(params.inner), "utf8").toString("base64");
  return { v: 1, enc: true, d };
}
