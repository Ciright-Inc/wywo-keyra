import { rateLimitResponse } from "@/app/api/keyra/_routeHelpers";
import { fetchAuthSessionSnapshot } from "@/lib/keyraProtection";
import {
  resolveKeyraSessionUserFromPhone,
} from "@/lib/keyraSessionEstablish";
import { jsonWithKeyraSession } from "@/lib/keyraSessionResponse";
import { NextResponse } from "next/server";

type SyncBodyHint = {
  phone?: unknown;
  phoneE164?: unknown;
  phoneNumber?: unknown;
  displayName?: unknown;
  fullName?: unknown;
  username?: unknown;
  email?: unknown;
};

function pickString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function readBodyHint(req: Request): Promise<SyncBodyHint | null> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    const text = await req.text();
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as SyncBodyHint;
  } catch {
    return null;
  }
}

/**
 * Creates or refreshes keyra_session from the active SimSecure auth session cookie,
 * or from a verified phone (+ profile) in the JSON body on cross-origin hosts.
 *
 * On Railway / hosts that do not share the auth cookie domain with simsecure-auth,
 * the browser cannot forward auth cookies to this route — the client must call
 * the auth backend directly, then POST the derived identity here (same trust model
 * as `/api/keyra/session/continue?phone=...`).
 */
export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "session-sync");
  if (limited) return limited;

  const auth = await fetchAuthSessionSnapshot(req);
  if (auth.authenticated && auth.phoneE164) {
    const fromAuth = await resolveKeyraSessionUserFromPhone(
      auth.phoneE164,
      {
        displayName: auth.displayName ?? auth.fullName ?? auth.username,
        email: auth.email,
      },
      req,
    );
    if (fromAuth) {
      const res = jsonWithKeyraSession(fromAuth, { ok: true, synced: true });
      if (res) return res;
    }
  }

  const hint = await readBodyHint(req);
  if (hint) {
    const rawPhone =
      pickString(hint.phoneE164) ?? pickString(hint.phone) ?? pickString(hint.phoneNumber);
    if (rawPhone?.startsWith("+")) {
      const displayName =
        pickString(hint.displayName) ?? pickString(hint.fullName) ?? pickString(hint.username);
      const user = await resolveKeyraSessionUserFromPhone(
        rawPhone,
        { displayName, email: pickString(hint.email) },
        req,
      );
      if (user) {
        const res = jsonWithKeyraSession(user, { ok: true, synced: true });
        if (res) return res;
      }
    }
  }

  return NextResponse.json({ error: "No active auth session." }, { status: 401 });
}
