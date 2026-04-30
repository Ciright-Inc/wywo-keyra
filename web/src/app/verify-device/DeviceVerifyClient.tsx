"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureApiOriginUrl } from "@/lib/ensureApiOriginUrl";

function authBackendBase(): string {
  return ensureApiOriginUrl(process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "");
}

const MOCK =
  /^(1|true|yes)$/i.test(String(process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCK_VERIFY ?? "").trim()) ||
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_MOCK_VERIFY === "1";

type Props = { authorizePostAction: string };

function DeviceVerifyInner({ authorizePostAction }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mockSubmitting, setMockSubmitting] = useState(false);
  const [checkingExistingSession, setCheckingExistingSession] = useState(false);
  const [linkStatus, setLinkStatus] = useState<
    "checking" | "pending" | "approved" | "claimed" | "expired" | "not_found"
  >("checking");
  const hasAttemptedAutoLinkRef = useRef(false);
  const linkId = (searchParams.get("link") ?? "").trim();
  const returnUrl = searchParams.get("return");

  const missingLink = !linkId;

  async function handleMockVerify() {
    const cleaned = phone.trim();
    if (!cleaned || !linkId) return;
    setMockSubmitting(true);
    try {
      const base = authBackendBase();
      const res = await fetch(`${base}/auth/mock/verify-mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: "999123456789", linkId }),
      });
      const body = res.headers.get("content-type")?.includes("json") ? await res.json() : {};
      if (!res.ok) {
        const detail = typeof (body as { error?: string }).error === "string" ? `: ${(body as { error: string }).error}` : "";
        throw new Error(`Mock verification failed (HTTP ${res.status})${detail}`);
      }
      if (returnUrl && returnUrl.startsWith("http")) {
        window.location.href = returnUrl;
      } else {
        router.replace("/");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMockSubmitting(false);
    }
  }

  function handleMockFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned || !linkId) return;
    void handleMockVerify();
  }

  const tryAutoLinkFromExistingMobileSession = useCallback(async (currentLinkId: string, currentReturnUrl: string | null) => {
    setCheckingExistingSession(true);
    try {
      const base = authBackendBase();
      const sessionRes = await fetch(`${base}/auth/session`, { method: "GET", credentials: "include" });
      if (!sessionRes.ok) return;
      const sessionJson = (await sessionRes.json()) as { authenticated?: boolean };
      if (!sessionJson.authenticated) return;

      const linkRes = await fetch(`${base}/auth/link-session/approve-existing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ linkId: currentLinkId }),
      });
      if (!linkRes.ok) return;

      if (currentReturnUrl && currentReturnUrl.startsWith("http")) {
        window.location.href = currentReturnUrl;
      } else {
        router.replace("/");
      }
    } catch {
      /* best effort */
    } finally {
      setCheckingExistingSession(false);
    }
  }, [router]);

  useEffect(() => {
    if (!linkId) return;
    let cancelled = false;
    const base = authBackendBase();
    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${base}/auth/link-session/public-status?linkId=${encodeURIComponent(linkId)}`,
          { method: "GET", credentials: "include" },
        );
        if (cancelled) return;
        if (res.status === 404) {
          setLinkStatus("not_found");
          return;
        }
        if (!res.ok) {
          setLinkStatus("pending");
          return;
        }
        const json = (await res.json()) as { status?: string };
        const status = json.status;
        if (status === "expired" || status === "approved" || status === "claimed" || status === "pending") {
          setLinkStatus(status);
          return;
        }
        setLinkStatus("pending");
      } catch {
        if (!cancelled) setLinkStatus("pending");
      }
    };
    void checkStatus();
    return () => {
      cancelled = true;
    };
  }, [linkId]);

  useEffect(() => {
    if (!linkId || linkStatus !== "pending" || hasAttemptedAutoLinkRef.current) return;
    hasAttemptedAutoLinkRef.current = true;
    void tryAutoLinkFromExistingMobileSession(linkId, returnUrl);
  }, [linkId, linkStatus, returnUrl, tryAutoLinkFromExistingMobileSession]);

  useEffect(() => {
    const reset = () => setSubmitting(false);
    window.addEventListener("pageshow", reset);
    window.addEventListener("focus", reset);
    return () => {
      window.removeEventListener("pageshow", reset);
      window.removeEventListener("focus", reset);
    };
  }, []);

  return (
    <main className="verify-device-root">
      <div className="verify-device-card">
        <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: 0 }}>
          Phone verification
        </p>
        <h1>Link this phone to your desktop sign-in</h1>
        <p>
          Enter your mobile number to continue. After network verification, your desktop hosted login completes automatically.
        </p>

        {missingLink ? (
          <div className="verify-device-msg err">This link is invalid. Scan the QR again from the desktop window.</div>
        ) : linkStatus === "checking" ? (
          <div className="verify-device-msg" style={{ border: "1px solid rgba(148,163,184,0.3)", color: "#cbd5e1" }}>
            Preparing secure session…
          </div>
        ) : linkStatus === "expired" || linkStatus === "not_found" ? (
          <div className="verify-device-msg err">This session expired. Go back to your desktop and open a new QR.</div>
        ) : checkingExistingSession ? (
          <div className="verify-device-msg" style={{ border: "1px solid rgba(148,163,184,0.3)", color: "#cbd5e1" }}>
            Checking existing session…
          </div>
        ) : linkStatus === "approved" || linkStatus === "claimed" ? (
          <div className="verify-device-msg ok">This desktop session is already linked. You can return to your computer.</div>
        ) : (
          <form
            method="POST"
            action={authorizePostAction}
            onSubmit={MOCK ? handleMockFormSubmit : undefined}
          >
            <input type="hidden" name="linkId" value={linkId} />
            {returnUrl && /^https?:\/\//i.test(returnUrl) ? (
              <input type="hidden" name="returnUrl" value={returnUrl} />
            ) : null}
            <label htmlFor="device-link-phone" style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              Mobile number
            </label>
            <input
              id="device-link-phone"
              name="phone"
              type="tel"
              className="verify-device-input"
              value={phone}
              onChange={(e) => {
                if (submitting) setSubmitting(false);
                setPhone(e.target.value);
              }}
              placeholder="E.164 e.g. 353871234567"
              autoComplete="tel"
              required
            />
            <button
              type="submit"
              className="verify-device-btn"
              disabled={!phone.trim() || submitting || mockSubmitting}
            >
              {MOCK
                ? mockSubmitting
                  ? "Verifying…"
                  : "Verify (local mock)"
                : submitting
                  ? "Opening verification…"
                  : "Continue"}
            </button>
            {MOCK ? (
              <button
                type="button"
                className="verify-device-btn"
                style={{ marginTop: "0.5rem", background: "#334155", color: "#e2e8f0" }}
                disabled={!phone.trim() || mockSubmitting || submitting}
                onClick={() => void handleMockVerify()}
              >
                {mockSubmitting ? "Verifying…" : "Instant mock verify"}
              </button>
            ) : null}
          </form>
        )}
      </div>
    </main>
  );
}

export default function DeviceVerifyClient({ authorizePostAction }: Props) {
  return (
    <Suspense
      fallback={
        <main className="verify-device-root">
          <p style={{ color: "#94a3b8" }}>Loading…</p>
        </main>
      }
    >
      <DeviceVerifyInner authorizePostAction={authorizePostAction} />
    </Suspense>
  );
}
