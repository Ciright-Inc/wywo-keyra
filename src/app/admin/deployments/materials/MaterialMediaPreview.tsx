"use client";

import type { MaterialMediaKind } from "@prisma/client";
import { buildAdminMaterialMediaUrl } from "@/lib/materials/materialMediaUrls";

type PreviewVariant = "default" | "grid";

type Props = {
  url: string;
  /** When set, preview/open uses the authenticated admin file proxy (private buckets). */
  s3Key?: string;
  title: string;
  mediaKind: MaterialMediaKind;
  mimeType: string;
  className?: string;
  /** Grid cards: static thumbs only (no video player). Edit/upload uses default. */
  variant?: PreviewVariant;
};

function GridVideoPlaceholder({ title }: { title: string }) {
  return (
    <div
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-[var(--ds-canvas-soft)] text-[var(--ds-muted)]"
      aria-label={`${title} (video)`}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 10.5 21 8v8l-5-2.5v-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xs font-medium">Video file</span>
    </div>
  );
}

export function MaterialMediaPreview({
  url,
  s3Key,
  title,
  mediaKind,
  mimeType,
  className = "",
  variant = "default",
}: Props) {
  const src = s3Key?.trim() ? buildAdminMaterialMediaUrl(s3Key) : url;
  const base =
    "relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)]";

  if (mediaKind === "VIDEO" || mimeType.startsWith("video/")) {
    if (variant === "grid") {
      return (
        <div className={`${base} ${className}`}>
          <GridVideoPlaceholder title={title} />
        </div>
      );
    }

    return (
      <div className={`${base} ${className}`}>
        <video
          src={src}
          className="h-full w-full object-contain"
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          aria-label={title}
        />
      </div>
    );
  }

  if (mediaKind === "IMAGE" || mediaKind === "GIF" || mimeType.startsWith("image/")) {
    return (
      <div className={`${base} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  return (
    <div className={`${base} ${className}`}>
      <span className="text-xs text-[var(--ds-muted)]">Preview unavailable</span>
    </div>
  );
}
