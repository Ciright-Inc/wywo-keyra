import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Create your profile, verify once, and stay protected — explained in plain language, with protection always first.",
};

const steps = [
  {
    title: "Create your profile",
    body: "A guided, step-by-step flow. No jargon. Just clarity about what you are setting up and why it helps keep you protected.",
  },
  {
    title: "Verify with confidence",
    body: "When it matters, Keyra helps confirm it is really you — calmly and clearly.",
  },
  {
    title: "Manage trusted access",
    body: "You stay in charge. Review access and adjust settings in language that makes sense.",
  },
  {
    title: "Stay protected over time",
    body: "Protection does not stop after day one. Keyra grows with you, your family, and your business — always with the person first.",
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
            Be Protected Online — with a simple process, clear verification, and
            calm protection you can trust at every step.
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
          <p className="font-medium text-keyra-primary">Ready to be protected?</p>
          <Link href="/#get-started" className="mt-4 inline-flex">
            <Button>Get protected</Button>
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
