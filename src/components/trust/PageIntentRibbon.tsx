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
  /**
   * `onCosmic` — solid dark panel for busy / image heroes (high contrast).
   * `onSurface` — opaque light panel for editorial pages and light heroes.
   */
  tone?: "onSurface" | "onCosmic";
}) {
  const cosmic = tone === "onCosmic";

  const shell = cosmic
    ? "mb-8 rounded-2xl border border-white/15 bg-zinc-950 px-5 py-4 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:mb-10 sm:px-7 sm:py-5"
    : "mb-6 rounded-[var(--keyra-radius-card)] border border-black/12 bg-keyra-bg px-4 py-4 text-left shadow-[0_16px_48px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] sm:px-6 sm:py-5";

  const dt = cosmic
    ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400"
    : "text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2";

  const ddBase = cosmic
    ? "mt-2 text-sm font-medium leading-relaxed sm:text-[15px]"
    : "mt-1.5 text-sm font-medium leading-relaxed sm:text-[15px]";

  const ddDefault = cosmic ? "text-zinc-100" : "text-keyra-primary";
  const ddAccent = cosmic ? "text-white" : "text-keyra-accent";

  const sep = cosmic
    ? "border-t border-white/15 pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0"
    : "border-t border-black/10 pt-5 md:border-t-0 md:border-l md:pl-6 md:pt-0";

  return (
    <div className={shell} role="region" aria-label="Page intent">
      <dl className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
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
