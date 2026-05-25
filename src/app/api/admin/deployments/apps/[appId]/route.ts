import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  ensureDeploymentAppCategory,
  ensureDeploymentAppsSeeded,
  validateDeploymentAppInput,
  toDeploymentAppView,
} from "@/lib/deploymentApps";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";
import { revalidatePublicDeployments } from "@/lib/deployments/revalidatePublicDeployments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  appId: string;
};

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  await ensureDeploymentAppsSeeded();

  const { appId } = await params;
  const app = await prisma.deploymentApp.findUnique({ where: { id: appId } });
  if (!app) return NextResponse.json({ error: "App not found." }, { status: 404 });
  return NextResponse.json({ app: toDeploymentAppView(app) });
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
  const exists = await prisma.deploymentApp.findUnique({
    where: { id: appId },
    select: { id: true, sortOrder: true },
  });
  if (!exists) return NextResponse.json({ error: "App not found." }, { status: 404 });

  const parsedSortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? Math.trunc(body.sortOrder)
      : exists.sortOrder;

  const parsed = validateDeploymentAppInput({
    label: typeof body.label === "string" ? body.label : "",
    description: typeof body.description === "string" ? body.description : "",
    href: typeof body.href === "string" ? body.href : "",
    gensparkUrl: typeof body.gensparkUrl === "string" ? body.gensparkUrl : null,
    temporaryUrl: typeof body.temporaryUrl === "string" ? body.temporaryUrl : null,
    section: typeof body.section === "string" ? body.section : "",
    isPrivate: body.isPrivate === true,
    isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    sortOrder: parsedSortOrder,
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  await ensureDeploymentAppCategory(parsed.section);

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
        sortOrder: parsed.sortOrder,
        isActive: parsed.isActive,
      },
    });

    await writeAudit({
      entityType: "DeploymentApp",
      entityId: app.id,
      action: "UPDATE",
      payload: { label: app.label, href: app.href, isPrivate: app.isPrivate, isActive: app.isActive },
    });

    revalidatePublicDeployments();

    return NextResponse.json({ app: toDeploymentAppView(app) });
  } catch (err) {
    console.error("[DeploymentApp PUT]", err);
    return NextResponse.json(
      { error: "Failed to save app. If this persists, restart the dev server and try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const readOnly = denyIfReadOnly(auth);
  if (readOnly) return readOnly;
  const complianceOnly = denyIfComplianceOnlyWriter(auth);
  if (complianceOnly) return complianceOnly;
  await ensureDeploymentAppsSeeded();

  const { appId } = await params;
  const body = await readJsonObject(req);
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  const exists = await prisma.deploymentApp.findUnique({ where: { id: appId }, select: { id: true, label: true } });
  if (!exists) return NextResponse.json({ error: "App not found." }, { status: 404 });

  try {
    const app = await prisma.deploymentApp.update({
      where: { id: appId },
      data: { isActive: body.isActive },
    });

    await writeAudit({
      entityType: "DeploymentApp",
      entityId: app.id,
      action: body.isActive ? "UPDATE" : "DELETE",
      payload: { label: app.label, isActive: app.isActive },
    });

    revalidatePublicDeployments();

    return NextResponse.json({ app: toDeploymentAppView(app) });
  } catch (err) {
    console.error("[DeploymentApp PATCH]", err);
    return NextResponse.json(
      { error: "Unable to save active status. If this persists, restart the dev server and try again." },
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
  const exists = await prisma.deploymentApp.findUnique({
    where: { id: appId },
    select: { id: true, label: true },
  });
  if (!exists) return NextResponse.json({ error: "App not found." }, { status: 404 });

  try {
    await prisma.deploymentApp.delete({ where: { id: appId } });
  } catch (err) {
    console.error("[DeploymentApp DELETE]", err);
    return NextResponse.json({ error: "Unable to delete app." }, { status: 500 });
  }

  await writeAudit({
    entityType: "DeploymentApp",
    entityId: appId,
    action: "DELETE",
    payload: { label: exists.label },
  });

  revalidatePublicDeployments();
  revalidatePath("/admin/deployments/apps");

  return NextResponse.json({ ok: true });
}
