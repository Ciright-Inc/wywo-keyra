import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Trust",
  description:
    "How KERYA builds trust with clear, human-first protection.",
};

const pillars = [
  {
    title: "Trust-centred design",
    body: "Every screen and message is meant to reduce doubt. You should always understand what is happening and why it helps you.",
  },
  {
    title: "User-first protection",
    body: "Protection exists to serve people. KERYA prioritizes your control and peace of mind.",
  },
  {
    title: "Privacy respect",
    body: "Your data deserves care. KERYA is shaped around privacy-aware practices and honest communication about how identity is used.",
  },
];

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <FadeIn>
        <p className="text-sm font-medium uppercase tracking-wider text-kerya-accent">
          Trust
        </p>
        <h1 className="mt-3 text-[36px] font-semibold tracking-tight text-kerya-text sm:text-[44px]">
          Safe. Simple. Human.
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
          Trust is built with clear choices, respectful language, and protection
          that always puts people first.
        </p>
      </FadeIn>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {pillars.map((p, i) => (
          <FadeIn key={p.title} delay={i * 0.05}>
            <div className="kerya-card h-full">
              <p className="text-[14px] font-semibold uppercase tracking-wide text-kerya-accent">
                Pillar {i + 1}
              </p>
              <h2 className="mt-2 text-[24px] font-semibold text-kerya-text">
                {p.title}
              </h2>
              <p className="mt-2 text-[16px] leading-relaxed text-kerya-text-2">
                {p.body}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn className="mt-12 flex flex-wrap gap-3">
        <Link href="/contact" className="inline-flex">
          <Button variant="secondary">Contact us</Button>
        </Link>
        <Link href="/about" className="inline-flex">
          <Button>Read about KERYA</Button>
        </Link>
      </FadeIn>
    </div>
  );
}
