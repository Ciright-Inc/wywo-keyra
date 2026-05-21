import { PrismaClient } from "@prisma/client";

const PRISMA_CLIENT_SCHEMA_VERSION = "deployment-app-genspark-url-v2";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientSchemaVersion?: string;
};

export const prisma =
  globalForPrisma.prismaClientSchemaVersion === PRISMA_CLIENT_SCHEMA_VERSION && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientSchemaVersion = PRISMA_CLIENT_SCHEMA_VERSION;
}

export default prisma;
