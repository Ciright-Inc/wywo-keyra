"use client";

import { useMemo, useRef, useState } from "react";
import { DataRoomDocumentKind } from "@prisma/client";
import { AdminSelectMenu } from "@/components/admin/AdminSelectMenu";
import { CollapsibleSearchBar } from "@/components/admin/CollapsibleSearchBar";
import { AdminListEmptyState } from "@/components/admin/AdminListEmptyState";
import { RowActions } from "@/components/admin/RowActions";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import {
  closeUploadFormWhileUploadingMessage,
  deleteAdminDataRoomMessage,
} from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import {
  ALL_DOCUMENT_KINDS_FILTER,
  DOCUMENT_KIND_LABELS,
  type AdminDataRoomView,
  type DocumentKindFilter,
} from "@/lib/dataRooms/dataRoomConstants";
import { formatDataRoomFileSize } from "@/lib/dataRooms/dataRoomDocuments";
import { enrichAdminDataRoomView } from "@/lib/dataRooms/dataRoomDocumentUrls";
import { DataRoomForm } from "./DataRoomForm";
import { DataRoomDocumentPreview } from "./DataRoomDocumentPreview";
import { DataRoomFullscreenPreview } from "./DataRoomFullscreenPreview";
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

function KindChip({ kind }: { kind: DataRoomDocumentKind }) {
  return (
    <span className="ds-badge-pill inline-flex shrink-0 truncate normal-case tracking-normal">
      {DOCUMENT_KIND_LABELS[kind]}
    </span>
  );
}

type Props = {
  initialDataRooms: AdminDataRoomView[];
};

export function DataRoomsDirectoryClient({ initialDataRooms }: Props) {
  const confirm = useAdminConfirm();
  const toast = useToast();
  const [dataRooms, setDataRooms] = useState(initialDataRooms);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const cancelUploadRef = useRef<(() => void) | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<DocumentKindFilter>(ALL_DOCUMENT_KINDS_FILTER);
  const [previewItem, setPreviewItem] = useState<AdminDataRoomView | null>(null);

  const visibleDataRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataRooms.filter((item) => {
      if (kindFilter !== ALL_DOCUMENT_KINDS_FILTER && item.documentKind !== kindFilter) {
        return false;
      }
      if (!q) return true;
      return [item.title, item.description, item.fileName, item.mimeType].some((value) =>
        (value ?? "").toLowerCase().includes(q),
      );
    });
  }, [dataRooms, query, kindFilter]);

  const hasSearch = query.trim().length > 0;
  const hasKindFilter = kindFilter !== ALL_DOCUMENT_KINDS_FILTER;
  const totalVisible = visibleDataRooms.length;

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

  async function deleteDataRoom(item: AdminDataRoomView) {
    if (!(await confirm(deleteAdminDataRoomMessage(item.title)))) return;
    setBusyId(item.id);
    try {
      const res = await fetch(
        `/api/admin/deployments/data-rooms/${encodeURIComponent(item.id)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Delete failed.");
      }
      setDataRooms((current) => current.filter((row) => row.id !== item.id));
      showAdminActionToast(toast, "deleted", "data-room", { name: item.title });
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
              <h1 className={adminPageTitle}>Data rooms</h1>
              <span className={adminCountBadge}>
                {hasSearch || hasKindFilter
                  ? `${totalVisible} of ${dataRooms.length}`
                  : dataRooms.length}
              </span>
            </div>
            <p className={`${adminBody} mt-1.5 max-w-xl text-[var(--ds-body)]`}>
              PDFs, text, and office documents stored in S3. Preview in fullscreen from the grid.
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <CollapsibleSearchBar
              mode="client"
              searchQuery={query}
              onChange={setQuery}
              placeholder="Title, file name, type…"
              ariaLabel="Search data room documents"
            />
            <button
              type="button"
              className={`shrink-0 whitespace-nowrap ${createOpen ? "ds-btn-secondary is-sm" : "ds-btn-primary is-sm"}`}
              onClick={() => void toggleCreateForm()}
            >
              {createOpen ? "Close upload form" : "Upload document"}
            </button>
          </div>
        </div>

        {createOpen ? (
          <div className="mt-5 border-t border-[var(--ds-hairline)] pt-5">
            <h2 className={adminSectionTitle}>Upload document</h2>
            <p className={`${adminBody} mt-1 text-[var(--ds-body)]`}>
              Add a title and document file. New items appear at the top of the grid.
            </p>
            <div className="ds-feature-card is-dashboard mt-4">
              <DataRoomForm
                mode="create"
                embedded
                onUploadingChange={setUploadInProgress}
                onRegisterCancelUpload={(cancel) => {
                  cancelUploadRef.current = cancel;
                }}
                onCreated={(doc) => {
                  setDataRooms((current) => [enrichAdminDataRoomView(doc), ...current]);
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
              onChange={(v) => setKindFilter(v as DocumentKindFilter)}
              wide
              aria-label="Filter documents by type"
              options={[
                { value: ALL_DOCUMENT_KINDS_FILTER, label: "All types" },
                ...Object.values(DataRoomDocumentKind).map((kind) => ({
                  value: kind,
                  label: DOCUMENT_KIND_LABELS[kind],
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
          entityName="documents"
        />
      ) : (
        <div className={`${adminTableWrap} mt-6 p-3 sm:p-4`}>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDataRooms.map((item) => {
              const isDeleting = busyId === item.id;
              return (
                <li
                  key={item.id}
                  className={`ds-feature-card is-dashboard p-3 sm:p-4 ${isDeleting ? "opacity-60" : ""}`}
                >
                  <DataRoomDocumentPreview
                    title={item.title}
                    url={item.url}
                    s3Key={item.s3Key}
                    mimeType={item.mimeType}
                    documentKind={item.documentKind}
                    fileName={item.fileName}
                    fileSizeBytes={item.fileSizeBytes}
                    className="mb-3"
                    onFullscreen={() => setPreviewItem(item)}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="truncate ds-body-sm font-semibold">{item.title}</h2>
                        <KindChip kind={item.documentKind} />
                      </div>
                      {item.description ? (
                        <p className="mt-1.5 line-clamp-2 text-sm text-keyra-text-2">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[var(--ds-muted)]">
                        {item.fileName} · {formatDataRoomFileSize(item.fileSizeBytes)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <button
                        type="button"
                        className="ds-btn-icon"
                        style={{ width: 28, height: 28 }}
                        onClick={() => setPreviewItem(item)}
                        aria-label={`Fullscreen preview of ${item.title}`}
                      >
                        <span className="material-symbols-outlined text-[18px]" aria-hidden>
                          fullscreen
                        </span>
                      </button>
                      <RowActions
                        editHref={`/admin/deployments/data-rooms/${item.id}/edit`}
                        editAriaLabel={`Edit ${item.title}`}
                        canDelete
                        deleteAriaLabel={`Delete ${item.title}`}
                        onDelete={() => void deleteDataRoom(item)}
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

      {previewItem ? (
        <DataRoomFullscreenPreview
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
          url={previewItem.url}
          s3Key={previewItem.s3Key}
          mimeType={previewItem.mimeType}
          documentKind={previewItem.documentKind}
          fileName={previewItem.fileName}
          fileSizeBytes={previewItem.fileSizeBytes}
        />
      ) : null}
    </div>
  );
}
