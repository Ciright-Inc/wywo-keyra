import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalDocument({ title, lastUpdated, intro, sections }: LegalDocumentProps) {
  return (
    <div className="keyra-band--light bg-keyra-bg px-4 py-12 sm:px-6 sm:py-20 md:py-24">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-keyra-primary sm:text-4xl md:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 text-[15px] text-keyra-text-2">Last updated: {lastUpdated}</p>
          <p className="mt-6 text-[16px] leading-relaxed text-keyra-text-2 sm:text-[18px]">
            <span className="text-keyra-primary">Be Protected Online.</span> {intro}
          </p>
        </FadeIn>

        <div className="mt-12 space-y-8">
          {sections.map((section, i) => (
            <FadeIn key={section.id} delay={i * 0.03}>
              <section
                id={section.id}
                className="keyra-card scroll-mt-24 p-5 sm:p-6"
                aria-labelledby={`${section.id}-heading`}
              >
                <h2
                  id={`${section.id}-heading`}
                  className="text-lg font-semibold text-keyra-text sm:text-xl"
                >
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-keyra-text-2 sm:text-[16px]">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                  {section.list ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.list.map((item) => (
                        <li key={item.slice(0, 48)}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12 text-center">
          <p className="text-[15px] leading-relaxed text-keyra-text-2">
            Questions about this page?{" "}
            <Link
              href="/contact"
              className="font-medium text-keyra-text underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
