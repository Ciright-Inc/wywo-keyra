"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { HeaderNoSSR } from "./HeaderNoSSR";
import { ElevenLabsHomeAgent } from "@/components/home/ElevenLabsHomeAgent";
import { isMinimalMarketingChrome } from "@/lib/marketingChrome";

/** Hides marketing header on focused auth flows (device verify, hosted login, OAuth callback). */
export function KeyraAppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const minimal = isMinimalMarketingChrome(pathname);

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
    </>
  );
}
