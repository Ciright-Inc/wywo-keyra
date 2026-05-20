import { NextResponse } from "next/server";
import { VerificationMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { revalidateDeploymentsAfterMutation, writeAudit } from "@/app/api/admin/deployments/_audit";
import { parseBoolean } from "@/app/api/admin/deployments/_parse";
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
  const existing = await prisma.accessDomainRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canMutateServerAsset(auth, existing.targetType, existing.targetId, {
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
  if (!ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await readJsonObject(req);
  const data: Record<string, unknown> = {};

  if (typeof body.allowedEmailDomain === "string") {
    data.allowedEmailDomain = body.allowedEmailDomain.trim().toLowerCase();
  }
  const methodRaw = body.verificationMethod;
  if (methodRaw === "EMAIL_OTP" || methodRaw === "SSO" || methodRaw === "INVITE_ONLY") {
    data.verificationMethod = methodRaw as VerificationMethod;
  }
  const isActive = parseBoolean(body.isActive);
  if (isActive !== undefined) data.isActive = isActive;

  const updated = await prisma.accessDomainRule.update({ where: { id }, data });

  await writeAudit({
    entityType: "AccessDomainRule",
    entityId: id,
    action: "PATCH",
    payload: body,
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ rule: updated });
}

/**
 * Hard delete an access domain rule. No FK refs point at it, so this is a plain `delete`
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
  const existing = await prisma.accessDomainRule.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await canMutateServerAsset(auth, existing.targetType, existing.targetId, {
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
  if (!ok) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.accessDomainRule.delete({ where: { id } });

  await writeAudit({
    entityType: "AccessDomainRule",
    entityId: id,
    action: "DELETE",
    payload: {
      allowedEmailDomain: existing.allowedEmailDomain,
      targetType: existing.targetType,
      targetId: existing.targetId,
    },
  });
  revalidateDeploymentsAfterMutation();

  return NextResponse.json({ ok: true });
}
