"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import { buildGetStartedAccessUrl, keyraMarketingOrigin } from "@/lib/keyraAppUrls";

type Props = {
  reason: "sign_in" | "no_access";
  phoneE164?: string;
  nextPath: string;
};

export function AdminAccessGate({ reason, phoneE164, nextPath }: Props) {
  const loginHref = useMemo(() => {
    if (typeof window !== "undefined") {
      return buildGetStartedAccessUrl(`${window.location.origin}${nextPath}`);
    }
    return buildGetStartedAccessUrl(`${keyraMarketingOrigin()}${nextPath}`);
  }, [nextPath]);

  const isNoAccess = reason === "no_access";

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--keyra-action)]/45 blur-3xl" />
        <div className="absolute bottom-8 right-10 h-64 w-64 rounded-full bg-keyra-primary/[0.06] blur-3xl" />
      </div>

      <div className="grid w-full items-stretch overflow-hidden rounded-[2rem] border border-keyra-border bg-keyra-surface/80 shadow-[0_28px_90px_rgba(0,0,0,0.10)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-keyra-border bg-keyra-bg/60 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-keyra-border bg-keyra-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">
              Keyra admin
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-keyra-primary">
              Admin access uses your Keyra login.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-keyra-text-2">
              Sign in on Keyra with the same mobile number linked to an active admin user record.
            </p>
          </div>

          <div className="grid gap-3">
            {["Sign in on Keyra", "Mobile matched to admin user", "Deployment console access"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-keyra-border bg-keyra-surface/70 px-4 py-3 text-sm font-medium text-keyra-primary"
              >
                <span className="size-2 rounded-full bg-keyra-primary" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-keyra-text-2">Keyra admin</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-keyra-primary">
              {isNoAccess ? "No admin access" : "Sign in on Keyra first"}
            </h2>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight text-keyra-primary">
              {isNoAccess ? "No admin access" : "Sign in on Keyra first"}
            </h2>
          </div>

          {isNoAccess ? (
            <div className="mt-5 space-y-3 text-sm leading-6 text-keyra-text-2">
              <p>
                You are signed in to Keyra
                {phoneE164 ? (
                  <>
                    {" "}
                    as <span className="font-medium text-keyra-primary">{formatPhoneDisplay(phoneE164)}</span>
                  </>
                ) : null}
                , but this mobile number does not have active admin rights.
              </p>
              <p>Contact a global administrator if you need deployment admin access.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3 text-sm leading-6 text-keyra-text-2">
              <p>Admin uses the same Keyra session as the main site. Sign in first, then return here.</p>
              <p>After login, access is granted only when your mobile number matches an active admin user.</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {!isNoAccess ? (
              <a href={loginHref} className="inline-flex">
                <Button variant="primary" size="lg" type="button">
                  Login on Keyra
                </Button>
              </a>
            ) : null}
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] px-5 py-3 text-sm font-medium text-[var(--ds-ink)] transition hover:bg-[var(--ds-surface-muted)]"
            >
              Back to Keyra home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
