"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LatestAuthenticationsFeed } from "@/components/home/LatestAuthenticationsFeed";
import { cn } from "@/components/ui/cn";

const formatNumber = (value: number) =>
  value.toLocaleString("en", { maximumFractionDigits: 0 });

const panelBase = "keyra-card box-border";

const labelEyebrow =
  "text-[0.52rem] font-medium uppercase tracking-[0.16em] text-keyra-text-2/90";

function LiveStatsInner() {
  const [total, setTotal] = useState(2_157_774);
  const [perSecond, setPerSecond] = useState(4_822);
  const [perMinute, setPerMinute] = useState(289_320);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPerSecond((prev) => {
        const jitter = Math.round((Math.random() - 0.5) * 90);
        const next = Math.max(3600, prev + jitter);
        setPerMinute(next * 60);
        setTotal((current) => current + next);
        return next;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mt-0.5 text-[clamp(0.95rem,0.85vw+0.65rem,1.12rem)] font-semibold leading-none tracking-[var(--keyra-tracking-head)] text-keyra-primary">
        {formatNumber(total)}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-1.5 lg:gap-x-2 lg:gap-y-1.5">
        <div>
          <strong className="block text-[clamp(0.58rem,0.2vw+0.48rem,0.68rem)] font-medium text-keyra-primary/95">
            {formatNumber(perSecond)}
          </strong>
          <span className="mt-0.5 block text-[clamp(0.45rem,0.15vw+0.38rem,0.52rem)] text-keyra-text-2 lg:mt-px">
            Per second
          </span>
        </div>
        <div>
          <strong className="block text-[clamp(0.58rem,0.2vw+0.48rem,0.68rem)] font-medium text-keyra-primary/95">
            {formatNumber(perMinute)}
          </strong>
          <span className="mt-0.5 block text-[clamp(0.45rem,0.15vw+0.38rem,0.52rem)] text-keyra-text-2 lg:mt-px">
            Per minute
          </span>
        </div>
      </div>
    </>
  );
}

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
      <LiveStatsInner />
      <Link
        href="/global-deployment"
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
