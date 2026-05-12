import { NextResponse } from "next/server";
import { TargetType, VerificationMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import { canMutateServerAsset, denyIfComplianceOnlyWriter, denyIfReadOnly } from "@/lib/deployments/adminAuthz";

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const rows = await prisma.accessDomainRule.findMany({
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ rules: rows });
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
  const allowedEmailDomain =
    typeof body.allowedEmailDomain === "string" ? body.allowedEmailDomain.trim().toLowerCase() : "";
  const methodRaw = body.verificationMethod;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  if (targetTypeRaw !== "COUNTRY" && targetTypeRaw !== "TELCO") {
    return NextResponse.json({ error: "Invalid targetType." }, { status: 400 });
  }
  if (!targetId || !allowedEmailDomain) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const targetType = targetTypeRaw as TargetType;
  const ok = await canMutateServerAsset(auth, targetType, targetId, {
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
  if (!ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let verificationMethod: VerificationMethod = VerificationMethod.EMAIL_OTP;
  if (methodRaw === "SSO") verificationMethod = VerificationMethod.SSO;
  if (methodRaw === "INVITE_ONLY") verificationMethod = VerificationMethod.INVITE_ONLY;

  const created = await prisma.accessDomainRule.create({
    data: {
      targetType,
      targetId,
      allowedEmailDomain,
      verificationMethod,
      isActive,
    },
  });

  await writeAudit({
    entityType: "AccessDomainRule",
    entityId: created.id,
    action: "CREATE",
    payload: { allowedEmailDomain },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ rule: created }, { status: 201 });
}
