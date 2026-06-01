import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
} from "@/app/api/keyra/_routeHelpers";
import { isValidMobileE164 } from "@/lib/keyraRegistrationValidation";
import { resolveKeyraSessionUserFromPhone } from "@/lib/keyraSessionEstablish";
import { jsonWithKeyraSession } from "@/lib/keyraSessionResponse";
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

  const displayName =
    typeof body.displayName === "string"
      ? body.displayName.trim()
      : typeof body.fullName === "string"
        ? body.fullName.trim()
        : undefined;
  const user = await resolveKeyraSessionUserFromPhone(phone, { displayName }, req);
  if (!user) {
    return NextResponse.json(
      { error: "Enter a valid international mobile number (include + and country code)." },
      { status: 400 },
    );
  }
  const res = jsonWithKeyraSession(user);
  if (!res) {
    return NextResponse.json(
      {
        error:
          "Session signing is not configured. Set KEYRA_SESSION_SECRET in production.",
      },
      { status: 503 },
    );
  }
  return res;
}
