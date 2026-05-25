"use client";

import Link from "next/link";
import { GlobalVerificationSignalsLive } from "@/components/home/GlobalVerificationSignalsLive";
import { cn } from "@/components/ui/cn";
import { keyraGlobalDeploymentUrl } from "@/lib/keyraAppUrls";

const TELEMETRY_ROWS = [
  { city: "Johannesburg", method: "SAT-ID", badge: "S.A.T." },
  { city: "Windhoek", method: "SAT-SIG", badge: "S.A.T." },
  { city: "New York", method: "SAT-SIG", badge: "S.A.T." },
];

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
        href={keyraGlobalDeploymentUrl()}
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
      aria-label="Latest verifications"
    >
      <p className={cn("mb-2", labelEyebrow)}>Latest verifications</p>
      <div className="grid gap-1.5">
        {TELEMETRY_ROWS.map((row) => (
          <div
            key={row.city}
            className="grid grid-cols-[minmax(0,1.6fr)_auto_auto] items-center gap-1.5 text-[clamp(0.58rem,0.24vw+0.52rem,0.68rem)] text-keyra-primary"
          >
            <span className="truncate font-medium">{row.city}</span>
            <span className="text-[clamp(0.48rem,0.2vw+0.43rem,0.56rem)] text-keyra-text-2">{row.method}</span>
            <span className="justify-self-end rounded-[var(--keyra-radius-pill)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] px-1.5 py-0.5 text-[clamp(0.48rem,0.2vw+0.43rem,0.56rem)] font-medium text-keyra-primary">
              {row.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
