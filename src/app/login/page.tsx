"use client";

import {
  FormHoneypot,
  PhoneInternationalRow,
  RegistrationFormShell,
} from "@/components/registration/registrationPrimitives";
import { useDefaultPhoneDial } from "@/components/registration/useDefaultPhoneDial";
import { Button } from "@/components/ui/Button";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { combinePhoneParts } from "@/lib/phoneCountryOptions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, refresh } = useKeyraSession();
  const { phoneCountryCode, setPhoneCountryCode, dial } = useDefaultPhoneDial();
  const [national, setNational] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/app");
    }
  }, [user, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const mobileNumber = combinePhoneParts(dial, national);
    setPending(true);
    try {
      const res = await fetch("/api/keyra/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: mobileNumber,
          _honeypot: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not sign in.");
      }
      await refresh();
      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-keyra-text-2">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
      <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
        Account
      </p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary">
        Sign in with your phone
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-keyra-text-2">
        Your mobile number is your Keyra account. Add your name anytime under{" "}
        <strong className="font-medium text-keyra-primary">Profile</strong>.
      </p>

      <RegistrationFormShell onSubmit={onSubmit} error={error}>
        <FormHoneypot value={honeypot} onChange={setHoneypot} />
        <PhoneInternationalRow
          idBase="login-phone"
          label="Mobile number"
          phoneCountryCode={phoneCountryCode}
          nationalValue={national}
          onPhoneCountryChange={setPhoneCountryCode}
          onNationalChange={setNational}
          hint="Use your primary phone. OTP/SMS verification can be added when connected to Core."
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Signing in…" : "Continue"}
        </Button>
      </RegistrationFormShell>

      <p className="mt-8 text-center text-[14px] text-keyra-text-2">
        <Link href="/" className="font-medium text-[var(--keyra-accent)] hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
