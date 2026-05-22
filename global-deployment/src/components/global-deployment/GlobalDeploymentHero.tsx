import { HeroCosmicBackdrop } from "@/components/trust/HeroCosmicBackdrop";

const INTENTS = [
  {
    label: "Who this is for",
    body: "Governments, carriers, and security teams planning trusted digital identity.",
    accent: false,
  },
  {
    label: "Problem",
    body: "Deployment posture is hard to see across regions, countries, and operators.",
    accent: false,
  },
  {
    label: "What to do next",
    body: "Explore the map and registry below; pair with Keyra admin for authoritative edits.",
    accent: true,
  },
] as const;

export function GlobalDeploymentHero() {
  return (
    <section className="relative min-h-[min(44vh,26rem)] overflow-hidden border-b border-keyra-border px-4 py-12 sm:px-6 sm:py-14 lg:min-h-[min(48vh,28rem)]">
      <HeroCosmicBackdrop variant="enterprise" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">Enterprise · Global</p>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
          Global deployment
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-200 sm:text-base">
          A calm view of where Keyra is identified, validated, and operational — organized by the same region and
          country records maintained in Keyra admin.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {INTENTS.map((item) => (
            <article
              key={item.label}
              className={[
                "relative overflow-hidden rounded-[var(--keyra-radius-lg)] border px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)]",
                item.accent
                  ? "border-[rgba(110,165,198,0.35)] bg-[rgba(248,250,252,0.97)]"
                  : "border-white/25 bg-[rgba(255,255,255,0.94)]",
              ].join(" ")}
            >
              {item.accent ? (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[rgba(90,130,165,0.55)] to-transparent" />
              ) : null}
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-keyra-text-2">{item.label}</p>
              <p
                className={`mt-2 text-[13px] leading-relaxed ${item.accent ? "font-medium text-keyra-primary" : "text-keyra-text-2"}`}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
