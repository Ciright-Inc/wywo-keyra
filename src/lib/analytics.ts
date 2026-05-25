/**
 * Plausible custom events — requires PlausibleScripts / tagged-events on the page.
 */
export type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: PlausibleProps },
    ) => void;
  }
}

export function trackPlausible(event: string, props?: PlausibleProps): void {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.plausible === "function") {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch {
    /* analytics must never break UX */
  }
}
