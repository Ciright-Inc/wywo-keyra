"use client";

import Link from "next/link";
import { REGION_LABELS, REGION_ORDER, REGION_SLUGS } from "@/lib/constants";

/** Stylized geopolitical lattice — calm abstraction for navigation. */
export function RegionLattice() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {REGION_ORDER.map((key, idx) => {
        const slug = REGION_SLUGS[key];
        const label = REGION_LABELS[key];
        return (
          <Link
            key={key}
            href={`/regions/${slug}`}
            className="group rounded-2xl border border-[var(--line)] bg-[var(--elevated)] px-4 py-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:border-[var(--fg)]"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-2)]">
              Region {String(idx + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 text-base font-medium leading-snug text-[var(--fg)] group-hover:underline">
              {label}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Browse intelligence anchors, SAT-Core alignment, and field priorities.
            </p>
          </Link>
        );
      })}
    </div>
  );
}
