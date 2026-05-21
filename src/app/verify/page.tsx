"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconShieldCheck } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

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
    <div className="bg-keyra-bg px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[720px]">
        <h1 className="text-3xl font-bold tracking-tight text-keyra-primary sm:text-[36px] lg:text-[44px]">
          Verify with one tap
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
          <span className="text-keyra-primary">Be Protected Online.</span> When
          it matters, verification should feel calm. Tap once and you’re done.
        </p>

        <Card className="mt-10 p-7">
          <CardHeader
            title="One‑tap verification"
            description="A simple confirmation that it’s really you."
            icon={<IconShieldCheck className="h-5 w-5" />}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button disabled={busy} onClick={() => void verify()}>
              {busy ? "Verifying…" : "Verify now"}
            </Button>
            <Link href="/app" className="inline-flex">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

