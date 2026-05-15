import type { ReactNode } from "react";
import { CinematicReveal } from "@/components/motion/CinematicReveal";

type NarrativeSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  surface?: "default" | "elevated" | "silence";
  align?: "left" | "center";
};

/**
 * Shared narrative shell — editorial rhythm, asymmetrical silence, cinematic reveal.
 */
export function NarrativeSection({
  id,
  eyebrow,
  title,
  lead,
  children,
  className = "",
  surface = "default",
  align = "left",
}: NarrativeSectionProps) {
  const surfaceClass =
    surface === "elevated"
      ? "bg-[var(--keyra-surface)]"
      : surface === "silence"
        ? "bg-keyra-bg"
        : "bg-keyra-bg";

  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section
      id={id}
      className={`keyra-section scroll-mt-44 lg:scroll-mt-24 ${surfaceClass} ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={`mx-auto flex max-w-6xl flex-col ${alignClass}`}>
        <CinematicReveal depth="foreground">
          <p className="keyra-eyebrow">{eyebrow}</p>
        </CinematicReveal>
        <CinematicReveal depth="midground" delay={0.06} className="mt-4 w-full max-w-4xl">
          <h2 id={`${id}-title`} className="keyra-display-hero text-balance">
            {title}
          </h2>
        </CinematicReveal>
        {lead ? (
          <CinematicReveal depth="background" delay={0.12} className="mt-6 w-full max-w-2xl">
            <p className="keyra-prose text-pretty sm:text-lg">{lead}</p>
          </CinematicReveal>
        ) : null}
        {children ? (
          <CinematicReveal depth="background" delay={0.18} className="mt-12 w-full">
            {children}
          </CinematicReveal>
        ) : null}
      </div>
    </section>
  );
}