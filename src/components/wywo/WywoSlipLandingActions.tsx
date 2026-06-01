"use client";

import Link from "next/link";
import { useWywoGetStartedSignInHref } from "@/lib/useWywoGetStartedSignInHref";

type Props = {
  signedIn: boolean;
};

export function WywoSlipLandingActions({ signedIn }: Props) {
  const signInHref = useWywoGetStartedSignInHref();

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
