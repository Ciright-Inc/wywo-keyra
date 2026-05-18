import Link from "next/link";
import { INDUSTRY_LABELS, INDUSTRY_ORDER, INDUSTRY_SLUGS } from "@/lib/constants";

export default function IndustriesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">Industry directory</h1>
      <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">
        Cross-cut the catalogue by the lanes buyers travel — cybersecurity, identity, telecom, AI, banking,
        digital government, and more.
      </p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRY_ORDER.map((key) => (
          <li key={key}>
            <Link
              href={`/industries/${INDUSTRY_SLUGS[key]}`}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--elevated)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--fg)]"
            >
              {INDUSTRY_LABELS[key]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
