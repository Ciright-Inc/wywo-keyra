/**
 * Production-safe bootstrap: if there are zero AdminUser rows, create the same demo admins
 * as `prisma/seed.ts` (password from SEED_ADMIN_PASSWORD or default). Does not delete or
 * overwrite anything when admins already exist.
 *
 * Called from `seedDeployCatalog` after the deployment graph is present (regions / IE / eir).
 */
import { hash } from "bcryptjs";
import { DeploymentAdminRole, PrismaClient } from "@prisma/client";

export async function seedAdminUsersIfEmpty(prisma: PrismaClient): Promise<{ created: number } | "skipped"> {
  const existing = await prisma.adminUser.count();
  if (existing > 0) {
    console.info("[seedAdminUsersIfEmpty] Admin users already exist — skipping bootstrap.");
    return "skipped";
  }

  const neRegion = await prisma.region.findFirst({ where: { slug: "northern-europe" } });
  const ieCountry = await prisma.countryDeployment.findFirst({ where: { iso2: "IE" } });
  const eirTelco = await prisma.telcoDeployment.findFirst({
    where: { slug: "eir", country: { iso2: "IE" } },
  });

  if (!neRegion || !ieCountry || !eirTelco) {
    console.warn(
      "[seedAdminUsersIfEmpty] Cannot bootstrap admins: need region `northern-europe`, country IE, telco `eir`. Run deployment graph seed first.",
    );
    return { created: 0 };
  }

  const seedPw = process.env.SEED_ADMIN_PASSWORD?.trim() || "ChangeMeSeed!123";
  const passwordHash = await hash(seedPw, 10);

  const adminSeeds: Array<{
    email: string;
    displayName: string;
    role: DeploymentAdminRole;
    scopeJson?: Record<string, string[]>;
  }> = [
    { email: "global@seed.keyra", displayName: "Global Admin", role: DeploymentAdminRole.GLOBAL_ADMIN },
    {
      email: "regional@seed.keyra",
      displayName: "Regional Admin (Northern Europe)",
      role: DeploymentAdminRole.REGIONAL_ADMIN,
      scopeJson: { regionIds: [neRegion.id] },
    },
    {
      email: "country@seed.keyra",
      displayName: "Country Admin (Ireland)",
      role: DeploymentAdminRole.COUNTRY_ADMIN,
      scopeJson: { countryIds: [ieCountry.id] },
    },
    {
      email: "telco@seed.keyra",
      displayName: "Telco Admin (eir)",
      role: DeploymentAdminRole.TELCO_ADMIN,
      scopeJson: { telcoIds: [eirTelco.id] },
    },
    { email: "compliance@seed.keyra", displayName: "Compliance Reviewer", role: DeploymentAdminRole.COMPLIANCE_REVIEWER },
    { email: "readonly@seed.keyra", displayName: "Read Only", role: DeploymentAdminRole.READ_ONLY },
  ];

  for (const u of adminSeeds) {
    await prisma.adminUser.create({
      data: {
        email: u.email,
        displayName: u.displayName,
        passwordHash,
        role: u.role,
        scopeJson: u.scopeJson ?? undefined,
        isActive: true,
      },
    });
  }

  console.info(
    `[seedAdminUsersIfEmpty] Created ${adminSeeds.length} admin users (password from SEED_ADMIN_PASSWORD or default "ChangeMeSeed!123").`,
  );

  return { created: adminSeeds.length };
}
