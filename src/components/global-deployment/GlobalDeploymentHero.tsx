import { PageIntentRibbon } from "@/components/trust/PageIntentRibbon";

export function GlobalDeploymentHero() {
  return (
    <div className="border-b border-keyra-border bg-keyra-bg px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <PageIntentRibbon
          who="Governments, carriers, and security teams planning trusted digital identity."
          problem="Deployment posture is hard to see across regions, countries, and operators."
          nextAction="Explore the tree below; pair with Keyra admin for authoritative edits."
        />
        <p className="text-[14px] font-medium uppercase tracking-wider text-keyra-text-2">Global</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl">
          Global deployment
        </h1>
        <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
          A calm view of where Keyra is identified, validated, and operational — organized by formal region
          taxonomy and published country and operator records.
        </p>
      </div>
    </div>
  );
}
