"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import { buildAdminGetStartedAccessUrl } from "@/lib/keyraAppUrls";

type Props = {
  reason: "sign_in" | "no_access";
  phoneE164?: string;
  nextPath: string;
};

export function AdminAccessGate({ reason, phoneE164, nextPath }: Props) {
  const loginHref = useMemo(
    () => buildAdminGetStartedAccessUrl(nextPath),
    [nextPath],
  );

  const isNoAccess = reason === "no_access";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full items-stretch overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="ds-badge-pill">Keyra admin</div>
            <h1 className="ds-display-md mt-8">Admin access uses your Keyra login.</h1>
            <p className="ds-body-sm mt-4 max-w-sm text-[var(--ds-body)]">
              Sign in on Keyra with the same mobile number linked to an active admin user record.
            </p>
          </div>

          <div className="grid gap-3">
            {["Sign in on Keyra", "Mobile matched to admin user", "Deployment console access"].map((item) => (
              <div key={item} className="ds-admin-panel flex items-center gap-3 py-3 text-sm font-medium">
                <span className="size-2 rounded-full bg-[var(--ds-ink)]" aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="lg:hidden">
            <p className="ds-caption-uppercase">Keyra admin</p>
            <h2 className="ds-title-md mt-3">{isNoAccess ? "No admin access" : "Sign in on Keyra first"}</h2>
          </div>

          <div className="hidden lg:block">
            <h2 className="ds-title-md">{isNoAccess ? "No admin access" : "Sign in on Keyra first"}</h2>
          </div>

          {isNoAccess ? (
            <div className="ds-body-sm mt-5 space-y-3 text-[var(--ds-body)]">
              <p>
                You are signed in to Keyra
                {phoneE164 ? (
                  <>
                    {" "}
                    as <span className="font-medium text-[var(--ds-ink)]">{formatPhoneDisplay(phoneE164)}</span>
                  </>
                ) : null}
                , but this mobile number does not have active admin rights.
              </p>
              <p>Contact a global administrator if you need deployment admin access.</p>
            </div>
          ) : (
            <div className="ds-body-sm mt-5 space-y-3 text-[var(--ds-body)]">
              <p>Admin uses the same Keyra session as the main site. Sign in first, then return here.</p>
              <p>After login, access is granted only when your mobile number matches an active admin user.</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {!isNoAccess ? (
              <a href={loginHref} className="ds-btn-primary">
                Login on Keyra
              </a>
            ) : null}
            <Link href="/" className="ds-btn-secondary">
              Back to Keyra home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
