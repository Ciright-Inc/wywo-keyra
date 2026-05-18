import type { Metadata } from "next";
import { ContactLeadForm } from "@/components/contact/ContactLeadForm";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Be Protected Online. Contact Keyra — we respond in calm, plain language.",
};

export default function ContactPage() {
  return (
    <div className="keyra-band--light px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl">
              Contact Keyra
            </h1>
            <p className="mt-3 text-[18px] font-medium text-keyra-primary">
              Be Protected Online.
            </p>
            <p className="mt-4 text-base leading-relaxed text-keyra-ink sm:text-lg">
              Individuals, families, organizations, and institutions — share a
              few details and we’ll reply with calm, clear next steps.
            </p>
          </div>
        </FadeIn>

        <FadeIn className="mt-12 rounded-2xl border border-keyra-border/20 bg-keyra-surface p-5 text-left sm:rounded-3xl sm:p-8 md:p-10">
          <ContactLeadForm />
        </FadeIn>
      </div>
    </div>
  );
}
