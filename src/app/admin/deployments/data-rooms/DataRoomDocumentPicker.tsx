"use client";

import { useRef, useState, type RefObject } from "react";
import { cn } from "@/components/ui/cn";
import {
  DATA_ROOM_MAX_UPLOAD_BYTES,
  validateDataRoomFile,
} from "@/lib/dataRooms/dataRoomDocuments";

type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  onFile: (file: File) => void;
  onInvalidFile?: (message: string) => void;
};

export function DataRoomDocumentPicker({ inputRef, disabled, onFile, onInvalidFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const dragDepthRef = useRef(0);
  const maxMb = DATA_ROOM_MAX_UPLOAD_BYTES / (1024 * 1024);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function pickFromList(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const validated = validateDataRoomFile(file);
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
        <p className="text-sm font-semibold text-[var(--ds-ink)]">Document</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ds-body)]">
          Upload PDF, text, Word, Excel, or PowerPoint files. Images and videos are not allowed in
          data rooms.
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
        aria-label="Add a document. Click to browse, or drag and drop a file."
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex shrink-0 items-center justify-center rounded-[var(--ds-radius-sm)] bg-[var(--ds-canvas-soft)] px-5 py-4 text-[var(--ds-ink)]">
            <span className="material-symbols-outlined text-[40px]" aria-hidden>
              description
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--ds-ink)]">
              {dragOver ? "Drop your file here" : "Click here to choose a document"}
            </p>
            <p className="mt-1 text-sm text-[var(--ds-muted)]">
              You can also drag a file from your computer into this box.
            </p>
            <p className="mt-2 text-xs text-[var(--ds-muted)]">
              PDF, TXT, CSV, MD, Word, Excel, PowerPoint, RTF · up to {maxMb} MB
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
