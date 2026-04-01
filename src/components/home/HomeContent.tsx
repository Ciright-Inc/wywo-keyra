"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconDevices, IconShieldCheck, IconSpark } from "@/components/ui/Icons";

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
      className={`scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function HomeContent() {
  return (
    <>
      <section className="relative min-h-[92vh] scroll-mt-24 overflow-hidden border-b border-kerya-border bg-kerya-bg px-4 py-20 sm:px-6 sm:py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/image.png')",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-kerya-bg/85" aria-hidden />
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl items-center">
          <div className="max-w-2xl">
            <motion.h1
              className="text-[56px] font-bold leading-[1.08] tracking-tight text-kerya-text sm:text-[64px]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              Feel Protected Online
            </motion.h1>
            <motion.p
              className="mt-6 text-[18px] leading-relaxed text-kerya-text-2 sm:text-[20px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              Simple protection for you, your family, and everything that
              matters.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <Link href="/#get-started" className="inline-flex">
                <Button size="lg">Get Protected</Button>
              </Link>
              <Link href="/#how-it-works" className="inline-flex">
                <Button size="lg" variant="secondary">
                  How it works
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionShell id="product" className="bg-kerya-surface">
        <FadeIn>
          <h2 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
            The internet wasn’t built to protect you
          </h2>
          <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
            Scams, impersonation, and fake accounts can make everyday life feel
            uncertain. KERYA brings calm protection so you can move through the
            digital world with more confidence.
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell>
        <FadeIn>
          <h2 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
            KERYA makes protection simple
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "You are real",
                body: "Identity verification that keeps your digital life truly yours.",
                icon: <IconSpark className="h-5 w-5" />,
              },
              {
                title: "Your access is yours",
                body: "Verified sign-in designed to protect what only you should reach.",
                icon: <IconShieldCheck className="h-5 w-5" />,
              },
              {
                title: "Your family is protected",
                body: "Simple safety controls that help protect everyone at home.",
                icon: <IconDevices className="h-5 w-5" />,
              },
            ].map((item, idx) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
                className="kerya-card rounded-[var(--k-radius-card)] p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgb(11_31_42_/6%)] text-kerya-primary">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-[24px] font-semibold text-kerya-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-[16px] leading-relaxed text-kerya-text-2">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell id="how-it-works" className="bg-kerya-surface">
        <FadeIn>
          <h2 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
            Protection in seconds
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Download KERYA",
                body: "Set up your protection in moments.",
                ui: "App",
              },
              {
                title: "Verify once",
                body: "Confirm it is you with one simple step.",
                ui: "ID",
              },
              {
                title: "Stay protected everywhere",
                body: "Enjoy calm, continuous protection across your digital life.",
                ui: "Safe",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="kerya-card p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium uppercase tracking-wider text-kerya-text-2">
                    Step {i + 1}
                  </span>
                  <span className="rounded-full bg-kerya-primary px-3 py-1 text-[12px] font-semibold text-kerya-surface">
                    {item.ui}
                  </span>
                </div>
                <h3 className="mt-4 text-[24px] font-semibold text-kerya-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-[16px] leading-relaxed text-kerya-text-2">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell id="families">
        <FadeIn>
          <h2 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
            Protection you don’t have to think about
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "No passwords to remember",
              "No codes to chase",
              "No stress",
              "Always protected",
            ].map((point) => (
              <Card key={point} className="p-5">
                <p className="text-[16px] text-kerya-text">{point}</p>
              </Card>
            ))}
          </ul>
        </FadeIn>
      </SectionShell>

      <SectionShell id="get-started" className="pb-24">
        <FadeIn>
          <div className="overflow-hidden rounded-[var(--k-radius-sheet)] bg-kerya-primary px-6 py-14 text-center text-kerya-surface sm:px-12">
            <h2 className="text-[36px] font-semibold tracking-tight sm:text-[44px]">
              Protected by KERYA
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-kerya-surface/80 sm:text-[18px]">
              Protection that feels simple, human, and always there when it
              matters.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex"
            >
              <Button size="lg" variant="primary" className="bg-kerya-accent">
                Start now
              </Button>
            </Link>
          </div>
        </FadeIn>
      </SectionShell>
    </>
  );
}
