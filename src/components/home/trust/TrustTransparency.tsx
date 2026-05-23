"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { NEW_TAB_LINK } from "@/lib/newTabLink";
import { TRUST_PRINCIPLES } from "@/lib/trustJourney";
import { AccessKeyraButton } from "./AccessKeyraButton";

export function TrustTransparency() {
  return (
    <section
      id="trust-responsibility"
      className="keyra-trust-transparency keyra-section scroll-mt-[var(--keyra-header-offset)] keyra-band--light"
      aria-labelledby="trust-transparency-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-5xl px-0 sm:px-2">
        <FadeIn>
          <article className="keyra-home-panel keyra-trust-transparency-panel keyra-trust-panel--soft mx-auto w-full">
            <div className="keyra-trust-transparency-panel__body">
              <header className="keyra-trust-transparency-panel__header">
                <p className="keyra-trust-transparency-panel__eyebrow">Trust &amp; responsibility</p>
                <h2
                  id="trust-transparency-heading"
                  className="keyra-trust-transparency-panel__title text-balance"
                >
                  Built With Care
                </h2>
              </header>

              <div className="keyra-trust-transparency-panel__prose">
                <p className="keyra-trust-transparency-panel__lead text-pretty">
                  Keyra is designed to minimize exposure, support trusted verification, and operate
                  through encryption, consent, and privacy-first principles.
                </p>
                <p className="text-pretty">
                  But like all human-built systems, connected technologies are never entirely free
                  from interruption, misuse, evolving threats, or unforeseen events.
                </p>
                <p className="keyra-trust-transparency-panel__note text-pretty">
                  By using Keyra, users acknowledge the importance of informed participation,
                  thoughtful governance, and shared responsibility in trusted digital systems.
                </p>
              </div>

              <div className="keyra-trust-transparency-panel__principles-wrap">
                <p className="keyra-trust-transparency-panel__principles-label">Trust principles</p>
                <ul
                  className="keyra-trust-transparency-panel__principles"
                  aria-label="Trust principles"
                >
                  {TRUST_PRINCIPLES.map((principle) => (
                    <li key={principle}>{principle}</li>
                  ))}
                </ul>
              </div>
            </div>

            <footer className="keyra-trust-transparency-panel__footer">
              <p className="keyra-trust-transparency__terms text-pretty">
                By continuing, you agree to the{" "}
                <Link href="/terms" {...NEW_TAB_LINK} className="keyra-trust-transparency__link">
                  Keyra Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" {...NEW_TAB_LINK} className="keyra-trust-transparency__link">
                  Privacy Principles
                </Link>
                , and acknowledge that trusted digital systems require informed participation and
                shared responsibility.
              </p>
              <div className="keyra-trust-transparency-panel__cta">
                <AccessKeyraButton section="account" variant="primary" />
              </div>
            </footer>
          </article>
        </FadeIn>
      </div>
    </section>
  );
}
