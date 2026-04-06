"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
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
      className={`scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:py-32 ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function TrustBlock({
  id,
  question,
  answer,
}: {
  id: string;
  question: string;
  answer: string;
}) {
  return (
    <FadeIn>
      <div
        id={id}
        className="keyra-card rounded-[var(--keyra-radius-card)] p-5 sm:p-7 md:p-8"
      >
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem] md:leading-tight">
          {question}
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
          {answer}
        </p>
      </div>
    </FadeIn>
  );
}

export function HomeContent() {
  return (
    <>
      <section className="relative min-h-[85vh] scroll-mt-24 overflow-hidden border-b border-keyra-border bg-keyra-bg px-4 py-20 sm:min-h-[92vh] sm:px-6 sm:py-28 lg:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/image.png')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-keyra-bg/85" aria-hidden />
        <div className="relative mx-auto flex min-h-[60vh] w-full min-w-0 max-w-6xl items-center sm:min-h-[72vh]">
          <div className="w-full min-w-0 max-w-2xl">
            <motion.h1
              className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-keyra-primary sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.08]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              Be Protected Online
            </motion.h1>
            <motion.p
              className="mt-6 text-[16px] leading-relaxed text-keyra-text-2 sm:text-lg md:text-[20px]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              Protection for your identity, money, data, and digital life. Calm,
              trusted protection for people, families, and businesses.
            </motion.p>
            <motion.div
              className="mt-9 flex w-full min-w-0 flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <Link href="/#get-started" className="inline-flex">
                <Button size="lg">Get protected</Button>
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

      <SectionShell id="product" className="bg-keyra-surface">
        <FadeIn>
          <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-primary">
            Protection first
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Simple protection for everyday life
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Keyra begins with protection. No jargon. No noise. Just clear,
            human trust you can feel from the first moment.
          </p>
        </FadeIn>
      </SectionShell>

      <SectionShell id="families" className="bg-keyra-bg">
        <div className="grid gap-8 lg:grid-cols-2">
          <TrustBlock
            id="family"
            question="Is your family protected?"
            answer="Keyra helps keep the people you care about covered — quietly, clearly, and without complexity. Protection you can explain simply at the kitchen table."
          />
          <TrustBlock
            id="customers"
            question="Are your customers protected?"
            answer="Give people a calm, premium experience they trust instantly. Keyra is built so protection feels respectful, not corporate or intimidating."
          />
        </div>
      </SectionShell>

      <SectionShell className="bg-keyra-surface">
        <div className="grid gap-8 lg:grid-cols-2">
          <TrustBlock
            id="money"
            question="Is your money protected?"
            answer="Transactions and accounts deserve the same quiet confidence as a leading financial brand. Keyra keeps protection present without drama."
          />
          <TrustBlock
            id="identity"
            question="Is your identity protected?"
            answer="Verification without friction. You stay in control while Keyra helps ensure it is really you when it matters."
          />
        </div>
      </SectionShell>

      <SectionShell className="bg-keyra-bg">
        <div className="grid gap-8 lg:grid-cols-2">
          <TrustBlock
            id="data"
            question="Is your data protected?"
            answer="Your information is treated with care. Clear choices, plain language, and protection that stays on in the background."
          />
          <TrustBlock
            id="business"
            question="Is your business protected?"
            answer="From teams to operations, Keyra scales the same calm promise: protection first, simplicity always, trust at every step."
          />
        </div>
      </SectionShell>

      <SectionShell id="reassurance" className="bg-keyra-surface">
        <FadeIn>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            You’re protected
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Trusted protection at every step. Built to protect what matters most.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Protection comes first",
              "Calm protection, always on",
              "Protection you can trust",
              "Quietly protecting every connection",
            ].map((line) => (
              <Card key={line} className="p-6">
                <p className="text-[16px] font-medium text-keyra-text">{line}</p>
              </Card>
            ))}
          </ul>
        </FadeIn>
      </SectionShell>

      <SectionShell id="how-it-works" className="bg-keyra-bg">
        <FadeIn>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Protection at every step
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
            Three calm steps. No technical language.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "1",
                title: "Get Keyra",
                body: "Set up in moments. Protection starts here.",
              },
              {
                step: "2",
                title: "Verify once",
                body: "One simple check so we know it is really you.",
              },
              {
                step: "3",
                title: "Stay protected",
                body: "Keyra stays on — quietly, consistently, everywhere you need it.",
              },
            ].map((item) => (
              <div key={item.title} className="keyra-card p-5 sm:p-6 md:p-7">
                <span className="text-[14px] font-semibold text-keyra-text-2">
                  Step {item.step}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-keyra-primary sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </SectionShell>

      <SectionShell id="get-started" className="pb-24 sm:pb-32">
        <FadeIn>
          <div className="overflow-hidden rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-keyra-surface px-4 py-12 text-center sm:px-10 sm:py-16 md:px-12 md:py-20">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
              Be Protected Online
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px] md:text-[18px]">
              Keyra is a feeling of protection — premium, human, and always
              there when it matters.
            </p>
            <Link href="/contact" className="mt-8 inline-flex">
              <Button size="lg" variant="primary">
                Start now
              </Button>
            </Link>
          </div>
        </FadeIn>
      </SectionShell>
    </>
  );
}
