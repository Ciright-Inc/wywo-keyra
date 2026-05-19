"use client";

import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

export function AccountMenu() {
  const { user, headerLabel, logout } = useKeyraSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex h-10 max-w-[min(46vw,220px)] items-center gap-2 rounded-[var(--keyra-radius-pill)] border border-keyra-border px-3 text-left text-[13px] font-medium text-keyra-primary transition duration-300 ease-out hover:border-[rgba(255,255,255,0.14)] sm:max-w-[260px] sm:px-4 sm:text-sm",
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span className="truncate">{headerLabel}</span>
        <span className="text-keyra-text-2" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] min-w-[220px] rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-keyra-surface py-2 shadow-[var(--keyra-shadow-hover)]"
        >
          <div className="border-b border-keyra-border px-4 py-3">
            <p className="truncate text-[14px] font-semibold text-keyra-primary">
              {headerLabel}
            </p>
            <p className="mt-1 truncate text-[12px] text-keyra-text-2">
              {formatPhoneDisplay(user.phoneE164)}
            </p>
          </div>
          <Link
            role="menuitem"
            href="/app/profile"
            className="block px-4 py-2.5 text-[14px] text-keyra-text transition hover:bg-keyra-bg"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            role="menuitem"
            href="/app/family"
            className="block px-4 py-2.5 text-[14px] text-keyra-text transition hover:bg-keyra-bg"
            onClick={() => setOpen(false)}
          >
            Family
          </Link>
          <Link
            role="menuitem"
            href="/app/settings"
            className="block px-4 py-2.5 text-[14px] text-keyra-text transition hover:bg-keyra-bg"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <Link
            role="menuitem"
            href="/app"
            className="block px-4 py-2.5 text-[14px] text-keyra-text transition hover:bg-keyra-bg"
            onClick={() => setOpen(false)}
          >
            My Keyra
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-2.5 text-left text-[14px] text-keyra-text transition hover:bg-keyra-bg"
            onClick={async () => {
              await logout();
              setOpen(false);
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
