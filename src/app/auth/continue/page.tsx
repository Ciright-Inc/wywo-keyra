"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

/**
 * Legacy / local-dev fallback: sync keyra_session from auth cookie, or from ?phone= after Get Started.
 * Normal flow: open Keyra with an active auth session — KeyraSessionProvider calls POST /api/keyra/session/sync.
 */
export default function AuthContinuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [message, setMessage] = useState("Connecting your Keyra session…");

  useEffect(() => {
    const phone = searchParams.get("phone")?.trim() ?? "";
    const next = searchParams.get("next")?.trim() || "/";
    const safeNext = next.startsWith("/") ? next : "/";

    let cancelled = false;

    async function run() {
      try {
        const syncRes = await fetch("/api/keyra/session/sync", {
          method: "POST",
          credentials: "include",
        });
        if (syncRes.ok) {
          if (cancelled) return;
          setMessage("Opening your dashboard…");
          router.replace(safeNext);
          return;
        }

        if (!phone.startsWith("+")) {
          throw new Error("No active session. Sign in again.");
        }

        const res = await fetch("/api/keyra/session/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phoneNumber: phone }),
        });
        const body = res.headers.get("content-type")?.includes("application/json")
          ? await res.json()
          : {};
        if (!res.ok) {
          throw new Error(
            typeof body.error === "string" ? body.error : "Could not start your Keyra session.",
          );
        }
        if (cancelled) return;
        setMessage("Opening your dashboard…");
        try {
          push({
            kind: "success",
            title: "Signed in",
            message: "Your phone is linked to Keyra on this device.",
          });
        } catch {
          // Toast is non-critical; session cookie is already set.
        }
        router.replace(safeNext);
      } catch (err) {
        if (cancelled) return;
        const text = err instanceof Error ? err.message : "Could not connect to Keyra.";
        setMessage(text);
        push({ kind: "error", title: "Session", message: text });
        router.replace(`/login?next=${encodeURIComponent(safeNext)}`);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, push]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-[16px] text-keyra-text-2">{message}</p>
    </div>
  );
}
