"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import {
  fetchBrowserAuthSession,
  userHintFromAuthPayload,
} from "@/lib/keyraAuthSessionClient";
import { WywoDigitalSlip } from "./WywoDigitalSlip";
import { WywoSlipLandingActions } from "./WywoSlipLandingActions";

type Props = {
  initialSignedIn: boolean;
};

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
      const authHint = userHintFromAuthPayload(await fetchBrowserAuthSession());
      if (authHint) {
        try {
          const syncRes = await fetch("/api/keyra/session/sync", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authHint),
          });
          if (!syncRes.ok) {
            await fetch("/api/keyra/session/login", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phoneNumber: authHint.phoneE164,
                displayName: authHint.displayName,
              }),
            });
          }
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
        const stillMe = await fetch("/api/keyra/session/me", {
          credentials: "include",
          cache: "no-store",
        }).catch(() => null);
        if (stillMe?.ok) {
          const json = (await stillMe.json()) as { user?: { phoneE164?: string } | null };
          if (json.user?.phoneE164) {
            setSessionReady(true);
            return;
          }
        }
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

      <WywoSlipLandingActions signedIn={signedIn} onSignedIn={() => void syncSession()} />
    </div>
  );
}
