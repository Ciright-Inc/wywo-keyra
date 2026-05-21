import { cn } from "@/components/ui/cn";

type KeyraTrustLoaderProps = {
  /** Visible status line; also used for aria-label. */
  label?: string;
  /** inline — compact; page — section height; overlay — absolute fill for map/media. */
  variant?: "inline" | "page" | "overlay";
  className?: string;
};

/**
 * Institutional trust pulse — calm loading signal (never blank).
 */
export function KeyraTrustLoader({
  label = "Loading",
  variant = "inline",
  className,
}: KeyraTrustLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "page" && "min-h-[min(52vh,28rem)] w-full py-12",
        variant === "overlay" && "absolute inset-0 z-30",
        className,
      )}
    >
      <div className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
        <span
          className="keyra-trust-ring absolute inset-0 rounded-full border border-[rgba(13,116,206,0.22)]"
          aria-hidden
        />
        <span
          className="keyra-trust-ring keyra-trust-ring-delay absolute inset-[3px] rounded-full border border-[rgba(13,116,206,0.14)]"
          aria-hidden
        />
        <span
          className="keyra-trust-pulse relative h-2 w-2 rounded-full bg-[var(--color-text-link)] shadow-[0_0_12px_rgba(13,116,206,0.45)]"
          aria-hidden
        />
      </div>
      {label ? (
        <p className="mt-4 max-w-[16rem] text-[11px] font-medium uppercase tracking-[0.14em] text-keyra-text-2">
          {label}
        </p>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}
