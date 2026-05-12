import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { DeploymentAdminRole, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { ADMIN_JWT_COOKIE, adminIsConfigured, signAdminJwt } from "@/lib/adminJwt";

function isSchemaOrAdminUserIssue(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message;
  if (/AdminUser/i.test(m)) return true;
  if (/no such table/i.test(m)) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === "P2021";
  }
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  return false;
}

export async function POST(req: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }

  try {
    const body = await readJsonObject(req);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const serviceToken = typeof body.serviceToken === "string" ? body.serviceToken.trim() : "";
    const legacyBodyToken = typeof body.token === "string" ? body.token.trim() : "";
    const breakGlassToken = serviceToken || legacyBodyToken;

    if (breakGlassToken) {
      const expected = process.env.KEYRA_ADMIN_TOKEN?.trim();
      if (!expected || breakGlassToken !== expected) {
        return NextResponse.json({ error: "Invalid service token." }, { status: 401 });
      }
      const jwt = await signAdminJwt({
        sub: "legacy-service",
        role: DeploymentAdminRole.GLOBAL_ADMIN,
        svc: true,
      });
      const res = NextResponse.json({ ok: true, mode: "service" });
      res.cookies.set(ADMIN_JWT_COOKIE, jwt, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      return res;
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user?.isActive) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const passwordOk = await compare(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const jwt = await signAdminJwt({
      sub: user.id,
      role: user.role,
      svc: false,
    });

    const res = NextResponse.json({ ok: true, mode: "user", role: user.role });
    res.cookies.set(ADMIN_JWT_COOKIE, jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    console.error("[api/admin/auth/login]", err);
    if (isSchemaOrAdminUserIssue(err)) {
      return NextResponse.json(
        {
          error:
            "Admin database is not ready (missing AdminUser table or DB file). Run: npm run db:push && npm run db:seed",
        },
        { status: 503 },
      );
    }
    const detail = process.env.NODE_ENV === "development" && err instanceof Error ? err.message : undefined;
    return NextResponse.json({ error: "Login failed.", detail }, { status: 500 });
  }
}
