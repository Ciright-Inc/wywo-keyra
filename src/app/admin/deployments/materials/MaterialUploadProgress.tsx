"use client";

type Props = {
  fileName: string;
  percent: number;
  onCancel: () => void;
};

export function MaterialUploadProgress({ fileName, percent, onCancel }: Props) {
  return (
    <div className="grid gap-2 rounded-[var(--ds-radius-md)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--ds-ink)]">
        <span className="min-w-0 truncate font-medium">Uploading {fileName}</span>
        <span className="ds-numeric tabular-nums text-[var(--ds-muted)]">{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--ds-surface)]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress for ${fileName}`}
      >
        <div
          className="h-full rounded-full bg-[var(--ds-ink)] transition-[width] duration-150 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <button type="button" className="ds-btn-secondary is-sm w-fit" onClick={onCancel}>
        Cancel upload
      </button>
    </div>
  );
}
