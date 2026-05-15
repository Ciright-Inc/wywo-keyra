import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";
import { HeroCosmicBackdrop } from "@/components/trust/HeroCosmicBackdrop";

export function GlobalDeploymentHero() {
  return (
    <section className="relative min-h-[min(48vh,28rem)] overflow-hidden border-b border-keyra-border px-4 py-14 sm:px-6 sm:py-16 lg:min-h-[min(44vh,26rem)]">
      <HeroCosmicBackdrop variant="enterprise" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <PageIntentRibbon
          tone="onCosmic"
          who="Governments, carriers, and security teams planning trusted digital identity."
          problem="Deployment posture is hard to see across regions, countries, and operators."
          nextAction="Explore the map and registry below; pair with Keyra admin for authoritative edits."
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Global</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-[3.35rem]">
          Global deployment
        </h1>
        <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
          A calm view of where Keyra is identified, validated, and operational — organized by formal region taxonomy
          and published country and operator records.
        </p>
      </div>
    </section>
  );
}
