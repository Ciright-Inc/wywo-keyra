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
        "h-[4.5rem] w-[min(22rem,calc(100vw-9rem))] sm:h-20 sm:w-[26rem] md:h-[5.5rem] md:w-[30rem] lg:h-[5.75rem] lg:w-[34rem]",
      w: 960,
      h: 168,
    },
    footer: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
    inline: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full origin-left scale-[1.22] object-contain object-left sm:scale-[1.12]"
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
