/** Side-by-side Menu + Access in the marketing header (mobile + desktop Access). */
export const KEYRA_HEADER_ACTIONS_GROUP = "flex shrink-0 items-center gap-2";

/** Shared pill chrome: 12px × 24px padding, Inter, smooth hover transition. */
const KEYRA_HEADER_ACTION_BASE =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-6 py-3 font-sans text-sm leading-none transition-[background-color,opacity,border-color] duration-200 ease-out";

/** Menu — outline: #E0E0E0 border, white fill, dark text, light gray hover. */
export const KEYRA_HEADER_ACTION_MENU = [
  KEYRA_HEADER_ACTION_BASE,
  "border border-[#E0E0E0] bg-white font-medium text-[var(--color-ink)]",
  "hover:bg-[#F5F5F5] active:bg-[#EEEEEE]",
].join(" ");

/** Mobile menu trigger — matches 9-dot launcher icon button. */
export const KEYRA_HEADER_ACTION_MENU_ICON = [
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[var(--keyra-radius-pill)] border border-keyra-border bg-white text-keyra-primary transition-colors duration-150 ease-out",
  "hover:border-black/14 hover:bg-black/[0.04] active:border-[rgba(255,255,255,0.14)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/35",
].join(" ");

/** Access — primary: #000 fill, bold white text, opacity hover. */
export const KEYRA_HEADER_ACTION_ACCESS = [
  KEYRA_HEADER_ACTION_BASE,
  "border-0 bg-black font-semibold text-white",
  "hover:opacity-[0.88] active:opacity-[0.82]",
].join(" ");
