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
        "h-16 w-full min-w-0 max-w-full sm:max-w-[24rem] md:max-w-[28rem] lg:max-w-[32rem]",
      w: 1000,
      h: 180,
    },
    footer: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
    inline: { box: "h-14 w-[13rem] sm:h-14 sm:w-[15rem]", w: 340, h: 72 },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full origin-left scale-[1.32] object-contain object-left sm:scale-[1.22] md:scale-[1.14] lg:scale-[1.08]"
      : "h-full w-full object-contain object-center";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${variant === "header" ? "h-16 min-w-0 max-w-full" : ""} ${className}`}
    >
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
