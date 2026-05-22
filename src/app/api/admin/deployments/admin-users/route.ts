import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { writeAudit } from "@/app/api/admin/deployments/_audit";
import {
  validateAdminUserCreate,
  validateAdminUserUpdate,
  validationErrorResponse,
} from "@/lib/adminUserValidation";
import { requireDeploymentAuth } from "@/lib/deployments/adminContext";
import {
  requireGlobalAdminUserRead,
  requireGlobalAdminUserWrite,
} from "@/lib/deployments/adminUsersGuard";
import type { DeploymentAdminRole } from "@prisma/client";

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

function adminUserSearchWhere(q: string) {
  const query = q.trim();
  if (!query) return undefined;
  return {
    OR: [
      { displayName: { contains: query, mode: "insensitive" as const } },
      { email: { contains: query, mode: "insensitive" as const } },
      { phoneE164: { contains: query, mode: "insensitive" as const } },
    ],
  };
}

export async function GET(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalAdminUserRead(auth);
  if (denied) return denied;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("perPage") ?? "25", 10) || 25));

  const where = adminUserSearchWhere(q);
  const totalCount = await prisma.adminUser.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(page, totalPages);

  const users = await prisma.adminUser.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { displayName: "asc" }, { email: "asc" }],
    skip: (safePage - 1) * perPage,
    take: perPage,
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

  return NextResponse.json({
    users: users.map(publicAdminUser),
    pagination: {
      page: safePage,
      pageSize: perPage,
      totalCount,
      totalPages,
    },
  });
}

export async function POST(req: Request) {
  const auth = await requireDeploymentAuth(req);
  if (auth instanceof Response) return auth;
  const denied = requireGlobalAdminUserWrite(auth);
  if (denied) return denied;

  const body = await readJsonObject(req);
  const validated = validateAdminUserCreate({
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    email: typeof body.email === "string" ? body.email : "",
    phoneCountryCode: typeof body.phoneCountryCode === "string" ? body.phoneCountryCode : "",
    phoneNational: typeof body.phoneNational === "string" ? body.phoneNational : "",
    role: typeof body.role === "string" ? body.role : "",
    isActive: body.isActive !== false,
  });

  if (!validated.ok) {
    return NextResponse.json(validationErrorResponse(validated.errors, validated.message), {
      status: 400,
    });
  }

  const { displayName, email, phoneE164, role, isActive } = validated.data;

  const existingEmail = await prisma.adminUser.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json(
      validationErrorResponse({ email: "An admin user with this email already exists." }, "An admin user with this email already exists."),
      { status: 409 },
    );
  }

  const existingPhone = await prisma.adminUser.findUnique({ where: { phoneE164 } });
  if (existingPhone) {
    return NextResponse.json(
      validationErrorResponse({ phone: "An admin user with this mobile number already exists." }, "An admin user with this mobile number already exists."),
      { status: 409 },
    );
  }

  const passwordHash = await hash(randomBytes(32).toString("hex"), 10);
  const created = await prisma.adminUser.create({
    data: {
      displayName,
      email,
      phoneE164,
      passwordHash,
      role,
      isActive,
    },
  });

  await writeAudit({
    entityType: "AdminUser",
    entityId: created.id,
    action: "CREATE",
    payload: { email: created.email, displayName: created.displayName, role: created.role },
  });

  return NextResponse.json({ user: publicAdminUser(created) }, { status: 201 });
}
