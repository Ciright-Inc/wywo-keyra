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
  "inline-flex items-center justify-center select-none whitespace-nowrap rounded-[var(--keyra-radius-pill)] px-5 py-3 text-[16px] font-semibold transition duration-200 focus-visible:outline-none focus-visible:keyra-focus disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-keyra-primary text-white hover:opacity-95 active:opacity-90",
  secondary:
    "bg-transparent text-keyra-primary border border-keyra-border hover:border-keyra-primary",
  ghost:
    "bg-transparent text-keyra-primary hover:bg-keyra-bg",
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

