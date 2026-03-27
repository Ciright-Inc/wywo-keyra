import Image from "next/image";

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
  const logoSizes = {
    header: { box: "h-16 w-32", px: 128 },
    footer: { box: "h-14 w-28", px: 112 },
    inline: { box: "h-16 w-32", px: 128 },
  } as const;

  const wordmarkSize =
    variant === "footer" ? "text-sm" : "text-lg";

  const tileClass =
    variant === "header" ? (
      "rounded-xl bg-keyra-accent transition-transform group-hover:scale-[1.02]"
    ) : variant === "footer" ? (
      "rounded-lg bg-keyra-accent/8"
    ) : (
      "rounded-xl bg-keyra-accent/8"
    );

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden ${logoSizes[variant].box} ${tileClass}`}
      >
        <Image
          src="/logo.png"
          alt="KEYRA logo"
          width={logoSizes[variant].px}
          height={logoSizes[variant].px}
          className="h-full w-full object-contain p-0.5"
          priority={variant === "header"}
        />
      </span>
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
