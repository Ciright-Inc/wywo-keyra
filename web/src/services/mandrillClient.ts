/**
 * Mailchimp Transactional Email (formerly Mandrill) — HTTPS JSON API.
 *
 * Mandrill sends **email only**. It does not deliver SMS. Use this for user or
 * ops notifications alongside Ciright Core / telecom SMS verification.
 *
 * https://mailchimp.com/developer/transactional/api/messages/
 */

const MANDRILL_SEND_URL = "https://mandrillapp.com/api/1.0/messages/send.json";

export function isMandrillConfigured(): boolean {
  const key = process.env.MANDRILL_API_KEY?.trim();
  const from = process.env.MANDRILL_FROM_EMAIL?.trim();
  return Boolean(key && from);
}

type MandrillErrorBody = {
  status?: string;
  name?: string;
  message?: string;
};

type MandrillSendResultRow = {
  email?: string;
  status?: string;
  reject_reason?: string;
};

export async function sendMandrillTransactional(params: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.MANDRILL_API_KEY?.trim();
  const fromEmail = process.env.MANDRILL_FROM_EMAIL?.trim();
  const fromName = process.env.MANDRILL_FROM_NAME?.trim() || "Keyra";

  if (!key || !fromEmail) {
    return { ok: false, error: "Mandrill env not configured." };
  }

  const emails = (Array.isArray(params.to) ? params.to : [params.to])
    .map((e) => e.trim())
    .filter(Boolean);

  if (!emails.length) {
    return { ok: false, error: "No recipients." };
  }

  const html =
    params.html ??
    params.text
      .split("\n")
      .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<br/>"))
      .join("");

  const res = await fetch(MANDRILL_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      message: {
        from_email: fromEmail,
        from_name: fromName,
        to: emails.map((email) => ({ email, type: "to" })),
        subject: params.subject,
        text: params.text,
        html,
      },
    }),
  });

  const raw: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, error: "Mandrill HTTP error." };
  }

  const errBody = raw as MandrillErrorBody;
  if (errBody?.status === "error") {
    return {
      ok: false,
      error: String(errBody.message ?? errBody.name ?? "Mandrill error."),
    };
  }

  const rows = raw as MandrillSendResultRow[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Unexpected Mandrill response." };
  }

  const bad = rows.find(
    (r) =>
      r.status &&
      r.status !== "sent" &&
      r.status !== "queued" &&
      r.status !== "scheduled",
  );
  if (bad) {
    return {
      ok: false,
      error: String(bad.reject_reason || bad.status || "Rejected."),
    };
  }

  return { ok: true };
}

/** Last few digits only — never put full MSISDN in email bodies. */
export function redactedMobileHint(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const tail = digits.slice(-4);
  return tail.length >= 2 ? `••••${tail}` : "your registered mobile";
}

export async function sendKeyraVerificationQueuedNotice(params: {
  toEmail: string;
  context: string;
  mobileHint: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const subject = "Keyra — mobile verification";
  const text = [
    "Hello,",
    "",
    `We're processing identity verification for Keyra (${params.context}).`,
    `The mobile number on file ends with ${params.mobileHint}.`,
    "",
    "If you recently started registration at keyra.ie, watch this phone for an SMS from your carrier / Keyra verification flow.",
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— Keyra",
  ].join("\n");

  return sendMandrillTransactional({
    to: params.toEmail,
    subject,
    text,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
