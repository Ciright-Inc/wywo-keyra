"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DataRoomDocumentKind } from "@prisma/client";
import { useAdminConfirm } from "@/components/admin/AdminConfirmProvider";
import { useToast } from "@/components/ui/Toast";
import { closeUploadFormWhileUploadingMessage } from "@/lib/admin/adminDeleteMessages";
import { showAdminActionToast } from "@/lib/admin/adminToastMessages";
import type { AdminDataRoomView } from "@/lib/dataRooms/dataRoomConstants";
import {
  DATA_ROOM_FILE_ACCEPT,
  formatDataRoomFileSize,
  validateDataRoomFile,
} from "@/lib/dataRooms/dataRoomDocuments";
import { parseMaterialSortOrder } from "@/lib/materials/materialSortOrder";
import { uploadDataRoomFile } from "@/lib/dataRooms/dataRoomUploadClient";
import { MaterialUploadProgress } from "../materials/MaterialUploadProgress";
import { DataRoomDocumentPicker } from "./DataRoomDocumentPicker";
import { DataRoomDocumentPreview } from "./DataRoomDocumentPreview";
import { DataRoomEditableDocument } from "./DataRoomEditableDocument";
import { DataRoomFullscreenPreview } from "./DataRoomFullscreenPreview";
import {
  adminLabel,
  adminLegacyInput,
  adminPanelStatic,
} from "@/lib/admin/adminUiClasses";

type UploadPayload = {
  url: string;
  s3Key: string;
  mimeType: string;
  documentKind: AdminDataRoomView["documentKind"];
  fileName: string;
  fileSizeBytes: number;
};

type Props = {
  mode: "create" | "edit";
  dataRoom?: AdminDataRoomView;
  embedded?: boolean;
  onCreated?: (dataRoom: AdminDataRoomView) => void;
  onCancel?: () => void;
  onUploadingChange?: (uploading: boolean) => void;
  onRegisterCancelUpload?: (cancel: () => void) => void;
  onLeavePage?: () => void;
};

export function DataRoomForm({
  mode,
  dataRoom,
  embedded,
  onCreated,
  onCancel,
  onUploadingChange,
  onRegisterCancelUpload,
  onLeavePage,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useAdminConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(dataRoom?.title ?? "");
  const [description, setDescription] = useState(dataRoom?.description ?? "");
  const [sortOrder, setSortOrder] = useState(
    dataRoom?.sortOrder != null ? String(dataRoom.sortOrder) : "",
  );
  const [upload, setUpload] = useState<UploadPayload | null>(
    dataRoom
      ? {
          url: dataRoom.url,
          s3Key: dataRoom.s3Key,
          mimeType: dataRoom.mimeType,
          documentKind: dataRoom.documentKind,
          fileName: dataRoom.fileName,
          fileSizeBytes: dataRoom.fileSizeBytes,
        }
      : null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const uploadSnapshotRef = useRef<UploadPayload | null>(null);

  function resetCreateFields() {
    setTitle("");
    setDescription("");
    setSortOrder("");
    setUpload(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const cancelUpload = useCallback(() => {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setUploading(false);
    setUploadProgress(0);
    setUploadingFileName(null);
    setUpload(uploadSnapshotRef.current);
    uploadSnapshotRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  useEffect(() => {
    onRegisterCancelUpload?.(cancelUpload);
  }, [cancelUpload, onRegisterCancelUpload]);

  async function confirmCloseWhileUploading(): Promise<boolean> {
    if (!uploading) return true;
    return confirm({
      message: closeUploadFormWhileUploadingMessage(),
      confirmLabel: "Close form",
      cancelLabel: "Keep uploading",
    });
  }

  async function handleEmbeddedCancel() {
    if (!(await confirmCloseWhileUploading())) return;
    if (uploading) cancelUpload();
    onCancel?.();
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setError(null);

    const validated = validateDataRoomFile(file);
    if (!validated.ok) {
      setError(validated.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    uploadSnapshotRef.current = upload;
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    setUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);

    try {
      const data = await uploadDataRoomFile(file, {
        onProgress: setUploadProgress,
        signal: controller.signal,
      });

      setUpload({
        url: data.url,
        s3Key: data.s3Key,
        mimeType: data.mimeType,
        documentKind: data.documentKind as DataRoomDocumentKind,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
      });
      setUploadProgress(100);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Upload failed.");
      setUpload(uploadSnapshotRef.current);
    } finally {
      setUploading(false);
      setUploadingFileName(null);
      uploadAbortRef.current = null;
      uploadSnapshotRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!upload) {
      setError("Upload a document before saving.");
      return;
    }

    const sortParsed = parseMaterialSortOrder(sortOrder);
    if ("error" in sortParsed) {
      setError(sortParsed.error);
      return;
    }

    setSaving(true);
    setError(null);

    const replaceFile =
      mode === "edit" &&
      dataRoom &&
      (upload.s3Key !== dataRoom.s3Key || upload.url !== dataRoom.url);

    const endpoint =
      mode === "edit" && dataRoom
        ? `/api/admin/deployments/data-rooms/${encodeURIComponent(dataRoom.id)}`
        : "/api/admin/deployments/data-rooms";

    const res = await fetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        description: description.trim() || null,
        url: upload.url,
        s3Key: upload.s3Key,
        mimeType: upload.mimeType,
        documentKind: upload.documentKind,
        fileName: upload.fileName,
        fileSizeBytes: upload.fileSizeBytes,
        sortOrder: sortParsed.sortOrder,
        replaceFile: mode === "edit" ? replaceFile : undefined,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      error?: string;
      dataRoom?: AdminDataRoomView;
    } | null;
    setSaving(false);

    if (!res.ok) {
      setError(data?.error ?? "Unable to save document.");
      return;
    }

    showAdminActionToast(
      toast,
      mode === "edit" ? "saved" : "created",
      "data-room",
      { name: title.trim() },
    );

    if (mode === "create" && embedded && onCreated && data?.dataRoom) {
      resetCreateFields();
      onCreated(data.dataRoom);
      return;
    }

    router.push("/admin/deployments/data-rooms");
    router.refresh();
  }

  const previewItem = upload
    ? {
        title: title || upload.fileName,
        url: upload.url,
        s3Key: upload.s3Key,
        mimeType: upload.mimeType,
        documentKind: upload.documentKind,
        fileName: upload.fileName,
        fileSizeBytes: upload.fileSizeBytes,
      }
    : null;

  const formClassName = embedded ? "grid gap-4" : "mt-8 grid gap-4";

  return (
    <>
      <form onSubmit={submit} className={formClassName}>
        <label className={adminLabel}>
          Title
          <input
            className={adminLegacyInput}
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading || saving}
            required
          />
        </label>

        <label className={adminLabel}>
          Description
          <span className="ml-1 text-xs font-normal text-[var(--ds-muted)]">(optional)</span>
          <textarea
            className={`${adminLegacyInput} min-h-[88px] resize-y`}
            placeholder="Notes for investors or internal use"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading || saving}
            rows={3}
          />
        </label>

        <label className={adminLabel}>
          Sort order
          <span className="ml-0.5 text-[var(--ds-destructive,#dc2626)]" aria-hidden>
            *
          </span>
          <input
            className={adminLegacyInput}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            placeholder="e.g. 1"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "." ||
                e.key === "," ||
                e.key === "e" ||
                e.key === "E" ||
                e.key === "-" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
            disabled={uploading || saving}
            aria-required
          />
          <span className="mt-1 block text-xs font-normal text-[var(--ds-muted)]">
            Required. Whole number (1, 2, 3…). Each document must have a unique order number.
          </span>
        </label>

        <div className={`grid gap-4 ${adminPanelStatic} p-4 sm:p-5`}>
          <input
            ref={fileInputRef}
            type="file"
            accept={DATA_ROOM_FILE_ACCEPT}
            className="sr-only"
            disabled={uploading || saving}
            onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
          />

          {!upload && !uploading ? (
            <DataRoomDocumentPicker
              inputRef={fileInputRef}
              disabled={uploading || saving}
              onFile={(file) => void handleFileChange(file)}
              onInvalidFile={setError}
            />
          ) : null}

          {uploading && uploadingFileName ? (
            <MaterialUploadProgress
              fileName={uploadingFileName}
              percent={uploadProgress}
              onCancel={cancelUpload}
            />
          ) : null}

          {upload && !uploading ? (
            <div className="grid gap-2">
              {mode === "edit" ? (
                <DataRoomEditableDocument
                  title={title || upload.fileName}
                  url={upload.url}
                  s3Key={upload.s3Key}
                  mimeType={upload.mimeType}
                  documentKind={upload.documentKind}
                  fileName={upload.fileName}
                  fileSizeBytes={upload.fileSizeBytes}
                  disabled={uploading || saving}
                  onReplace={() => fileInputRef.current?.click()}
                  onPreview={() => setPreviewOpen(true)}
                />
              ) : (
                <>
                  <DataRoomDocumentPreview
                    title={title || upload.fileName}
                    url={upload.url}
                    s3Key={upload.s3Key}
                    mimeType={upload.mimeType}
                    documentKind={upload.documentKind}
                    fileName={upload.fileName}
                    fileSizeBytes={upload.fileSizeBytes}
                    variant="inline"
                    onFullscreen={() => setPreviewOpen(true)}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[var(--ds-muted)]">
                      {upload.fileName} · {formatDataRoomFileSize(upload.fileSizeBytes)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="ds-btn-secondary is-sm shrink-0"
                        disabled={uploading || saving}
                        onClick={() => setPreviewOpen(true)}
                      >
                        Fullscreen preview
                      </button>
                      <button
                        type="button"
                        className="ds-btn-secondary is-sm shrink-0"
                        disabled={uploading || saving}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change document
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {error ? <p className="ds-admin-error-banner">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || uploading || !upload}
            className="ds-btn-primary is-sm disabled:opacity-55"
          >
            {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Add document"}
          </button>
          {embedded && onCancel ? (
            <button
              type="button"
              className="ds-btn-secondary is-sm"
              disabled={saving}
              onClick={() => void handleEmbeddedCancel()}
            >
              Cancel
            </button>
          ) : onLeavePage ? (
            <button
              type="button"
              className="ds-btn-secondary is-sm"
              disabled={saving}
              onClick={onLeavePage}
            >
              Cancel
            </button>
          ) : (
            <Link
              href="/admin/deployments/data-rooms"
              className={`ds-btn-secondary is-sm ${uploading || saving ? "pointer-events-none opacity-55" : ""}`}
              aria-disabled={uploading || saving}
              tabIndex={uploading || saving ? -1 : undefined}
            >
              Cancel
            </Link>
          )}
        </div>
      </form>

      {previewItem ? (
        <DataRoomFullscreenPreview
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={previewItem.title}
          url={previewItem.url}
          s3Key={previewItem.s3Key}
          mimeType={previewItem.mimeType}
          documentKind={previewItem.documentKind}
          fileName={previewItem.fileName}
          fileSizeBytes={previewItem.fileSizeBytes}
        />
      ) : null}
    </>
  );
}
