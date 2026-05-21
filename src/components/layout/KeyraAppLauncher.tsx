"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { getKeyraAdminAppLinks } from "@/lib/keyraAppUrls";

type LauncherApp = {
  id: string;
  label: string;
  description: string;
  href: string;
};

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

function AppTileIcon({ label }: { label: string }) {
  return (
    <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl border border-black/20 bg-keyra-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <Image
        src="/keyra-app-mark.png"
        alt=""
        fill
        sizes="40px"
        className="scale-[1.18] object-contain opacity-35"
        aria-hidden
        unoptimized
      />
      <span className="relative rounded-sm bg-white px-0.5 py-0.5 text-[10px] font-semibold leading-none text-keyra-primary shadow-sm ring-1 ring-black/[0.06]">
        {label.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}

export function KeyraAppLauncher() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<LauncherApp[]>(() => (isAdminRoute ? [] : getKeyraAdminAppLinks()));
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiles = useMemo(() => apps, [apps]);

  function refreshLauncherApps() {
    if (isAdminRoute) setApps([]);
    fetch(`/api/deployments/apps/launcher?t=${Date.now()}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { apps?: LauncherApp[] } | null) => {
        if (Array.isArray(data?.apps) && data.apps.length > 0) setApps(data.apps);
      })
      .catch(() => {
        if (!isAdminRoute) setApps(getKeyraAdminAppLinks());
      });
  }

  useEffect(() => {
    if (isAdminRoute) setApps([]);
    if (!isAdminRoute) refreshLauncherApps();
    return () => {
      // Keep the hook shape stable for Fast Refresh.
    };
  }, [isAdminRoute]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Keyra apps"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[var(--keyra-radius-pill)] border border-keyra-border transition-colors duration-150 ease-out active:border-[rgba(255,255,255,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35",
          "hover:border-black/14 hover:bg-black/[0.04]",
          open && "border-black/18 bg-black/[0.05]",
        )}
        onClick={(e) => {
          e.stopPropagation();
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) refreshLauncherApps();
        }}
      >
        <NineDotTriggerIcon />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Keyra apps"
          className="absolute right-0 top-[calc(100%+8px)] z-[65] flex max-h-[min(34rem,calc(100vh-6rem))] w-[min(calc(100vw-1.5rem),20rem)] flex-col rounded-xl border border-black/12 bg-keyra-bg p-3 shadow-[0_24px_64px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.05)] sm:w-[20rem]"
        >
          <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-keyra-text-2">
            Keyra apps
          </p>
          <ul className="keyra-app-launcher-scroll grid min-h-0 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {tiles.map((item) => (
              <li key={item.id} className="min-w-0">
                <a
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.label} — ${item.description}`}
                  className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-transparent px-1 py-2 text-center transition hover:border-black/12 hover:bg-keyra-surface focus:outline-none focus-visible:border-black/30 focus-visible:ring-2 focus-visible:ring-black/20"
                  onClick={() => setOpen(false)}
                >
                  <AppTileIcon label={item.label} />
                  <span className="line-clamp-2 w-full text-[10px] font-medium leading-tight text-keyra-primary">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
