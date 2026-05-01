/**
 * SMS verification orchestration via Ciright Core / telecom workflows.
 *
 * Optional: Mailchimp Transactional (Mandrill) sends **email** notices when
 * `notifyEmail` is provided — Mandrill cannot send SMS.
 *
 * TODO: Wire SMS OTP to Ciright Core / telco when endpoints exist.
 */

import type { KeyraAuthenticationMethod } from "@/lib/keyraRegistrationTypes";
import { isCirightCoreConfigured } from "@/services/cirightCoreClient";
import {
  isMandrillConfigured,
  redactedMobileHint,
  sendKeyraVerificationQueuedNotice,
} from "@/services/mandrillClient";

export async function queueSmsVerification(params: {
  mobileE164: string;
  authenticationMethod: KeyraAuthenticationMethod;
  /** Logical registry context — never logged with full MSISDN in browsers */
  context: string;
  /** When Mandrill is configured, sends a transactional email (email-only API). */
  notifyEmail?: string;
}): Promise<{ queued: boolean; mandrillSent: boolean }> {
  let mandrillSent = false;

  const email = params.notifyEmail?.trim();
  if (email && isMandrillConfigured()) {
    const sent = await sendKeyraVerificationQueuedNotice({
      toEmail: email,
      context: params.context,
      mobileHint: redactedMobileHint(params.mobileE164),
    });
    mandrillSent = sent.ok;
  }

  if (!isCirightCoreConfigured()) {
    return { queued: false, mandrillSent };
  }

  // TODO: POST to Ciright Core to start SMS verification for mobileE164.
  void params.authenticationMethod;
  void params.mobileE164;
  return { queued: true, mandrillSent };
}

export async function confirmSmsVerification(params: {
  mobileE164: string;
  code: string;
}): Promise<{ verified: boolean }> {
  void params.mobileE164;
  void params.code;
  // TODO: POST /api/keyra/sms/verify implementation against Core
  return { verified: false };
}
