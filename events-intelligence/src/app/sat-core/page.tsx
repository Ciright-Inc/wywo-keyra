import Link from "next/link";
import { SAT_LABELS } from "@/lib/constants";
import type { SatCoreProblem } from "@prisma/client";

const ordered = Object.keys(SAT_LABELS) as SatCoreProblem[];

export default function SatCorePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">SAT-Core alignment</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Each catalogue row maps to the SAT-Core problems Keyra instrumentality addresses — filter events by
        these tags to see where proof lands with carriers, banks, governments, and developers.
      </p>
      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {ordered.map((key) => (
          <li key={key}>
            <Link
              href={`/events?sat=${key}`}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--elevated)] px-5 py-4 transition hover:border-[var(--fg)]"
            >
              <p className="text-base font-medium text-[var(--fg)]">{SAT_LABELS[key]}</p>
              <p className="mt-2 font-mono text-[11px] text-[var(--muted-2)]">{key}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
