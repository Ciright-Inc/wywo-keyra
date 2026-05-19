"use client";

/**
 * Shown on /admin when the session cookie is valid — standalone deploy has no public SiteHeader.
 */

export function AdminSessionBar() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3">
      <p className="text-sm text-[var(--muted)]">
        <span className="font-medium text-[var(--fg)]">Signed in</span>
        {" · "}
        You&apos;re logged in to the operator console.
      </p>
      <button
        type="button"
        onClick={() => void logout()}
        className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] underline-offset-4 hover:text-[var(--fg)] hover:underline"
      >
        Log out
      </button>
    </div>
  );
}
