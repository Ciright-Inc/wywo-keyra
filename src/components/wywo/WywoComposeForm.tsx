"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminError,
  adminFormGrid,
  adminFormStack,
  adminInput,
  adminLabel,
  adminToolbarBtnPrimary,
  adminToolbarBtnSecondary,
} from "@/lib/admin/adminUiClasses";
import { WYWO_CATEGORY_OPTIONS, WYWO_PRIORITY_OPTIONS } from "@/lib/wywo/constants";
import { WywoPhoneField } from "./WywoPhoneField";
import { WywoSelect } from "./WywoSelect";

type CcRow = { phone: string; name?: string; email?: string };

export function WywoComposeForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<
    | null
    | {
        message: { id: string; wywoMessageId: string };
        trustStatus: string;
        inviteIssued: boolean;
        inviteUrl?: string;
        inviteSmsBody?: string;
        inviteSmsOk?: boolean;
        inviteSmsProvider?: "stdout" | "webhook" | "twilio";
        inviteSmsDevOnly?: boolean;
        recipientOnKeyra?: boolean;
      }
  >(null);

  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("general");
  const [referralPhoneNumber, setReferralPhoneNumber] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [readReceiptRequested, setReadReceiptRequested] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [ccText, setCcText] = useState("");

  function parseCc(): CcRow[] {
    return ccText
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((row) => {
        // Allow "name <phone>" or "name|phone" or just phone.
        const matchTriangle = row.match(/^(.*?)\s*<([^>]+)>$/);
        if (matchTriangle) {
          return { name: matchTriangle[1].trim(), phone: matchTriangle[2].trim() };
        }
        const parts = row.split("|").map((p) => p.trim());
        if (parts.length >= 2) {
          return { name: parts[0], phone: parts[1], email: parts[2] };
        }
        return { phone: row };
      });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const payload = {
        recipientPhone,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        subject,
        body,
        priority,
        category,
        urgent,
        readReceiptRequested,
        referralPhoneNumber: referralPhoneNumber || null,
        expiresAt: expiresAt || null,
        ccRecipients: parseCc(),
      };
      const res = await fetch("/api/wywo/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string } & Record<string, unknown>;
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setResult(json as unknown as NonNullable<typeof result>);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={adminFormStack}>
      <div className={adminFormGrid}>
        <div>
          <label className={adminLabel} htmlFor="wywo-recipient-phone">
            Recipient phone
          </label>
          <WywoPhoneField
            id="wywo-recipient-phone"
            name="recipientPhone"
            value={recipientPhone}
            onChange={setRecipientPhone}
            placeholder="87 555 0100"
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Recipient name</label>
          <input
            className={adminInput}
            placeholder="Optional"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel}>Recipient email</label>
          <input
            className={adminInput}
            placeholder="Optional"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="wywo-referral-phone">
            Referral phone (if untrusted)
          </label>
          <WywoPhoneField
            id="wywo-referral-phone"
            name="referralPhoneNumber"
            value={referralPhoneNumber}
            onChange={setReferralPhoneNumber}
            placeholder="Optional referral phone"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={adminLabel}>Subject</label>
          <input
            className={adminInput}
            placeholder="The verified subject of your message"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={adminLabel}>Body</label>
          <textarea
            className={`${adminInput} min-h-[160px]`}
            placeholder="Trusted message body — encrypted at rest."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Priority</label>
          <WywoSelect
            value={priority}
            onChange={setPriority}
            options={WYWO_PRIORITY_OPTIONS}
          />
        </div>
        <div>
          <label className={adminLabel}>Category</label>
          <WywoSelect
            value={category}
            onChange={setCategory}
            options={WYWO_CATEGORY_OPTIONS}
          />
        </div>
        <div>
          <label className={adminLabel}>Expires at</label>
          <input
            className={adminInput}
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="ds-body-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
            />
            Urgent
          </label>
          <label className="ds-body-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={readReceiptRequested}
              onChange={(e) => setReadReceiptRequested(e.target.checked)}
            />
            Request read receipt
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={adminLabel}>
            CC recipients (one per line — e.g. {`"Jane Doe <+353…>"`})
          </label>
          <textarea
            className={`${adminInput} min-h-[80px]`}
            value={ccText}
            onChange={(e) => setCcText(e.target.value)}
            placeholder={'Jane Doe <+353 87 555 0101>\nOps |+353 87 555 0102|ops@example.com'}
          />
        </div>
      </div>

      {error ? <p className={adminError}>{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={adminToolbarBtnPrimary}
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Send WYWO"}
        </button>
        <button
          type="button"
          className={adminToolbarBtnSecondary}
          onClick={() => router.push("/wywo")}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>

      {result ? (
        <div className="ds-feature-card is-dashboard space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="ds-title-sm">Message dispatched</h3>
              <p className="mt-1 ds-caption">
                Trust evaluated:{" "}
                <span className="ds-caption-uppercase" style={{ color: "var(--ds-ink)" }}>
                  {result.trustStatus}
                </span>
              </p>
            </div>
            <span
              className={`wywo-badge ${result.inviteIssued ? "is-pending" : "is-trusted"}`}
            >
              {result.inviteIssued ? "Invite issued" : "Delivered"}
            </span>
          </div>

          {result.inviteIssued ? (
            <>
              <p className="ds-body-sm">
                Recipient is not yet on Keyra. A WYWO invite was created — they must verify
                identity at this link before the message becomes visible to them.
              </p>
              {result.inviteUrl ? (
                <div className="rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] p-3">
                  <p className="ds-caption-uppercase">Invite link</p>
                  <a
                    className="ds-text-link ds-numeric break-all"
                    href={result.inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.inviteUrl}
                  </a>
                </div>
              ) : null}

              {result.inviteSmsDevOnly ? (
                <div className="rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] p-3 space-y-2">
                  <p className="ds-caption-uppercase">SMS — dev mode</p>
                  <p className="ds-body-sm">
                    No SMS provider is configured, so nothing was actually sent to the
                    recipient&apos;s phone. The invite text was printed to the dev server
                    terminal instead.
                  </p>
                  <p className="ds-caption">
                    To send real SMS, set <code className="ds-numeric">TWILIO_ACCOUNT_SID</code>,{" "}
                    <code className="ds-numeric">TWILIO_AUTH_TOKEN</code>, and{" "}
                    <code className="ds-numeric">TWILIO_FROM_NUMBER</code> in{" "}
                    <code className="ds-numeric">.env</code> — or point{" "}
                    <code className="ds-numeric">WYWO_SMS_WEBHOOK_URL</code> at your gateway.
                  </p>
                  {result.inviteSmsBody ? (
                    <details className="ds-body-sm">
                      <summary className="cursor-pointer ds-caption-uppercase">Show SMS body</summary>
                      <pre className="mt-2 whitespace-pre-wrap text-[var(--ds-ink)] ds-body-sm">
                        {result.inviteSmsBody}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : (
                <p className="ds-body-sm">
                  SMS dispatch:{" "}
                  <span className="ds-caption-uppercase" style={{ color: "var(--ds-ink)" }}>
                    {result.inviteSmsOk
                      ? `delivered via ${result.inviteSmsProvider}`
                      : "pending — retry queued"}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className="ds-body-sm">
              {result.recipientOnKeyra
                ? "The recipient already has a Keyra world — your message is now in their WYWO inbox under PENDING_REVIEW until they approve you."
                : "Delivered into the recipient's trusted layer."}
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
