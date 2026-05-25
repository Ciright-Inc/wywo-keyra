export default function DataRoomsLoading() {
  return (
    <div className="animate-pulse space-y-4 py-2">
      <div className="h-8 w-48 rounded-lg bg-[var(--ds-canvas-soft)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-[var(--ds-canvas-soft)]" />
        ))}
      </div>
    </div>
  );
}
