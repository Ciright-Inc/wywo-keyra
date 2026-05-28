"use client";

import Link from "next/link";
import { buildGetStartedAccessUrl, buildKeyraSessionContinueUrl } from "@/lib/keyraAppUrls";

const WYWO_SLIP = "/wywo";

type Props = {
  signedIn: boolean;
  isLocal: boolean;
};

export function WywoSlipLandingActions({ signedIn, isLocal }: Props) {
  void isLocal;
  const signInHref = buildGetStartedAccessUrl(buildKeyraSessionContinueUrl(WYWO_SLIP));

  if (signedIn) {
    return (
      <p className="wywo-slip-actions__hint">
        Signed in with Keyra. Submit your slip below or open the dashboard above.
      </p>
    );
  }

  return (
    <div className="wywo-slip-actions">
      <Link href={signInHref} className="ds-btn-primary">
        Sign in
      </Link>
      <p className="wywo-slip-actions__hint">
        Sign in via Get Started. No anonymous communication — every sender is attributable through
        Keyra identity.
      </p>
    </div>
  );
}
