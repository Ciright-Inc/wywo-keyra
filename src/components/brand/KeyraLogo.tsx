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
  const logoSrc = "/kerya-logo.png?v=3";
  const logoSizes = {
    header: {
      box: "h-12 w-[clamp(200px,min(92vw,420px),420px)] sm:h-[3.35rem] sm:w-[min(96vw,460px)] lg:h-12 lg:w-[280px] xl:h-13 xl:w-[360px]",
      w: 1320,
      h: 520,
    },
    footer: {
      box: "h-9 w-[clamp(104px,28vw,168px)] sm:h-10 sm:w-[200px] md:h-11 md:w-[240px] lg:h-12 lg:w-[280px] xl:h-13 xl:w-[360px]",
      w: 1320,
      h: 520,
    },
    inline: {
      box: "h-9 w-[clamp(104px,28vw,168px)] sm:h-10 sm:w-[200px] md:h-11 md:w-[240px] lg:h-12 lg:w-[280px] xl:h-13 xl:w-[360px]",
      w: 1320,
      h: 520,
    },
  } as const;

  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";
  const imageClass =
    variant === "header"
      ? "h-full w-full origin-left scale-[1.46] object-contain object-left sm:scale-[1.52] md:scale-[1.5] lg:scale-[1.22]"
      : "h-full w-full origin-left scale-105 object-contain object-left sm:scale-110 md:scale-[1.18] lg:scale-[1.22]";

  return (
    <span
      className={`items-center gap-2.5 ${variant === "header" ? "flex h-[4.5rem] min-h-0 w-full max-w-full justify-start overflow-hidden sm:h-20 lg:inline-flex lg:h-14 lg:w-auto" : "inline-flex"} ${className}`}
    >
      <span
        className={`relative flex min-w-0 shrink items-center justify-start overflow-hidden rounded-sm ${logoSizes[variant].box}`}
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
