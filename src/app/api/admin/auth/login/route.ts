import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { DeploymentAdminRole, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readJsonObject } from "@/app/api/keyra/_routeHelpers";
import { ADMIN_JWT_COOKIE, adminIsConfigured, signAdminJwt } from "@/lib/adminJwt";

const CIRIGHT_ADMIN_LOGIN_URL = "https://www.myciright.com/Ciright/api/commonrestapi/m1342055";

type CirightEmployee = {
  employeeId?: number;
  name?: string;
  email?: string;
  sphereTypeId?: number;
  sphereType?: string;
  userName?: string;
};

type CirightLoginResponse = {
  status?: boolean | string;
  message?: string;
  data?: Array<{
    employees?: CirightEmployee[];
    userToken?: string;
    token?: string;
  }>;
};

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

function boolish(value: unknown): boolean {
  return value === true || value === "true" || value === "True" || value === "1";
}

function firstSphereTypeOneEmployee(payload: CirightLoginResponse): CirightEmployee | null {
  for (const item of payload.data ?? []) {
    const employee = item.employees?.find((row) => Number(row.sphereTypeId) === 1);
    if (employee) return employee;
  }
  return null;
}

async function authenticateCirightAdmin(username: string, password: string): Promise<
  | { ok: true; employee: CirightEmployee }
  | { ok: false; error: string; status: number; allowLocalFallback: boolean }
> {
  const res = await fetch(CIRIGHT_ADMIN_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscriptionId: "9051160",
      verticalId: "2956",
      username,
      password,
      appId: "2974",
      sphereTypeUrl: "keyra-admin.htm",
    }),
  });

  if (!res.ok) {
    return { ok: false, error: "Admin login service is unavailable.", status: 502, allowLocalFallback: true };
  }

  const payload = (await res.json().catch(() => null)) as CirightLoginResponse | null;
  if (!payload || !boolish(payload.status)) {
    return {
      ok: false,
      error: payload?.message || "Invalid credentials.",
      status: 401,
      allowLocalFallback: true,
    };
  }

  const employee = firstSphereTypeOneEmployee(payload);
  if (!employee) {
    return {
      ok: false,
      error: "This user is not authorized for Keyra admin.",
      status: 403,
      allowLocalFallback: false,
    };
  }

  return { ok: true, employee };
}

export async function POST(req: Request) {
  if (!adminIsConfigured()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }

  try {
    const body = await readJsonObject(req);
    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : typeof body.email === "string"
          ? body.email.trim()
          : "";
    const email = username.toLowerCase();
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

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    try {
      const external = await authenticateCirightAdmin(username, password);
      if (external.ok) {
        const jwt = await signAdminJwt({
          sub: `ciright:${external.employee.employeeId ?? external.employee.userName ?? username}`,
          role: DeploymentAdminRole.GLOBAL_ADMIN,
          svc: true,
        });

        const res = NextResponse.json({
          ok: true,
          mode: "ciright",
          employee: {
            employeeId: external.employee.employeeId,
            name: external.employee.name,
            email: external.employee.email,
            sphereTypeId: external.employee.sphereTypeId,
          },
        });
        res.cookies.set(ADMIN_JWT_COOKIE, jwt, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 8,
        });
        return res;
      }

      if (!external.allowLocalFallback) {
        return NextResponse.json({ error: external.error }, { status: external.status });
      }
    } catch (err) {
      console.error("[api/admin/auth/login:ciright]", err);
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
