"use client";

import dynamic from "next/dynamic";
import { useGlobeAuthFeedPulses } from "@/hooks/useGlobeAuthFeedPulses";
import { useGlobePulseBatch } from "@/hooks/useGlobePulseBatch";
import { useGlobePulseEvents } from "@/hooks/useGlobePulseEvents";

function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "ChunkLoadError" || /loading chunk/i.test(err.message);
}

/** Retry dynamic import once after dev HMR / dev:clean invalidates old chunk URLs. */
function importGlobeScene() {
  const load = () =>
    import("@/components/home/globe/KeyraRealisticGlobeScene").then((m) => m.default);

  return load().catch((err) => {
    if (!isChunkLoadError(err)) throw err;
    return new Promise<Awaited<ReturnType<typeof load>>>((resolve, reject) => {
      window.setTimeout(() => {
        load().then(resolve).catch(reject);
      }, 400);
    });
  });
}

const KeyraRealisticGlobeScene = dynamic(() => importGlobeScene(), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[160px] bg-[#fafafa]" aria-hidden />,
});

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
  const authFeedPulses = useGlobeAuthFeedPulses();
  const randomEvents = useGlobePulseEvents();
  const randomPulses = useGlobePulseBatch(randomEvents);
  const { activePulses, activeLinks } = authFeedPulses.synced
    ? authFeedPulses
    : randomPulses;

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel ?? "Photorealistic Earth globe with live verification signals"}
      suppressHydrationWarning
    >
      <KeyraRealisticGlobeScene
        opaque={opaque}
        activePulses={activePulses}
        activeLinks={activeLinks}
      />
    </div>
  );
}
