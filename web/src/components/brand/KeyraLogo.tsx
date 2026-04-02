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
      box:
        "h-[3.75rem] w-[min(19rem,calc(100vw-10.5rem))] sm:h-16 sm:w-[22rem] md:h-[4.75rem] md:w-[26rem] lg:w-[28rem]",
      w: 800,
      h: 140,
    },
    footer: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
    inline: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full object-contain object-left"
      : "h-full w-full object-contain object-center";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative flex shrink-0 items-center justify-center ${variant === "header" ? "overflow-visible" : "overflow-hidden"} ${logoSizes[variant].box}`}
      >
        <Image
          src="/keyra-logo.png"
          alt="KEYRA"
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
          KEYRA
        </span>
      ) : null}
    </span>
  );
}
