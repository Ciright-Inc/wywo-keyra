import type { NextRequest } from "next/server";
import {
  resolveAdminAuthForPhone,
} from "@/lib/deployments/adminContext";
import { resolveKeyraSessionFromNextRequest } from "@/lib/keyraSessionServer";

/** Admin UI/API access uses the public Keyra session plus an active AdminUser phone match. */
export async function isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
  const session = await resolveKeyraSessionFromNextRequest(req);
  if (!session?.phoneE164) return false;
  const auth = await resolveAdminAuthForPhone(session.phoneE164);
  return auth !== null;
}

export function adminIsConfigured(): boolean {
  return true;
}
