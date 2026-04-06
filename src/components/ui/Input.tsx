"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
};

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const describedBy = hint || error ? `${id}-help` : undefined;

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="block text-[14px] font-medium text-keyra-text"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-[var(--keyra-radius-card)] border bg-keyra-surface px-4 text-[16px] text-keyra-text placeholder:text-keyra-text-2/70 transition duration-200 focus-visible:outline-none focus-visible:keyra-focus",
          error ? "border-keyra-primary" : "border-keyra-border",
          className,
        )}
        {...props}
      />
      {hint || error ? (
        <p
          id={describedBy}
          className={cn(
            "text-[14px] leading-relaxed",
            error ? "font-medium text-keyra-primary" : "text-keyra-text-2",
          )}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

