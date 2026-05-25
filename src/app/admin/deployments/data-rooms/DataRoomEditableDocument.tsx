"use client";

import type { DataRoomDocumentKind } from "@prisma/client";
import { formatDataRoomFileSize } from "@/lib/dataRooms/dataRoomDocuments";
import { DataRoomDocumentPreview } from "./DataRoomDocumentPreview";

type Props = {
  title: string;
  url: string;
  s3Key: string;
  mimeType: string;
  documentKind: DataRoomDocumentKind;
  fileName: string;
  fileSizeBytes: number;
  disabled?: boolean;
  onReplace: () => void;
  onPreview?: () => void;
};

export function DataRoomEditableDocument({
  title,
  url,
  s3Key,
  mimeType,
  documentKind,
  fileName,
  fileSizeBytes,
  disabled,
  onReplace,
  onPreview,
}: Props) {
  return (
    <div className="grid gap-3">
      <DataRoomDocumentPreview
        title={title}
        url={url}
        s3Key={s3Key}
        mimeType={mimeType}
        documentKind={documentKind}
        fileName={fileName}
        fileSizeBytes={fileSizeBytes}
        variant="inline"
        onFullscreen={onPreview}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--ds-muted)]">
          {fileName} · {formatDataRoomFileSize(fileSizeBytes)}
        </p>
        <button
          type="button"
          className="ds-btn-secondary is-sm shrink-0"
          disabled={disabled}
          onClick={onReplace}
        >
          Change document
        </button>
      </div>
    </div>
  );
}
