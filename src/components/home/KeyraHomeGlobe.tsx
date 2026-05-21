"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

type KeyraHomeGlobeProps = {
  className?: string;
  "aria-label"?: string;
  /** Opaque white canvas — crisp circle edge on light hero cards. */
  opaque?: boolean;
};

/**
 * Photorealistic Earth (three.js / R3F). Scene loads only after mount so SSR and the
 * first client paint match — avoids hydration mismatches from `next/dynamic` wrappers.
 */
export function KeyraHomeGlobe({
  className = "",
  "aria-label": ariaLabel,
  opaque = false,
}: KeyraHomeGlobeProps) {
  const [Scene, setScene] = useState<ComponentType<{ opaque?: boolean }> | null>(null);

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
        <Scene opaque={opaque} />
      ) : (
        <div className="h-full w-full min-h-[160px] bg-[#fafafa]" aria-hidden />
      )}
    </div>
  );
}
