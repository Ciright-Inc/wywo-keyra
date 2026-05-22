import type { ReactNode } from "react";
import { CinematicReveal } from "@/components/motion/CinematicReveal";
import { StaggerReveal } from "@/components/motion/StaggerReveal";

type NarrativeSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  /** Full-bleed background: pure white or pure black (`keyra-band--*`),for SLC-style alternation. */
  band?: "light" | "dark";
  align?: "left" | "center";
  /** When true, direct children reveal in sequence (use on card grids, not single CTAs). */
  stagger?: boolean;
  /** Layout classes on the children container (e.g. grid columns). */
  childrenClassName?: string;
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
  band = "light",
  align = "left",
  stagger = false,
  childrenClassName = "",
}: NarrativeSectionProps) {
  const childrenWrapClass = `mt-8 w-full ${childrenClassName}`.trim();
  const bandClass = band === "dark" ? "keyra-band--dark" : "keyra-band--light";

  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <section
      id={id}
      className={`keyra-section scroll-mt-[var(--keyra-header-offset)] ${bandClass} ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className={`mx-auto flex w-full min-w-0 max-w-6xl flex-col ${alignClass}`}>
        <CinematicReveal depth="foreground">
          <p className="keyra-eyebrow">{eyebrow}</p>
        </CinematicReveal>
        <CinematicReveal depth="midground" delay={0.06} className="mt-3 w-full max-w-4xl">
          <h2 id={`${id}-title`} className="keyra-display-hero text-balance">
            {title}
          </h2>
        </CinematicReveal>
        {lead ? (
          <CinematicReveal depth="background" delay={0.12} className="mt-4 w-full max-w-2xl">
            <p className="keyra-prose text-pretty sm:text-lg">{lead}</p>
          </CinematicReveal>
        ) : null}
        {children ? (
          stagger ? (
            <StaggerReveal className={childrenWrapClass} delay={0.12} stagger={0.06}>
              {children}
            </StaggerReveal>
          ) : (
            <CinematicReveal depth="background" delay={0.18} className={childrenWrapClass}>
              {children}
            </CinematicReveal>
          )
        ) : null}
      </div>
    </section>
  );
}
