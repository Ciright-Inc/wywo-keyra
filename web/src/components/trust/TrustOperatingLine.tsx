/**
 * Calm trust visualization — operational, not cyberpunk.
 * Use for lightweight “infrastructure is present” reassurance.
 */
export function TrustOperatingLine({
  label = "Protection layer active",
  tone = "nominal",
}: {
  label?: string;
  tone?: "nominal" | "quiet";
}) {
  const dot =
    tone === "nominal"
      ? "bg-emerald-400/90 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
      : "bg-keyra-text-2/60";
  return (
    <div className="flex items-center gap-2 text-[11px] text-keyra-text-2 sm:text-xs" role="status">
      <span className={`relative inline-flex size-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className="leading-snug">{label}</span>
    </div>
  );
}
