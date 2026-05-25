import type { Metadata } from "next";
import { ConsultationExperience } from "@/components/consultation/ConsultationExperience";

export const metadata: Metadata = {
  title: "Strategic Consultation",
  description:
    "Request strategic consultation with Keyra advisors — identity infrastructure, SIM-bound trust, fraud reduction, and enterprise deployment.",
};

export default function ConsultationPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative keyra-band--light px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,64rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-keyra-border to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl">
          <ConsultationExperience />
        </div>
      </section>

      <section className="keyra-band--dark border-t border-keyra-border/10 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-keyra-muted/90">
            Infrastructure-grade advisory
          </p>
          <p className="mt-4 text-lg font-medium text-keyra-primary">
            Powered by Ciright — contact, calendar, and secure video unified for
            Keyra strategic consultations.
          </p>
        </div>
      </section>
    </div>
  );
}
