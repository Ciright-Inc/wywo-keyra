import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { sanitizeIndividual } from "@/lib/keyraRegistrationSanitize";
import { validateIndividual } from "@/lib/keyraRegistrationValidation";
import { registerIndividual } from "@/services/keyraRegistrationService";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "register-individual");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const consent = body.consent === true;
  const payload = sanitizeIndividual(body);
  const err = validateIndividual(payload, consent);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  try {
    await registerIndividual(payload);
  } catch {
    return Response.json(
      { error: "Registration could not be completed. Please try again later." },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    message:
      "Your Keyra identity registration has started. We will send a secure SMS to verify your mobile device.",
  });
}
