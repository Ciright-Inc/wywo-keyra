import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-sm text-keyra-text-2">Loading…</div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
