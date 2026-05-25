"use client";

import { ConsultationEmailForm } from "@/components/consultation/ConsultationEmailForm";
import { ConsultationInfrastructureVisual } from "@/components/consultation/ConsultationInfrastructureVisual";
import { ConsultationPathCards } from "@/components/consultation/ConsultationPathCards";
import { ConsultationSchedulingFlow } from "@/components/consultation/ConsultationSchedulingFlow";
import { FadeIn } from "@/components/motion/FadeIn";
import Link from "next/link";
import { useState } from "react";

type View = "choose" | "email" | "calendar";

export function ConsultationExperience() {
  const [view, setView] = useState<View>("choose");

  return (
    <>
      <FadeIn>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-keyra-muted">
            Keyra Advisory
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            Request Strategic Consultation
          </h1>
          <p className="mt-6 text-base leading-relaxed text-keyra-muted sm:text-lg">
            Engage Keyra advisors to discuss identity infrastructure,
            authentication modernization, SIM-bound trust, fraud reduction, AI
            agent identity, secure devices, carrier integration, enterprise
            deployment, and global rollout strategy.
          </p>
        </div>
      </FadeIn>

      <FadeIn className="mt-14" delay={0.05}>
        <ConsultationInfrastructureVisual />
      </FadeIn>

      <FadeIn className="mt-14" delay={0.1}>
        {view === "choose" ? (
          <ConsultationPathCards
            onSelect={(path) => setView(path)}
          />
        ) : null}

        {view === "email" ? (
          <div className="rounded-2xl border border-keyra-border/20 bg-keyra-surface p-5 sm:rounded-3xl sm:p-8 md:p-10">
            <ConsultationEmailForm onBack={() => setView("choose")} />
          </div>
        ) : null}

        {view === "calendar" ? (
          <div className="rounded-2xl border border-keyra-border/20 bg-keyra-surface p-5 sm:rounded-3xl sm:p-8 md:p-10">
            <ConsultationSchedulingFlow onBack={() => setView("choose")} />
          </div>
        ) : null}
      </FadeIn>

      {view === "choose" ? (
        <FadeIn className="mt-20 text-center" delay={0.15}>
          <p className="text-sm leading-relaxed text-keyra-muted">
            This is the entry point into Keyra&apos;s strategic advisory layer
            for organizations preparing to modernize identity, authentication,
            fraud prevention, SIM trust, secure devices, AI agent verification,
            and global digital trust infrastructure.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setView("calendar")}
              className="rounded-full border border-keyra-text bg-keyra-text px-6 py-3 text-sm font-semibold text-keyra-bg transition hover:opacity-90"
            >
              Schedule Video Consultation
            </button>
            <button
              type="button"
              onClick={() => setView("email")}
              className="rounded-full border border-keyra-border px-6 py-3 text-sm font-semibold text-keyra-primary transition hover:border-keyra-text/30"
            >
              Send Consultation Request
            </button>
          </div>
          <p className="mt-10">
            <Link
              href="/contact"
              className="text-sm font-medium text-keyra-text underline-offset-4 hover:underline"
            >
              Speak With Keyra Advisors
            </Link>
          </p>
        </FadeIn>
      ) : null}
    </>
  );
}
