"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUDIENCE_LANE_HREFS, AUDIENCE_LANE_LABELS } from "@/lib/audienceLanes";

type Lane = "enterprise" | "ecosystem";

function activeLane(pathname: string): Lane {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p.startsWith("/admin")) return "enterprise";
  if (p.startsWith("/global-deployment")) return "enterprise";
  if (p.startsWith("/partners")) return "ecosystem";
  return "enterprise";
}

const items: { lane: Lane; href: string; label: string }[] = [
  { lane: "enterprise", href: AUDIENCE_LANE_HREFS.enterprise, label: AUDIENCE_LANE_LABELS.enterprise },
  { lane: "ecosystem", href: AUDIENCE_LANE_HREFS.ecosystem, label: AUDIENCE_LANE_LABELS.ecosystem },
];

export function AudienceLaneSwitcher({
  variant = "bar",
}: {
  variant?: "bar" | "compact" | "footer";
}) {
  const pathname = usePathname();
  const current = activeLane(pathname);

  const wrap =
    variant === "footer"
      ? "w-full"
      : variant === "compact"
        ? "flex flex-wrap gap-1.5"
        : "flex flex-wrap items-center justify-center gap-1 border-t border-black/10 bg-keyra-surface/95 backdrop-blur-sm px-2 py-1.5 sm:gap-2 sm:px-4";

  const rowJustify = variant === "footer" ? "justify-start" : "justify-center";

  const innerRowClass =
    variant === "bar"
      ? "grid w-full min-w-0 grid-cols-2 items-center justify-items-center gap-x-0 gap-y-0 sm:flex sm:w-full sm:flex-wrap sm:justify-center sm:gap-2"
      : `flex w-full min-w-0 flex-wrap items-center gap-1 sm:gap-2 ${rowJustify}`;

  const pillActive =
    variant === "footer"
      ? "min-h-9 shrink-0 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-center text-[11px] font-semibold text-white sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs"
      : "min-h-9 shrink-0 rounded-full border border-keyra-accent/35 bg-keyra-accent/10 px-3 py-1.5 text-center text-[11px] font-semibold text-keyra-primary sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

  const pillIdle =
    variant === "footer"
      ? "min-h-9 shrink-0 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-center text-[11px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs"
      : "min-h-9 shrink-0 rounded-full px-3 py-1.5 text-center text-[11px] font-medium text-keyra-text-2 transition hover:bg-keyra-surface hover:text-keyra-primary sm:min-h-0 sm:px-3 sm:py-1.5 sm:text-xs";

  return (
    <div className={wrap} role="navigation" aria-label="Keyra audience: Governments or Partners">
      <div className={innerRowClass}>
        {items.map(({ lane, href, label }) => {
          const isActive = current === lane;
          return (
            <Link key={lane} href={href} className={isActive ? pillActive : pillIdle}>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
