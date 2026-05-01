import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
} from "@/app/api/keyra/_routeHelpers";
import {
  KEYRA_SESSION_COOKIE,
  KEYRA_SESSION_MAX_AGE,
  serializeSession,
  type KeyraSessionUser,
} from "@/lib/keyraSessionCookie";
import { isValidMobileE164 } from "@/lib/keyraRegistrationValidation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "session-login");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }

  const phone =
    typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  if (!isValidMobileE164(phone)) {
    return NextResponse.json(
      { error: "Enter a valid international mobile number (include + and country code)." },
      { status: 400 },
    );
  }

  const user: KeyraSessionUser = { phoneE164: phone };
  const token = serializeSession(user);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Session signing is not configured. Set KEYRA_SESSION_SECRET in production.",
      },
      { status: 503 },
    );
  }

  const res = NextResponse.json({ ok: true, user });
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
