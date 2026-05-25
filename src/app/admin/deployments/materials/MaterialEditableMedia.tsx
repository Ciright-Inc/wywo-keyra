"use client";

import type { MaterialMediaKind } from "@prisma/client";
import { formatMaterialFileSize } from "@/lib/materials/materialMedia";
import { MaterialMediaPreview } from "./MaterialMediaPreview";

type Props = {
  url: string;
  s3Key: string;
  title: string;
  mediaKind: MaterialMediaKind;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
  disabled?: boolean;
  onReplace: () => void;
};

/** Edit flow: static preview (video has native controls); change file via button below. */
export function MaterialEditableMedia({
  url,
  s3Key,
  title,
  mediaKind,
  mimeType,
  fileName,
  fileSizeBytes,
  disabled,
  onReplace,
}: Props) {
  const isVideo = mediaKind === "VIDEO" || mimeType.startsWith("video/");

  return (
    <div className="grid gap-3">
      <MaterialMediaPreview
        url={url}
        s3Key={s3Key}
        title={title}
        mediaKind={mediaKind}
        mimeType={mimeType}
        className="mb-0"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--ds-muted)]">
          {fileName} · {formatMaterialFileSize(fileSizeBytes)}
          {isVideo ? (
            <span className="text-[var(--ds-muted)]"> · Use the player controls to play or pause</span>
          ) : null}
        </p>
        <button
          type="button"
          className="ds-btn-secondary is-sm shrink-0"
          disabled={disabled}
          onClick={onReplace}
        >
          Change photo or video
        </button>
      </div>
    </div>
  );
}
