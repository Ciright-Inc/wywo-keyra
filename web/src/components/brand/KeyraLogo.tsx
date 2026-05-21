import Image from "next/image";
import { KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";

/** Intrinsic logo asset ratio (width / height). */
const LOGO_ASPECT = "1320/520";

type KeyraLogoProps = {
  className?: string;
  variant?: "header" | "footer" | "inline";
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

const variantHeights: Record<NonNullable<KeyraLogoProps["variant"]>, string> = {
  header: "h-10 sm:h-11 lg:h-10",
  footer: "h-8 sm:h-9",
  inline: "h-8 sm:h-9",
};

export function KeyraLogo({
  className = "",
  variant = "header",
  showWordmark = true,
  wordmarkClassName = "",
}: KeyraLogoProps) {
  const logoSrc = KEYRA_LOGO_SRC;
  const wordmarkSize = variant === "footer" ? "text-sm" : "text-lg";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative block shrink-0 ${variantHeights[variant]}`}
        style={{ aspectRatio: LOGO_ASPECT }}
      >
        <Image
          src={logoSrc}
          alt="Keyra"
          fill
          sizes={
            variant === "header"
              ? "(max-width: 1024px) 200px, 280px"
              : "(max-width: 768px) 140px, 180px"
          }
          className="object-contain object-left"
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
