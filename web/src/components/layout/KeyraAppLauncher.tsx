"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  getKeyraEcosystemAppLinks,
  keyraLauncherAppsApiUrl,
  type KeyraEcosystemAppLink,
} from "@/lib/keyraAppUrls";

function NineDotTriggerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-keyra-primary", className)}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AppLauncherTile({
  item,
  onNavigate,
}: {
  item: KeyraEcosystemAppLink;
  onNavigate: () => void;
}) {
  return (
    <li className="min-w-0">
      <a
        role="menuitem"
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={`${item.label} — ${item.description}`}
        className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-1 py-2 text-center transition hover:border-black/12 hover:bg-keyra-surface"
        onClick={onNavigate}
      >
        <span className="flex size-9 items-center justify-center rounded-md border border-black/[0.08] bg-keyra-surface text-[10px] font-semibold leading-tight text-keyra-accent">
          {item.label.slice(0, 2)}
        </span>
        <span className="line-clamp-2 w-full text-[10px] font-medium leading-tight text-keyra-primary">
          {item.label}
        </span>
      </a>
    </li>
  );
}

export function KeyraAppLauncher() {
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<KeyraEcosystemAppLink[]>(() => getKeyraEcosystemAppLinks());
  const [privateApps, setPrivateApps] = useState<KeyraEcosystemAppLink[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiles = useMemo(() => apps, [apps]);
  const privateTiles = useMemo(() => privateApps, [privateApps]);
  const showPrivateSection = privateTiles.length > 0;
  const launcherApi = keyraLauncherAppsApiUrl();

  const refresh = useCallback(async () => {
    const fallback = getKeyraEcosystemAppLinks();
    try {
      const res = await fetch(`${launcherApi}?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        apps?: KeyraEcosystemAppLink[];
        privateApps?: KeyraEcosystemAppLink[];
      };
      if (Array.isArray(data?.apps) && data.apps.length > 0) setApps(data.apps);
      else setApps(fallback);
      setPrivateApps(Array.isArray(data?.privateApps) ? data.privateApps : []);
    } catch {
      setApps(fallback);
      setPrivateApps([]);
    }
  }, [launcherApi]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    void refresh();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, refresh]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Keyra apps"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[var(--keyra-radius-pill)] border border-keyra-border transition-colors duration-150 ease-out active:border-[rgba(255,255,255,0.14)]",
          "hover:border-black/14 hover:bg-black/[0.04]",
          open && "border-black/18 bg-black/[0.05]",
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <NineDotTriggerIcon />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Keyra apps"
          className="absolute right-0 top-[calc(100%+8px)] z-[65] w-[min(calc(100vw-1.5rem),20rem)] rounded-[var(--keyra-radius-sheet)] border border-black/12 bg-keyra-bg p-3 shadow-[0_24px_64px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.05)] sm:w-[20rem]"
        >
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
            Keyra apps
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {tiles.map((item) => (
              <AppLauncherTile key={item.id} item={item} onNavigate={() => setOpen(false)} />
            ))}
            {showPrivateSection ? (
              <>
                <li className="col-span-3 list-none py-1" role="separator" aria-hidden>
                  <div className="h-px bg-black/10" />
                </li>
                <li className="col-span-3 list-none px-1 pt-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2">
                    Private apps
                  </p>
                </li>
              </>
            ) : null}
            {privateTiles.map((item) => (
              <AppLauncherTile key={`private-${item.id}`} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
