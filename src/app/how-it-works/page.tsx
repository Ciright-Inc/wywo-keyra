import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Be Protected Online. How Keyra establishes identity trust in plain language.",
};

const steps = [
  {
    title: "Start with a simple step",
    body: "Keyra begins calmly. You choose what you need, in plain language, with clarity at every step.",
  },
  {
    title: "Verification when it matters",
    body: "When a moment needs certainty, Keyra confirms who is real — without drama.",
  },
  {
    title: "Trust becomes a standard",
    body: "Verified people and entities create calmer interactions — for individuals, organizations, and institutions.",
  },
  {
    title: "Protection stays on",
    body: "Keyra is designed for long-term certainty. Protection remains consistent as life and risk change.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-keyra-bg px-4 py-12 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            How Keyra works
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
            <span className="text-keyra-primary">Be Protected Online.</span> A
            calm shift from guessing to knowing — for people, businesses, and
            nations.
          </p>
        </FadeIn>

        <ol className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <li className="keyra-card p-5 sm:p-6">
                <span className="text-[14px] font-semibold uppercase tracking-wide text-keyra-text-2">
                  Step {i + 1}
                </span>
                <h2 className="mt-2 text-xl font-semibold text-keyra-primary sm:text-2xl">
                  {s.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
                  {s.body}
                </p>
              </li>
            </FadeIn>
          ))}
        </ol>

        <FadeIn className="mt-12 text-center">
          <p className="font-medium text-keyra-primary">Be Protected Online.</p>
          <ButtonLink href="/#get-protected" className="mt-4">
            Protect Your Identity
          </ButtonLink>
        </FadeIn>
      </div>
    </div>
  );
}
