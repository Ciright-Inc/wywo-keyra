import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Enrol your identity, authenticate with confidence, and manage trusted access over time — explained in plain language.",
};

const steps = [
  {
    title: "Enrol your identity",
    body: "You create your trusted profile with KEYRA in a guided, step-by-step flow. No jargon. No guesswork. Just clarity about what you are setting up and why it helps.",
  },
  {
    title: "Authenticate with confidence",
    body: "When you access important services, KEYRA helps confirm it is really you. That supports safer sign-in and reduces the chance of someone else acting in your name.",
  },
  {
    title: "Manage trusted access",
    body: "You stay in charge of how your identity is used. Review access, adjust settings, and keep your digital presence aligned with how you live online.",
  },
  {
    title: "Stay protected over time",
    body: "Trust is ongoing. KEYRA is built to grow with you — from personal use to household protection and future app experiences — always centred on the person behind the screen.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight text-keyra-ink">
            How KEYRA works
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-keyra-muted">
            KEYRA protects you online by making sure you are really you. Here
            is the journey in simple terms — reassuring, not technical.
          </p>
        </FadeIn>

        <ol className="mt-14 space-y-10">
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <li className="rounded-2xl border border-keyra-border bg-keyra-surface p-6">
                <span className="text-sm font-semibold uppercase tracking-wide text-keyra-accent">
                  Step {i + 1}
                </span>
                <h2 className="mt-2 text-xl font-semibold text-keyra-ink">
                  {s.title}
                </h2>
                <p className="mt-3 leading-relaxed text-keyra-muted">{s.body}</p>
              </li>
            </FadeIn>
          ))}
        </ol>

        <FadeIn className="mt-14 rounded-2xl bg-keyra-accent-soft/50 p-8 text-center">
          <p className="font-medium text-keyra-ink">Ready to get protected?</p>
          <Link
            href="/#get-started"
            className="mt-4 inline-flex rounded-full bg-keyra-accent px-6 py-3 text-sm font-semibold text-keyra-surface hover:bg-keyra-muted"
          >
            Get started
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
