import type { ReactNode } from "react";
import {
  adminBody,
  adminCountBadge,
  adminPageHeader,
  adminPageTitle,
  adminPageToolbar,
  adminPanel,
} from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";

type Props = {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  toolbar?: ReactNode;
  className?: string;
};

/** Standard directory list page header (design.md §2.2). */
export function AdminPageHeader({ title, description, count, countLabel = "total", toolbar, className }: Props) {
  return (
    <div className={cn(adminPanel, className)}>
      <div className={adminPageHeader}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={adminPageTitle}>{title}</h1>
            {count !== undefined ? (
              <span className={adminCountBadge}>
                {count.toLocaleString()} {countLabel}
              </span>
            ) : null}
          </div>
          {description ? <p className={cn(adminBody, "mt-1.5 max-w-xl text-[var(--ds-body)]")}>{description}</p> : null}
        </div>
        {toolbar ? <div className={adminPageToolbar}>{toolbar}</div> : null}
      </div>
    </div>
  );
}
