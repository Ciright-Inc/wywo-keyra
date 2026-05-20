import type { Metadata } from "next";
import Link from "next/link";
import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";

export const metadata: Metadata = {
  title: "Governments",
  description: "Sovereign digital identity infrastructure for nations — Keyra for governments and public institutions.",
};

export default function GovernmentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--keyra-space-section-x)] py-[var(--keyra-space-section-y)] text-keyra-primary">
      <PageIntentRibbon
        who="Government agencies, public institutions, and national infrastructure operators."
        problem="Identity fragmentation threatens national security and citizen trust."
        nextAction="Explore Keyra's sovereign identity infrastructure for your nation."
      />
      <p className="keyra-eyebrow">Government & Public Sector</p>
      <h1 className="keyra-display mt-3">Sovereign digital identity.</h1>
      <p className="keyra-prose mt-5 text-balance">
        Carrier-scale authentication infrastructure built for national resilience. Keyra provides governments with
        deterministic identity verification, cryptographic orchestration, and sovereign-grade trust systems.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="keyra-card border-keyra-border/80 p-6">
          <h3 className="text-lg font-semibold text-keyra-primary">Citizen Verification</h3>
          <p className="mt-2 text-sm text-keyra-text-2">
            Rooted identity verification for digital government services.
          </p>
        </div>
        <div className="keyra-card border-keyra-border/80 p-6">
          <h3 className="text-lg font-semibold text-keyra-primary">National Infrastructure</h3>
          <p className="mt-2 text-sm text-keyra-text-2">
            Carrier-aware signals for critical systems and continuity.
          </p>
        </div>
      </div>
      <p className="mt-8 text-sm text-keyra-text-2">
        Learn more about our{" "}
        <Link href="/global-deployment" className="font-medium text-keyra-accent underline-offset-2 hover:underline">
          global deployment infrastructure
        </Link>
        .
      </p>
    </div>
  );
}
