import type { SVGProps } from "react";

export function KeyraMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M16 6.5 23.5 10v6.7c0 4.1-3.2 7.6-7.5 9.1C11.7 24.3 8.5 20.8 8.5 16.7V10L16 6.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 16.2 14.8 18.5 19.4 12.8"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type KeyraLogoProps = {
  className?: string;
  /** Header: white mark on accent tile. Footer: accent mark on soft tile. Inline: accent only, no tile. */
  variant?: "header" | "footer" | "inline";
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function KeyraLogo({
  className = "",
  variant = "header",
  showWordmark = true,
  wordmarkClassName = "",
}: KeyraLogoProps) {
  const markSizes = {
    header: "h-[1.15rem] w-[1.15rem]",
    footer: "h-4 w-4",
    inline: "h-6 w-6",
  } as const;

  const wordmarkSize =
    variant === "footer" ? "text-sm" : "text-lg";

  const tile =
    variant === "header" ? (
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-keyra-accent text-white shadow-sm transition-transform group-hover:scale-[1.02]">
        <KeyraMark className={markSizes.header} />
      </span>
    ) : variant === "footer" ? (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-keyra-accent-soft text-keyra-accent">
        <KeyraMark className={markSizes.footer} />
      </span>
    ) : (
      <KeyraMark className={`shrink-0 text-keyra-accent ${markSizes.inline}`} />
    );

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {tile}
      {showWordmark ? (
        <span
          className={`${wordmarkSize} font-semibold tracking-tight text-keyra-ink ${wordmarkClassName}`}
        >
          KEYRA
        </span>
      ) : null}
    </span>
  );
}
