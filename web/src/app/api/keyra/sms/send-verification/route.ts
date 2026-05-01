import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import {
  isValidEmail,
  isValidMobileE164,
} from "@/lib/keyraRegistrationValidation";
import { queueSmsVerification } from "@/services/smsVerificationService";

/**
 * Explicit SMS verification kick-off (outside registration bundling).
 *
 * TODO: Align payload with Ciright Core SMS workflow IDs / templates.
 */
export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "sms-send");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const mobileNumber =
    typeof body.mobileNumber === "string" ? body.mobileNumber.trim() : "";
  if (!isValidMobileE164(mobileNumber)) {
    return Response.json({ error: "Valid international mobile required." }, { status: 400 });
  }

  const notifyRaw =
    typeof body.notifyEmail === "string" ? body.notifyEmail.trim() : "";
  const notifyEmail = notifyRaw && isValidEmail(notifyRaw) ? notifyRaw : undefined;
  if (notifyRaw && !notifyEmail) {
    return Response.json({ error: "notifyEmail must be a valid email." }, { status: 400 });
  }

  const result = await queueSmsVerification({
    mobileE164: mobileNumber,
    authenticationMethod: "MOBILE_TELCO_VERIFICATION",
    context:
      typeof body.context === "string" ? body.context.slice(0, 64) : "MANUAL",
    notifyEmail,
  });

  return Response.json({
    ok: true,
    mandrillSent: result.mandrillSent,
    smsQueuedWithCore: result.queued,
  });
}
