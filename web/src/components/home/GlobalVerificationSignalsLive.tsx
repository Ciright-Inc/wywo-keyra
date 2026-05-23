"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/components/ui/cn";
import { useCountUp } from "@/components/motion/useCountUp";

const formatNumber = (value: number) =>
  value.toLocaleString("en", { maximumFractionDigits: 0 });

/** Hero widget display target — count-up animates to this on first viewport entry. */
export const GLOBAL_VERIFICATION_SIGNALS_BASE = 3_400_000;
export const GLOBAL_VERIFICATION_SIGNALS_TARGET = 3_527_375;

type GlobalVerificationSignalsLiveProps = {
  /** `hero` matches the home page widget; `globe` matches globe overlay panels. */
  variant?: "hero" | "globe";
  className?: string;
};

export function GlobalVerificationSignalsLive({
  variant = "hero",
  className = "",
}: GlobalVerificationSignalsLiveProps) {
  const isHero = variant === "hero";
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [countUpDone, setCountUpDone] = useState(!isHero || !!reduceMotion);

  const [total, setTotal] = useState(GLOBAL_VERIFICATION_SIGNALS_TARGET);
  const [perSecond, setPerSecond] = useState(4_822);
  const [perMinute, setPerMinute] = useState(289_320);

  const animatedTotal = useCountUp({
    from: GLOBAL_VERIFICATION_SIGNALS_BASE,
    to: GLOBAL_VERIFICATION_SIGNALS_TARGET,
    duration: 2,
    enabled: inView && isHero && !reduceMotion,
    onComplete: () => setCountUpDone(true),
  });

  const displayTotal = countUpDone ? total : animatedTotal;

  useEffect(() => {
    if (!countUpDone) return;

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
  }, [countUpDone]);

  if (variant === "globe") {
    return (
      <div ref={ref} className={className}>
        <div className="mt-0.5 text-[clamp(0.95rem,0.85vw+0.65rem,1.12rem)] font-semibold leading-none tracking-[var(--keyra-tracking-head)] text-keyra-primary">
          {formatNumber(displayTotal)}
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

  return (
    <div ref={ref} className={cn(className)}>
      <p className="mt-3 font-mono text-[1.65rem] font-semibold leading-none tracking-tight tabular-nums text-slate-900">
        {formatNumber(displayTotal)}
      </p>
      <div className="mt-3 flex gap-5">
        <div>
          <p className="font-mono text-xs font-medium tabular-nums text-slate-900">
            {formatNumber(perSecond)}
          </p>
          <p className="text-[10px] text-slate-500">Per second</p>
        </div>
        <div>
          <p className="font-mono text-xs font-medium tabular-nums text-slate-900">
            {formatNumber(perMinute)}
          </p>
          <p className="text-[10px] text-slate-500">Per minute</p>
        </div>
      </div>
    </div>
  );
}
