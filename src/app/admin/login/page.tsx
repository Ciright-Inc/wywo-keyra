import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminAccessGate } from "./AdminAccessGate";
import {
  resolveAdminAccessState,
  resolveDeploymentAuthFromCookies,
} from "@/lib/deployments/adminContext";

type Search = { next?: string; reason?: string };

function safeNext(raw: string | undefined): string {
  return raw?.startsWith("/admin") ? raw : "/admin/deployments";
}

async function AdminLoginContent({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const nextPath = safeNext(sp.next);
  const auth = await resolveDeploymentAuthFromCookies();
  if (auth) redirect(nextPath);

  const access = await resolveAdminAccessState();
  if (access.status === "authorized") redirect(nextPath);

  const reason =
    sp.reason === "no_access" || access.status === "no_access" ? "no_access" : "sign_in";

  return (
    <AdminAccessGate
      reason={reason}
      phoneE164={access.status === "no_access" ? access.phoneE164 : undefined}
      nextPath={nextPath}
    />
  );
}

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 ds-body-sm text-[var(--ds-body)]">Loading…</div>
      }
    >
      <AdminLoginContent searchParams={searchParams} />
    </Suspense>
  );
}
