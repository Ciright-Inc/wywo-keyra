import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Create your account, verify once, and stay protected everywhere.",
};

const steps = [
  {
    title: "Create your account",
    body: "Set up your profile in a clear, guided flow.",
  },
  {
    title: "Verify once",
    body: "Confirm it is really you with one simple check.",
  },
  {
    title: "Stay protected everywhere",
    body: "Keep protection active across your devices and family accounts.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
            Protection in seconds
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
            Every step is clear and calm. No technical language. No friction.
          </p>
        </FadeIn>

        <ol className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <li className="kerya-card">
                <span className="text-[14px] font-semibold uppercase tracking-wide text-kerya-accent">
                  Step {i + 1}
                </span>
                <h2 className="mt-2 text-[24px] font-semibold text-kerya-text">
                  {s.title}
                </h2>
                <p className="mt-2 text-[16px] leading-relaxed text-kerya-text-2">
                  {s.body}
                </p>
              </li>
            </FadeIn>
          ))}
        </ol>

        <FadeIn className="mt-12 text-center">
          <p className="font-medium text-kerya-text">You are one step away.</p>
          <Link href="/#get-started" className="mt-4 inline-flex">
            <Button>Get protected</Button>
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
