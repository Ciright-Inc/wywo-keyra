import type { Metadata } from "next";
import Link from "next/link";
import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";

export const metadata: Metadata = {
  title: "Developers",
  description: "Build trusted identity into every interaction — Keyra ecosystem for integrators.",
};

/** Style 3 lane surface (data-keyra-lane=developer from middleware). */
export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--keyra-space-section-x)] py-[var(--keyra-space-section-y)] text-keyra-primary">
      <PageIntentRibbon
        who="Integrators, carriers, and product teams embedding Keyra APIs."
        problem="Authentication must be trustworthy without slowing shipping velocity."
        nextAction="Review the example request below; follow links to consumer and deployment surfaces when you need context."
      />
      <p className="keyra-eyebrow">Developer & partner ecosystem</p>
      <h1 className="keyra-display mt-3">Integrate with confidence.</h1>
      <p className="keyra-prose mt-5 text-balance">
        Carrier-grade APIs for rooted authentication. This surface uses the developer lane: structured
        rhythm, mono-friendly blocks, and technical clarity — aligned with the global Keyra design system.
      </p>
      <div
        className="keyra-code-block mt-8 rounded-[var(--keyra-radius-card)] border border-keyra-border bg-keyra-bg/80 p-4 text-keyra-text-2"
        role="region"
        aria-label="Example request"
      >
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-keyra-text-2">Example</p>
        <pre className="keyra-code overflow-x-auto text-keyra-primary">
          {`GET /api/keyra/latest-authentications/session
→ { feedEnabled, records, nextCursor, … }`}
        </pre>
      </div>
      <p className="mt-8 text-sm text-keyra-text-2">
        Public marketing remains on the{" "}
        <Link href="/" className="font-medium text-keyra-accent underline-offset-2 hover:underline">
          home experience
        </Link>
        . Operations & deployment intelligence live under{" "}
        <Link href="/global-deployment" className="font-medium text-keyra-accent underline-offset-2 hover:underline">
          Global deployment
        </Link>
        .
      </p>
    </div>
  );
}
