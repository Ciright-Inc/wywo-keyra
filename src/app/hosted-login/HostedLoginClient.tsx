"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { ensureApiOriginUrl } from "@/lib/ensureApiOriginUrl";

function authBackendBase(): string {
  return ensureApiOriginUrl(process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL || "");
}

function readCvFromHash(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash.replace(/^#/, "");
  return new URLSearchParams(h).get("cv") || "";
}

function HostedLoginInner() {
  const searchParams = useSearchParams();
  const challengeId = (searchParams.get("c") || "").trim();
  /** Browser timer id (avoid NodeJS.Timeout vs number mismatch in typings). */
  const pollRef = useRef<number | null>(null);
  const [meta, setMeta] = useState<{ projectName?: string; status?: string } | null>(null);
  const [linkSession, setLinkSession] = useState<{
    linkId: string;
    desktopSecret: string;
    mobileVerificationUrl: string;
  } | null>(null);
  const [qrSrc, setQrSrc] = useState("");
  const [phase, setPhase] = useState<"loading" | "qr" | "completing" | "error">("loading");
  const [error, setError] = useState("");

  const completeAndFinish = useCallback(async (challenge: string, codeVerifier: string) => {
    const base = authBackendBase();
    if (!base) {
      setError("NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL is not configured.");
      setPhase("error");
      return;
    }
    const res = await fetch(`${base}/hosted-login/complete`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge, codeVerifier: codeVerifier || undefined }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      error_description?: string;
      id_token?: string;
      state?: string;
      redirect_uri?: string;
    };
    if (!res.ok) {
      setError(json.error_description || json.error || `Complete failed (${res.status})`);
      setPhase("error");
      return;
    }
    if (typeof json.id_token === "string" && json.id_token.length > 0) {
      console.log("[hosted-login] id_token (access bearer for your app):", json.id_token);
    }
    const idToken = json.id_token;
    const state = json.state;
    const redirectUri = json.redirect_uri;
    if (window.opener) {
      window.opener.postMessage(
        {
          source: "ciright-hosted-auth",
          id_token: idToken,
          state,
          redirect_uri: redirectUri,
        },
        "*",
      );
      window.close();
      return;
    }
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.hash = `id_token=${encodeURIComponent(idToken || "")}&state=${encodeURIComponent(state || "")}`;
      window.location.replace(url.toString());
    }
  }, []);

  useEffect(() => {
    const base = authBackendBase();
    if (!base) {
      setError("Hosted login is not configured (missing auth backend URL).");
      setPhase("error");
      return;
    }
    if (!challengeId) {
      setError("Missing login challenge. Open this page from your app using the hosted URL returned by the API.");
      setPhase("error");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const m = await fetch(`${base}/hosted-login/challenge/${encodeURIComponent(challengeId)}`);
        const j = (await m.json()) as { projectName?: string; status?: string; error?: string };
        if (!m.ok) throw new Error(j.error || `Challenge lookup failed (${m.status})`);
        if (cancelled) return;
        setMeta({ projectName: j.projectName, status: j.status });
        if (j.status === "expired") {
          setPhase("error");
          setError("This sign-in link has expired. Start again from your app.");
          return;
        }

        const lr = await fetch(`${base}/auth/link-session`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostedChallengeId: challengeId }),
        });
        const linkJson = (await lr.json()) as {
          error?: string;
          linkId?: string;
          desktopSecret?: string;
          mobileVerificationUrl?: string;
        };
        if (!lr.ok) throw new Error(linkJson.error || `Link session failed (${lr.status})`);
        if (cancelled) return;
        if (
          !linkJson.linkId ||
          !linkJson.desktopSecret ||
          !linkJson.mobileVerificationUrl
        ) {
          throw new Error("Invalid link session response");
        }
        setLinkSession({
          linkId: linkJson.linkId,
          desktopSecret: linkJson.desktopSecret,
          mobileVerificationUrl: linkJson.mobileVerificationUrl,
        });
        try {
          const dataUrl = await QRCode.toDataURL(linkJson.mobileVerificationUrl, {
            width: 260,
            margin: 1,
            errorCorrectionLevel: "M",
          });
          if (!cancelled) setQrSrc(dataUrl);
        } catch {
          if (!cancelled) setQrSrc("");
        }
        setPhase("qr");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start hosted login.");
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  useEffect(() => {
    if (!linkSession || phase !== "qr") return;
    const base = authBackendBase();
    const cv = readCvFromHash();

    const tick = async () => {
      try {
        const q = new URLSearchParams({
          linkId: linkSession.linkId,
          desktopSecret: linkSession.desktopSecret,
        });
        const res = await fetch(`${base}/auth/link-session/status?${q}`, { credentials: "include" });
        if (!res.ok) return;
        const j = (await res.json()) as { status?: string };
        if (j.status === "approved") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          const claim = await fetch(`${base}/auth/link-session/claim`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              linkId: linkSession.linkId,
              desktopSecret: linkSession.desktopSecret,
            }),
          });
          const claimJson = (await claim.json().catch(() => ({}))) as {
            error?: string;
            error_description?: string;
            access_token?: string;
          };
          if (!claim.ok) {
            setError(
              claimJson.error_description ||
                claimJson.error ||
                "Could not finalize session after mobile approval.",
            );
            setPhase("error");
            return;
          }
          if (typeof claimJson.access_token === "string" && claimJson.access_token.length > 0) {
            console.log("[hosted-login] access_token (IPification, after mobile verify):", claimJson.access_token);
          }
          setPhase("completing");
          await completeAndFinish(challengeId, cv);
        }
        if (j.status === "expired") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setError("The QR session expired. Close this page and try again from your app.");
          setPhase("error");
        }
      } catch {
        /* ignore poll errors */
      }
    };

    void tick();
    pollRef.current = window.setInterval(() => void tick(), 2500) as unknown as number;
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [linkSession, phase, challengeId, completeAndFinish]);

  if (phase === "error") {
    return (
      <main className="hosted-login-root">
        <h1>Sign in</h1>
        <p className="hosted-login-error">{error}</p>
      </main>
    );
  }

  if (phase === "loading" || phase === "completing") {
    return (
      <main className="hosted-login-root">
        <h1>{meta?.projectName || "Sign in"}</h1>
        <p className="hosted-login-muted">
          {phase === "completing" ? "Finishing sign-in…" : "Preparing secure login…"}
        </p>
      </main>
    );
  }

  const verifyUrl = linkSession?.mobileVerificationUrl || "";

  return (
    <main className="hosted-login-root">
      <h1>{meta?.projectName || "Sign in"}</h1>
      <p className="hosted-login-sub">Scan with your phone to verify, then you&apos;ll return to your app.</p>
      <p className="hosted-login-hint">
        Your phone must be on the <strong>same Wi‑Fi</strong> as this computer. Some cameras don&apos;t offer to open{" "}
        <code className="hosted-login-code">http://</code> links — use the link below if scan does nothing.
      </p>
      {qrSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrSrc} alt="QR code to verify device" className="hosted-login-qr" width={260} height={260} />
      ) : (
        <p className="hosted-login-muted">QR could not be generated — use the link below.</p>
      )}
      <div className="hosted-login-link-box">
        <p className="hosted-login-link-label">Open on your phone (tap or copy)</p>
        <a href={verifyUrl} className="hosted-login-link" target="_blank" rel="noopener noreferrer">
          {verifyUrl || "—"}
        </a>
        <button
          type="button"
          className="hosted-login-copy"
          onClick={() => {
            if (verifyUrl) void navigator.clipboard.writeText(verifyUrl);
          }}
          disabled={!verifyUrl}
        >
          Copy link
        </button>
      </div>
    </main>
  );
}

export default function HostedLoginClient() {
  return (
    <Suspense
      fallback={
        <main className="hosted-login-root">
          <p className="hosted-login-muted">Loading…</p>
        </main>
      }
    >
      <HostedLoginInner />
    </Suspense>
  );
}
