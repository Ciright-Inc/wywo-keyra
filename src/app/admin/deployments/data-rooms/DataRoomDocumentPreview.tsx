"use client";

import { useEffect, useMemo, useState } from "react";
import type { DataRoomDocumentKind } from "@prisma/client";
import {
  canInlinePreviewDataRoom,
  formatDataRoomFileSize,
} from "@/lib/dataRooms/dataRoomDocuments";
import { getDataRoomPreviewUrl } from "@/lib/dataRooms/dataRoomDocumentUrls";
import { DOCUMENT_KIND_LABELS } from "@/lib/dataRooms/dataRoomConstants";

type Variant = "card" | "inline";

type Props = {
  title: string;
  url: string;
  s3Key?: string;
  mimeType: string;
  documentKind: DataRoomDocumentKind;
  fileName: string;
  fileSizeBytes?: number;
  variant?: Variant;
  className?: string;
  onFullscreen?: () => void;
};

function kindIcon(documentKind: DataRoomDocumentKind): string {
  switch (documentKind) {
    case "PDF":
      return "picture_as_pdf";
    case "TEXT":
      return "article";
    case "WORD":
      return "description";
    case "SPREADSHEET":
      return "table_chart";
    case "PRESENTATION":
      return "slideshow";
    default:
      return "draft";
  }
}

export function DataRoomDocumentPreview({
  title,
  url,
  s3Key,
  mimeType,
  documentKind,
  fileName,
  fileSizeBytes,
  variant = "card",
  className = "",
  onFullscreen,
}: Props) {
  const previewSrc = useMemo(() => getDataRoomPreviewUrl(s3Key ?? "", url), [s3Key, url]);
  const inline = canInlinePreviewDataRoom(mimeType, documentKind);
  const isPdf = documentKind === "PDF" || mimeType === "application/pdf";
  const isText = documentKind === "TEXT" || mimeType.startsWith("text/");

  const [textContent, setTextContent] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (!inline || !isText || !previewSrc) return;

    let cancelled = false;
    setTextError(null);
    setTextContent(null);

    fetch(previewSrc, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load document.");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setTextContent(text);
      })
      .catch((err) => {
        if (!cancelled) {
          if (variant === "card") setTextContent(null);
          else setTextError(err instanceof Error ? err.message : "Could not load document.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inline, isText, previewSrc, variant]);

  useEffect(() => {
    if (!inline || !isPdf || !previewSrc || variant === "card") {
      setPdfBlobUrl(null);
      setPdfError(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setPdfError(null);
    setPdfBlobUrl(null);

    fetch(previewSrc, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const snippet = (await res.text()).slice(0, 120);
          throw new Error(
            snippet.includes("AccessDenied")
              ? "Could not load PDF (storage access denied)."
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
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [inline, isPdf, previewSrc, variant]);

  const frameClass =
    variant === "card"
      ? `relative flex aspect-[4/3] w-full flex-col overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline)] bg-[var(--ds-canvas-soft)] ${className}`
      : `relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline)] bg-white ${className}`;

  if (inline && isPdf && variant === "card") {
    return (
      <div className={frameClass}>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden bg-white px-4 py-6">
          <span className="material-symbols-outlined text-5xl text-[var(--ds-muted)]" aria-hidden>
            picture_as_pdf
          </span>
          <p className="max-w-full truncate text-center text-xs font-medium text-[var(--ds-ink)]">
            {DOCUMENT_KIND_LABELS[documentKind]}
          </p>
          <p
            className="max-w-full truncate text-center text-[10px] text-[var(--ds-muted)]"
            title={fileName}
          >
            {fileName}
          </p>
        </div>
        {onFullscreen ? (
          <button
            type="button"
            className="ds-btn-secondary is-sm absolute bottom-3 left-1/2 z-10 -translate-x-1/2 shadow-sm"
            onClick={onFullscreen}
          >
            Fullscreen preview
          </button>
        ) : null}
      </div>
    );
  }

  if (inline && isPdf) {
    return (
      <div className={frameClass}>
        {pdfError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
            <p className="text-sm text-[var(--ds-destructive,#dc2626)]">{pdfError}</p>
            {onFullscreen ? (
              <button type="button" className="ds-btn-secondary is-sm" onClick={onFullscreen}>
                Try fullscreen
              </button>
            ) : null}
          </div>
        ) : pdfBlobUrl ? (
          <iframe title={title} src={pdfBlobUrl} className="h-full min-h-0 w-full flex-1 border-0" />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--ds-muted)]">
            Loading preview…
          </div>
        )}
        {onFullscreen ? (
          <button
            type="button"
            className="ds-btn-secondary is-sm absolute bottom-3 left-1/2 z-10 -translate-x-1/2 shadow-sm"
            onClick={onFullscreen}
          >
            Fullscreen preview
          </button>
        ) : null}
      </div>
    );
  }

  if (inline && isText) {
    return (
      <div className={frameClass}>
        <div
          className={`min-h-0 flex-1 p-3 ${variant === "card" ? "overflow-hidden" : "overflow-auto"}`}
        >
          {textError ? (
            <p className="text-sm text-[var(--ds-destructive,#dc2626)]">{textError}</p>
          ) : textContent != null ? (
            <pre
              className={`whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[var(--ds-ink)] ${
                variant === "card" ? "line-clamp-[8] overflow-hidden" : ""
              }`}
            >
              {textContent.slice(0, variant === "card" ? 1200 : 50000)}
              {variant === "card" && textContent.length > 1200 ? "…" : ""}
            </pre>
          ) : (
            <p className="text-sm text-[var(--ds-muted)]">Loading preview…</p>
          )}
        </div>
        {onFullscreen ? (
          <button
            type="button"
            className="ds-btn-secondary is-sm absolute bottom-3 left-1/2 z-10 -translate-x-1/2 shadow-sm"
            onClick={onFullscreen}
          >
            Fullscreen preview
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline)] bg-[var(--ds-canvas-soft)] px-4 ${className}`}
    >
      <span className="material-symbols-outlined text-4xl text-[var(--ds-muted)]" aria-hidden>
        {kindIcon(documentKind)}
      </span>
      <p className="max-w-full truncate text-center text-xs font-medium text-[var(--ds-ink)]">
        {DOCUMENT_KIND_LABELS[documentKind]}
      </p>
      <p className="max-w-full truncate text-center text-[10px] text-[var(--ds-muted)]" title={fileName}>
        {fileName}
        {fileSizeBytes != null ? ` · ${formatDataRoomFileSize(fileSizeBytes)}` : ""}
      </p>
      {onFullscreen ? (
        <button
          type="button"
          className="ds-btn-secondary is-sm absolute bottom-3 left-1/2 -translate-x-1/2"
          onClick={onFullscreen}
          aria-label={`Fullscreen preview of ${title}`}
        >
          Fullscreen preview
        </button>
      ) : null}
    </div>
  );
}
