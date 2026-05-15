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
  const baseWash = variant === "enterprise" ? "bg-keyra-bg/68" : "bg-keyra-bg/55";
  const driftOpacity = variant === "enterprise" ? "opacity-50" : "opacity-70";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('/image.png')" }} />
      <div className={`absolute inset-0 ${baseWash}`} />
      <div className={`absolute inset-0 ${driftOpacity}`}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 20% 15%, rgba(142,189,210,0.08), transparent 55%), radial-gradient(900px 540px at 80% 25%, rgba(122,135,168,0.07), transparent 55%), radial-gradient(950px 640px at 55% 85%, rgba(142,189,210,0.06), transparent 60%)",
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
