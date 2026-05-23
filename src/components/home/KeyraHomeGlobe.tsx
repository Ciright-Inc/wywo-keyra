"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { useGlobePulseBatch } from "@/hooks/useGlobePulseBatch";
import { useGlobePulseEvents } from "@/hooks/useGlobePulseEvents";
import type { KeyraRealisticGlobeSceneProps } from "@/components/home/globe/KeyraRealisticGlobeScene";

type KeyraHomeGlobeProps = {
  className?: string;
  "aria-label"?: string;
  /** Opaque white canvas — crisp circle edge on light hero cards. */
  opaque?: boolean;
};

/**
 * Photorealistic Earth with simsecure-style verification pulses (three.js / R3F).
 */
export function KeyraHomeGlobe({
  className = "",
  "aria-label": ariaLabel,
  opaque = false,
}: KeyraHomeGlobeProps) {
  const events = useGlobePulseEvents();
  const { activePulses, activeLinks } = useGlobePulseBatch(events);
  const [Scene, setScene] = useState<ComponentType<KeyraRealisticGlobeSceneProps> | null>(null);

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
      aria-label={ariaLabel ?? "Photorealistic Earth globe with live verification signals"}
      suppressHydrationWarning
    >
      {Scene ? (
        <Scene opaque={opaque} activePulses={activePulses} activeLinks={activeLinks} />
      ) : (
        <div className="h-full w-full min-h-[160px] bg-[#fafafa]" aria-hidden />
      )}
    </div>
  );
}
