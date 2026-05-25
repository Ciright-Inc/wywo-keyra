import type { ReactNode } from "react";
import { adminBody, adminPageTitle } from "@/lib/admin/adminUiClasses";
import { cn } from "@/components/ui/cn";

type Props = {
  title: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Directory page hero — search on the title row (top right), actions below on mobile. */
export function AdminDirectoryPageHeader({
  title,
  badge,
  description,
  search,
  actions,
  className,
}: Props) {
  return (
    <div className={cn("ds-directory-header", className)}>
      <div className="ds-directory-header__title-row">
        <div className="ds-directory-header__title-group">
          {typeof title === "string" ? <h1 className={adminPageTitle}>{title}</h1> : title}
          {badge}
        </div>
        {search ? <div className="ds-directory-header__search">{search}</div> : null}
      </div>
      {description || actions ? (
        <div className="ds-directory-header__below">
          {description ? (
            <p className={cn(adminBody, "ds-directory-header__description mt-1.5 max-w-xl text-[var(--ds-body)]")}>
              {description}
            </p>
          ) : null}
          {actions ? <div className="ds-directory-header__actions">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Section title row (e.g. audit tables) — same search placement as page headers. */
export function AdminDirectorySectionTitleRow({
  children,
  search,
  className,
}: {
  children: ReactNode;
  search?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ds-directory-header__title-row", className)}>
      <div className="ds-directory-header__title-group">{children}</div>
      {search ? <div className="ds-directory-header__search">{search}</div> : null}
    </div>
  );
}
