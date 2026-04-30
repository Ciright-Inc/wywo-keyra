"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { decodeIpificationState } from "@/lib/ipificationState";
import { ensureApiOriginUrl } from "@/lib/ensureApiOriginUrl";

function authBackendBase(): string {
  return ensureApiOriginUrl(process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "");
}

/**
 * IPification / Keycloak may return ?code=&state= (query) or #code=&state= (fragment).
 * Failures use ?error=&error_description= instead of code.
 */
function readOAuthFromBrowser(): {
  code: string;
  state: string;
  error: string;
  errorDescription: string;
} {
  if (typeof window === "undefined") {
    return { code: "", state: "", error: "", errorDescription: "" };
  }
  const q = new URLSearchParams(window.location.search);
  let code = q.get("code") ?? "";
  let state = q.get("state") ?? "";
  let error = q.get("error") ?? "";
  let errorDescription = q.get("error_description") ?? "";

  const rawHash = window.location.hash.replace(/^#/, "");
  if (rawHash) {
    const hq = new URLSearchParams(rawHash);
    if (!code) code = hq.get("code") ?? "";
    if (!state) state = hq.get("state") ?? "";
    if (!error) error = hq.get("error") ?? "";
    if (!errorDescription) errorDescription = hq.get("error_description") ?? "";
  }

  if (errorDescription) {
    try {
      errorDescription = decodeURIComponent(errorDescription.replace(/\+/g, " "));
    } catch {
      /* keep raw */
    }
  }
  return { code, state, error, errorDescription };
}

function IpificationCallbackInner() {
  const hasCalledBackendRef = useRef(false);
  const { code, state, error, errorDescription } = readOAuthFromBrowser();
  const parsedState = decodeIpificationState(state);
  const base = authBackendBase();

  const initialMessage =
    error
      ? errorDescription ||
        error ||
        "Phone verification was cancelled or failed. Close this tab and start again from your app."
      : !code
        ? "No code received from IPification. Please try login again. " +
          "Set IPIFICATION_REDIRECT_URI and the IPification client redirect to https://keyra.ie/api/ipification/oidc-return " +
          "(handles POST form_post); that route forwards to /callback. Legacy GET-only: https://keyra.ie/callback."
        : !parsedState?.phone
          ? "Invalid verification state. Try again from the verify page."
          : !base
            ? "Auth service URL is not configured on Keyra."
            : "Completing verification…";

  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (hasCalledBackendRef.current) return;
    if (error || !code || !parsedState?.phone || !base) {
      hasCalledBackendRef.current = true;
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
  }, [base, code, error, parsedState?.linkId, parsedState?.phone, parsedState?.returnUrl]);

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
