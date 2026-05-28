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

/**
 * Standalone WYWO deployment fallback. When the WYWO build runs as its own
 * service (e.g. wywo.keyra.ie or the Railway preview) and we don't want to
 * round-trip through `get-started.keyra.ie`, an operator can pin a single
 * identity via env vars and skip auth entirely. This is the only way to
 * open WYWO without Keyra cross-domain cookies.
 *
 * Required: `WYWO_STANDALONE_PHONE` in E.164 form (`+919...`).
 * Optional: `WYWO_STANDALONE_NAME`, `WYWO_STANDALONE_EMAIL`.
 *
 * The matching `KEYRA_DEPLOYMENT_MODE=wywo` env (or `wywo-keyra`/`wywo.`
 * hostname) is also required so this only takes effect on the dedicated
 * WYWO deployment, never on keyra.ie.
 */
function wywoStandaloneSessionFromEnv(): KeyraSessionUser | null {
  const phone = process.env.WYWO_STANDALONE_PHONE?.trim();
  if (!phone?.startsWith("+")) return null;
  const mode = process.env.KEYRA_DEPLOYMENT_MODE?.trim().toLowerCase();
  const asRoot = process.env.WYWO_AS_ROOT === "1";
  if (mode !== "wywo" && !asRoot) return null;
  return {
    phoneE164: phone,
    displayName: process.env.WYWO_STANDALONE_NAME?.trim() || phone,
    email: process.env.WYWO_STANDALONE_EMAIL?.trim() || undefined,
  } as KeyraSessionUser;
}

export async function resolveWywoActor(): Promise<WywoActor | null> {
  const session = await resolveKeyraSessionFromCookies();
  if (session?.phoneE164) return actorWithAdmin(session);

  // Standalone WYWO deployment (production-safe, env-gated).
  const standalone = wywoStandaloneSessionFromEnv();
  if (standalone) return actorWithAdmin(standalone);

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
    redirect("/wywo/home");
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

  const standalone = wywoStandaloneSessionFromEnv();
  if (standalone) return actorWithAdmin(standalone);

  const devPhone = devSessionPhoneFallback();
  if (devPhone) {
    return actorWithAdmin({ phoneE164: devPhone, displayName: "Devisha jansari" });
  }
  return null;
}
