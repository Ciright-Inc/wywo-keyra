import "server-only";

/**
 * SMS dispatcher used by WYWO invites.
 * In production we'll wire to Twilio / the Keyra telco gateway; until then we
 * log to stdout in dev and accept a webhook-style override via WYWO_SMS_WEBHOOK_URL.
 */

export type SmsDispatchResult = {
  ok: boolean;
  provider: "stdout" | "webhook" | "twilio";
  providerMessageId?: string;
  error?: string;
  /** True when no real provider is configured and the SMS only printed to stdout. */
  devOnly?: boolean;
};

export async function sendSms(opts: {
  to: string;
  body: string;
  context?: Record<string, unknown>;
}): Promise<SmsDispatchResult> {
  const webhook = process.env.WYWO_SMS_WEBHOOK_URL?.trim();
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_FROM_NUMBER?.trim();

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const params = new URLSearchParams({ To: opts.to, From: twilioFrom, Body: opts.body });
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, provider: "twilio", error: text || `HTTP ${res.status}` };
      }
      const payload = (await res.json().catch(() => null)) as { sid?: string } | null;
      return { ok: true, provider: "twilio", providerMessageId: payload?.sid };
    } catch (err) {
      return { ok: false, provider: "twilio", error: (err as Error).message };
    }
  }

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: opts.to, body: opts.body, context: opts.context ?? {} }),
      });
      if (!res.ok) {
        return { ok: false, provider: "webhook", error: `HTTP ${res.status}` };
      }
      return { ok: true, provider: "webhook" };
    } catch (err) {
      return { ok: false, provider: "webhook", error: (err as Error).message };
    }
  }

  // Dev fallback — print a loud, easy-to-grep one-liner and succeed.
  const banner = "\n══════ WYWO · DEV SMS (no provider configured) ══════";
  const footer = "═══════════════════════════════════════════════════════\n";
   
  console.log(
    `${banner}\n  to:    ${opts.to}\n  body:  ${opts.body}\n  ctx:   ${JSON.stringify(opts.context ?? {})}\n${footer}`,
  );
  return { ok: true, provider: "stdout", devOnly: true };
}
