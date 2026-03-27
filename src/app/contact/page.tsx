import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about KEYRA, trusted identity, or getting started? Reach out and we will point you in the right direction.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight text-keyra-ink">
            We’re here to help
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-keyra-muted">
            Questions about KEYRA, trusted identity, or getting started? Reach
            out and we’ll point you in the right direction.
          </p>
        </FadeIn>

        <FadeIn className="mt-12 rounded-3xl border border-keyra-border bg-keyra-surface p-8 text-left shadow-sm">
          <p className="text-sm font-medium text-keyra-ink">Contact</p>
          <p className="mt-2 text-sm leading-relaxed text-keyra-muted">
            For launch, wire this block to your preferred channel — for example a
            simple form or{" "}
            <a
              href="mailto:hello@keyra.ie"
              className="font-medium text-keyra-accent underline-offset-4 hover:underline"
            >
              hello@keyra.ie
            </a>
            . We keep responses friendly and straightforward.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
