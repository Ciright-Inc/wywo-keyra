/**
 * Idempotent seed for Admin users tab.
 *
 * Data: `prisma/data/admin-users-seed.json`
 * - Upserts each user by email on every deploy.
 * - Updates display name, phone, role, active flag, and scope when changed.
 * - Preserves existing password hashes on update (phone-based admin login).
 *
 * Runs automatically via `npm run db:seed:deploy-catalog` on production start.
 * Manual: `npm run db:seed:admin-users`
 */
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { DeploymentAdminRole, Prisma, PrismaClient } from "@prisma/client";
import { loadAdminUsersSeed, type AdminUsersSeedUser } from "./adminUsersSeedData";

export type AdminUsersSeedStats = {
  created: number;
  updated: number;
  unchanged: number;
  skipped?: boolean;
};

async function resolveScopeJson(
  prisma: PrismaClient,
  scope: AdminUsersSeedUser["scope"],
): Promise<Prisma.InputJsonValue | undefined> {
  if (!scope) return undefined;

  const regionIds: string[] = [];
  const countryIds: string[] = [];
  const telcoIds: string[] = [];

  for (const slug of scope.regionSlugs ?? []) {
    const region = await prisma.region.findFirst({ where: { slug }, select: { id: true } });
    if (!region) throw new Error(`[seedAdminUsers] Unknown region slug: ${slug}`);
    regionIds.push(region.id);
  }

  for (const iso2 of scope.countryIso2s ?? []) {
    const country = await prisma.countryDeployment.findFirst({
      where: { iso2: iso2.toUpperCase() },
      select: { id: true },
    });
    if (!country) throw new Error(`[seedAdminUsers] Unknown country ISO2: ${iso2}`);
    countryIds.push(country.id);
  }

  for (const key of scope.telcoKeys ?? []) {
    const [iso2, slug] = key.split(":");
    if (!iso2 || !slug) throw new Error(`[seedAdminUsers] Invalid telco key (use ISO2:slug): ${key}`);
    const telco = await prisma.telcoDeployment.findFirst({
      where: { slug, country: { iso2: iso2.toUpperCase() } },
      select: { id: true },
    });
    if (!telco) throw new Error(`[seedAdminUsers] Unknown telco key: ${key}`);
    telcoIds.push(telco.id);
  }

  const scopeJson: Record<string, string[]> = {};
  if (regionIds.length) scopeJson.regionIds = regionIds;
  if (countryIds.length) scopeJson.countryIds = countryIds;
  if (telcoIds.length) scopeJson.telcoIds = telcoIds;

  return Object.keys(scopeJson).length ? scopeJson : undefined;
}

function scopeJsonEqual(
  a: Prisma.JsonValue | null | undefined,
  b: Prisma.InputJsonValue | undefined,
): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

async function createPasswordHash(): Promise<string> {
  return hash(randomBytes(32).toString("hex"), 10);
}

/** Ensure seeded phone numbers can be assigned without tripping the unique index. */
async function releasePhoneForOtherUsers(
  prisma: PrismaClient | Prisma.TransactionClient,
  phoneE164: string | null,
  email: string,
): Promise<void> {
  if (!phoneE164) return;
  await prisma.adminUser.updateMany({
    where: {
      phoneE164,
      NOT: { email },
    },
    data: { phoneE164: null },
  });
}

export async function seedAdminUsers(
  prisma: PrismaClient,
  options?: { skipIfAnyExist?: boolean },
): Promise<AdminUsersSeedStats> {
  if (options?.skipIfAnyExist) {
    const existingCount = await prisma.adminUser.count();
    if (existingCount > 0) {
      return { created: 0, updated: 0, unchanged: 0, skipped: true };
    }
  }

  const data = loadAdminUsersSeed();
  const stats: AdminUsersSeedStats = { created: 0, updated: 0, unchanged: 0 };

  for (const entry of data.users) {
    const email = entry.email.trim().toLowerCase();
    const displayName = entry.displayName.trim();
    const phoneE164 = entry.phoneE164?.trim() || null;
    const role = entry.role as DeploymentAdminRole;
    const isActive = entry.isActive !== false;
    const scopeJson = await resolveScopeJson(prisma, entry.scope);

    await prisma.$transaction(async (tx) => {
      await releasePhoneForOtherUsers(tx, phoneE164, email);

      const existing = await tx.adminUser.findUnique({ where: { email } });

      if (!existing) {
        await tx.adminUser.create({
          data: {
            email,
            displayName,
            phoneE164,
            passwordHash: await createPasswordHash(),
            role,
            scopeJson,
            isActive,
          },
        });
        stats.created += 1;
        return;
      }

      const needsUpdate =
        existing.displayName !== displayName ||
        existing.phoneE164 !== phoneE164 ||
        existing.role !== role ||
        existing.isActive !== isActive ||
        !scopeJsonEqual(existing.scopeJson, scopeJson);

      if (!needsUpdate) {
        stats.unchanged += 1;
        return;
      }

      await tx.adminUser.update({
        where: { email },
        data: {
          displayName,
          phoneE164,
          role,
          scopeJson,
          isActive,
        },
      });
      stats.updated += 1;
    });
  }

  return stats;
}

const runStandalone = typeof process !== "undefined" && process.argv[1]?.includes("seedAdminUsers");
if (runStandalone) {
  async function main() {
    const prisma = new PrismaClient();
    try {
      const stats = await seedAdminUsers(prisma);
      console.info("[seedAdminUsers]", stats);
    } finally {
      await prisma.$disconnect();
    }
  }
  void main().catch((e) => {
    console.error("[seedAdminUsers]", e);
    process.exit(1);
  });
}
