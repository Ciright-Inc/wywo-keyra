export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-[var(--keyra-surface)] p-8 text-center">
      <p className="text-sm font-semibold text-keyra-primary">{title}</p>
      <p className="mt-2 text-sm text-keyra-text-2">{body}</p>
    </div>
  );
}
