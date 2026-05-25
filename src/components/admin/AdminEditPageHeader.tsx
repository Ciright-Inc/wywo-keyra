import Link from "next/link";
import { AdminNavGlyph } from "@/components/admin/AdminNavGlyph";
import { adminBody, adminEditBackLink, adminPageTitle } from "@/lib/admin/adminUiClasses";

type Props = {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
  /** When set, intercepts back navigation (e.g. confirm before leaving during upload). */
  onBack?: () => void;
};

export function AdminEditPageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back to list",
  onBack,
}: Props) {
  const backContent = (
    <>
      <AdminNavGlyph name="arrow_back" className="shrink-0" />
      {backLabel}
    </>
  );

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className={adminPageTitle}>{title}</h1>
        {subtitle ? <p className={`${adminBody} mt-2 text-[var(--ds-body)]`}>{subtitle}</p> : null}
      </div>
      {onBack ? (
        <button type="button" className={adminEditBackLink} onClick={onBack}>
          {backContent}
        </button>
      ) : (
        <Link href={backHref} className={adminEditBackLink}>
          {backContent}
        </Link>
      )}
    </div>
  );
}
