"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

/**
 * Input — label + field + helper/error stack.
 *
 * Spec: agent.md §0.7. Field uses `.ds-text-input` (8px radius, hairline border,
 * 16px text to prevent iOS zoom, 2px ink border on focus). Error state turns the
 * border red and surfaces the message in spec-error styling.
 */
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
    <div>
      {label ? (
        <label htmlFor={id} className="ds-input-label">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn("ds-text-input", error ? "is-error" : "", className)}
        {...props}
      />
      {hint || error ? (
        <p id={describedBy} className={error ? "ds-input-error" : "ds-input-helper"}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
