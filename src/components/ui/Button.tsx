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

const variantClass: Record<Variant, string> = {
  primary: "ds-btn-primary",
  secondary: "ds-btn-secondary",
  ghost: "ds-btn-tertiary",
  destructive: "ds-btn-destructive",
};

/** Extra Tailwind to layer on top of the base `.ds-btn-*` recipe for non-canonical sizes. */
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
  return (
    <button
      className={cn(variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
}
