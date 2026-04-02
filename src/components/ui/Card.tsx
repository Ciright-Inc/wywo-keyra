import type { ReactNode } from "react";
import { cn } from "./cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("kerya-card p-6", className)}>{children}</div>;
}

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
        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--keyra-radius-card)] bg-kerya-bg text-kerya-primary">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[18px] font-semibold text-kerya-primary">{title}</p>
        {description ? (
          <p className="mt-1 text-[14px] leading-relaxed text-kerya-text-2">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

