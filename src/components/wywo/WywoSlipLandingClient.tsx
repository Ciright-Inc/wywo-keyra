"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { WywoDigitalSlip } from "./WywoDigitalSlip";
import { WywoSlipLandingActions } from "./WywoSlipLandingActions";

type Props = {
  initialSignedIn: boolean;
};

type AuthSessionPayload = {
  authenticated?: boolean;
  user?: {
    phone?: string;
    displayName?: string | null;
    fullName?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
};

function userHintFromAuthPayload(payload: AuthSessionPayload | null): {
  phoneE164: string;
  displayName?: string;
  email?: string;
} | null {
  if (!payload?.authenticated || !payload.user?.phone) return null;
  const phone = String(payload.user.phone).trim();
  const phoneE164 = phone.startsWith("+") ? phone : phone ? `+${phone}` : "";
  if (!phoneE164.startsWith("+")) return null;
  const displayName =
    String(payload.user.displayName ?? payload.user.fullName ?? payload.user.name ?? "").trim() ||
    undefined;
  const email =
    typeof payload.user.email === "string" ? payload.user.email.trim() || undefined : undefined;
  return { phoneE164, displayName, email };
}

async function fetchAuthSessionForWywo(signal?: AbortSignal): Promise<AuthSessionPayload | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (res.ok) {
      return (await res.json()) as AuthSessionPayload;
    }
  } catch {
    // continue to direct auth backend (cross-origin Railway / localhost)
  }

  const authBackendUrl =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL?.trim() : "";
  if (!authBackendUrl) return null;

  try {
    const base = authBackendUrl.replace(/\/+$/, "");
    const res = await fetch(`${base}/auth/session`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      signal,
    });
    if (res.ok) {
      return (await res.json()) as AuthSessionPayload;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Client shell for /wywo — mirrors keyra.ie post–Get Started session sync:
 * after verify, global auth is synced into keyra_session; signed-in UI unlocks.
 */
export function WywoSlipLandingClient({ initialSignedIn }: Props) {
  const { isAuthenticated, initialized, refresh } = useKeyraSession();
  const [sessionReady, setSessionReady] = useState(initialSignedIn);
  const syncInFlightRef = useRef(false);

  const signedIn = initialized ? isAuthenticated || sessionReady : sessionReady || initialSignedIn;

  const syncSession = useCallback(async () => {
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    try {
      // Mint/refresh keyra_session from SimSecure auth (proxy on *.keyra.ie, or direct
      // auth backend on Railway when already signed in on app / Get Started).
      const authHint = userHintFromAuthPayload(await fetchAuthSessionForWywo());
      if (authHint) {
        try {
          await fetch("/api/keyra/session/sync", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authHint),
          });
        } catch {
          /* ignore */
        }
      }

      await refresh();

      const me = await fetch("/api/keyra/session/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (me.ok) {
        const json = (await me.json()) as { user?: { phoneE164?: string } | null };
        if (json.user?.phoneE164) {
          setSessionReady(true);
          return;
        }
      }
      if (initialized && !isAuthenticated) {
        setSessionReady(false);
      }
    } finally {
      syncInFlightRef.current = false;
    }
  }, [initialized, isAuthenticated, refresh]);

  // Cross-domain return (Railway / localhost): Get Started appends ?phone= — mint session server-side.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone")?.trim();
    if (!phone?.startsWith("+")) return;

    const nextRaw = params.get("next")?.trim() || "/wywo";
    const next = nextRaw.startsWith("/") ? nextRaw : "/wywo";
    const continueParams = new URLSearchParams({
      next,
      phone,
    });
    const displayName =
      params.get("displayName")?.trim() ||
      params.get("fullName")?.trim() ||
      params.get("name")?.trim() ||
      "";
    if (displayName && displayName.length >= 2 && !displayName.startsWith("+")) {
      continueParams.set("displayName", displayName);
    }
    window.location.replace(`/api/keyra/session/continue?${continueParams.toString()}`);
  }, []);

  useEffect(() => {
    void syncSession();
  }, [syncSession]);

  // Returning from Get Started in another tab or via bfcache — re-sync like keyra admin login.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFocus = () => {
      void syncSession();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        syncInFlightRef.current = false;
      }
      void syncSession();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void syncSession();
      }
    });

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [syncSession]);

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      setSessionReady(true);
    }
  }, [initialized, isAuthenticated]);

  return (
    <div className="wywo-slip-landing__stage">
      {signedIn ? (
        <div className="wywo-slip-landing__topbar">
          <Link href="/wywo/home" className="ds-btn-secondary wywo-slip-landing__dashboard-link">
            Open dashboard
          </Link>
        </div>
      ) : null}

      <header className="wywo-slip-landing__intro">
        <p className="keyra-eyebrow wywo-slip-landing__eyebrow">WYWO · While You Were Out</p>
        <h1 className="keyra-display-hero wywo-slip-landing__title">
          The trusted message layer for the AI era
        </h1>
        <p className="keyra-prose wywo-slip-landing__tagline">
          I no longer receive noise. I receive trusted communications from verified humans and
          verified agents.
        </p>
      </header>

      <WywoDigitalSlip signedIn={signedIn} />

      <WywoSlipLandingActions signedIn={signedIn} />
    </div>
  );
}
