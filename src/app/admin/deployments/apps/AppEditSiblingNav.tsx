import Link from "next/link";
import type { DeploymentAppEditNeighbor } from "@/lib/deploymentApps";

type Props = {
  prevApp: DeploymentAppEditNeighbor | null;
  nextApp: DeploymentAppEditNeighbor | null;
  index: number;
  total: number;
};

const btnClass =
  "inline-flex items-center gap-1.5 rounded-xl border border-keyra-border bg-keyra-bg px-3 py-2 text-sm font-medium text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40";

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3.5 5.5 8 10 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppEditSiblingNav({ prevApp, nextApp, index, total }: Props) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      {total > 0 ? (
        <span className="text-xs font-medium text-keyra-text-2">
          {index} of {total}
        </span>
      ) : null}
      <div className="flex items-center gap-2">
        {prevApp ? (
          <Link
            href={`/admin/deployments/apps/${prevApp.id}/edit`}
            className={btnClass}
            title={`Previous: ${prevApp.label}`}
            aria-label={`Previous app: ${prevApp.label}`}
          >
            <ChevronLeft />
            Previous
          </Link>
        ) : (
          <button type="button" className={btnClass} disabled aria-label="No previous app">
            <ChevronLeft />
            Previous
          </button>
        )}
        {nextApp ? (
          <Link
            href={`/admin/deployments/apps/${nextApp.id}/edit`}
            className={btnClass}
            title={`Next: ${nextApp.label}`}
            aria-label={`Next app: ${nextApp.label}`}
          >
            Next
            <ChevronRight />
          </Link>
        ) : (
          <button type="button" className={btnClass} disabled aria-label="No next app">
            Next
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}
