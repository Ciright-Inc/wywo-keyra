import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About KERYA",
  description:
    "KERYA exists to make protection simple, calm, and human for everyone.",
};

const sections = [
  { title: "Our mission", body: "Help every person feel protected online." },
  { title: "Why trust matters", body: "Clear identity reduces doubt and stress." },
  { title: "Built for people", body: "Simple language. Calm steps. Real control." },
  { title: "A better future", body: "Protection for individuals and families." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <FadeIn>
        <p className="text-sm font-medium uppercase tracking-wider text-kerya-accent">
          About KERYA
        </p>
        <h1 className="mt-3 text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
          Protection that feels simple
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
          KERYA helps people and families feel safe online without extra effort.
          You stay in control. You stay protected.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/how-it-works" className="inline-flex">
            <Button variant="secondary">How it works</Button>
          </Link>
          <Link href="/#get-started" className="inline-flex">
            <Button>Get protected</Button>
          </Link>
        </div>
      </FadeIn>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {sections.map((s, i) => (
          <FadeIn key={s.title} delay={i * 0.05}>
            <Card className="h-full">
              <h2 className="text-[24px] font-semibold text-kerya-text">{s.title}</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-kerya-text-2">
                {s.body}
              </p>
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn className="mt-12 rounded-[var(--k-radius-sheet)] bg-kerya-primary px-8 py-10 text-center">
        <p className="text-[24px] font-semibold text-kerya-surface">
          KERYA = Protected
        </p>
        <p className="mt-2 text-[16px] text-kerya-surface">
          A calm layer of protection for everyday digital life.
        </p>
      </FadeIn>
    </div>
  );
}
