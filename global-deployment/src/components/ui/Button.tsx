"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center select-none whitespace-nowrap transition duration-200 ease-out focus-visible:outline-none focus-visible:keyra-focus disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "rounded-[var(--keyra-radius-md)] border border-[var(--keyra-action-border)] bg-[var(--keyra-action)] text-[var(--keyra-action-text)] font-semibold hover:bg-black hover:text-white",
  secondary:
    "rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-surface text-keyra-primary font-medium hover:border-black/20 hover:bg-keyra-bg",
  ghost:
    "rounded-[var(--keyra-radius-md)] border border-transparent bg-transparent text-keyra-text-2 font-medium hover:bg-keyra-surface hover:text-keyra-primary",
  outline:
    "rounded-[var(--keyra-radius-md)] border border-keyra-border bg-keyra-bg text-keyra-primary font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-black/25 hover:bg-keyra-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px] leading-none",
  md: "h-10 px-4 text-[13px] font-semibold leading-none",
  lg: "h-12 px-6 text-[14px] font-semibold leading-none rounded-[var(--keyra-radius-pill)]",
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
