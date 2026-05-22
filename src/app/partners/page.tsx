import type { Metadata } from "next";
import Link from "next/link";
import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerReveal } from "@/components/motion/StaggerReveal";
import { narrativeCardGridClass, narrativeEqualPanel } from "@/components/home/narrative/narrativeGrid";
import { keyraDeveloperPortalUrl } from "@/lib/keyraAppUrls";

export const metadata: Metadata = {
  title: "Partners",
  description: "Partner with Keyra to build trusted identity infrastructure — enterprise and ecosystem integrations.",
};

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--keyra-space-section-x)] py-[var(--keyra-space-section-y)] text-keyra-primary">
      <PageIntentRibbon
        who="Enterprise partners, carriers, and technology integrators."
        problem="Authentication fragmentation increases fraud and operational complexity."
        nextAction="Explore partnership opportunities with Keyra's identity infrastructure."
      />
      <FadeIn>
        <p className="keyra-eyebrow">Partner Ecosystem</p>
        <h1 className="keyra-display mt-3">Build trust at scale.</h1>
        <p className="keyra-prose mt-5 text-balance">
          Partner with Keyra to integrate deterministic identity verification into your products and services.
          Our carrier-grade APIs provide rooted authentication that scales across enterprises and ecosystems.
        </p>
      </FadeIn>
      <StaggerReveal className={narrativeCardGridClass(2, "mt-8 max-w-none")}>
        <div className={narrativeEqualPanel("keyra-card keyra-home-card--lift border-keyra-border/80 p-6")}>
          <h3 className="text-lg font-semibold text-keyra-primary">Enterprise Integration</h3>
          <p className="mt-2 text-sm text-keyra-text-2">
            Embed Keyra&apos;s verification into your enterprise applications.
          </p>
        </div>
        <div className={narrativeEqualPanel("keyra-card keyra-home-card--lift border-keyra-border/80 p-6")}>
          <h3 className="text-lg font-semibold text-keyra-primary">Carrier Partners</h3>
          <p className="mt-2 text-sm text-keyra-text-2">
            Join the global carrier network for identity verification.
          </p>
        </div>
      </StaggerReveal>
      <FadeIn className="mt-8">
        <p className="text-sm text-keyra-text-2">
          Explore our{" "}
          <a
            href={keyraDeveloperPortalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-keyra-accent underline-offset-2 hover:underline"
          >
            developer platform
          </a>
          {" "}and{" "}
          <Link href="/contact" className="font-medium text-keyra-accent underline-offset-2 hover:underline">
            contact us
          </Link>
          {" "}to discuss partnership opportunities.
        </p>
      </FadeIn>
    </div>
  );
}
