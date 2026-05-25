import "server-only";

import { PrismaClient } from "@prisma/client";

/** Bump when Prisma schema changes so dev HMR picks up a new generated client. */
const PRISMA_CLIENT_SCHEMA_VERSION = "admin-data-room-v2";

/** Models added in recent migrations — used to detect a stale cached client. */
const REQUIRED_DELEGATES = ["adminDataRoom"] as const;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientSchemaVersion?: string;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  const missing = REQUIRED_DELEGATES.filter((name) => !(name in client));
  if (missing.length > 0) {
    throw new Error(
      `Prisma client is missing models: ${missing.join(", ")}. ` +
        "Stop the dev server, run `npx prisma generate`, delete the `.next` folder, then start again.",
    );
  }

  return client;
}

function isStalePrismaClient(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.some((name) => !(name in client));
}

function disconnectPrismaClient(client: PrismaClient): void {
  void client.$disconnect().catch(() => undefined);
}

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const versionMatches =
    globalForPrisma.prismaClientSchemaVersion === PRISMA_CLIENT_SCHEMA_VERSION;

  if (cached && versionMatches && !isStalePrismaClient(cached)) {
    return cached;
  }

  if (cached) {
    disconnectPrismaClient(cached);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaClientSchemaVersion = PRISMA_CLIENT_SCHEMA_VERSION;
  return client;
}

/** Stable export; delegates to the current global client (safe across HMR / prisma generate). */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = resolvePrismaClient();
    const value = Reflect.get(client, prop, client) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export default prisma;
