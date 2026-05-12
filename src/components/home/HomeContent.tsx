"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { KeyraHomeGlobe } from "@/components/home/KeyraHomeGlobe";
import {
  KeyraGlobeLiveActivityPanel,
  KeyraGlobeLiveStatPanel,
} from "@/components/home/KeyraGlobeLivePanels";
import { HomeRegistrationCTAs } from "@/components/registration/HomeRegistrationCTAs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function SectionShell({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-44 px-4 py-16 sm:px-6 sm:py-24 lg:scroll-mt-24 lg:py-32 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SignalDot({
  style,
  delay = "0s",
  size = 6,
}: {
  style: React.CSSProperties;
  delay?: string;
  size?: number;
}) {
  return (
    <span
      className="animate-keyra-signal absolute rounded-full"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 30% 30%, rgba(102,227,255,1), rgba(102,227,255,0.12) 55%, rgba(102,227,255,0) 70%)",
        boxShadow:
          "0 0 20px rgba(102,227,255,0.28), 0 0 48px rgba(108,124,255,0.14)",
        animationDelay: delay,
        ...style,
      }}
      aria-hidden
    />
  );
}

export function HomeContent() {
  return (
    <>
      <section className="relative min-h-[min(88vh,56rem)] scroll-mt-44 overflow-hidden border-b border-keyra-border bg-keyra-bg px-4 py-12 sm:px-6 sm:py-16 lg:scroll-mt-24 lg:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{ backgroundImage: "url('/image.png')" }}
          />
          <div className="absolute inset-0 bg-keyra-bg/55" />
          <div className="absolute inset-0 opacity-70">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(1200px 700px at 20% 15%, rgba(102,227,255,0.12), transparent 55%), radial-gradient(900px 540px at 80% 25%, rgba(108,124,255,0.10), transparent 55%), radial-gradient(950px 640px at 55% 85%, rgba(102,227,255,0.08), transparent 60%)",
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
          <SignalDot style={{ left: "14%", top: "28%" }} delay="0.1s" />
          <SignalDot style={{ left: "26%", top: "42%" }} delay="1.1s" size={7} />
          <SignalDot style={{ left: "38%", top: "31%" }} delay="0.7s" />
          <SignalDot style={{ left: "49%", top: "52%" }} delay="1.8s" size={8} />
          <SignalDot style={{ left: "57%", top: "34%" }} delay="0.3s" />
          <SignalDot style={{ left: "66%", top: "46%" }} delay="1.4s" size={7} />
          <SignalDot style={{ left: "78%", top: "33%" }} delay="0.9s" />
          <SignalDot style={{ left: "84%", top: "55%" }} delay="2.1s" size={8} />
          <SignalDot style={{ left: "31%", top: "62%" }} delay="2.6s" />
          <SignalDot style={{ left: "62%", top: "68%" }} delay="1.9s" size={7} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-keyra-bg" />
        </div>

        <div className="relative mx-auto grid min-h-0 w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-8 py-4 sm:min-h-[52vh] lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)] lg:min-h-[54vh] lg:gap-10 lg:py-0">
          <div className="w-full min-w-0 max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-keyra-primary sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                Be Protected Online.
              </motion.span>
            </h1>
            <motion.p
              className="mt-5 text-balance text-[16px] leading-relaxed text-keyra-text-2 sm:text-lg md:text-[20px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              The identity trust layer of the internet — for people, businesses,
              and nations.
            </motion.p>

            <motion.div
              className="mt-7 w-full min-w-0 max-w-3xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <HomeRegistrationCTAs />
            </motion.div>

            <motion.p
              className="mt-8 text-sm text-keyra-text-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28 }}
            >
              A global standard that feels human. <span className="text-keyra-primary">Be Protected Online.</span>
            </motion.p>
          </div>

          <div className="pointer-events-auto relative flex w-full max-w-[min(100%,580px)] justify-center justify-self-center lg:max-w-[580px] lg:justify-self-end">
            <div
              className="keyra-globe-stage relative box-border flex w-full flex-col gap-3 lg:block lg:min-h-[min(500px,62vw)] lg:px-3 lg:pb-7 lg:pt-5"
              suppressHydrationWarning
            >
              <KeyraGlobeLiveStatPanel />
              <div className="relative order-2 mx-auto w-full max-w-[320px] sm:max-w-[380px] lg:absolute lg:left-1/2 lg:top-1/2 lg:max-w-[460px] lg:-translate-x-1/2 lg:-translate-y-1/2">
                <div
                  className="pointer-events-none absolute -inset-3 rounded-full opacity-90 blur-md sm:-inset-4"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 25%, rgba(102,227,255,0.22), transparent 58%), radial-gradient(circle at 70% 80%, rgba(108,124,255,0.12), transparent 55%)",
                  }}
                  aria-hidden
                />
                <div
                  className="relative mx-auto aspect-square w-full overflow-hidden rounded-full shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:aspect-auto lg:h-[460px] lg:w-[min(100%-24px,460px)] lg:max-w-[460px]"
                  suppressHydrationWarning
                >
                  <KeyraHomeGlobe className="block h-full w-full touch-pan-y" />
                </div>
              </div>
              <KeyraGlobeLiveActivityPanel />
            </div>
          </div>
        </div>
      </section>

      <SectionShell id="problem" className="bg-keyra-bg">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            The problem
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            The internet was built without identity.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            We do not know who is real. Fraud, scams, impersonation, and AI
            deception thrive in that gap. Trust is broken — and it doesn’t have
            to be.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "We don’t know who is real.",
              "Impersonation is easy.",
              "Trust is broken.",
              "The world needs a standard.",
            ].map((line) => (
              <Card key={line} className="p-6">
                <p className="text-[16px] font-medium text-keyra-text">{line}</p>
              </Card>
            ))}
          </div>

          <p className="mt-10 text-[15px] leading-relaxed text-keyra-text-2">
            <span className="text-keyra-primary">Be Protected Online.</span>
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell id="missing-layer" className="bg-[var(--keyra-surface)]">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            The shift
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            The missing layer.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Keyra brings identity to the network. Verified humans. Verified
            organizations. Verified systems. Protection that works quietly in
            the background — so trust feels immediate.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "You are either verified. Or you are not.",
              "Trust should not be a guess.",
              "Identity should be certain.",
            ].map((line) => (
              <Card key={line} className="p-6">
                <p className="text-[16px] font-medium text-keyra-text">{line}</p>
              </Card>
            ))}
          </div>

          <p className="mt-10 text-[15px] leading-relaxed text-keyra-text-2">
            <span className="text-keyra-primary">Be Protected Online.</span>{" "}
            Verification that feels calm. Protection that feels certain.
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell id="for" className="bg-keyra-bg">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            Who it’s for
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Built for everyone who needs trust.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Individuals. Families. Businesses. Governments. One calm standard:
            <span className="text-keyra-primary"> Be Protected Online.</span>
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Individuals",
              headline: "Know who you are connecting with.",
              body: "Your identity should protect you — everywhere you go online.",
              href: "/signup",
              cta: "Protect Your Identity",
            },
            {
              title: "Families",
              headline: "Protect those who don’t see the risks.",
              body: "Peace of mind for the people you care about most.",
              href: "/app/family",
              cta: "Protect Your Family",
            },
            {
              title: "Businesses",
              headline: "Build trust with every customer interaction.",
              body: "Reduce fraud. Increase confidence. Protect your brand.",
              href: "/contact",
              cta: "Secure Your Organization",
            },
            {
              title: "Governments",
              headline: "Establish sovereign digital identity.",
              body: "Infrastructure that supports citizens, institutions, and national resilience.",
              href: "/contact",
              cta: "Partner with Keyra",
            },
          ].map((item) => (
            <FadeIn key={item.title}>
              <div className="keyra-card p-7 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">
                  {item.title}
                </p>
                <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-keyra-primary">
                  {item.headline}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
                  {item.body}
                </p>
                <Link href={item.href} className="mt-6 inline-flex">
                  <Button variant="secondary">{item.cta}</Button>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="confidence" className="bg-[var(--keyra-surface)]">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            Confidence
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Certainty feels different.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            You don’t need to question every interaction. You don’t need to
            wonder what’s real. With Keyra, you know.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Trust becomes a standard.",
              "Protection becomes expected.",
              "Verification becomes normal.",
            ].map((line) => (
              <Card key={line} className="p-6">
                <p className="text-[16px] font-medium text-keyra-text">{line}</p>
              </Card>
            ))}
          </div>
          <p className="mt-10 text-[15px] leading-relaxed text-keyra-text-2">
            <span className="text-keyra-primary">Be Protected Online.</span>
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell id="global" className="bg-keyra-bg">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
            Global
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Built in Ireland. Designed for the world.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Keyra is an Ireland-based trust institution for the digital age —
            built to serve individuals, enterprises, and nations without
            compromise.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
            Global trust needs global standards.{" "}
            <span className="text-keyra-primary">Be Protected Online.</span>
          </p>
          <div className="mt-8">
            <Link href="/global-deployment" className="inline-flex">
              <Button variant="secondary">View Global Deployment</Button>
            </Link>
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell id="get-protected" className="pb-24 sm:pb-32">
        <FadeIn>
          <div className="overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-[var(--keyra-surface-2)] px-4 py-12 text-center sm:px-10 sm:py-16 md:px-12 md:py-20">
            <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
              Final impression
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
              The internet needs identity.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
              The next era of the internet is verified. The next era of safety
              is built-in. The next era of trust is Keyra.
            </p>
            <div className="mx-auto mt-10 max-w-xl rounded-[var(--keyra-radius-card)] border border-keyra-border bg-[rgba(255,255,255,0.03)] px-5 py-6">
              <p className="text-lg font-semibold text-keyra-primary">
                Be Protected Online.
              </p>
              <p className="mt-2 text-sm text-keyra-text-2">
                Keyra is infrastructure for trust.
              </p>
              <div className="mx-auto mt-8 max-w-3xl text-left">
                <HomeRegistrationCTAs />
              </div>
            </div>
          </div>
        </FadeIn>
      </SectionShell>
    </>
  );
}
