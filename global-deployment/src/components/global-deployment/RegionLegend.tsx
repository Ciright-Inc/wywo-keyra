import { legendStatuses } from "@/lib/deployments/status";

export function RegionLegend() {
  const items = legendStatuses();
  return (
    <div className="keyra-card p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-keyra-text-2">Status legend</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.code} className="flex items-start gap-3 rounded-[var(--keyra-radius-md)] border border-keyra-border/80 bg-keyra-bg/60 px-3 py-2.5">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${s.dotClass}`} aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-keyra-primary">{s.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-keyra-text-2">{s.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
