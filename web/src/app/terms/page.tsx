import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for KERYA — clear expectations for the service.",
};

export default function TermsPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight text-kerya-text">
            Terms
          </h1>
          <p className="mt-6 leading-relaxed text-kerya-text-2">
            Formal terms of use will be published here ahead of public enrolment.
            They will be written to be as readable as possible — consistent with
            how we approach the rest of KERYA.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
