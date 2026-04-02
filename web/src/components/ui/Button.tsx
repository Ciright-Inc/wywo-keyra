"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center select-none whitespace-nowrap rounded-[var(--keyra-radius-pill)] px-5 py-3 text-[16px] font-semibold transition duration-200 focus-visible:outline-none focus-visible:kerya-focus disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-kerya-accent text-kerya-surface hover:opacity-95 active:opacity-90",
  secondary:
    "bg-transparent text-kerya-primary border border-kerya-border hover:border-[color:var(--keyra-hover-border)]",
  ghost:
    "bg-transparent text-kerya-primary hover:bg-[color:var(--keyra-hover-fill)]",
};

const sizes: Record<Size, string> = {
  md: "h-12",
  lg: "h-14 px-7 text-[16px]",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

