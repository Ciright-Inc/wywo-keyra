import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Be Protected Online. Keyra privacy overview — respectful, clear, and restrained.",
};

export default function PrivacyPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight text-keyra-primary">
            Privacy
          </h1>
          <p className="mt-6 leading-relaxed text-keyra-ink">
            <span className="text-keyra-primary">Be Protected Online.</span>{" "}
            Keyra is built with privacy-respecting principles. A full policy will
            appear here before launch. In the meantime, our commitment is
            simple: collect only what helps protect your identity, explain it in
            plain language, and give you meaningful control.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
