import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { sanitizeFamily } from "@/lib/keyraRegistrationSanitize";
import { validateFamily } from "@/lib/keyraRegistrationValidation";
import { registerFamily } from "@/services/keyraRegistrationService";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "register-family");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const payload = sanitizeFamily(body);
  const err = validateFamily(payload);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  try {
    await registerFamily(payload);
  } catch {
    return Response.json(
      { error: "Registration could not be completed. Please try again later." },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    message:
      "Your Keyra Family Core has been created. Each family member will receive an SMS to begin securing their identity.",
  });
}
