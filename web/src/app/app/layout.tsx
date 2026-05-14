import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";
import { TrustOperatingLine } from "@/components/trust/TrustOperatingLine";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-keyra-bg">
      <header className="sticky top-16 z-[var(--keyra-z-sticky)] border-b border-keyra-border bg-keyra-surface/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/app"
              className="inline-flex min-w-0 items-center gap-2 sm:gap-3"
            >
              <KeyraLogo variant="inline" showWordmark={false} />
              <span className="hidden text-[14px] font-medium text-keyra-text-2 sm:inline">
                Your protection
              </span>
            </Link>
            <nav
              className="flex min-w-0 flex-wrap items-center gap-1 sm:justify-end"
              aria-label="App"
            >
              {[
                { href: "/app", label: "Overview" },
                { href: "/app/profile", label: "Profile" },
                { href: "/app/family", label: "Family" },
                { href: "/app/settings", label: "Settings" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3 py-2 text-[13px] font-medium text-keyra-primary transition hover:bg-keyra-bg hover:text-keyra-text-2 sm:px-4 sm:text-[14px]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-2 border-t border-keyra-border/40 pt-2">
            <TrustOperatingLine label="Session protected — manage profile and devices anytime." />
          </div>
        </div>
      </header>
      <main className="min-w-0 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
