"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminError,
  adminInput,
  adminLabel,
  adminToolbarBtnPrimary,
  adminToolbarBtnSecondary,
} from "@/lib/admin/adminUiClasses";

type Props = {
  token: string;
  alreadySignedIn?: boolean;
};

export function WywoInviteVerifyClient({ token, alreadySignedIn }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [messageHref, setMessageHref] = useState<string | null>(null);
  const [name, setName] = useState("");

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wywo/invite/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, recipientName: name || undefined }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        messageId?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setVerified(true);
      if (json.messageId) setMessageHref(`/wywo/messages/${json.messageId}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (verified) {
    return (
      <div className="ds-feature-card is-dashboard p-4 space-y-2">
        <p className="ds-body-sm text-[var(--ds-ink)]">
          Identity verified. Your trusted Keyra inbox is ready.
        </p>
        {messageHref ? (
          <Link href={messageHref} className={adminToolbarBtnPrimary}>
            Open message
          </Link>
        ) : (
          <Link href="/wywo/inbox" className={adminToolbarBtnPrimary}>
            Open WYWO
          </Link>
        )}
      </div>
    );
  }

  if (alreadySignedIn) {
    return (
      <div className="space-y-3">
        <p className="ds-body-sm text-[var(--ds-ink)]">
          You are signed in with the correct phone. Confirm to unlock the message.
        </p>
        <div>
          <label className={adminLabel}>Display name (optional)</label>
          <input
            className={adminInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        {error ? <p className={adminError}>{error}</p> : null}
        <button
          type="button"
          className={adminToolbarBtnPrimary}
          onClick={verify}
          disabled={busy}
        >
          {busy ? "Verifying…" : "Verify & open message"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="ds-body-sm text-[var(--ds-ink)]">
        To receive this WYWO message you must verify your phone with Keyra. After
        verification, this message will appear in your trusted inbox under the sender&apos;s
        world.
      </p>
      <div className="flex gap-3 flex-wrap">
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/wywo/invite/${token}`)}`}
          className={adminToolbarBtnPrimary}
        >
          Verify with Keyra
        </Link>
        <Link
          href={`/signup?returnTo=${encodeURIComponent(`/wywo/invite/${token}`)}`}
          className={adminToolbarBtnSecondary}
        >
          Create Keyra identity
        </Link>
      </div>
      <p className="ds-caption text-[var(--ds-body)]">
        Every message on WYWO is attributable. No anonymous communication is permitted.
      </p>
    </div>
  );
}
