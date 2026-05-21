"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

/**
 * Button — single source of truth for CTAs across the app.
 *
 * Spec: agent.md §0.6 / TR-1 / TR-2.
 *
 *  • `primary`   = solid `#000` background, white text, 8px radius. Hover swaps to `#1a1a1a`.
 *  • `secondary` = white surface, `#dcdee0` hairline border, ink text. Hover swaps to `#fafafa`.
 *  • `ghost`     = transparent + link-blue text (mapped to spec "tertiary"). Hover swaps to `#476cff`.
 *  • `destructive` = white surface, hairline border, error-red text (rare).
 *
 * Sizes:
 *  • `md` (default) — 40px tall, 14/500, the canonical CTA.
 *  • `lg`           — 48px tall, wider padding (legacy variant, kept for source compat).
 *  • `sm`           — 32px tall, 13/500, 6px radius — dashboard toolbars.
 *
 * Hover changes exactly one visual property (TR-8). No shadow at rest or hover.
 * Public API unchanged from the previous version so every consumer keeps working.
 */
type Variant = "primary" | "secondary" | "ghost" | "destructive";

type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

/** Pulled: shared interaction + press feedback base classes. */
const base =
  "inline-flex items-center justify-center select-none whitespace-nowrap rounded-[var(--keyra-radius-pill)] px-5 py-3 text-[16px] font-semibold transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:keyra-focus disabled:opacity-50 disabled:pointer-events-none touch-manipulation";

/** Pulled: inline variant styles with active/press states. */
const pulledVariants: Record<"primary" | "secondary" | "ghost", string> = {
  primary:
    "bg-[var(--keyra-action)] text-[var(--keyra-action-text)] border border-[var(--keyra-action-border)] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.08)]",
  secondary:
    "bg-transparent text-keyra-primary border border-keyra-border hover:border-keyra-primary active:bg-[rgba(255,255,255,0.04)]",
  ghost:
    "bg-[rgba(255,255,255,0.04)] text-keyra-primary border border-keyra-border hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)] active:bg-[rgba(255,255,255,0.08)]",
};

/** Pulled: legacy height sizing from remote main. */
const pulledSizes: Record<"md" | "lg", string> = {
  md: "h-12",
  lg: "h-14 px-7 text-[16px]",
};

/** Local: design-system `.ds-btn-*` recipes. */
const variantClass: Record<Variant, string> = {
  primary: "ds-btn-primary",
  secondary: "ds-btn-secondary",
  ghost: "ds-btn-tertiary",
  destructive: "ds-btn-destructive",
};

/** Local: extra Tailwind layered on `.ds-btn-*` for non-canonical sizes. */
const sizeClass: Record<Size, string> = {
  sm: "is-sm",
  md: "",
  lg: "min-h-12 px-6 text-[15px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const pulledVariant =
    variant === "destructive" ? undefined : pulledVariants[variant];

  return (
    <button
      className={cn(
        base,
        pulledVariant,
        variantClass[variant],
        size !== "sm" ? pulledSizes[size] : undefined,
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
