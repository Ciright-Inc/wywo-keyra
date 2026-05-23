"use client";

import { useEffect, useRef, useState } from "react";
import {
  DOT_LIFETIME_MS,
  STREAM_EXPIRE_TRIGGER_COUNT,
  STREAM_FIRST_WAVE_COUNT,
  STREAM_REFILL_WAVE_COUNT,
  STREAM_SECOND_WAVE_COUNT,
  STREAM_SECOND_WAVE_DELAY_MS,
  STREAM_SPAWN_STAGGER_MS,
} from "@/lib/globe/globePulseConstants";
import { spawnPulseFromEvent } from "@/lib/globe/globePulseBatch";
import { syncPulseLinks } from "@/lib/globe/globePulseNetwork";
import { preloadLandMask } from "@/lib/globe/landDetection";
import type { GlobePulse, GlobePulseEvent, GlobePulseLink } from "@/lib/globe/types";

const HEARTBEAT_SPAWN_MS = 900;

function getPool(events: GlobePulseEvent[]) {
  return Array.isArray(events) ? events.filter((event) => event?.id) : [];
}

function pickRandomEvent(pool: GlobePulseEvent[]) {
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function useGlobePulseBatch(events: GlobePulseEvent[]) {
  const [activePulses, setActivePulses] = useState<GlobePulse[]>([]);
  const [activeLinks, setActiveLinks] = useState<GlobePulseLink[]>([]);
  const poolRef = useRef(getPool(events));
  const landMaskRef = useRef<ImageData | null>(null);
  const spawnTimersRef = useRef<number[]>([]);
  const intervalIdsRef = useRef<number[]>([]);
  const prunedSinceBonusRef = useRef(0);
  const spawnLoopActiveRef = useRef(false);

  useEffect(() => {
    poolRef.current = getPool(events);
  }, [events]);

  useEffect(() => {
    let cancelled = false;
    preloadLandMask().then((mask) => {
      if (!cancelled) landMaskRef.current = mask;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearSpawnTimers = () => {
      spawnTimersRef.current.forEach((id) => window.clearTimeout(id));
      spawnTimersRef.current = [];
    };

    const clearIntervals = () => {
      intervalIdsRef.current.forEach((id) => window.clearInterval(id));
      intervalIdsRef.current = [];
    };

    const pushPulse = (pulse: GlobePulse) => {
      setActivePulses((prev) => {
        const next = [...prev, pulse];
        setActiveLinks((links) => syncPulseLinks(next, links));
        return next;
      });
    };

    const addPulse = () => {
      const pool = poolRef.current;
      if (!pool.length || cancelled) return;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const event = pickRandomEvent(pool);
        if (!event) return;
        const pulse = spawnPulseFromEvent(
          event,
          performance.now(),
          landMaskRef.current,
          poolRef.current,
        );
        if (pulse) {
          pushPulse(pulse);
          return;
        }
      }
    };

    const scheduleSpawnWave = (count: number) => {
      if (count <= 0 || cancelled) return;
      for (let index = 0; index < count; index += 1) {
        const timerId = window.setTimeout(() => {
          if (!cancelled) addPulse();
        }, index * STREAM_SPAWN_STAGGER_MS);
        spawnTimersRef.current.push(timerId);
      }
    };

    const onDotsExpired = (removed: number) => {
      if (removed <= 0 || cancelled) return;

      scheduleSpawnWave(removed);

      prunedSinceBonusRef.current += removed;
      if (prunedSinceBonusRef.current >= STREAM_EXPIRE_TRIGGER_COUNT) {
        prunedSinceBonusRef.current = 0;
        scheduleSpawnWave(STREAM_REFILL_WAVE_COUNT);
      }
    };

    const pruneExpired = () => {
      const now = performance.now();
      let removed = 0;

      setActivePulses((prev) => {
        const next = prev.filter((pulse) => now - pulse.startedAt < DOT_LIFETIME_MS);
        removed = prev.length - next.length;
        setActiveLinks((links) => syncPulseLinks(next, links));
        return next;
      });

      onDotsExpired(removed);
    };

    const startLoop = () => {
      if (spawnLoopActiveRef.current || cancelled || !poolRef.current.length) return;
      spawnLoopActiveRef.current = true;

      prunedSinceBonusRef.current = 0;
      scheduleSpawnWave(STREAM_FIRST_WAVE_COUNT);

      const secondWaveId = window.setTimeout(() => {
        if (!cancelled) scheduleSpawnWave(STREAM_SECOND_WAVE_COUNT);
      }, STREAM_SECOND_WAVE_DELAY_MS);
      spawnTimersRef.current.push(secondWaveId);

      intervalIdsRef.current.push(window.setInterval(pruneExpired, 80));
      intervalIdsRef.current.push(
        window.setInterval(() => {
          if (!cancelled) addPulse();
        }, HEARTBEAT_SPAWN_MS),
      );
    };

    if (poolRef.current.length) {
      startLoop();
    } else {
      const poolWaitId = window.setInterval(() => {
        if (cancelled) return;
        if (poolRef.current.length) {
          window.clearInterval(poolWaitId);
          startLoop();
        }
      }, 100);
      intervalIdsRef.current.push(poolWaitId);
    }

    return () => {
      cancelled = true;
      spawnLoopActiveRef.current = false;
      clearIntervals();
      clearSpawnTimers();
    };
  }, []);

  return { activePulses, activeLinks };
}
