import { NextResponse } from "next/server";
import { ServerEnvironment } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseDeploymentStatus } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canMutateServerAsset, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

type Params = { id: string };

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const { id } = await context.params;
  const existing = await prisma.serverNode.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canMutateServerAsset(auth, existing.targetType, existing.targetId, {
    country: (cid) =>
      prisma.countryDeployment.findUnique({
        where: { id: cid },
        select: { id: true, regionId: true },
      }),
    telco: (tid) =>
      prisma.telcoDeployment.findUnique({
        where: { id: tid },
        select: {
          id: true,
          countryId: true,
          country: { select: { id: true, regionId: true } },
        },
      }),
  });
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.fqdn === "string") data.fqdn = body.fqdn.trim();
  const envRaw = body.environment;
  if (envRaw === "PROD" || envRaw === "STAGE" || envRaw === "TEST") {
    data.environment = envRaw as ServerEnvironment;
  }
  if (typeof body.healthcheckUrl === "string") {
    data.healthcheckUrl = body.healthcheckUrl.trim().length ? body.healthcheckUrl.trim() : null;
  }
  const status = parseDeploymentStatus(body.status);
  if (status) data.status = status;
  if (typeof body.lastHeartbeatAt === "string") {
    data.lastHeartbeatAt = body.lastHeartbeatAt.trim().length
      ? new Date(body.lastHeartbeatAt)
      : null;
  }
  if (typeof body.metadataJson === "object") {
    data.metadataJson = body.metadataJson as never;
  }

  const updated = await prisma.serverNode.update({ where: { id }, data });

  await writeAudit({
    entityType: "ServerNode",
    entityId: id,
    action: "PATCH",
    payload: body,
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ serverNode: updated });
}

/**
 * Hard delete a server node. No FK refs point at ServerNode, so this is a plain `delete`
 * after the same auth pipeline used by PATCH.
 */
export async function DELETE(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const { id } = await context.params;
  const existing = await prisma.serverNode.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = await canMutateServerAsset(auth, existing.targetType, existing.targetId, {
    country: (cid) =>
      prisma.countryDeployment.findUnique({
        where: { id: cid },
        select: { id: true, regionId: true },
      }),
    telco: (tid) =>
      prisma.telcoDeployment.findUnique({
        where: { id: tid },
        select: {
          id: true,
          countryId: true,
          country: { select: { id: true, regionId: true } },
        },
      }),
  });
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.serverNode.delete({ where: { id } });

  await writeAudit({
    entityType: "ServerNode",
    entityId: id,
    action: "DELETE",
    payload: {
      fqdn: existing.fqdn,
      targetType: existing.targetType,
      targetId: existing.targetId,
    },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ ok: true });
}
