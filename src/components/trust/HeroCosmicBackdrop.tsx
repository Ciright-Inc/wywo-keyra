import type { ReactNode } from "react";

/**
 * Shared atmospheric layers for marketing / enterprise heroes (uses `/public/image.png`).
 * Pointer-events none — keep interactive content in siblings with `relative z-10`.
 */
export function HeroCosmicBackdrop({
  variant = "marketing",
  children,
}: {
  variant?: "marketing" | "enterprise";
  /** Rendered above drift lines, under the bottom vignette (e.g. signal dots on home). */
  children?: ReactNode;
}) {
  /* Enterprise: dark graphite scrim so light typography stays legible over a bright globe. */
  const baseWash =
    variant === "enterprise"
      ? "bg-gradient-to-b from-zinc-950/82 via-zinc-950/48 to-zinc-950/22"
      : "bg-transparent";
  const driftOpacity = variant === "enterprise" ? "opacity-50" : "opacity-0";
  const imageOpacity = variant === "enterprise" ? "opacity-[0.72]" : "opacity-100";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className={`absolute inset-0 bg-cover bg-center ${imageOpacity}`}
        style={{ backgroundImage: "url('/image.png')" }}
      />
      <div className={`absolute inset-0 ${baseWash}`} />
      <div className={`absolute inset-0 ${driftOpacity}`}>
        <div className="absolute inset-0" />
      </div>
      {children}
    </div>
  );
}
