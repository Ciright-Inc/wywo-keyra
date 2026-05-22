import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  validateAdminUserUpdate,
  validationErrorResponse,
} from "@/lib/adminUserValidation";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import {
  currentAdminUserId,
  requireGlobalAdminUserRead,
  requireGlobalAdminUserWrite,
} from "@/lib/deployments/adminUsersGuard";
import type { DeploymentAdminRole } from "@prisma/client";

type Params = { id: string };

function publicAdminUser(user: {
  id: string;
  email: string;
  displayName: string | null;
  phoneE164: string | null;
  role: DeploymentAdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phoneE164: user.phoneE164,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalAdminUserRead(auth);
  if (denied) return denied;

  const { id } = await context.params;
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      phoneE164: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user: publicAdminUser(user) });
}

export async function PATCH(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalAdminUserWrite(auth);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await readJsonObject(req);
  const validated = validateAdminUserUpdate({
    displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    phoneCountryCode: typeof body.phoneCountryCode === "string" ? body.phoneCountryCode : undefined,
    phoneNational: typeof body.phoneNational === "string" ? body.phoneNational : undefined,
    role: typeof body.role === "string" ? body.role : undefined,
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
  });

  if (!validated.ok) {
    return NextResponse.json(validationErrorResponse(validated.errors, validated.message), {
      status: 400,
    });
  }

  const patch = validated.data;
  const data: {
    displayName?: string;
    email?: string;
    phoneE164?: string;
    role?: DeploymentAdminRole;
    isActive?: boolean;
  } = {
    displayName: patch.displayName,
    email: patch.email,
    phoneE164: patch.phoneE164,
    role: patch.role,
    isActive: patch.isActive,
  };

  if (patch.email && patch.email !== existing.email) {
    const clash = await prisma.adminUser.findUnique({ where: { email: patch.email } });
    if (clash) {
      return NextResponse.json(
        validationErrorResponse(
          { email: "An admin user with this email already exists." },
          "An admin user with this email already exists.",
        ),
        { status: 409 },
      );
    }
  }

  if (patch.phoneE164 && patch.phoneE164 !== existing.phoneE164) {
    const clash = await prisma.adminUser.findUnique({ where: { phoneE164: patch.phoneE164 } });
    if (clash) {
      return NextResponse.json(
        validationErrorResponse(
          { phone: "An admin user with this mobile number already exists." },
          "An admin user with this mobile number already exists.",
        ),
        { status: 409 },
      );
    }
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data,
  });

  await writeAudit({
    entityType: "AdminUser",
    entityId: id,
    action: "PATCH",
    payload: body,
  });

  return NextResponse.json({ user: publicAdminUser(updated) });
}

export async function DELETE(req: Request, context: { params: Promise<Params> }) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalAdminUserWrite(auth);
  if (denied) return denied;

  const { id } = await context.params;
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const selfId = currentAdminUserId(auth);
  if (selfId && selfId === id) {
    return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });

  await writeAudit({
    entityType: "AdminUser",
    entityId: id,
    action: "DELETE",
    payload: {
      email: existing.email,
      displayName: existing.displayName,
      role: existing.role,
    },
  });

  return NextResponse.json({ ok: true });
}
