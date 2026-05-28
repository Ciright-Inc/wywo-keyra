"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { WywoDigitalSlip } from "./WywoDigitalSlip";
import { WywoSlipLandingActions } from "./WywoSlipLandingActions";

type Props = {
  initialSignedIn: boolean;
};

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/**
 * Client shell for /wywo — syncs Keyra session after login,
 * shows dashboard link + submit only when authenticated.
 */
export function WywoSlipLandingClient({ initialSignedIn }: Props) {
  const router = useRouter();
  const { isAuthenticated, initialized, refresh } = useKeyraSession();
  const [sessionReady, setSessionReady] = useState(initialSignedIn);
  const [isLocal, setIsLocal] = useState(false);

  const signedIn = initialized ? isAuthenticated : sessionReady || initialSignedIn;

  const syncSession = useCallback(async () => {
    try {
      await fetch("/api/keyra/session/sync", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      /* ignore */
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
      }
    }
  }, [refresh]);

  useEffect(() => {
    setIsLocal(isLocalDevHost());
    void syncSession();
  }, [syncSession]);

  // If the user logs out (or the session expires) while staying on /wywo, ensure
  // we immediately hide dashboard + submit actions.
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      setSessionReady(false);
    }
  }, [initialized, isAuthenticated]);

  const handleLoginSuccess = useCallback(() => {
    setSessionReady(true);
    void (async () => {
      await syncSession();
      router.refresh();
    })();
  }, [router, syncSession]);

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

      <WywoSlipLandingActions signedIn={signedIn} isLocal={isLocal} />
    </div>
  );
}
