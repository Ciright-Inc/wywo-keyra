import { PrismaClient } from "@prisma/client";

/** Bump when Prisma schema changes so dev HMR picks up a new generated client. */
const PRISMA_CLIENT_SCHEMA_VERSION = "keyra-user-protection-v1";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientSchemaVersion?: string;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function resolvePrismaClient(): PrismaClient {
  if (
    globalForPrisma.prismaClientSchemaVersion === PRISMA_CLIENT_SCHEMA_VERSION &&
    globalForPrisma.prisma
  ) {
    return globalForPrisma.prisma;
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
