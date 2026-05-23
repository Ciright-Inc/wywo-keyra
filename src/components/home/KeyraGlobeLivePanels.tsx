"use client";

import Link from "next/link";
import { GlobalVerificationSignalsLive } from "@/components/home/GlobalVerificationSignalsLive";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import { LatestAuthenticationsFeed } from "@/components/home/LatestAuthenticationsFeed";
import { cn } from "@/components/ui/cn";

const panelBase = "keyra-card keyra-card--media-hud box-border";

const labelEyebrow =
  "text-[0.52rem] font-medium uppercase tracking-[0.16em] text-keyra-text-2/90";

type PanelProps = { className?: string };

/** Keyra–style: stacked on mobile; on lg, anchored top-right over the globe stage. */
export function KeyraGlobeLiveStatPanel({ className = "" }: PanelProps) {
  return (
    <div
      className={cn(
        panelBase,
        "order-1 w-full p-3 lg:pointer-events-auto lg:absolute lg:top-1 lg:right-0 lg:z-20 lg:w-auto lg:max-w-[212px] lg:translate-x-[8%] lg:-translate-y-[12%] lg:rounded-xl lg:p-2 lg:pl-2.5",
        className,
      )}
      aria-label="Global verification signals"
    >
      <p className={cn("mb-1", labelEyebrow)}>Global verification signals</p>
      <GlobalVerificationSignalsLive variant="globe" />
      <Link
        href="/global-deployment"
        {...NEW_TAB_LINK}
        className={cn(
          "mt-3 flex w-full items-center justify-center rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-3 py-2 text-center text-[clamp(0.62rem,0.28vw+0.5rem,0.72rem)] font-medium leading-snug tracking-wide text-keyra-primary no-underline transition duration-300 ease-out hover:border-[var(--keyra-border)] hover:bg-[rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:keyra-focus lg:mt-2",
        )}
      >
        Global numbers verified — live by region
      </Link>
    </div>
  );
}

/** Keyra–style: stacked on mobile; on lg, anchored lower-left over the globe stage. */
export function KeyraGlobeLiveActivityPanel({ className = "" }: PanelProps) {
  return (
    <div
      className={cn(
        panelBase,
        "order-3 w-full p-3.5 lg:pointer-events-auto lg:absolute lg:left-[calc(50%-288px)] lg:right-auto lg:top-[calc(50%+118px)] lg:bottom-auto lg:z-20 lg:w-auto lg:min-w-[278px] lg:max-w-[min(320px,48vw)] lg:translate-x-0 lg:translate-y-0 lg:p-4",
        className,
      )}
      aria-label="Latest authentications"
    >
      <p className={cn("mb-2", labelEyebrow)}>Latest authentications</p>
      <LatestAuthenticationsFeed />
    </div>
  );
}
