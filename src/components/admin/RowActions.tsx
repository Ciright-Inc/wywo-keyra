"use client";

import Link from "next/link";
import type { ReactElement } from "react";

/**
 * Shared per-row action cluster for admin directory tables.
 *
 * Renders a pencil edit link (always shown — read-only roles still need to view detail
 * pages) and an optional trash delete button. The button is gated by `canDelete` so the
 * caller can hide it for roles without mutation rights without changing column width.
 *
 * Style mirrors the Telcos directory: 32px square hairline-bordered buttons, neutral for
 * edit, red-tinted for delete, with the row dimming to 60% opacity while a delete is in
 * flight (caller toggles `isDeleting`).
 */
type Props = {
  /** Detail / edit page route for this row. */
  editHref: string;
  /** Accessible label for the edit link, e.g. "Edit Germany". */
  editAriaLabel: string;
  /** When false, the trash button is hidden entirely. */
  canDelete: boolean;
  /** Accessible label for the delete button, e.g. "Delete Germany". */
  deleteAriaLabel: string;
  /** Caller decides confirm text + fetch — this just fires the callback. */
  onDelete: () => void;
  /** Reflects in-flight DELETE; disables the button + dims the icon. */
  isDeleting: boolean;
};

export function RowActions({
  editHref,
  editAriaLabel,
  canDelete,
  deleteAriaLabel,
  onDelete,
  isDeleting,
}: Props): ReactElement {
  return (
    <div className="inline-flex items-center justify-end gap-1.5">
      <Link
        href={editHref}
        title="Edit"
        aria-label={editAriaLabel}
        className="inline-flex size-8 items-center justify-center rounded-md border border-keyra-border bg-keyra-bg text-keyra-primary transition hover:border-black/20 hover:bg-keyra-surface"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      </Link>
      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
          aria-label={deleteAriaLabel}
          className="inline-flex size-8 items-center justify-center rounded-md border border-keyra-border bg-keyra-bg text-red-700 transition hover:border-red-500/30 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
