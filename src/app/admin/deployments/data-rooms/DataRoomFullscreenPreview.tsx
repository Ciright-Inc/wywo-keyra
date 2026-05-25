"use client";

import { useEffect, useMemo, useState } from "react";
import type { DataRoomDocumentKind } from "@prisma/client";
import {
  canInlinePreviewDataRoom,
  formatDataRoomFileSize,
} from "@/lib/dataRooms/dataRoomDocuments";
import { getDataRoomPreviewUrl } from "@/lib/dataRooms/dataRoomDocumentUrls";
import { DOCUMENT_KIND_LABELS } from "@/lib/dataRooms/dataRoomConstants";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  s3Key?: string;
  mimeType: string;
  documentKind: DataRoomDocumentKind;
  fileName: string;
  fileSizeBytes: number;
};

export function DataRoomFullscreenPreview({
  open,
  onClose,
  title,
  url,
  s3Key,
  mimeType,
  documentKind,
  fileName,
  fileSizeBytes,
}: Props) {
  const previewSrc = useMemo(() => getDataRoomPreviewUrl(s3Key ?? "", url), [s3Key, url]);

  const [textContent, setTextContent] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const inline = canInlinePreviewDataRoom(mimeType, documentKind);
  const isPdf = documentKind === "PDF" || mimeType === "application/pdf";
  const isText = documentKind === "TEXT" || mimeType.startsWith("text/");

  useEffect(() => {
    if (!open) {
      setTextContent(null);
      setTextError(null);
      setTextLoading(false);
      setPdfBlobUrl(null);
      setPdfError(null);
      setPdfLoading(false);
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !isText || !previewSrc) return;

    let cancelled = false;
    setTextLoading(true);
    setTextError(null);
    setTextContent(null);

    fetch(previewSrc, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load document text.");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setTextContent(text);
      })
      .catch((err) => {
        if (!cancelled) {
          setTextError(err instanceof Error ? err.message : "Could not load document.");
        }
      })
      .finally(() => {
        if (!cancelled) setTextLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isText, previewSrc]);

  useEffect(() => {
    if (!open || !isPdf || !previewSrc) {
      setPdfBlobUrl(null);
      setPdfError(null);
      setPdfLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setPdfLoading(true);
    setPdfError(null);
    setPdfBlobUrl(null);

    fetch(previewSrc, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(
            body.includes("AccessDenied")
              ? "Could not load PDF. The file is in private storage — use the admin preview, not the S3 link."
              : "Could not load PDF preview.",
          );
        }
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setPdfError(err instanceof Error ? err.message : "Could not load PDF.");
        }
      })
      .finally(() => {
        if (!cancelled) setPdfLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, isPdf, previewSrc]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex flex-col bg-[var(--ds-surface,#fff)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${title}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--ds-hairline)] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[var(--ds-ink)]">{title}</h2>
          <p className="mt-0.5 truncate text-xs text-[var(--ds-muted)]">
            {DOCUMENT_KIND_LABELS[documentKind]} · {fileName} · {formatDataRoomFileSize(fileSizeBytes)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={previewSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn-secondary is-sm"
          >
            Open in new tab
          </a>
          <button type="button" className="ds-btn-primary is-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden bg-[var(--ds-canvas-soft)]">
        {inline && isPdf ? (
          <div className="h-full w-full bg-white">
            {pdfLoading ? (
              <p className="p-6 text-sm text-[var(--ds-muted)]">Loading PDF…</p>
            ) : pdfError ? (
              <p className="ds-admin-error-banner m-6">{pdfError}</p>
            ) : pdfBlobUrl ? (
              <iframe title={title} src={pdfBlobUrl} className="h-full w-full border-0" />
            ) : null}
          </div>
        ) : null}

        {inline && isText ? (
          <div className="h-full overflow-auto p-4 sm:p-6">
            {textLoading ? (
              <p className="text-sm text-[var(--ds-muted)]">Loading document…</p>
            ) : textError ? (
              <p className="ds-admin-error-banner">{textError}</p>
            ) : (
              <pre className="max-w-5xl whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-[var(--ds-ink)]">
                {textContent ?? ""}
              </pre>
            )}
          </div>
        ) : null}

        {!inline ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="material-symbols-outlined text-5xl text-[var(--ds-muted)]" aria-hidden>
              description
            </span>
            <div className="max-w-md">
              <p className="text-sm font-medium text-[var(--ds-ink)]">
                In-browser preview is not available for this file type
              </p>
              <p className="mt-2 text-sm text-[var(--ds-body)]">
                Word, Excel, and PowerPoint files open best in their desktop apps. Download via Open
                in new tab.
              </p>
            </div>
            <a
              href={previewSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn-primary is-sm"
            >
              Open document
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
