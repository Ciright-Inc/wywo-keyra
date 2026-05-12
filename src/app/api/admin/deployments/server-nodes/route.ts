import { NextResponse } from "next/server";
import { ServerEnvironment, TargetType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseDeploymentStatus } from "@/app/api/admin/deployments/_parse";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canMutateServerAsset, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const rows = await prisma.serverNode.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ serverNodes: rows });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const d = denyIfReadOnly(auth);
  if (d) return d;
  const d2 = denyIfComplianceOnlyWriter(auth);
  if (d2) return d2;

  const body = await readJsonObject(req);
  const targetTypeRaw = body.targetType;
  const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
  const fqdn = typeof body.fqdn === "string" ? body.fqdn.trim() : "";
  const envRaw = body.environment;
  const healthcheckUrl =
    typeof body.healthcheckUrl === "string" ? body.healthcheckUrl.trim() : null;
  const status = parseDeploymentStatus(body.status) ?? "IDENTIFIED";

  if (targetTypeRaw !== "COUNTRY" && targetTypeRaw !== "TELCO") {
    return NextResponse.json({ error: "Invalid targetType." }, { status: 400 });
  }
  if (!targetId || !fqdn) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (envRaw !== "PROD" && envRaw !== "STAGE" && envRaw !== "TEST") {
    return NextResponse.json({ error: "Invalid environment." }, { status: 400 });
  }

  const targetType = targetTypeRaw as TargetType;
  const environment = envRaw as ServerEnvironment;

  const allowed = await canMutateServerAsset(auth, targetType, targetId, {
    country: (id) =>
      prisma.countryDeployment.findUnique({
        where: { id },
        select: { id: true, regionId: true },
      }),
    telco: (id) =>
      prisma.telcoDeployment.findUnique({
        where: { id },
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

  const created = await prisma.serverNode.create({
    data: {
      targetType,
      targetId,
      fqdn,
      environment,
      healthcheckUrl,
      status,
      metadataJson:
        typeof body.metadataJson === "object" && body.metadataJson !== null
          ? (body.metadataJson as never)
          : undefined,
    },
  });

  await writeAudit({
    entityType: "ServerNode",
    entityId: created.id,
    action: "CREATE",
    payload: { fqdn },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ serverNode: created }, { status: 201 });
}
