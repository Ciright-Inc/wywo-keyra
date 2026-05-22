"use client";

import { AdminDeleteIconButton, AdminEditIconLink } from "@/components/admin/AdminEditIconButton";
import type { ReactElement } from "react";

type Props = {
  editHref: string;
  editAriaLabel: string;
  canDelete: boolean;
  deleteAriaLabel: string;
  onDelete: () => void;
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
    <div className="inline-flex items-center justify-end gap-1">
      <AdminEditIconLink href={editHref} aria-label={editAriaLabel} />
      {canDelete ? (
        <AdminDeleteIconButton
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={deleteAriaLabel}
        />
      ) : null}
    </div>
  );
}
