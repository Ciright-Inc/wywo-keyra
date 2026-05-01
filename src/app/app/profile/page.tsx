"use client";

import {
  FormHoneypot,
  RegistrationFormShell,
  regField,
  regLabel,
} from "@/components/registration/registrationPrimitives";
import { Button } from "@/components/ui/Button";
import { useKeyraSession } from "@/contexts/KeyraSessionContext";
import { formatPhoneDisplay } from "@/lib/keyraSessionDisplay";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppProfilePage() {
  const router = useRouter();
  const { user, refresh } = useKeyraSession();
  const [honeypot, setHoneypot] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setEmail(user.email ?? "");
    setCountry(user.country ?? "");
  }, [user]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const res = await fetch("/api/keyra/session/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName,
          email,
          country,
          _honeypot: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      await refresh();
      router.refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl text-keyra-text-2">Redirecting…</div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">
        Profile
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-keyra-primary">
        Your details
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-keyra-text-2">
        Your name appears in the site header when provided. Phone:{" "}
        <span className="font-medium text-keyra-primary">
          {formatPhoneDisplay(user.phoneE164)}
        </span>
      </p>

      <div className="mt-8 rounded-[var(--keyra-radius-sheet)] border border-keyra-border bg-keyra-surface p-6">
        <RegistrationFormShell onSubmit={onSubmit} error={error}>
          <FormHoneypot value={honeypot} onChange={setHoneypot} />

          <div>
            <label htmlFor="prof-name" className={regLabel}>
              Display name
            </label>
            <input
              id="prof-name"
              className={regField}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Murphy"
              autoComplete="name"
            />
            <p className="mt-2 text-[13px] text-keyra-text-2">
              Shown in the header instead of your phone number when set.
            </p>
          </div>

          <div>
            <label htmlFor="prof-email" className={regLabel}>
              Email
            </label>
            <input
              id="prof-email"
              type="email"
              className={regField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="prof-country" className={regLabel}>
              Country / region
            </label>
            <input
              id="prof-country"
              className={regField}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Ireland"
              autoComplete="country-name"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
            <Link href="/app" className="inline-flex">
              <Button type="button" variant="secondary">
                Back to overview
              </Button>
            </Link>
          </div>

          {saved ? (
            <p className="text-[14px] font-medium text-[var(--keyra-accent)]" role="status">
              Profile saved.
            </p>
          ) : null}
        </RegistrationFormShell>
      </div>
    </div>
  );
}
