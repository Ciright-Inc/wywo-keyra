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
    header: { box: "h-16 w-[22rem] sm:h-16 sm:w-[26rem]", w: 640, h: 80 },
    footer: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
    inline: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full object-contain object-center scale-[1.55] origin-center"
      : "h-full w-full object-contain object-center";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden ${logoSizes[variant].box}`}
      >
        <Image
          src="/kerya-logo.png"
          alt="KERYA"
          width={logoSizes[variant].w}
          height={logoSizes[variant].h}
          className={imageClass}
          priority={variant === "header"}
        />
      </span>
      {showWordmark ? (
        <span
          className={`${wordmarkSize} font-semibold tracking-tight text-kerya-text ${wordmarkClassName}`}
        >
          KERYA
        </span>
      ) : null}
    </span>
  );
}
