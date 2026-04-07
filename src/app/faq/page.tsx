import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Keyra — protection, verification, families, and getting started in plain language.",
};

const faqs = [
  {
    q: "What is Keyra?",
    a: "Keyra helps you stay protected online with calm, clear verification and control over who can use your identity — without noisy jargon.",
  },
  {
    q: "How do I get started?",
    a: "Create your profile, follow the guided steps, and verify when it matters. You can explore the homepage sections or jump to Get Started anytime.",
  },
  {
    q: "Is Keyra for families and businesses?",
    a: "Yes. Keyra is designed for individuals, families, and teams who want trustworthy protection and simple language at every step.",
  },
  {
    q: "How does verification work?",
    a: "When an action needs to be sure it is really you, Keyra uses secure verification flows — explained clearly before you continue.",
  },
  {
    q: "What data does Keyra collect?",
    a: "We follow privacy-first principles: collect only what helps protect you, explain it plainly, and give you meaningful control. See our Privacy page for more.",
  },
  {
    q: "Who can I contact for help?",
    a: "Use our Contact page to send a message, or email hello@keyra.ie — we reply in calm, clear language.",
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
            Quick answers in plain language. If you need more detail, we are happy to help — see{" "}
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
