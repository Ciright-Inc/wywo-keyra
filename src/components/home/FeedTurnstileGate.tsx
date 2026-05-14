"use client";

import { useEffect, useRef } from "react";

/** Optional Cloudflare Turnstile gate when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set. */
export function FeedTurnstileGate({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !hostRef.current) return;

    const mount = () => {
      const el = hostRef.current;
      const api = window.turnstile;
      if (!el || !api) return;
      if (widgetIdRef.current) {
        api.remove?.(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      widgetIdRef.current = api.render(el, {
        sitekey: siteKey,
        callback: onToken,
      });
    };

    if (window.turnstile) {
      mount();
      return () => {
        const id = widgetIdRef.current;
        if (id && window.turnstile?.remove) window.turnstile.remove(id);
        widgetIdRef.current = null;
      };
    }

    const existing = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    const script = existing instanceof HTMLScriptElement ? existing : document.createElement("script");
    if (!existing) {
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", mount);
    return () => {
      script.removeEventListener("load", mount);
      const id = widgetIdRef.current;
      if (id && window.turnstile?.remove) window.turnstile.remove(id);
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <div className="rounded-md border border-keyra-border/60 bg-keyra-bg/40 p-2">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-keyra-text-2">Verify to load live feed</p>
      <div ref={hostRef} className="min-h-[65px]" />
    </div>
  );
}
