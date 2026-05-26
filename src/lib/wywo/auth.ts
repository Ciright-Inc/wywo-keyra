import "server-only";

import { redirect } from "next/navigation";
import { resolveKeyraSessionFromCookies } from "@/lib/keyraSessionServer";
import type { KeyraSessionUser } from "@/lib/keyraSessionTypes";
import { resolveAdminAuthForPhone } from "@/lib/deployments/adminContext";
import { devSessionPhoneFallback } from "@/lib/keyraSessionEstablish";
import type { WywoActor } from "./types";

/**
 * Map a Keyra session into a WYWO actor. The WYWO actor inherits the same
 * trust anchors as the Keyra identity — phone-verified, no anonymous use.
 */
export function actorFromSession(session: KeyraSessionUser): WywoActor {
  return {
    phoneE164: session.phoneE164,
    displayName: session.displayName?.trim() || session.phoneE164,
    email: session.email?.trim() || undefined,
  };
}

async function actorWithAdmin(session: KeyraSessionUser): Promise<WywoActor> {
  const actor = actorFromSession(session);
  const admin = await resolveAdminAuthForPhone(session.phoneE164).catch(() => null);
  if (admin) actor.isAdmin = true;
  return actor;
}

export async function resolveWywoActor(): Promise<WywoActor | null> {
  const session = await resolveKeyraSessionFromCookies();
  if (session?.phoneE164) return actorWithAdmin(session);

  // Local dev: Get Started cookies live on get-started.keyra.ie — use KEYRA_DEV_SESSION_PHONE.
  const devPhone = devSessionPhoneFallback();
  if (devPhone) {
    return actorWithAdmin({ phoneE164: devPhone, displayName: "Devisha jansari" });
  }
  return null;
}

/**
 * Server-side guard for protected WYWO pages. Redirects to the Keyra login
 * with a returnTo if the user is not signed in.
 */
export async function assertWywoActor(returnTo: string): Promise<WywoActor> {
  const actor = await resolveWywoActor();
  if (!actor) {
    const next = returnTo.startsWith("/") ? returnTo : `/${returnTo}`;
    // Dev: establish keyra_session on localhost (no Get Started round-trip).
    if (devSessionPhoneFallback()) {
      redirect(`/api/keyra/session/continue?next=${encodeURIComponent(next)}`);
    }
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return actor;
}

/** Admin-only assertion used by the admin sub-routes. */
export async function assertWywoAdminActor(returnTo: string): Promise<WywoActor> {
  const actor = await assertWywoActor(returnTo);
  if (!actor.isAdmin) {
    redirect("/wywo");
  }
  return actor;
}

/**
 * Resolve a WYWO actor from a Next.js Request (used by API routes).
 * Returns null when unauthenticated.
 */
export async function resolveWywoActorFromRequest(req: Request): Promise<WywoActor | null> {
  const { resolveKeyraSessionFromRequest } = await import("@/lib/keyraSessionServer");
  const session = await resolveKeyraSessionFromRequest(req);
  if (session?.phoneE164) return actorWithAdmin(session);

  const devPhone = devSessionPhoneFallback();
  if (devPhone) {
    return actorWithAdmin({ phoneE164: devPhone, displayName: "Devisha jansari" });
  }
  return null;
}
