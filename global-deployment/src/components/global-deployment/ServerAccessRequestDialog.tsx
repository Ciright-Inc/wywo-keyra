"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function ServerAccessRequestDialog({
  open,
  onClose,
  targetType,
  targetId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  targetType: "COUNTRY" | "TELCO";
  targetId: string;
  title: string;
}) {
  const [workEmail, setWorkEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessage(null);
    setError(null);
    setBusy(false);
  }, [open, targetId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-request-title"
        className="relative z-[81] w-full max-w-lg rounded-t-[var(--keyra-radius-sheet)] border border-keyra-border bg-[var(--keyra-surface)] p-5 shadow-[0_-18px_60px_rgba(0,0,0,0.55)] sm:rounded-[var(--keyra-radius-sheet)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">
              Request server access
            </p>
            <h2 id="access-request-title" className="mt-2 text-lg font-semibold text-keyra-primary">
              {title}
            </h2>
            <p className="mt-2 text-sm text-keyra-text-2">
              Access is governed. We will verify your work email against approved organization domains.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-keyra-border px-2 py-1 text-xs text-keyra-text-2 hover:text-keyra-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            setMessage(null);
            try {
              const res = await fetch("/api/public/access-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  targetType,
                  targetId,
                  workEmail,
                  employeeType: "TYPE_1",
                  requestReason: reason.trim().length ? reason.trim() : null,
                }),
              });
              const json: unknown = await res.json().catch(() => null);
              const msg =
                typeof json === "object" &&
                json !== null &&
                "message" in json &&
                typeof (json as { message?: unknown }).message === "string"
                  ? (json as { message: string }).message
                  : null;
              if (!res.ok) {
                setError(
                  typeof json === "object" &&
                    json !== null &&
                    "error" in json &&
                    typeof (json as { error?: unknown }).error === "string"
                    ? (json as { error: string }).error
                    : "Unable to submit right now.",
                );
              } else {
                setMessage(msg ?? "Request received.");
                setWorkEmail("");
                setReason("");
              }
            } catch {
              setError("Unable to submit right now.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm text-keyra-text-2">
            Work email
            <input
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            />
          </label>

          <label className="block text-sm text-keyra-text-2">
            Reason (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg px-3 py-2 text-sm text-keyra-primary outline-none focus-visible:keyra-focus"
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {message ? <p className="text-sm text-keyra-text-2">{message}</p> : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
