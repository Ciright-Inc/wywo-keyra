"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

type KeyraHomeGlobeProps = {
  className?: string;
  "aria-label"?: string;
};

/**
 * Photorealistic Earth (three.js / R3F). Scene loads only after mount so SSR and the
 * first client paint match — avoids hydration mismatches from `next/dynamic` wrappers.
 */
export function KeyraHomeGlobe({ className = "", "aria-label": ariaLabel }: KeyraHomeGlobeProps) {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/components/home/globe/KeyraRealisticGlobeScene").then((mod) => {
      if (!cancelled) setScene(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel ?? "Photorealistic Earth globe"}
      suppressHydrationWarning
    >
      {Scene ? (
        <Scene />
      ) : (
        <div className="h-full w-full min-h-[160px] bg-[#fafafa]" aria-hidden />
      )}
    </div>
  );
}
