"use client";

import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { motion } from "framer-motion";
import { GlobalVerificationSignalsLive } from "@/components/home/GlobalVerificationSignalsLive";
import { LatestAuthenticationsFeed } from "@/components/home/LatestAuthenticationsFeed";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconFamilyShield,
  IconFingerprint,
  IconGlobeVerify,
  IconInstitution,
  IconKeyraMark,
  IconPartnerNetwork,
  IconSatSignal,
  IconUsers,
} from "@/components/ui/Icons";
import { keyraGovernmentsUrl } from "@/lib/keyraAppUrls";

const easeTrust = [0.22, 0.61, 0.36, 1] as const;

const globalSignalsRegionHref = keyraGovernmentsUrl();

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;
type HeroVariant = "default" | "bento";

function HeroLiveBadge({ variant }: { variant: HeroVariant }) {
  if (variant === "bento") {
    return (
      <span className="keyra-bento-live">
        <span className="keyra-hero-live__dot" aria-hidden />
        Live
      </span>
    );
  }
  return (
    <span className="keyra-hero-live">
      <span className="keyra-hero-live__dot" aria-hidden />
      Live
    </span>
  );
}

function HeroInsightIcon({
  icon: Icon,
  size = "md",
  tone = "trust",
  variant = "default",
}: {
  icon: HeroIcon;
  size?: "md" | "lg";
  tone?: "trust" | "warning" | "ink";
  variant?: HeroVariant;
}) {
  if (variant === "bento") {
    return (
      <span className="keyra-bento-icon" aria-hidden>
        <Icon className={size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4"} />
      </span>
    );
  }
  const toneClass =
    tone === "warning"
      ? "keyra-hero-icon--warning"
      : tone === "ink"
        ? "keyra-hero-icon--ink"
        : "";
  return (
    <span
      className={`keyra-hero-icon ${size === "lg" ? "keyra-hero-icon--lg" : ""} ${toneClass}`}
      aria-hidden
    >
      <Icon className={size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4"} />
    </span>
  );
}

function HeroInsightPanel({
  eyebrow,
  icon,
  badge,
  interactive = false,
  className = "",
  children,
  delay = 0,
  variant = "default",
  grow = false,
}: {
  eyebrow: string;
  icon: HeroIcon;
  badge?: ReactNode;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
  delay?: number;
  variant?: HeroVariant;
  grow?: boolean;
}) {
  if (variant === "bento") {
    return (
      <motion.div
        className={`keyra-bento-glass ${grow ? "keyra-bento-glass--grow" : ""} ${className}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: easeTrust }}
      >
        <div className="keyra-bento-glass__head">
          <div className="flex min-w-0 items-center gap-2.5">
            <HeroInsightIcon icon={icon} variant="bento" />
            <p className="keyra-bento-eyebrow--on-dark">{eyebrow}</p>
          </div>
          {badge}
        </div>
        <div className={`keyra-bento-glass__body ${grow ? "keyra-bento-glass__body--grow" : ""}`}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`keyra-hero-insight p-4 ${interactive ? "keyra-hero-insight--interactive" : ""} ${className}`}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: easeTrust }}
    >
      <div className="keyra-hero-insight__head">
        <div className="keyra-hero-insight__label">
          <HeroInsightIcon icon={icon} tone="trust" />
          <p className="keyra-hero-eyebrow">{eyebrow}</p>
        </div>
        {badge}
      </div>
      <div className="pt-3">{children}</div>
    </motion.div>
  );
}

const timelineSteps: {
  l: string;
  t: string;
  t2?: string;
  icon: HeroIcon;
}[] = [
  {
    l: "Who this is for",
    t: "Keyra is for everyone operating in the digital world — from individuals and households to enterprises, telecom operators, financial institutions, governments, and global platforms that require trusted identity, secure access, and sovereign digital trust infrastructure.",
    icon: IconUsers,
  },
  {
    l: "Problem",
    t: "Identity today is fragmented, unverifiable, and increasingly vulnerable to synthetic deception. As AI accelerates impersonation and fraud, the internet requires a hardware-rooted global trust layer capable of authenticating people, devices, applications, and transactions with certainty.",
    icon: IconAlertTriangle,
  },
  {
    l: "What to do next",
    t: "Continue below to provision your Keyra identity and establish a hardware-rooted trust relationship designed to protect individuals, families, enterprises, and national digital ecosystems from fraud and synthetic threats.",
    t2: "Existing members may sign in to administer identity, authentication, and trust policies.",
    icon: IconArrowRight,
  },
];

const heroCtaItems: {
  t: string;
  d: string;
  h: string;
  tag: string;
  icon: HeroIcon;
}[] = [
  {
    t: "Protect Your Identity",
    d: "Secure your personal identity, mobile device, and digital presence with Keyra.",
    h: "/signup",
    tag: "Personal",
    icon: IconFingerprint,
  },
  {
    t: "Protect Your Family",
    d: "Create a protected family identity registry for every family member.",
    h: "/app/family",
    tag: "Family",
    icon: IconFamilyShield,
  },
  {
    t: "Secure Your Organization",
    d: "Protect your company domains, data, and team identities.",
    h: "/contact",
    tag: "Enterprise",
    icon: IconInstitution,
  },
  {
    t: "Partner With Keyra",
    d: "Join Keyra as a telecom, technology, or service partner.",
    h: "/partners",
    tag: "Partners",
    icon: IconPartnerNetwork,
  },
];

export function HeroKeyraTimeline({ variant = "default" }: { variant?: HeroVariant }) {
  if (variant === "bento") {
    return (
      <motion.div
        className="keyra-bento-timeline"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.28, ease: easeTrust }}
      >
        {timelineSteps.map((item, i) => (
          <motion.div
            key={item.l}
            className="keyra-bento-glass keyra-bento-timeline__item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 + i * 0.06, ease: easeTrust }}
          >
            <div className="flex items-start gap-3">
              <HeroInsightIcon icon={item.icon} variant="bento" />
              <div className="min-w-0">
                <p className="keyra-bento-eyebrow--on-dark">{item.l}</p>
                <p className="keyra-bento-body mt-2">{item.t}</p>
                {item.t2 ? <p className="keyra-bento-body mt-2">{item.t2}</p> : null}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {timelineSteps.map((item, i) => (
          <div key={item.l} className="flex items-start gap-5">
            <div className="relative flex w-8 flex-col items-center self-stretch pt-0.5">
              {i > 0 ? (
                <div
                  className="absolute left-1/2 w-px -translate-x-1/2 bg-[var(--color-hairline-strong)]"
                  style={{ bottom: "calc(100% - 4px)", height: "20px" }}
                />
              ) : null}
              <div
                className={`keyra-hero-step ${i === 0 ? "keyra-hero-step--trust" : i === 1 ? "keyra-hero-step--warn" : "keyra-hero-step--next"} relative z-10`}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              {i < timelineSteps.length - 1 ? (
                <div
                  className="absolute left-1/2 top-8 w-px -translate-x-1/2 bg-[var(--color-hairline-strong)]"
                  style={{ height: "calc(100% + 4px)" }}
                />
              ) : null}
            </div>
            <motion.div
              className="keyra-hero-insight min-w-0 flex-1 px-5 py-4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: easeTrust }}
            >
              <p className="keyra-hero-eyebrow">{item.l}</p>
              <p className="mt-2 text-[13px] leading-[1.65] text-[var(--color-body-strong)]">
                {item.t}
              </p>
              {item.t2 ? (
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--color-body-strong)]">
                  {item.t2}
                </p>
              ) : null}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroKeyraWidgets({
  clientReady,
  variant = "default",
}: {
  clientReady: boolean;
  variant?: HeroVariant;
}) {
  const feedVariant = variant === "bento" ? "bento" : "hero";

  return (
    <div className={`flex min-w-0 flex-col gap-4 ${variant === "default" ? "lg:pt-1" : "min-h-0"}`}>
      <HeroInsightPanel
        eyebrow="Global verification signals"
        icon={IconGlobeVerify}
        badge={<HeroLiveBadge variant={variant} />}
        delay={0.35}
        variant={variant}
      >
        <GlobalVerificationSignalsLive variant={feedVariant} />
        <a
          href={globalSignalsRegionHref}
          className={
            variant === "bento"
              ? "keyra-bento-chip keyra-bento-chip--link mt-3"
              : "keyra-hero-signals-chip mt-3"
          }
        >
          <IconKeyraMark
            className={`h-3.5 w-3.5 shrink-0 ${variant === "bento" ? "text-[var(--bento-ink)]" : "text-[var(--color-ink)]"}`}
            aria-hidden
          />
          <span className="text-pretty">Carrier-scale signals — verified live by region</span>
        </a>
      </HeroInsightPanel>

      <HeroInsightPanel
        eyebrow="Latest authentications"
        icon={IconSatSignal}
        badge={
          variant === "bento" ? (
            <span className="keyra-bento-tag">S.A.T.</span>
          ) : (
            <span className="keyra-hero-tag" style={{ letterSpacing: "0.14em" }}>
              S.A.T.
            </span>
          )
        }
        delay={0.42}
        variant={variant}
        grow={variant === "bento"}
      >
        {clientReady ? (
          <LatestAuthenticationsFeed variant={feedVariant} />
        ) : (
          <p className={variant === "bento" ? "keyra-bento-body text-[12px]" : "text-[12px] text-[var(--color-muted)]"} aria-busy>
            Synchronizing trust feed…
          </p>
        )}
      </HeroInsightPanel>
    </div>
  );
}

export function HeroKeyraCtaGrid({ variant = "default" }: { variant?: HeroVariant }) {
  if (variant === "bento") {
    return (
      <motion.div
        className="keyra-bento-cta-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.48, ease: easeTrust }}
      >
        {heroCtaItems.map((item) => (
          <Link key={item.t} href={item.h} prefetch={false} className="group block h-full">
            <div className="keyra-bento-glass keyra-bento-cta-card h-full">
              <div className="flex items-start justify-between gap-3">
                <HeroInsightIcon icon={item.icon} size="lg" variant="bento" />
                <span className="keyra-bento-tag">{item.tag}</span>
              </div>
              <h3 className="keyra-bento-cta-card__title">{item.t}</h3>
              <p className="keyra-bento-cta-card__desc">{item.d}</p>
            </div>
          </Link>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: easeTrust }}
    >
      {heroCtaItems.map((item) => (
        <Link key={item.t} href={item.h} prefetch={false} className="group block h-full">
          <div className="keyra-hero-insight keyra-hero-insight--interactive flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <HeroInsightIcon icon={item.icon} size="lg" />
              <span className="keyra-hero-tag">{item.tag}</span>
            </div>
            <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-[var(--color-ink)]">
              {item.t}
            </h3>
            <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-[var(--color-body)]">
              {item.d}
            </p>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}
