"use client";

import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

/** Pencil edit glyph — matches Authentication countries row actions. */
export function AdminEditIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

/** Trash delete glyph — same size/color treatment as AdminEditIcon. */
export function AdminDeleteIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function adminEditIconButtonClass(active?: boolean) {
  return cn(
    "inline-flex size-8 items-center justify-center rounded-md border bg-[var(--ds-surface-card)] transition disabled:cursor-not-allowed disabled:opacity-55",
    active
      ? "border-[var(--ds-ink)]/30 text-[var(--ds-ink)] ring-1 ring-[var(--ds-ink)]/20"
      : "border-[var(--ds-hairline-strong)] text-[var(--ds-ink)] hover:bg-[var(--ds-canvas-soft)]",
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  active?: boolean;
  "aria-label": string;
};

export function AdminEditIconButton({ active, className, ...props }: ButtonProps): ReactElement {
  return (
    <button type="button" title="Edit" className={cn(adminEditIconButtonClass(active), className)} {...props}>
      <AdminEditIcon />
    </button>
  );
}

type LinkProps = {
  href: string;
  active?: boolean;
  "aria-label": string;
  className?: string;
};

export function AdminEditIconLink({ href, active, className, "aria-label": ariaLabel }: LinkProps): ReactElement {
  return (
    <Link href={href} title="Edit" aria-label={ariaLabel} className={cn(adminEditIconButtonClass(active), className)}>
      <AdminEditIcon />
    </Link>
  );
}

type DeleteButtonProps = ComponentPropsWithoutRef<"button"> & {
  "aria-label": string;
};

export function AdminDeleteIconButton({ className, ...props }: DeleteButtonProps): ReactElement {
  return (
    <button type="button" title="Delete" className={cn(adminEditIconButtonClass(), className)} {...props}>
      <AdminDeleteIcon />
    </button>
  );
}
