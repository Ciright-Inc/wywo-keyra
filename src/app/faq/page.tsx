import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Be Protected Online. Plain-language answers about Keyra as the identity trust layer of the internet.",
};

const faqs = [
  {
    q: "What is Keyra?",
    a: "Keyra is the identity trust layer of the internet. It helps people, businesses, and nations know who is real — so you can be protected online.",
  },
  {
    q: "What does “Be Protected Online.” mean?",
    a: "It is a reassurance and a standard. Keyra exists so protection and trust online feel certain — not like a constant guess.",
  },
  {
    q: "Is Keyra for families and businesses?",
    a: "Yes. Keyra is built for individuals, families, businesses, and governments — one calm standard across every audience.",
  },
  {
    q: "Does Keyra feel technical?",
    a: "No. Keyra is designed to feel like infrastructure: calm, simple, and always present when certainty matters.",
  },
  {
    q: "What data does Keyra collect?",
    a: "Keyra is built around restraint: collect only what helps protect you, explain it in plain language, and give you meaningful control. See Privacy for more.",
  },
  {
    q: "Who can I contact for help?",
    a: "Use our Contact page. We respond in calm, clear language.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-keyra-bg px-4 py-12 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Frequently asked questions
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
            <span className="text-keyra-primary">Be Protected Online.</span>{" "}
            Quick answers in plain language. If you need more detail, we are
            happy to help — see{" "}
            <Link href="/contact" className="font-medium text-keyra-primary underline-offset-4 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </FadeIn>

        <ul className="mt-12 space-y-6">
          {faqs.map((item, i) => (
            <FadeIn key={item.q} delay={i * 0.04}>
              <li className="keyra-card p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-keyra-primary sm:text-xl">{item.q}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">{item.a}</p>
              </li>
            </FadeIn>
          ))}
        </ul>

        <FadeIn className="mt-12 text-center">
          <p className="font-medium text-keyra-primary">Still have a question?</p>
          <Link href="/contact" className="mt-4 inline-flex">
            <Button>Contact us</Button>
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
