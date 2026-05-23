"use client";

import { useEffect, useRef, useState } from "react";
import { easeCircOut } from "@/lib/keyraMotion";

/** Circ-out progress 0→1 (matches Framer `circOut` feel). */
function circOutProgress(t: number): number {
  return 1 - Math.pow(1 - t, 2);
}

type UseCountUpOptions = {
  from: number;
  to: number;
  duration?: number;
  enabled: boolean;
  onComplete?: () => void;
};

export function useCountUp({
  from,
  to,
  duration = 2,
  enabled,
  onComplete,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(from);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!enabled || completedRef.current) return;

    let raf = 0;
    const start = performance.now();
    const delta = to - from;

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const eased = circOutProgress(t);
      setValue(Math.round(from + delta * eased));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setValue(to);
        completedRef.current = true;
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, enabled, from, onComplete, to]);

  return value;
}

/** Exposed for tests / Storybook — documents the easing choice. */
export const countUpEase = easeCircOut;
