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
  const logoSrc = "/kerya-logo.png?v=2";
  const logoSizes = {
    header: {
      box: "h-11 w-[260px] sm:h-12 sm:w-[290px] md:h-12 md:w-[320px] lg:h-13 lg:w-[360px]",
      w: 1320,
      h: 520,
    },
    footer: {
      box: "h-11 w-[260px] sm:h-12 sm:w-[290px] md:h-12 md:w-[320px] lg:h-13 lg:w-[360px]",
      w: 1320,
      h: 520,
    },
    inline: {
      box: "h-11 w-[260px] sm:h-12 sm:w-[290px] md:h-12 md:w-[320px] lg:h-13 lg:w-[360px]",
      w: 1320,
      h: 520,
    },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  // Slight zoom so the text inside the PNG is legible.
  const imageClass =
    "h-full w-full origin-left scale-[1.22] object-contain object-left";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${variant === "header" ? "h-16 min-w-0 max-w-full" : ""} ${className}`}
    >
      <span
        className={`relative flex shrink-0 items-center justify-start overflow-visible ${logoSizes[variant].box}`}
      >
        <Image
          src={logoSrc}
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
