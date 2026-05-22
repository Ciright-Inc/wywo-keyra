"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HeaderNoSSR } from "./HeaderNoSSR";
import { ElevenLabsHomeAgent } from "@/components/home/ElevenLabsHomeAgent";

const MINIMAL_PATH_PREFIXES = ["/verify-device", "/hosted-login", "/callback"];

function isMinimalChrome(pathname: string): boolean {
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/admin/login/")
  ) {
    return true;
  }
  return MINIMAL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Hides marketing header/footer on focused auth flows (device verify, hosted login, OAuth callback). */
export function KeyraAppChrome({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const minimal = isMinimalChrome(pathname);

  if (minimal) {
    return <main className="min-w-0 flex-1">{children}</main>;
  }

  return (
    <>
      <HeaderNoSSR />
      <div
        className="pointer-events-none shrink-0"
        style={{ height: "var(--keyra-header-offset)" }}
        aria-hidden
      />
      <main className="min-w-0 flex-1">{children}</main>
      <ElevenLabsHomeAgent />
      {footer}
    </>
  );
}
