/**
 * Five-second clarity strip: who the page is for, what tension it addresses, what to do next.
 * Non-destructive: presentational only; does not replace hero copy.
 */
export function PageIntentRibbon({
  who,
  problem,
  nextAction,
}: {
  who: string;
  problem: string;
  nextAction: string;
}) {
  return (
    <div
      className="mb-6 rounded-[var(--keyra-radius-card)] border border-keyra-border/45 bg-keyra-surface/50 px-4 py-3 text-left sm:px-5"
      role="region"
      aria-label="Page intent"
    >
      <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2">Who this is for</dt>
          <dd className="mt-1 text-xs leading-snug text-keyra-primary sm:text-sm">{who}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2">Problem</dt>
          <dd className="mt-1 text-xs leading-snug text-keyra-primary sm:text-sm">{problem}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-keyra-text-2">What to do next</dt>
          <dd className="mt-1 text-xs leading-snug text-keyra-accent sm:text-sm">{nextAction}</dd>
        </div>
      </dl>
    </div>
  );
}
