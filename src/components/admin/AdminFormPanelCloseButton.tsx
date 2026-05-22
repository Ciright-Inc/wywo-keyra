"use client";

type Props = {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
};

export function AdminFormPanelCloseButton({ onClick, label = "Close form", disabled }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-keyra-border bg-keyra-bg px-2.5 py-1.5 text-xs font-semibold text-keyra-text-2 shadow-sm transition hover:border-black/25 hover:bg-keyra-surface hover:text-keyra-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
      Close
    </button>
  );
}
