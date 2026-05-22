import { cn } from "@/components/ui/cn";

/** Equal-height grid for short narrative line cards (homepage, partners). */
export const narrativeCardGridBaseClass =
  "keyra-narrative-card-grid grid w-full max-w-5xl auto-rows-fr gap-3 sm:gap-4";

export function narrativeCardGridClass(columns: 2 | 3, className?: string) {
  return cn(
    narrativeCardGridBaseClass,
    columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
    className,
  );
}

/** Equal-height grid for audience / multi-line narrative panels. */
export const narrativeAudienceGridClass =
  "keyra-narrative-card-grid grid w-full auto-rows-fr gap-6 md:grid-cols-2";

export function narrativeEqualCard(cardBase: string) {
  return cn(cardBase, "keyra-narrative-card--equal");
}

export function narrativeEqualPanel(panelBase: string) {
  return cn(panelBase, "keyra-narrative-audience-panel");
}

export const narrativeLineTextDefaultClass =
  "text-[15px] font-medium leading-snug tracking-tight text-keyra-primary sm:text-[16px]";

export const narrativeLineTextCompactClass =
  "text-[14px] font-medium leading-relaxed text-keyra-primary sm:text-[15px]";
