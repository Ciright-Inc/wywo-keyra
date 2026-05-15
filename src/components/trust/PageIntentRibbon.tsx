/**
 * Five-second clarity strip: who the page is for, what tension it addresses, what to do next.
 * Non-destructive: presentational only; does not replace hero copy.
 */
export function PageIntentRibbon({
  who,
  problem,
  nextAction,
  tone = "onSurface",
}: {
  who: string;
  problem: string;
  nextAction: string;
  /** `onCosmic` — frosted strip over starfield heroes. `onSurface` — Keyra sheet tokens for standard pages. */
  tone?: "onSurface" | "onCosmic";
}) {
  const cosmic = tone === "onCosmic";

  const shell = cosmic
    ? "mb-8 rounded-2xl border border-white/10 bg-slate-950/45 px-5 py-4 shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:mb-10 sm:px-7 sm:py-5"
    : "mb-6 rounded-[var(--keyra-radius-card)] border border-keyra-border/45 bg-keyra-surface/50 px-4 py-3 sm:px-5";

  const dt = cosmic ? "text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400" : "text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2";

  const ddBase = cosmic
    ? "mt-2 text-sm font-medium leading-relaxed sm:text-[15px]"
    : "mt-1 text-xs leading-snug sm:text-sm";

  const ddDefault = cosmic ? "text-slate-100" : "text-keyra-primary";
  const ddAccent = cosmic ? "text-cyan-100/95" : "text-keyra-accent";

  const sep = cosmic ? "sm:border-l sm:border-white/10 sm:pl-8" : "";

  return (
    <div className={`${shell} text-left`} role="region" aria-label="Page intent">
      <dl className={`grid gap-6 sm:grid-cols-3 ${cosmic ? "sm:gap-8" : "sm:gap-4"}`}>
        <div className="min-w-0">
          <dt className={dt}>Who this is for</dt>
          <dd className={`${ddBase} ${ddDefault}`}>{who}</dd>
        </div>
        <div className={`min-w-0 ${sep}`}>
          <dt className={dt}>Problem</dt>
          <dd className={`${ddBase} ${ddDefault}`}>{problem}</dd>
        </div>
        <div className={`min-w-0 ${sep}`}>
          <dt className={dt}>What to do next</dt>
          <dd className={`${ddBase} ${ddAccent}`}>{nextAction}</dd>
        </div>
      </dl>
    </div>
  );
}
