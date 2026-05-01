import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { sanitizeOrganization } from "@/lib/keyraRegistrationSanitize";
import { validateOrganization } from "@/lib/keyraRegistrationValidation";
import { registerOrganization } from "@/services/keyraRegistrationService";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "register-organization");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const payload = sanitizeOrganization(body);
  const err = validateOrganization(payload);
  if (err) {
    return Response.json({ error: err }, { status: 400 });
  }

  try {
    await registerOrganization(payload);
  } catch {
    return Response.json(
      { error: "Registration could not be completed. Please try again later." },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    message:
      "Your organization registration has started. Keyra will verify your domain, security leader, and registered contacts.",
  });
}
