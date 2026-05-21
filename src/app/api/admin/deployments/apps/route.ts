import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  ensureDeploymentAppCategory,
  ensureDeploymentAppsSeeded,
  listDeploymentApps,
  normalizeDeploymentAppId,
  validateDeploymentAppInput,
} from "@/lib/deploymentApps";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const apps = await listDeploymentApps({
    includePrivate: url.searchParams.get("surface") !== "launcher",
  });
  return NextResponse.json({ apps });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;

  await ensureDeploymentAppsSeeded();

  const body = await readJsonObject(req);
  const parsed = validateDeploymentAppInput({
    label: typeof body.label === "string" ? body.label : "",
    description: typeof body.description === "string" ? body.description : "",
    href: typeof body.href === "string" ? body.href : "",
    gensparkUrl: typeof body.gensparkUrl === "string" ? body.gensparkUrl : null,
    section: typeof body.section === "string" ? body.section : "",
    isPrivate: body.isPrivate === true,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await ensureDeploymentAppCategory(parsed.section);

  const baseId = normalizeDeploymentAppId(parsed.label);
  if (!baseId) return NextResponse.json({ error: "App name cannot create a valid id." }, { status: 400 });

  let id = baseId;
  let suffix = 2;
  while (await prisma.deploymentApp.findUnique({ where: { id }, select: { id: true } })) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  try {
    const app = await prisma.deploymentApp.create({
      data: {
        id,
        label: parsed.label,
        description: parsed.description,
        href: parsed.href,
        gensparkUrl: parsed.gensparkUrl,
        section: parsed.section,
        isPrivate: parsed.isPrivate,
        sortOrder: parsed.sortOrder ?? 0,
        isActive: true,
      },
    });

    await writeAudit({
      entityType: "DeploymentApp",
      entityId: app.id,
      action: "CREATE",
      payload: { label: app.label, href: app.href, isPrivate: app.isPrivate },
    });

    return NextResponse.json({ app }, { status: 201 });
  } catch (err) {
    console.error("[DeploymentApp POST]", err);
    return NextResponse.json(
      { error: "Failed to save app. If this persists, restart the dev server and try again." },
      { status: 500 },
    );
  }
}
