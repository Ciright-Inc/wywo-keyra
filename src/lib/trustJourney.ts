import type { ComponentType, SVGProps } from "react";
import {
  IconFamilyShield,
  IconFingerprint,
  IconInstitution,
  IconPartnerNetwork,
} from "@/components/ui/Icons";

export type TrustJourneyAnchor = "account" | "family" | "enterprise" | "future";

export type TrustJourneyIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type TrustJourneyCard = {
  anchor: TrustJourneyAnchor;
  title: string;
  description: string;
  tag: string;
  icon: TrustJourneyIcon;
  moduleOpenEvent: string;
};

export type TrustJourneyDeepSection = {
  anchor: TrustJourneyAnchor;
  headline: string;
  subheadline: string;
  body: string;
  bodySecondary?: string;
  bullets: string[];
};

export type TrustJourneyGroup = {
  band: "light" | "dark";
  anchors: readonly [TrustJourneyAnchor, TrustJourneyAnchor];
};

export const TRUST_JOURNEY_CARDS: TrustJourneyCard[] = [
  {
    anchor: "account",
    title: "Protect Your Account",
    description:
      "Consent-driven identity verification with minimal exposure across your digital life.",
    tag: "Personal",
    icon: IconFingerprint,
    moduleOpenEvent: "account_module_open",
  },
  {
    anchor: "family",
    title: "Protect Your Family",
    description:
      "Shared protection and trusted recovery for the people closest to you.",
    tag: "Family",
    icon: IconFamilyShield,
    moduleOpenEvent: "family_module_open",
  },
  {
    anchor: "enterprise",
    title: "Guard Your Enterprise",
    description:
      "Infrastructure-grade trust for teams, systems, and organizational continuity.",
    tag: "Enterprise",
    icon: IconInstitution,
    moduleOpenEvent: "enterprise_module_open",
  },
  {
    anchor: "future",
    title: "Join Us And Build The Future Of Trust",
    description:
      "Privacy-first infrastructure for a more responsible digital future.",
    tag: "Future",
    icon: IconPartnerNetwork,
    moduleOpenEvent: "future_module_open",
  },
];

export const TRUST_JOURNEY_SECTIONS: TrustJourneyDeepSection[] = [
  {
    anchor: "account",
    headline: "Protect Your Account",
    subheadline:
      "Your trusted digital identity begins with consent, verification, and minimal exposure.",
    body: "Keyra helps establish a secure identity layer designed to reduce unnecessary exposure while supporting trusted digital access across devices, services, and connected systems.",
    bodySecondary:
      "Built with encryption, consent-driven verification, and privacy-first principles.",
    bullets: [
      "Trusted identity verification",
      "Mobile-bound trust architecture",
      "Minimal data exposure",
      "Secure access continuity",
      "Consent-first permissions",
      "Encrypted by default",
    ],
  },
  {
    anchor: "family",
    headline: "Protect Your Family",
    subheadline: "Trusted access and shared protection for the people closest to you.",
    body: "Keyra supports thoughtful identity continuity through consent-driven trusted access, shared recovery protections, and privacy-respecting family trust systems.",
    bodySecondary:
      "Designed to help reduce unnecessary exposure while preserving individual control.",
    bullets: [
      "Trusted recovery access",
      "Shared protection systems",
      "Privacy-first continuity",
      "Consent-driven permissions",
      "Secure family trust layers",
      "Human-centered identity design",
    ],
  },
  {
    anchor: "enterprise",
    headline: "Guard Your Enterprise",
    subheadline: "Operational trust infrastructure for modern organizations.",
    body: "Keyra helps organizations establish secure verification layers designed to support trusted access, identity integrity, and operational resilience across systems, devices, and teams.",
    bodySecondary:
      "Built with privacy-first architecture and minimal data exposure principles.",
    bullets: [
      "Verified organizational trust",
      "Infrastructure-grade identity systems",
      "Consent-driven access architecture",
      "Encrypted verification layers",
      "Minimal exposure design",
      "Governance-oriented security",
    ],
  },
  {
    anchor: "future",
    headline: "Join Us And Build The Future Of Trust",
    subheadline:
      "The next era of the internet requires trusted infrastructure designed around consent, verification, and human accountability.",
    body: "Keyra is building privacy-first trust infrastructure for individuals, enterprises, developers, telecoms, and institutions seeking a more responsible digital future.",
    bodySecondary: "Built with restraint, transparency, and minimal data principles.",
    bullets: [
      "Privacy-first infrastructure",
      "Consent-based verification",
      "Human-centered trust systems",
      "Telecom-grade architecture",
      "Minimal data exposure",
      "Responsible digital identity",
    ],
  },
];

/** Two full-width bands — two journey panels each (pairs hero cards 1–2 and 3–4). */
export const TRUST_JOURNEY_GROUPS: TrustJourneyGroup[] = [
  { band: "dark", anchors: ["account", "family"] },
  { band: "light", anchors: ["enterprise", "future"] },
];

export const TRUST_JOURNEY_SECTION_BY_ANCHOR: Record<
  TrustJourneyAnchor,
  TrustJourneyDeepSection
> = Object.fromEntries(TRUST_JOURNEY_SECTIONS.map((s) => [s.anchor, s])) as Record<
  TrustJourneyAnchor,
  TrustJourneyDeepSection
>;

export const TRUST_PRINCIPLES = [
  "Your data is not for sale.",
  "Encryption by default.",
  "Minimal data exposure.",
  "Consent before access.",
  "Human-centered trust systems.",
  "Continuous improvement.",
] as const;

/** Cinematic smooth scroll to a trust journey anchor with hash sync. */
export function scrollToTrustAnchor(
  anchor: TrustJourneyAnchor,
  options?: { updateHash?: boolean },
): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(anchor);
  if (!el) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });

  if (options?.updateHash !== false) {
    const next = `#${anchor}`;
    if (window.location.hash !== next) {
      window.history.pushState(null, "", next);
    }
  }
}

export function isTrustJourneyAnchor(value: string): value is TrustJourneyAnchor {
  return value === "account" || value === "family" || value === "enterprise" || value === "future";
}
