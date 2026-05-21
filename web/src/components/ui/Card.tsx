import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Card — the canonical content surface.
 *
 * Spec: agent.md §0.8. White surface, 12px radius, 1px `#dcdee0` border, 24px padding,
 * single soft shadow on hover only (no shadow at rest). No backdrop-filter.
 *
 * The original API (`className` + `children`) is preserved so every existing consumer
 * keeps working; the padding default has moved into `.ds-feature-card` itself, so
 * the previous `p-6` is no longer needed (but a className override still wins).
 */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("ds-feature-card", className)}>{children}</div>;
}

/**
 * CardHeader — title + optional description + optional leading icon plate.
 *
 * Plate uses an 8px radius hairline tile (`--ds-radius-md`) per the spec's
 * "card thumbnail (inside card)" rule.
 */
export function CardHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      {icon ? (
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-strong)] text-[var(--ds-ink)]"
        >
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="ds-title-md">{title}</p>
        {description ? <p className="mt-1 ds-body-sm">{description}</p> : null}
      </div>
    </div>
  );
}
