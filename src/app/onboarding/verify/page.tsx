"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconShieldCheck } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

export default function VerifyPage() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function onVerify() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    push({
      kind: "success",
      title: "Verified",
      message: "You’re all set. Your protection is now active.",
    });
    setBusy(false);
  }

  return (
    <div className="bg-kerya-bg px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[720px]">
        <h1 className="text-[36px] font-bold tracking-tight text-kerya-text sm:text-[44px]">
          Verify once
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-kerya-text-2 sm:text-[18px]">
          This is a quick check to make sure it’s really you. After this, KERYA
          can keep you protected with less effort.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <CardHeader
              title="One‑tap verification"
              description="Tap once to confirm it’s you."
              icon={<IconShieldCheck className="h-5 w-5" />}
            />
            <div className="mt-6">
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => void onVerify()}
              >
                {busy ? "Verifying…" : "Verify now"}
              </Button>
              <p className="mt-3 text-center text-[14px] text-kerya-text-2">
                You can review and change this later in Settings.
              </p>
            </div>
          </Card>

          <Card className="p-7">
            <p className="text-[14px] font-medium uppercase tracking-wider text-kerya-text-2">
              What happens next
            </p>
            <p className="mt-3 text-[16px] leading-relaxed text-kerya-text">
              Once you’re verified, KERYA can help keep your sign‑ins and access
              calmer and more reliable.
            </p>
            <ul className="mt-6 space-y-3 text-[14px] text-kerya-text-2">
              <li>Less stress during important moments</li>
              <li>Clear, simple protection you can trust</li>
              <li>Confidence for you and your family</li>
            </ul>
            <Link href="/onboarding/complete" className="mt-6 inline-flex">
              <Button variant="secondary">Continue</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

