import Link from "next/link";
import { adminBody, adminEditBackLink, adminPageTitle } from "@/lib/admin/adminUiClasses";

type Props = {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
};

export function AdminEditPageHeader({ title, subtitle, backHref, backLabel = "Back to list" }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className={adminPageTitle}>{title}</h1>
        {subtitle ? <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>{subtitle}</p> : null}
      </div>
      <Link href={backHref} className={adminEditBackLink}>
        <span className="material-symbols-outlined text-[14px] leading-none no-underline" aria-hidden>
          arrow_back
        </span>
        {backLabel}
      </Link>
    </div>
  );
}
