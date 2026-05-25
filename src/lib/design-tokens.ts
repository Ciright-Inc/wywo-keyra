/**
 * Design tokens — TypeScript mirror of CSS variables in `globals.css`.
 * Source of truth for values: `agent.md`. Always reference tokens, not raw hex.
 */
export const ds = {
  canvas: "var(--ds-canvas)",
  canvasSoft: "var(--ds-canvas-soft)",
  surfaceCard: "var(--ds-surface-card)",
  surfaceStrong: "var(--ds-surface-strong)",
  surfaceDark: "var(--ds-surface-dark)",
  hairline: "var(--ds-hairline)",
  hairlineSoft: "var(--ds-hairline-soft)",
  hairlineStrong: "var(--ds-hairline-strong)",
  ink: "var(--ds-ink)",
  body: "var(--ds-body)",
  muted: "var(--ds-muted)",
  mutedSoft: "var(--ds-muted-soft)",
  onPrimary: "var(--ds-on-primary)",
  onDark: "var(--ds-on-dark)",
  primary: "var(--ds-primary)",
  primaryActive: "var(--ds-primary-active)",
  textLink: "var(--ds-text-link)",
  textLink2: "var(--ds-text-link-2)",
  success: "var(--ds-success)",
  error: "var(--ds-error)",
  warning: "var(--ds-warning)",
  radiusXs: "var(--ds-radius-xs)",
  radiusSm: "var(--ds-radius-sm)",
  radiusMd: "var(--ds-radius-md)",
  radiusLg: "var(--ds-radius-lg)",
  radiusXl: "var(--ds-radius-xl)",
  radiusPill: "var(--ds-radius-pill)",
  shadowSoft: "var(--ds-shadow-soft)",
  motionFast: "var(--ds-motion-fast)",
  motionBase: "var(--ds-motion-base)",
  motionSlow: "var(--ds-motion-slow)",
  ease: "var(--ds-ease)",
  fontSans: "var(--ds-font-sans)",
  fontAccent: "var(--ds-font-accent)",
} as const;

/** Website horizontal page padding — agent.md §1.1 */
export const pagePaddingX = "clamp(20px, 4vw, 48px)";

/** Website section vertical rhythm — agent.md §1.1 */
export const sectionPaddingY = "96px";

/** Dashboard sidebar width — agent.md §2.1 */
export const dashboardSidebarWidth = "240px";
