import {
  honeypotTripped,
  rateLimitResponse,
  readJsonObject,
  verifyCaptcha,
} from "@/app/api/keyra/_routeHelpers";
import { isValidMobileE164 } from "@/lib/keyraRegistrationValidation";
import { confirmSmsVerification } from "@/services/smsVerificationService";
import { isCirightCoreConfigured } from "@/services/cirightCoreClient";

/**
 * Confirm SMS OTP / telecom verification.
 *
 * TODO: Implement Ciright Core verification exchange.
 */
export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "sms-verify");
  if (limited) return limited;

  const body = await readJsonObject(req);
  if (honeypotTripped(body)) {
    return Response.json({ verified: false }, { status: 200 });
  }

  const captcha = await verifyCaptcha(body);
  if (captcha) return captcha;

  const mobileNumber =
    typeof body.mobileNumber === "string" ? body.mobileNumber.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!isValidMobileE164(mobileNumber) || !code) {
    return Response.json({ error: "Mobile and verification code required." }, { status: 400 });
  }

  if (!isCirightCoreConfigured()) {
    return Response.json(
      {
        error:
          "SMS verification is not live until Ciright Core credentials are configured.",
      },
      { status: 501 },
    );
  }

  const { verified } = await confirmSmsVerification({ mobileE164: mobileNumber, code });
  if (!verified) {
    return Response.json({ verified: false, error: "Verification failed." }, { status: 400 });
  }

  return Response.json({ verified: true });
}
