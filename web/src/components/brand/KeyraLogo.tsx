import Image from "next/image";

type KeyraLogoProps = {
  className?: string;
  /** Logo image is in /public. */
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
  const logoSizes = {
    header: {
      box: "h-14 w-[340px] sm:h-14 sm:w-[410px] md:h-16 md:w-[480px] lg:w-[520px]",
      w: 1320,
      h: 520,
    },
    footer: { box: "h-14 w-[320px] sm:h-14 sm:w-[360px]", w: 1320, h: 520 },
    inline: { box: "h-14 w-[320px] sm:h-14 sm:w-[360px]", w: 1320, h: 520 },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full origin-left scale-[2.10] object-contain object-left [filter:drop-shadow(0_1px_18px_rgba(255,255,255,0.36))]"
      : variant === "footer"
        ? "h-full w-full origin-left scale-[1.95] object-contain object-left [filter:drop-shadow(0_1px_18px_rgba(255,255,255,0.32))]"
        : "h-full w-full origin-left scale-[1.80] object-contain object-left [filter:drop-shadow(0_1px_16px_rgba(255,255,255,0.30))]";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${variant === "header" ? "h-16 min-w-0 max-w-full" : ""} ${className}`}
    >
      <span
        className={`relative flex shrink-0 items-center justify-start overflow-visible ${logoSizes[variant].box}`}
      >
        <Image
          src="/logo.png"
          alt="Keyra"
          width={logoSizes[variant].w}
          height={logoSizes[variant].h}
          className={imageClass}
          priority={variant === "header"}
          unoptimized
        />
      </span>
      {showWordmark ? (
        <span
          className={`${wordmarkSize} font-semibold tracking-tight text-keyra-text ${wordmarkClassName}`}
        >
          Keyra
        </span>
      ) : null}
    </span>
  );
}
