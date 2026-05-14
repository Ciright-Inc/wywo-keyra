"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUDIENCE_LANE_HREFS, AUDIENCE_LANE_LABELS } from "@/lib/audienceLanes";

type Lane = "consumers" | "enterprise" | "ecosystem";

function activeLane(pathname: string): Lane {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p.startsWith("/admin")) return "enterprise";
  if (p.startsWith("/global-deployment")) return "enterprise";
  if (p.startsWith("/developers")) return "ecosystem";
  return "consumers";
}

const items: { lane: Lane; href: string; label: string }[] = [
  { lane: "consumers", href: AUDIENCE_LANE_HREFS.consumers, label: AUDIENCE_LANE_LABELS.consumers },
  { lane: "enterprise", href: AUDIENCE_LANE_HREFS.enterprise, label: AUDIENCE_LANE_LABELS.enterprise },
  { lane: "ecosystem", href: AUDIENCE_LANE_HREFS.ecosystem, label: AUDIENCE_LANE_LABELS.ecosystem },
];

export function AudienceLaneSwitcher({ variant = "bar" }: { variant?: "bar" | "compact" }) {
  const pathname = usePathname();
  const current = activeLane(pathname);

  const wrap =
    variant === "compact"
      ? "flex flex-wrap gap-1.5"
      : "flex flex-wrap items-center justify-center gap-1 border-t border-keyra-border/50 bg-keyra-bg/60 px-2 py-1.5 sm:gap-2 sm:px-4";

  return (
    <div className={wrap} role="navigation" aria-label="Keyra experience context: consumers, enterprise, or partners">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-1 sm:gap-2">
        {items.map(({ lane, href, label }) => {
          const isActive = current === lane;
          return (
            <Link
              key={lane}
              href={href}
              className={
                isActive
                  ? "min-h-9 shrink-0 rounded-full border border-keyra-accent/35 bg-keyra-accent/10 px-3 py-1.5 text-center text-[11px] font-semibold text-keyra-primary sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs"
                  : "min-h-9 shrink-0 rounded-full px-3 py-1.5 text-center text-[11px] font-medium text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary sm:min-h-0 sm:text-xs"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
