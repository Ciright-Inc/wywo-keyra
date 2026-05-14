import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export const KEYRA_FEED_SESSION_COOKIE = "keyra_feed_session";

const SESSION_HOURS = 24;

export async function ensureDefaultFeedSettings(): Promise<void> {
  await prisma.authenticationFeedSetting.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export async function createAuthenticationFeedSession(
  fingerprintHash: string | null,
): Promise<{ sessionUuid: string; expiresAt: Date }> {
  await ensureDefaultFeedSettings();
  const sessionUuid = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await prisma.authenticationFeedSession.create({
    data: {
      sessionUuid,
      userFingerprintHash: fingerprintHash,
      expiresAt,
      pairsUsedJson: [],
    },
  });
  return { sessionUuid, expiresAt };
}

export async function getAuthenticationFeedSession(sessionUuid: string) {
  const row = await prisma.authenticationFeedSession.findUnique({
    where: { sessionUuid },
  });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export function pairsUsedFromJson(json: Prisma.JsonValue): Set<string> {
  if (!Array.isArray(json)) return new Set();
  return new Set(json.filter((x): x is string => typeof x === "string"));
}

export async function updateSessionAfterBatch(params: {
  sessionUuid: string;
  pairsUsed: Set<string>;
  renderedDelta: number;
  uniquenessEpochDelta: number;
}): Promise<void> {
  const settings = await prisma.authenticationFeedSetting.findUnique({ where: { id: "default" } });
  const cap = settings?.sessionUniquenessLimit ?? 2000;
  const arr = Array.from(params.pairsUsed);
  const trimmed = arr.length > cap ? arr.slice(arr.length - cap) : arr;

  await prisma.authenticationFeedSession.update({
    where: { sessionUuid: params.sessionUuid },
    data: {
      pairsUsedJson: trimmed,
      renderedCount: { increment: params.renderedDelta },
      uniquenessEpoch: { increment: params.uniquenessEpochDelta },
      rngNonce: { increment: 1 },
    },
  });
}
