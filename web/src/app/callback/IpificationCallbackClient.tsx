"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { decodeIpificationState } from "@/lib/ipificationState";
import { ensureApiOriginUrl } from "@/lib/ensureApiOriginUrl";

function authBackendBase(): string {
  return ensureApiOriginUrl(process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "");
}

function IpificationCallbackInner() {
  const searchParams = useSearchParams();
  const hasCalledBackendRef = useRef(false);
  const [message, setMessage] = useState("Completing verification…");

  const code = searchParams.get("code") ?? "";
  const state = searchParams.get("state") ?? "";
  const parsedState = useMemo(() => decodeIpificationState(state), [state]);

  useEffect(() => {
    if (hasCalledBackendRef.current) return;

    if (!code) {
      setMessage("Missing authorization code. Close this tab and scan the QR again.");
      return;
    }
    if (!parsedState?.phone) {
      setMessage("Invalid verification state. Try again from the verify page.");
      return;
    }

    const base = authBackendBase();
    if (!base) {
      setMessage("Auth service URL is not configured on Keyra.");
      return;
    }

    const linkId = parsedState.linkId;
    hasCalledBackendRef.current = true;

    void (async () => {
      try {
        const res = await fetch(`${base}/auth/ipification/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            phone: parsedState.phone,
            code,
            linkId,
          }),
        });
        const contentType = res.headers.get("Content-Type") || "";
        if (!res.ok) {
          let detail = `Verification failed (HTTP ${res.status}).`;
          try {
            if (contentType.includes("application/json")) {
              const errJson = (await res.json()) as { error?: string; error_description?: string };
              detail = errJson.error_description || errJson.error || detail;
            } else {
              const t = await res.text();
              if (t) detail = t.slice(0, 300);
            }
          } catch {
            /* ignore */
          }
          setMessage(detail);
          return;
        }

        type CallbackJson = { status?: boolean; linkedDesktop?: boolean; message?: string };
        let json: CallbackJson | null = null;
        if (contentType.includes("application/json")) {
          try {
            json = (await res.json()) as CallbackJson;
          } catch {
            setMessage("Unreadable response from auth service.");
            return;
          }
        }
        if (!json?.status) {
          setMessage(json?.message || "Phone verification did not complete.");
          return;
        }

        let linkedDesktop = Boolean(json.linkedDesktop);
        if (linkId && !linkedDesktop) {
          try {
            const approveRes = await fetch(`${base}/auth/link-session/approve-existing`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ linkId }),
            });
            if (approveRes.ok) {
              const approveJson = (await approveRes.json()) as { status?: boolean; linkedDesktop?: boolean };
              linkedDesktop = Boolean(approveJson.status && approveJson.linkedDesktop);
            }
          } catch {
            /* non-fatal */
          }
        }

        const returnUrl = parsedState.returnUrl?.trim();
        if (returnUrl && /^https?:\/\//i.test(returnUrl)) {
          window.location.replace(returnUrl);
          return;
        }

        setMessage(
          linkedDesktop
            ? "Phone verified. You can return to your computer to finish signing in."
            : "Phone verified. You can close this page.",
        );
      } catch {
        setMessage("Network error while contacting the auth service.");
      }
    })();
  }, [code, parsedState]);

  return (
    <main className="verify-device-root">
      <div className="verify-device-card">
        <p style={{ color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>{message}</p>
      </div>
    </main>
  );
}

export default function IpificationCallbackClient() {
  return (
    <Suspense
      fallback={
        <main className="verify-device-root">
          <p style={{ color: "#94a3b8" }}>Completing verification…</p>
        </main>
      }
    >
      <IpificationCallbackInner />
    </Suspense>
  );
}
