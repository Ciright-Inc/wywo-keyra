import type { ReactNode } from "react";
import {
  adminBody,
  adminCatalogStatBox,
  adminCatalogStatGrid,
  adminCatalogStatLabel,
  adminCatalogStatValue,
  adminPageHeader,
  adminPageTitle,
  adminPanel,
} from "@/lib/admin/adminUiClasses";

type Stat = {
  label: string;
  value: string;
};

type Props = {
  title: string;
  description: string;
  stats: Stat[];
  srOnly?: string;
  /** Optional modifier for stat grid layout (e.g. footer KPI row on mobile). */
  statGridClassName?: string;
  /** Collapsible search — rendered on the title row (top right). */
  search?: ReactNode;
};

/** Auth catalog pages — title left, KPI boxes right (countries / SAT protocols). */
export function AdminCatalogHero({ title, description, stats, srOnly, statGridClassName, search }: Props) {
  return (
    <div className={adminPanel}>
      <div className={`${adminPageHeader} !mb-0`}>
        <div className="min-w-0 max-w-3xl flex-1">
          <div className="ds-directory-header__title-row">
            <div className="ds-directory-header__title-group">
              <h1 className={adminPageTitle}>{title}</h1>
            </div>
            {search ? <div className="ds-directory-header__search">{search}</div> : null}
          </div>
          <p className={`${adminBody} mt-1.5 text-[var(--ds-body)]`}>{description}</p>
          {srOnly ? <p className="sr-only">{srOnly}</p> : null}
        </div>
        <div
          className={[adminCatalogStatGrid, statGridClassName].filter(Boolean).join(" ")}
          data-stat-count={stats.length}
        >
          {stats.map((stat) => (
            <div key={stat.label} className={adminCatalogStatBox}>
              <p className={adminCatalogStatLabel}>{stat.label}</p>
              <p className={adminCatalogStatValue}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
