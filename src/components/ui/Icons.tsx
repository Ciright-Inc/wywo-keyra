import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconShieldCheck({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />
      <path d="M8.4 12.4 10.6 14.6 15.6 9.6" />
    </svg>
  );
}

export function IconSpark({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2Z" />
      <path d="M5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Z" />
    </svg>
  );
}

export function IconDevices({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M7 6h10a2 2 0 0 1 2 2v6H5V8a2 2 0 0 1 2-2Z" />
      <path d="M8 18h8" />
      <path d="M10 14v4" />
      <path d="M14 14v4" />
    </svg>
  );
}

export function IconPhone({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M22 16.9v2a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

export function IconUsers({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconBuilding({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function IconLink({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function IconAlertTriangle({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconArrowRight({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Keyra trust mark — key head with shield body (brand motif). */
export function IconKeyraMark({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <circle cx="8.5" cy="6.5" r="3.5" />
      <path d="M8.5 10v4" />
      <path d="M6.5 12h4" />
      <path d="M12 3 4 7v6c0 4.8 3.2 8.6 8 9.5 4.8-.9 8-4.7 8-9.5V7l-4-2" />
    </svg>
  );
}

/** SIM / eSIM hardware anchor for carrier-scale identity. */
export function IconSimChip({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M9 8h1" />
      <path d="M11 8h1" />
      <path d="M13 8h1" />
      <path d="M15 8h1" />
      <path d="M9 11h1" />
      <path d="M11 11h1" />
      <path d="M13 11h1" />
      <path d="M15 11h1" />
      <path d="M9 14h1" />
      <path d="M11 14h6" />
    </svg>
  );
}

/** S.A.T. protocol signal — sovereign authentication telemetry. */
export function IconSatSignal({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 3 5 7v5c0 4.2 3 7.6 7 8.5 4-.9 7-4.3 7-8.5V7l-7-4Z" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <path d="M10.5 12a1.5 1.5 0 0 1 3 0" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Global verification with deterministic check. */
export function IconGlobeVerify({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
      <path d="M8.5 14.5 10.5 16.5 15.5 11.5" />
    </svg>
  );
}

/** Biometric / deterministic identity proof. */
export function IconFingerprint({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 10a3 3 0 0 0-3 3v1" />
      <path d="M12 6v1" />
      <path d="M12 18v1" />
      <path d="M9 8.5a5.5 5.5 0 0 0-1 3.5V14" />
      <path d="M15 8.5a5.5 5.5 0 0 1 1 3.5V14" />
      <path d="M7 12a5 5 0 0 0 0 4" />
      <path d="M17 12a5 5 0 0 1 0 4" />
      <path d="M5 14a7 7 0 0 0 0 2" />
      <path d="M19 14a7 7 0 0 1 0 2" />
    </svg>
  );
}

/** Family identity registry under shared protection. */
export function IconFamilyShield({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M12 2 5 5.5V11c0 4.5 3 8.2 7 9 4-.8 7-4.5 7-9V5.5L12 2Z" />
      <circle cx="9" cy="11" r="1.25" />
      <circle cx="15" cy="11" r="1.25" />
      <path d="M10.5 14.5c.8.8 2.2.8 3 0" />
    </svg>
  );
}

/** Institutional / sovereign deployment. */
export function IconInstitution({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M4 20V10l8-5 8 5v10" />
      <path d="M9 20v-6h6v6" />
      <path d="M4 10h16" />
      <path d="M12 5v5" />
    </svg>
  );
}

/** Carrier & technology partner network. */
export function IconPartnerNetwork({ title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={!title} {...base} {...props}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v4" />
      <path d="M7.5 16.5 9.5 13" />
      <path d="M16.5 16.5 14.5 13" />
      <path d="M7 17h10" />
    </svg>
  );
}

