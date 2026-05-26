import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * WYWO message body encryption.
 * AES-256-GCM with a per-message random IV.
 * Master key derived from WYWO_MESSAGE_SECRET (preferred) or
 * KEYRA_SESSION_SECRET (dev fallback).
 */

const ALG = "aes-256-gcm";

function masterKey(): Buffer {
  const raw =
    process.env.WYWO_MESSAGE_SECRET?.trim() ||
    process.env.KEYRA_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production" ? "__wywo_dev_message_secret__" : "");
  if (!raw) {
    throw new Error(
      "WYWO_MESSAGE_SECRET is not set. Refusing to encrypt WYWO messages in production.",
    );
  }
  return createHash("sha256").update(raw).digest();
}

export type WywoCryptoMeta = { v: 1; alg: "aes-256-gcm"; iv: string; tag: string };

export function encryptMessageBody(plaintext: string): {
  ciphertext: string;
  meta: WywoCryptoMeta;
} {
  const key = masterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: enc.toString("base64"),
    meta: {
      v: 1,
      alg: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
    },
  };
}

export function decryptMessageBody(
  ciphertext: string,
  meta: unknown,
): string {
  const m = meta as WywoCryptoMeta | null | undefined;
  if (!m || m.v !== 1 || m.alg !== "aes-256-gcm" || !m.iv || !m.tag) {
    return "[Encrypted — unable to decode message body.]";
  }
  try {
    const key = masterKey();
    const iv = Buffer.from(m.iv, "base64");
    const tag = Buffer.from(m.tag, "base64");
    const decipher = createDecipheriv(ALG, key, iv);
    decipher.setAuthTag(tag);
    const enc = Buffer.from(ciphertext, "base64");
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf8");
  } catch {
    return "[Encrypted — decryption failed.]";
  }
}

/** Cryptographically random invite token (URL-safe). */
export function generateInviteToken(): string {
  return randomBytes(24).toString("base64url");
}
