"use client";

import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useClientReady } from "@/lib/useClientReady";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20v-1a6.5 6.5 0 0 1 13 0v1" />
    </svg>
  );
}

function accountMenuInitials(label: string | null): string | null {
  if (!label || /^\+?[\d\s().-]+$/.test(label.trim())) return null;
  const parts = label.trim().split(/\s+/).filter((p) => /[A-Za-z]/.test(p));
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return null;
}

function AccountMenuIdentityMark({
  label,
  size = "sm",
}: {
  label: string | null;
  size?: "sm" | "md";
}) {
  const initials = accountMenuInitials(label);
  const isMd = size === "md";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-keyra-accent to-keyra-accent-2 text-white",
        "shadow-[0_2px_10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.28)]",
        "ring-2 ring-white/90",
        isMd ? "size-10" : "size-7",
      )}
      aria-hidden
    >
      {initials ? (
        <span
          className={cn(
            "font-semibold leading-none tracking-tight",
            isMd ? "text-[13px]" : "text-[11px]",
          )}
        >
          {initials}
        </span>
      ) : (
        <PersonIcon className={isMd ? "size-6" : "size-5"} />
      )}
      <span
        className="absolute -bottom-px -right-px size-2 rounded-full border-[1.5px] border-white bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.55)]"
        aria-hidden
      />
    </span>
  );
}

export function AccountMenu() {
  const { user, headerLabel, logout } = useKeyraSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clientReady = useClientReady();

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
          "flex h-10 max-w-[min(40vw,12rem)] items-center gap-2 rounded-[var(--keyra-radius-pill)] border pl-1 pr-2 text-left text-[13px] font-semibold text-keyra-primary",
          "border-keyra-border/90 bg-keyra-surface/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md",
          "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
          "hover:border-black/14 hover:bg-keyra-surface hover:shadow-[0_4px_14px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.55)]",
          "active:scale-[0.99]",
          open &&
            "border-keyra-accent/35 bg-keyra-surface shadow-[0_4px_18px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-keyra-accent/20",
          "sm:max-w-[260px] sm:gap-2.5 sm:pr-2.5 sm:text-sm",
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <AccountMenuIdentityMark label={headerLabel} />
        <span className="min-w-0 truncate">{headerLabel}</span>
        <ChevronDownIcon
          className={cn(
            "shrink-0 text-keyra-text-2 transition-[transform,color] duration-150",
            open && "rotate-180 text-keyra-accent",
          )}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-[60] min-w-[220px] rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-keyra-surface py-2 shadow-[var(--keyra-shadow-hover)]"
        >
          <div className="flex items-center gap-3 border-b border-keyra-border bg-gradient-to-br from-keyra-accent/[0.08] via-keyra-accent/[0.03] to-transparent px-4 py-3.5">
            <AccountMenuIdentityMark label={headerLabel} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-keyra-primary">
                {headerLabel}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-keyra-text-2">
                {formatPhoneDisplay(user.phoneE164)}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-keyra-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-keyra-accent">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Signed in
              </p>
            </div>
          </div>
          <Link
            role="menuitem"
            href="/app"
            prefetch={false}
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
              if (clientReady) router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
