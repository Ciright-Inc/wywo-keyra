import * as jose from "jose";
import type { DeploymentAdminRole } from "@prisma/client";

export const ADMIN_JWT_COOKIE = "keyra_admin_jwt";

const DEV_FALLBACK_SECRET = "dev-only-keyra-admin-jwt-secret-min-32-chars!!";

export function getAdminJwtSecret(): string {
  const s = process.env.KEYRA_ADMIN_JWT_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK_SECRET;
  }
  throw new Error("KEYRA_ADMIN_JWT_SECRET must be set (min 32 chars) in production.");
}

export type AdminJwtClaims = {
  sub: string;
  role: DeploymentAdminRole;
  /** Service / break-glass token login — not tied to AdminUser row */
  svc?: boolean;
};

export async function signAdminJwt(claims: AdminJwtClaims, expiresIn = "8h"): Promise<string> {
  const secret = new TextEncoder().encode(getAdminJwtSecret());
  const jwt = await new jose.SignJWT({
    role: claims.role,
    svc: claims.svc === true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
  return jwt;
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtClaims | null> {
  try {
    const secret = new TextEncoder().encode(getAdminJwtSecret());
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: ["HS256"] });
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const role = payload.role as DeploymentAdminRole | undefined;
    if (!sub || !role) return null;
    return {
      sub,
      role,
      svc: payload.svc === true,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

export function getTokenFromRequest(req: Request, cookieValue: string | null | undefined): string | null {
  return getBearerToken(req) ?? (cookieValue?.trim() || null);
}

export function adminIsConfigured(): boolean {
  const legacy = process.env.KEYRA_ADMIN_TOKEN?.trim();
  if (legacy) return true;
  const jwt = process.env.KEYRA_ADMIN_JWT_SECRET?.trim();
  if (jwt && jwt.length >= 32) return true;
  return process.env.NODE_ENV !== "production";
}
