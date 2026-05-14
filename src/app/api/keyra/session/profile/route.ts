import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
} from "@/app/api/keyra/_routeHelpers";
import {
  KEYRA_SESSION_COOKIE,
  KEYRA_SESSION_MAX_AGE,
  parseSession,
  serializeSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { isValidEmail } from "@/lib/keyraRegistrationValidation";
import { persistProfileFields } from "@/lib/keyraSiteUserProfileDb";
import { isPostgresDatabaseUrlConfigured } from "@/lib/postgresEnv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const limited = rateLimitResponse(req, "session-profile");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const jar = await cookies();
  const raw = jar.get(KEYRA_SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const prev = parseSession(raw);
  if (!prev) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const next: KeyraSessionUser = { ...prev };

  if ("displayName" in body) {
    const v =
      typeof body.displayName === "string"
        ? body.displayName.trim().slice(0, 160)
        : "";
    next.displayName = v || undefined;
  }

  if ("email" in body) {
    const v = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
    if (v && !isValidEmail(v)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    next.email = v || undefined;
  }

  if ("country" in body) {
    const v =
      typeof body.country === "string" ? body.country.trim().slice(0, 120) : "";
    next.country = v || undefined;
  }

  if (isPostgresDatabaseUrlConfigured()) {
    try {
      await persistProfileFields(next.phoneE164, {
        displayName: next.displayName,
        email: next.email,
        country: next.country,
      });
    } catch (err) {
      console.error("[api/keyra/session/profile] persist", err);
      return NextResponse.json(
        {
          error:
            "Could not save profile to the database. Apply pending migrations: from the Keyra folder run `npx prisma migrate deploy` (or `npx prisma migrate dev`). Ensure the KeyraSiteUserProfile table exists.",
        },
        { status: 503 },
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL must be set to a postgres:// or postgresql:// URL in production so profiles can be stored.",
      },
      { status: 503 },
    );
  } else {
    console.warn(
      "[api/keyra/session/profile] DATABASE_URL is missing or not Postgres — saving display name, email, and country in the session cookie only. They will be lost after logout until DATABASE_URL and migrations are set up.",
    );
  }

  const token = serializeSession(next);
  if (!token) {
    return NextResponse.json({ error: "Session signing unavailable." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true, user: next });
  res.cookies.set({
    name: KEYRA_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: KEYRA_SESSION_MAX_AGE,
  });
  return res;
}
