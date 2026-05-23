"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconShieldCheck } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

const benefits = [
  "Confirm it’s you with one tap",
  "Protection stays on in the background",
  "Return to what you were doing — calm and certain",
];

export default function VerifyNowPage() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function verify() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 650));
    push({ kind: "success", title: "You’re protected", message: "All good." });
    setBusy(false);
  }

  return (
    <section className="relative keyra-band--light">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,64rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-keyra-border to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex min-h-[calc(100dvh-var(--keyra-header-offset)-14rem)] max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="keyra-eyebrow">Verification</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
              Verify with one tap
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-keyra-muted sm:text-[18px]">
              <span className="font-medium text-keyra-primary">
                Be Protected Online.
              </span>{" "}
              When it matters, verification should feel calm. Tap once and
              you’re done.
            </p>
          </div>
        </FadeIn>

        <FadeIn
          className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8"
          delay={0.06}
        >
          <Card className="flex flex-col p-7 sm:p-8">
            <CardHeader
              title="One‑tap verification"
              description="A simple confirmation that it’s really you."
              icon={<IconShieldCheck className="h-5 w-5" />}
            />
            <div className="mt-auto pt-8">
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => void verify()}
              >
                {busy ? "Verifying…" : "Verify now"}
              </Button>
              <p className="mt-3 text-center text-[14px] text-keyra-muted">
                Takes a moment. No codes to type.
              </p>
            </div>
          </Card>

          <Card className="flex flex-col p-7 sm:p-8">
            <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-muted">
              What you get
            </p>
            <ul className="mt-5 flex-1 space-y-4">
              {benefits.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] leading-relaxed text-keyra-text"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-keyra-accent"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/" variant="secondary" className="w-full sm:w-auto">
                Back to home
              </ButtonLink>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}
