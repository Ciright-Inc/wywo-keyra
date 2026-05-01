import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { sanitizePartner } from "@/lib/keyraRegistrationSanitize";
import { validatePartner } from "@/lib/keyraRegistrationValidation";
import { registerPartner } from "@/services/keyraRegistrationService";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "register-partner");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const consent = body.consent === true;
  const payload = sanitizePartner(body);
  const err = validatePartner(payload, consent);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  try {
    await registerPartner(payload);
  } catch {
    return Response.json(
      { error: "Registration could not be completed. Please try again later." },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    message:
      "Thank you for your interest in partnering with Keyra. Our team will contact you to review the opportunity.",
  });
}
