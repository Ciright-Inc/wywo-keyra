"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** SSR-safe reduced motion — false until after mount, then matches user preference. */
export function useDeferredReducedMotion(): boolean {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready && Boolean(prefersReducedMotion);
}
