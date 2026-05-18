import { hash } from "bcryptjs";
import {
  DeploymentAdminRole,
  DeploymentStatus,
  PrismaClient,
  type ServerEnvironment,
  TargetType,
  type VerificationMethod,
} from "@prisma/client";
import { buildTelcoSubdomainForSeed, loadDeploymentSeed } from "./deploymentSeedData";
import { seedAuthenticationFeed } from "./seedAuthenticationFeed";
import { seedDeploymentGraph } from "./seedDeploymentGraph";

const prisma = new PrismaClient();

async function main() {
  const data = loadDeploymentSeed();

  await prisma.adminUser.deleteMany();

  await prisma.auditEvent.deleteMany();
  await prisma.serverAccessRequest.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.accessDomainRule.deleteMany();
  await prisma.serverNode.deleteMany();
  await prisma.telcoDeployment.deleteMany();
  await prisma.countryDeployment.deleteMany();
  await prisma.region.deleteMany();

  const regionBySlug = new Map<string, { id: string }>();
  for (const r of data.regions) {
    const created = await prisma.region.create({
      data: {
        continentCode: r.continentCode,
        subregionCode: r.subregionCode,
        name: r.name,
        slug: r.slug,
        mapKey: r.mapKey,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
      },
    });
    regionBySlug.set(r.slug, { id: created.id });
  }

  const countryByIso2 = new Map<string, { id: string; countrySubdomain: string }>();
  for (const c of data.countries) {
    const region = regionBySlug.get(c.regionSlug);
    if (!region) throw new Error(`Missing region slug: ${c.regionSlug}`);
    const created = await prisma.countryDeployment.create({
      data: {
        regionId: region.id,
        name: c.name,
        iso2: c.iso2.toUpperCase(),
        iso3: c.iso3.toUpperCase(),
        flagAssetKey: c.flagAssetKey,
        population: c.population,
        populationDisplay: c.populationDisplay,
        countrySubdomain: c.countrySubdomain.toLowerCase(),
        officialReferenceDomain: c.officialReferenceDomain,
        status: c.status as DeploymentStatus,
        statusNote: c.statusNote,
        sourceLabel: c.sourceLabel,
        sourceUrl: c.sourceUrl,
        sourceVerifiedAt: c.sourceVerifiedAt ? new Date(c.sourceVerifiedAt) : null,
        sortOrder: c.sortOrder,
        isPublished: c.isPublished,
      },
    });
    countryByIso2.set(c.iso2.toUpperCase(), {
      id: created.id,
      countrySubdomain: created.countrySubdomain,
    });
  }

  for (const t of data.telcos) {
    const country = countryByIso2.get(t.countryIso2.toUpperCase());
    if (!country) throw new Error(`Missing country ISO2: ${t.countryIso2}`);
    await prisma.telcoDeployment.create({
      data: {
        countryId: country.id,
        name: t.name,
        slug: t.slug,
        subscribers: t.subscribers,
        subscribersDisplay: t.subscribersDisplay,
        telcoSubdomain: buildTelcoSubdomainForSeed(country.countrySubdomain, t.slug),
        officialDomain: t.officialDomain,
        status: t.status as DeploymentStatus,
        sortOrder: t.sortOrder,
        isPublished: t.isPublished,
      },
    });
  }

  const telcoByKey = new Map<string, { id: string }>();
  const allTelcos = await prisma.telcoDeployment.findMany({
    include: { country: { select: { iso2: true } } },
  });
  for (const row of allTelcos) {
    telcoByKey.set(`${row.country.iso2}:${row.slug}`, { id: row.id });
  }

  for (const rule of data.accessDomainRules) {
    let targetId: string;
    let targetType: TargetType;
    if (rule.target.type === "COUNTRY") {
      const c = countryByIso2.get(rule.target.iso2.toUpperCase());
      if (!c) throw new Error(`Rule country not found: ${rule.target.iso2}`);
      targetId = c.id;
      targetType = TargetType.COUNTRY;
    } else {
      const k = `${rule.target.countryIso2.toUpperCase()}:${rule.target.slug}`;
      const t = telcoByKey.get(k);
      if (!t) throw new Error(`Rule telco not found: ${k}`);
      targetId = t.id;
      targetType = TargetType.TELCO;
    }
    await prisma.accessDomainRule.create({
      data: {
        targetType,
        targetId,
        allowedEmailDomain: rule.allowedEmailDomain.toLowerCase(),
        verificationMethod: rule.verificationMethod as VerificationMethod,
        isActive: rule.isActive,
      },
    });
  }

  for (const n of data.serverNodes) {
    const country = countryByIso2.get(n.countryIso2.toUpperCase());
    if (!country) throw new Error(`Server node country not found: ${n.countryIso2}`);
    await prisma.serverNode.create({
      data: {
        targetType: TargetType.COUNTRY,
        targetId: country.id,
        fqdn: n.fqdn,
        environment: n.environment as ServerEnvironment,
        healthcheckUrl: n.healthcheckUrl,
        status: n.status as DeploymentStatus,
      },
    });
  }

  // Seed status history snapshots for audit demo
  const firstCountry = await prisma.countryDeployment.findFirst({
    orderBy: { sortOrder: "asc" },
  });
  if (firstCountry) {
    await prisma.statusHistory.create({
      data: {
        targetType: "COUNTRY",
        targetId: firstCountry.id,
        previousStatus: DeploymentStatus.IDENTIFIED,
        nextStatus: firstCountry.status,
        changedBy: "seed",
        reason: "Initial seed snapshot",
      },
    });
  }

  const seedPw = process.env.SEED_ADMIN_PASSWORD?.trim() || "ChangeMeSeed!123";
  const passwordHash = await hash(seedPw, 10);

  const neRegion = regionBySlug.get("northern-europe");
  const ieCountry = countryByIso2.get("IE");
  const eirTelco = telcoByKey.get("IE:eir");
  if (!neRegion || !ieCountry || !eirTelco) {
    throw new Error("Seed admin demo references missing (northern-europe / IE / eir).");
  }

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
      },
    });
  }

  console.info(
    `[seed] Created ${adminSeeds.length} admin users (password from SEED_ADMIN_PASSWORD or default "ChangeMeSeed!123").`,
  );

  await seedDeploymentGraph(prisma);
  console.info("[seed] Extended deployment map with ISO-3166 catalog countries + placeholder telcos.");

  await seedAuthenticationFeed(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
