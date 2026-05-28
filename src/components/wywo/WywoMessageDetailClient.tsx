"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  adminBackLink,
  adminPageTitle,
  adminPanel,
  adminError,
  adminInput,
  adminLabel,
  adminToolbarBtnPrimary,
  adminToolbarBtnSecondary,
  adminToolbarBtnDanger,
} from "@/lib/admin/adminUiClasses";
import { formatAdminDateTime } from "@/lib/admin/formatAdminDateTime";
import type { WywoMessageView } from "@/lib/wywo/types";
import { WywoTrustBadge } from "./WywoTrustBadge";

type Props = {
  message: WywoMessageView;
};

export function WywoMessageDetailClient({ message }: Props) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState<null | "approve" | "block" | "archive" | "reply">(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function call(path: string, body?: unknown) {
    setError(null);
    setInfo(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;
    if (!res.ok || !json?.ok) {
      throw new Error(json?.error || `HTTP ${res.status}`);
    }
    return json;
  }

  async function approve() {
    setBusy("approve");
    try {
      await call(`/api/wywo/messages/${message.id}/approve`, { ring: "TRUSTED" });
      setInfo("Sender approved into Trusted Contacts.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function block() {
    setBusy("block");
    try {
      await call(`/api/wywo/messages/${message.id}/block`);
      setInfo("Sender blocked.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function archive() {
    setBusy("archive");
    try {
      await call(`/api/wywo/messages/${message.id}/archive`);
      setInfo("Message archived.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function reply() {
    if (!replyBody.trim()) return;
    setBusy("reply");
    try {
      await call(`/api/wywo/messages/${message.id}/reply`, { body: replyBody });
      setInfo("Reply sent.");
      setReplyBody("");
      setShowReply(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const isInbox = message.direction === "inbox";
  const allowApprove = isInbox && message.trustStatus !== "TRUSTED" && message.trustStatus !== "BLOCKED";
  const allowBlock = isInbox && message.trustStatus !== "BLOCKED";

  return (
    <div className="space-y-6">
      <div>
        <Link href={isInbox ? "/wywo/inbox" : "/wywo/sent"} className={adminBackLink}>
          ← Back
        </Link>
      </div>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={adminPageTitle}>{message.subject || "(no subject)"}</h1>
          <WywoTrustBadge status={message.trustStatus} />
          {message.urgent ? <span className="wywo-badge is-urgent">Urgent</span> : null}
        </div>
        <p className="ds-caption-uppercase">
          {isInbox ? "From" : "To"} ·{" "}
          {isInbox ? message.senderName : message.recipientName ?? "—"} ·{" "}
          <span className="ds-numeric">
            {isInbox ? message.senderPhone : message.recipientPhone}
          </span>
        </p>
      </header>

      <section className={`${adminPanel} space-y-5`}>
        <div className="wywo-meta-grid">
          <div>
            <span>World</span>
            <p className="ds-numeric break-all">{message.worldId ?? "—"}</p>
          </div>
          <div>
            <span>Subscription</span>
            <p className="ds-numeric break-all">{message.subscriptionId ?? "—"}</p>
          </div>
          <div>
            <span>Priority · Category</span>
            <p className="uppercase">
              {message.priority} · {message.category}
            </p>
          </div>
          <div>
            <span>Created · Read</span>
            <p>
              {formatAdminDateTime(message.createdAt)}
              {message.readAt ? ` · ${formatAdminDateTime(message.readAt)}` : ""}
            </p>
          </div>
          {message.referralRequired && message.referralPhoneNumber ? (
            <div>
              <span>Referral</span>
              <p className="ds-numeric">{message.referralPhoneNumber}</p>
            </div>
          ) : null}
          {message.ccRecipients.length ? (
            <div style={{ gridColumn: "1/-1" }}>
              <span>CC</span>
              <p>
                {message.ccRecipients
                  .map((r) => (r.name ? `${r.name} <${r.phone}>` : r.phone))
                  .join(", ")}
              </p>
            </div>
          ) : null}
        </div>
        <div className="border-t border-[var(--ds-hairline)] pt-5">
          <p className="ds-body-md whitespace-pre-wrap text-[var(--ds-ink)]">{message.body}</p>
        </div>
        {message.transcription ? (
          <div className="pt-5 border-t border-[var(--ds-hairline)]">
            <p className="ds-caption-uppercase">Transcription</p>
            <p className="ds-body-sm whitespace-pre-wrap text-[var(--ds-ink)]">
              {message.transcription}
            </p>
          </div>
        ) : null}
        {message.aiSummary ? (
          <div className="pt-5 border-t border-[var(--ds-hairline)]">
            <p className="ds-caption-uppercase">AI summary</p>
            <p className="ds-body-sm whitespace-pre-wrap text-[var(--ds-ink)]">
              {message.aiSummary}
            </p>
          </div>
        ) : null}
        {message.urgencyScore !== null || message.sentiment !== null ? (
          <div className="pt-5 border-t border-[var(--ds-hairline)]">
            <p className="ds-caption-uppercase">Signals</p>
            <p className="ds-body-sm">
              {message.urgencyScore !== null ? (
                <>
                  Urgency: <span className="ds-numeric">{message.urgencyScore}</span>
                  <span className="mx-2">·</span>
                </>
              ) : null}
              {message.sentiment ? (
                <>
                  Sentiment: <span className="ds-numeric">{message.sentiment}</span>
                </>
              ) : null}
            </p>
          </div>
        ) : null}
        {message.attachments.length ? (
          <div>
            <p className="ds-caption-uppercase">Attachments</p>
            <ul className="mt-2 ds-body-sm space-y-1">
              {message.attachments.map((a, i) => (
                <li key={i}>{a.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {error ? <p className={adminError}>{error}</p> : null}
      {info ? <p className="ds-body-sm text-[var(--ds-ink)]">{info}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={adminToolbarBtnPrimary}
          onClick={() => setShowReply((v) => !v)}
          disabled={busy === "reply"}
        >
          {showReply ? "Hide reply" : "Reply"}
        </button>
        {allowApprove ? (
          <button
            type="button"
            className={adminToolbarBtnSecondary}
            onClick={approve}
            disabled={busy !== null}
          >
            {busy === "approve" ? "Approving…" : "Approve sender"}
          </button>
        ) : null}
        {allowBlock ? (
          <button
            type="button"
            className={adminToolbarBtnDanger}
            onClick={block}
            disabled={busy !== null}
          >
            {busy === "block" ? "Blocking…" : "Block sender"}
          </button>
        ) : null}
        <button
          type="button"
          className={adminToolbarBtnSecondary}
          onClick={archive}
          disabled={busy !== null}
        >
          {busy === "archive" ? "Archiving…" : "Archive"}
        </button>
      </div>

      {showReply ? (
        <div className={`${adminPanel} p-6 space-y-3`}>
          <label className={adminLabel}>Your reply</label>
          <textarea
            className={`${adminInput} min-h-[140px]`}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Reply respectfully — every message is attributable."
          />
          <div>
            <button
              type="button"
              className={adminToolbarBtnPrimary}
              onClick={reply}
              disabled={busy === "reply" || !replyBody.trim()}
            >
              {busy === "reply" ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
