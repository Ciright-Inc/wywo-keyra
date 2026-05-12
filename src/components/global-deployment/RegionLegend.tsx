import { legendStatuses } from "@/lib/deployments/status";

export function RegionLegend() {
  const items = legendStatuses();
  return (
    <div className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-[var(--keyra-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-keyra-text-2">Legend</p>
      <ul className="mt-3 space-y-2">
        {items.map((s) => (
          <li key={s.code} className="flex items-start gap-2 text-sm text-keyra-text-2">
            <span className={`mt-1 size-2 shrink-0 rounded-full ${s.dotClass}`} aria-hidden />
            <span>
              <span className="font-semibold text-keyra-primary">{s.label}</span>
              <span className="block text-xs text-keyra-text-2">{s.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
