import Link from "next/link";
import { KeyraLogo } from "@/components/brand/KeyraLogo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-kerya-bg">
      <header className="sticky top-16 z-40 border-b border-kerya-border bg-kerya-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/app" className="inline-flex items-center gap-3">
            <KeyraLogo variant="inline" showWordmark={false} />
            <span className="text-[14px] font-medium text-kerya-text-2">
              Your protection
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="App">
            {[
              { href: "/app", label: "Overview" },
              { href: "/app/family", label: "Family" },
              { href: "/app/settings", label: "Settings" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[14px] font-medium text-kerya-text-2 transition hover:bg-kerya-bg hover:text-kerya-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}

