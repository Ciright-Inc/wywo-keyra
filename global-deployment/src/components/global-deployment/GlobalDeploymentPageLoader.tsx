import { KeyraTrustLoader } from "@/components/ui/KeyraTrustLoader";

function Shimmer({ className }: { className?: string }) {
  return <div className={`keyra-skeleton ${className ?? ""}`} aria-hidden />;
}

/**
 * Route / suspense fallback for the global deployment experience.
 */
export function GlobalDeploymentPageLoader() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="Loading global deployment"
    >
      <div className="overflow-hidden rounded-[var(--keyra-radius-xl)] border border-keyra-border bg-keyra-bg">
        <div className="px-5 py-8 sm:px-8 sm:py-10">
          <Shimmer className="h-3 w-28" />
          <Shimmer className="mt-5 h-10 w-full max-w-xl" />
          <Shimmer className="mt-4 h-4 w-full max-w-lg" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Shimmer className="h-24 rounded-[var(--keyra-radius-lg)]" />
            <Shimmer className="h-24 rounded-[var(--keyra-radius-lg)]" />
            <Shimmer className="h-24 rounded-[var(--keyra-radius-lg)]" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--keyra-radius-xl)] border border-keyra-border bg-keyra-bg shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.04)]">
        <div className="border-b border-keyra-border bg-keyra-surface/50 px-4 py-4 sm:px-5 sm:py-5">
          <Shimmer className="h-6 w-40" />
          <Shimmer className="mt-2 h-4 w-64" />
          <div className="mt-4 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Shimmer key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="relative aspect-[2/1] min-h-[220px] bg-[#081420] sm:min-h-[280px]">
          <KeyraTrustLoader
            variant="overlay"
            label="Preparing deployment map"
            className="bg-[rgba(6,14,24,0.72)] backdrop-blur-[2px]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--keyra-radius-xl)] border border-keyra-border bg-keyra-bg">
        <div className="border-b border-keyra-border px-4 py-4 sm:px-5">
          <Shimmer className="h-6 w-36" />
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-14 rounded-[var(--keyra-radius-lg)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
