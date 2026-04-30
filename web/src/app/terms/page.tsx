import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Terms",
  description: "Be Protected Online. Terms of use for Keyra — written to be clear and readable.",
};

export default function TermsPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight text-keyra-primary">
            Terms
          </h1>
          <p className="mt-6 leading-relaxed text-keyra-ink">
            <span className="text-keyra-primary">Be Protected Online.</span>{" "}
            Formal terms of use will be published here before we open more
            widely. They will be written to be as readable as possible —
            consistent with how we approach the rest of Keyra.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
