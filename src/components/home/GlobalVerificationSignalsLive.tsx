"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

const formatNumber = (value: number) =>
  value.toLocaleString("en", { maximumFractionDigits: 0 });

type GlobalVerificationSignalsLiveProps = {
  /** `hero` / `bento` — home widgets; `globe` — globe overlay panels. */
  variant?: "hero" | "bento" | "globe";
  className?: string;
};

export function GlobalVerificationSignalsLive({
  variant = "hero",
  className = "",
}: GlobalVerificationSignalsLiveProps) {
  const [total, setTotal] = useState(2_801_077);
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

  if (variant === "globe") {
    return (
      <div className={className}>
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
      </div>
    );
  }

  const compact = variant === "hero" || variant === "bento";

  return (
    <div className={cn(className)}>
      <p
        className={cn(
          "mt-3 font-mono font-semibold leading-none tracking-tight tabular-nums text-[var(--color-ink)]",
          compact ? "text-[clamp(1.35rem,4vw,1.65rem)]" : "text-[1.65rem]",
        )}
      >
        {formatNumber(total)}
      </p>
      <div
        className={cn(
          "mt-3 gap-x-4 gap-y-2",
          compact ? "grid grid-cols-2" : "flex flex-wrap gap-5",
        )}
      >
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium tabular-nums text-[var(--color-ink)]">
            {formatNumber(perSecond)}
          </p>
          <p className="text-[10px] text-[var(--color-body)]">Per second</p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium tabular-nums text-[var(--color-ink)]">
            {formatNumber(perMinute)}
          </p>
          <p className="text-[10px] text-[var(--color-body)]">Per minute</p>
        </div>
      </div>
    </div>
  );
}
