import Link from "next/link";
import { RegionLattice } from "@/components/map/RegionLattice";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-light text-[var(--fg)]">Global map</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        A calm lattice of geopolitical theaters — click through to regional intelligence. Cartographic
        precision matters less than navigational clarity and stakeholder truth.
      </p>
      <div className="mt-12">
        <RegionLattice />
      </div>
      <p className="mt-12 text-sm">
        <Link href="/regions" className="underline-offset-4 hover:underline">
          Directory view →
        </Link>
      </p>
    </div>
  );
}
