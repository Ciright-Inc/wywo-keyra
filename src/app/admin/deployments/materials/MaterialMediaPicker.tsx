"use client";

import { useRef, useState, type RefObject } from "react";
import { cn } from "@/components/ui/cn";
import { MATERIAL_MAX_UPLOAD_BYTES, validateMaterialFile } from "@/lib/materials/materialMedia";

function PhotoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1.75" fill="currentColor" />
      <path
        d="m3 16 5.5-4.5L13 14l3-2.5L21 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 10.5 21 8v8l-5-2.5v-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onFile: (file: File) => void;
  onInvalidFile?: (message: string) => void;
};

export function MaterialMediaPicker({ inputRef, disabled, onFile, onInvalidFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const dragDepthRef = useRef(0);
  const maxMb = MATERIAL_MAX_UPLOAD_BYTES / (1024 * 1024);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function pickFromList(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const validated = validateMaterialFile(file);
    if (!validated.ok) {
      onInvalidFile?.(validated.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onFile(file);
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    dragDepthRef.current += 1;
    setDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setDragOver(false);
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragOver(false);
    if (disabled) return;
    pickFromList(event.dataTransfer.files);
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-sm font-semibold text-[var(--ds-ink)]">Photo or video</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ds-body)]">
          Add one image or one video only — not PDFs, documents, or other file types. This is what
          people will see in the library.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "w-full rounded-[var(--ds-radius-md)] border-2 border-dashed p-6 text-left transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-ink)]",
          disabled && "cursor-not-allowed opacity-55",
          dragOver
            ? "border-[var(--ds-ink)] bg-[var(--ds-canvas-soft)]"
            : "border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)] hover:border-[var(--ds-ink)] hover:bg-[var(--ds-canvas-soft)]",
        )}
        aria-label="Add a photo or video. Click to browse, or drag and drop a file."
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex shrink-0 gap-3">
            <div className="flex flex-col items-center gap-1.5 rounded-[var(--ds-radius-sm)] bg-[var(--ds-canvas-soft)] px-4 py-3 text-[var(--ds-ink)]">
              <PhotoIcon />
              <span className="text-xs font-medium">Photos</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 rounded-[var(--ds-radius-sm)] bg-[var(--ds-canvas-soft)] px-4 py-3 text-[var(--ds-ink)]">
              <VideoIcon />
              <span className="text-xs font-medium">Videos</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--ds-ink)]">
              {dragOver ? "Drop your file here" : "Click here to choose a photo or video"}
            </p>
            <p className="mt-1 text-sm text-[var(--ds-muted)]">
              You can also drag a file from your computer into this box.
            </p>
            <p className="mt-2 text-xs text-[var(--ds-muted)]">
              All standard image and video formats (JPG, PNG, GIF, WebP, MP4, MOV, WebM, and more) ·
              up to {maxMb} MB
            </p>
          </div>
        </div>

        <span className="mt-4 inline-flex ds-btn-primary is-sm pointer-events-none">
          Browse files
        </span>
      </button>
    </div>
  );
}
