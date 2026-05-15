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
      : "bg-keyra-bg/55";
  const driftOpacity = variant === "enterprise" ? "opacity-50" : "opacity-70";
  const imageOpacity = variant === "enterprise" ? "opacity-[0.72]" : "opacity-80";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className={`absolute inset-0 bg-cover bg-center ${imageOpacity}`}
        style={{ backgroundImage: "url('/image.png')" }}
      />
      <div className={`absolute inset-0 ${baseWash}`} />
      <div className={`absolute inset-0 ${driftOpacity}`}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 720px at 18% 12%, rgba(110,165,198,0.11), transparent 56%), radial-gradient(920px 560px at 82% 22%, rgba(90,110,150,0.09), transparent 54%), radial-gradient(980px 620px at 52% 88%, rgba(130,175,205,0.07), transparent 58%)",
          }}
        />
        <div className="animate-keyra-drift absolute inset-0 opacity-65">
          <div className="absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_55%_at_52%_40%,#000,transparent)]">
            <div className="absolute left-[-10%] top-[14%] h-[1px] w-[120%] bg-gradient-to-r from-transparent via-[rgba(234,240,246,0.22)] to-transparent" />
            <div className="absolute left-[-10%] top-[34%] h-[1px] w-[120%] bg-gradient-to-r from-transparent via-[rgba(234,240,246,0.16)] to-transparent" />
            <div className="absolute left-[-10%] top-[54%] h-[1px] w-[120%] bg-gradient-to-r from-transparent via-[rgba(234,240,246,0.12)] to-transparent" />
          </div>
        </div>
      </div>
      {children}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-keyra-bg" />
    </div>
  );
}
