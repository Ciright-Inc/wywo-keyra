import Link from "next/link";
import { REGION_LABELS, REGION_ORDER, REGION_SLUGS } from "@/lib/constants";

export default function RegionsIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">Region directory</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Primary geopolitical structure — select a theater to see SAT-Core-aligned events and stakeholder
        gravity.
      </p>
      <ul className="mt-10 grid gap-3 md:grid-cols-2">
        {REGION_ORDER.map((r) => (
          <li key={r}>
            <Link
              href={`/regions/${REGION_SLUGS[r]}`}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--elevated)] px-5 py-4 transition hover:border-[var(--fg)]"
            >
              <span className="text-base font-medium text-[var(--fg)]">{REGION_LABELS[r]}</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">Open catalogue →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
