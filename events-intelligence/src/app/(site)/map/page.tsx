import Link from "next/link";
import { RegionLattice } from "@/components/map/RegionLattice";
import { WorldRegionMap } from "@/components/map/WorldRegionMap";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">Global map</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Interactive geopolitical view — each theater routes into regional intelligence. Precision is
        navigational: where buyers cluster for trust, identity, telecom, AI, and secure access.
      </p>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-medium text-[var(--fg)]">Geopolitical surface</h2>
        <WorldRegionMap />
      </section>

      <section className="mt-16 space-y-4">
        <h2 className="text-lg font-medium text-[var(--fg)]">Regional lattice</h2>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Alternate card layout for dense scanning — same eleven theaters as the primary navigation model.
        </p>
        <RegionLattice />
      </section>

      <p className="mt-12 flex flex-wrap gap-6 text-sm">
        <Link href="/regions" className="underline-offset-4 hover:underline">
          Region directory →
        </Link>
        <Link href="/countries" className="underline-offset-4 hover:underline">
          Country directory →
        </Link>
      </p>
    </div>
  );
}
