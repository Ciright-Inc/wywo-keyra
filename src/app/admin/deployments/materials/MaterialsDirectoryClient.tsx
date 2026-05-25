"use client";

import { useMemo, useRef, useState } from "react";
import { MaterialMediaKind } from "@prisma/client";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import {
  closeUploadFormWhileUploadingMessage,
  deleteAdminMaterialMessage,
} from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import {
  ALL_MATERIAL_KINDS_FILTER,
  MATERIAL_KIND_LABELS,
  type AdminMaterialView,
  type MaterialKindFilter,
} from "@/lib/materials/materialConstants";
import { formatMaterialFileSize } from "@/lib/materials/materialMedia";
import { enrichAdminMaterialView } from "@/lib/materials/materialMediaUrls";
import { MaterialForm } from "./MaterialForm";
import { MaterialMediaPreview } from "./MaterialMediaPreview";
import {
  adminBody,
  adminCountBadge,
  adminFilterLabel,
  adminFilterToolbar,
  adminPageTitle,
  adminPanel,
  adminSectionTitle,
  adminToolbarStrip,
  adminTableWrap,
} from "@/lib/admin/adminUiClasses";

function KindChip({ kind }: { kind: MaterialMediaKind }) {
  return (
    <span className="ds-badge-pill inline-flex shrink-0 truncate normal-case tracking-normal">
      {MATERIAL_KIND_LABELS[kind]}
    </span>
  );
}

type Props = {
  initialMaterials: AdminMaterialView[];
};

export function MaterialsDirectoryClient({ initialMaterials }: Props) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const [materials, setMaterials] = useState(initialMaterials);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const cancelUploadRef = useRef<(() => void) | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<MaterialKindFilter>(ALL_MATERIAL_KINDS_FILTER);

  const visibleMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((item) => {
      if (kindFilter !== ALL_MATERIAL_KINDS_FILTER && item.mediaKind !== kindFilter) {
        return false;
      }
      if (!q) return true;
      return [item.title, item.description, item.fileName, item.mimeType].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      );
    });
  }, [materials, query, kindFilter]);

  const hasSearch = query.trim().length > 0;
  const hasKindFilter = kindFilter !== ALL_MATERIAL_KINDS_FILTER;
  const totalVisible = visibleMaterials.length;

  async function closeCreateForm() {
    if (uploadInProgress) {
      const confirmed = await confirm({
        message: closeUploadFormWhileUploadingMessage(),
        confirmLabel: "Close form",
        cancelLabel: "Keep uploading",
      });
      if (!confirmed) return;
      cancelUploadRef.current?.();
      setUploadInProgress(false);
    }
    setCreateOpen(false);
  }

  async function toggleCreateForm() {
    if (createOpen) {
      await closeCreateForm();
      return;
    }
    setCreateOpen(true);
  }

  async function deleteMaterial(item: AdminMaterialView) {
    if (!(await confirm(deleteAdminMaterialMessage(item.title)))) return;
    setBusyId(item.id);
    try {
      const res = await fetch(
        `/api/admin/deployments/materials/${encodeURIComponent(item.id)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Delete failed.");
      }
      setMaterials((current) => current.filter((row) => row.id !== item.id));
      showAdminActionToast(toast, "deleted", "material", { name: item.title });
    } catch (err) {
      toast.error("Delete failed", err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className={adminPanel}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={adminPageTitle}>Materials</h1>
              <span className={adminCountBadge}>
                {hasSearch || hasKindFilter
                  ? `${totalVisible} of ${materials.length}`
                  : materials.length}
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              Images, videos, and GIFs stored in S3. New uploads appear first in the grid.
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <CollapsibleSearchBar
              mode="client"
              searchQuery={query}
              onChange={setQuery}
              placeholder="Title, file name, type…"
              ariaLabel="Search materials"
            />
            <button
              type="button"
              className={`shrink-0 whitespace-nowrap ${createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}`}
              onClick={() => void toggleCreateForm()}
            >
              {createOpen ? "Close upload form" : "Upload material"}
            </button>
          </div>
        </div>

        {createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>Upload material</h2>
            <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
              Add a title and media file. New items appear at the top of the grid.
            </p>
            <div className="ds-feature-card is-dashboard mt-4">
              <MaterialForm
                mode="create"
                embedded
                onUploadingChange={setUploadInProgress}
                onRegisterCancelUpload={(cancel) => {
                  cancelUploadRef.current = cancel;
                }}
                onCreated={(material) => {
                  setMaterials((current) => [enrichAdminMaterialView(material), ...current]);
                  setUploadInProgress(false);
                  cancelUploadRef.current = null;
                  setCreateOpen(false);
                }}
                onCancel={() => {
                  setUploadInProgress(false);
                  cancelUploadRef.current = null;
                  setCreateOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className={adminToolbarStrip}>
        <div className={adminFilterToolbar}>
          <label className={adminFilterLabel}>
            Type
            <AdminSelectMenu
              value={kindFilter}
              onChange={(v) => setKindFilter(v as MaterialKindFilter)}
              wide
              aria-label="Filter materials by type"
              options={[
                { value: ALL_MATERIAL_KINDS_FILTER, label: "All types" },
                ...Object.values(MaterialMediaKind).map((kind) => ({
                  value: kind,
                  label: MATERIAL_KIND_LABELS[kind],
                })),
              ]}
            />
          </label>
        </div>
      </div>

      {totalVisible === 0 ? (
        <AdminListEmptyState
          variant="panel"
          hasSearch={hasSearch}
          hasFilter={hasKindFilter}
          entityName="materials"
        />
      ) : (
        <div className={`${adminTableWrap} mt-6 p-3 sm:p-4`}>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleMaterials.map((item) => {
              const isDeleting = busyId === item.id;
              return (
                <li
                  key={item.id}
                  className={`ds-feature-card is-dashboard p-3 sm:p-4 ${isDeleting ? "opacity-60" : ""}`}
                >
                  <MaterialMediaPreview
                    url={item.url}
                    s3Key={item.s3Key}
                    title={item.title}
                    mediaKind={item.mediaKind}
                    mimeType={item.mimeType}
                    variant="grid"
                    className="mb-3"
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="truncate ds-body-sm font-semibold">{item.title}</h2>
                        <KindChip kind={item.mediaKind} />
                      </div>
                      {item.description ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-keyra-text-2">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[var(--ds-muted)]">
                        {item.fileName} · {formatMaterialFileSize(item.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <a
                        href={item.url}
                        className="ds-btn-icon"
                        style={{ width: 28, height: 28 }}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.title}`}
                      >
                        <svg
                          className="block size-3"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                      <RowActions
                        editHref={`/admin/deployments/materials/${item.id}/edit`}
                        editAriaLabel={`Edit ${item.title}`}
                        canDelete
                        deleteAriaLabel={`Delete ${item.title}`}
                        onDelete={() => void deleteMaterial(item)}
                        isDeleting={isDeleting}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
