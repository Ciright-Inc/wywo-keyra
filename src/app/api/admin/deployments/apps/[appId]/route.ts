import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  ensureDeploymentAppCategory,
  ensureDeploymentAppsSeeded,
  validateDeploymentAppInput,
} from "@/lib/deploymentApps";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

type Params = {
  appId: string;
};

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  await ensureDeploymentAppsSeeded();

  const { appId } = await params;
  const app = await prisma.deploymentApp.findFirst({ where: { id: appId, isActive: true } });
  if (!app) return NextResponse.json({ error: "App not found." }, { status: 404 });
  return NextResponse.json({ app });
}

export async function PUT(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;
  await ensureDeploymentAppsSeeded();

  const { appId } = await params;
  const body = await readJsonObject(req);
  const parsed = validateDeploymentAppInput({
    label: typeof body.label === "string" ? body.label : "",
    description: typeof body.description === "string" ? body.description : "",
    href: typeof body.href === "string" ? body.href : "",
    gensparkUrl: typeof body.gensparkUrl === "string" ? body.gensparkUrl : null,
    temporaryUrl: typeof body.temporaryUrl === "string" ? body.temporaryUrl : null,
    section: typeof body.section === "string" ? body.section : "",
    isPrivate: body.isPrivate === true,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await ensureDeploymentAppCategory(parsed.section);

  const exists = await prisma.deploymentApp.findFirst({ where: { id: appId, isActive: true }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "App not found." }, { status: 404 });

  try {
    const app = await prisma.deploymentApp.update({
      where: { id: appId },
      data: {
        label: parsed.label,
        description: parsed.description,
        href: parsed.href,
        gensparkUrl: parsed.gensparkUrl,
        temporaryUrl: parsed.temporaryUrl,
        section: parsed.section,
        isPrivate: parsed.isPrivate,
        sortOrder: parsed.sortOrder ?? 0,
        isActive: true,
      },
    });

    await writeAudit({
      entityType: "DeploymentApp",
      entityId: app.id,
      action: "UPDATE",
      payload: { label: app.label, href: app.href, isPrivate: app.isPrivate },
    });

    return NextResponse.json({ app });
  } catch (err) {
    console.error("[DeploymentApp PUT]", err);
    return NextResponse.json(
      { error: "Failed to save app. If this persists, restart the dev server and try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;
  await ensureDeploymentAppsSeeded();

  const { appId } = await params;
  const exists = await prisma.deploymentApp.findFirst({
    where: { id: appId, isActive: true },
    select: { id: true, label: true },
  });
  if (!exists) return NextResponse.json({ error: "App not found." }, { status: 404 });

  await prisma.deploymentApp.update({
    where: { id: appId },
    data: { isActive: false },
  });
  await writeAudit({
    entityType: "DeploymentApp",
    entityId: appId,
    action: "DELETE",
    payload: { label: exists.label },
  });

  return NextResponse.json({ ok: true });
}
