import type { NextRequest } from "next/server";
import {
  ADMIN_JWT_COOKIE,
  adminIsConfigured,
  getTokenFromRequest,
  verifyAdminJwt,
} from "@/lib/adminJwt";

export { ADMIN_JWT_COOKIE };

export { adminIsConfigured };

export async function isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
  if (!adminIsConfigured()) return false;
  const cookieVal = req.cookies.get(ADMIN_JWT_COOKIE)?.value ?? undefined;
  const raw = getTokenFromRequest(req, cookieVal);
  if (!raw) return false;
  const legacy = process.env.KEYRA_ADMIN_TOKEN?.trim();
  if (legacy && raw === legacy) return true;
  const v = await verifyAdminJwt(raw);
  return Boolean(v);
}
