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
};

/** Auth catalog pages — title left, KPI boxes right (countries / SAT protocols). */
export function AdminCatalogHero({ title, description, stats, srOnly }: Props) {
  return (
    <div className={adminPanel}>
      <div className={`${adminPageHeader} !mb-0`}>
        <div className="min-w-0 max-w-3xl">
          <h1 className={adminPageTitle}>{title}</h1>
          <p className={`${adminBody} mt-1.5 text-[var(--ds-body)]`}>{description}</p>
          {srOnly ? <p className="sr-only">{srOnly}</p> : null}
        </div>
        <div className={adminCatalogStatGrid} data-stat-count={stats.length}>
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
