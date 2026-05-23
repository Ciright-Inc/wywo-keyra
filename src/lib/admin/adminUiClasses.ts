/**
 * Shared admin UI class recipes (design.md §2).
 * Prefer these over inline Tailwind for dashboard consistency.
 */

/** Page title — 22px / 600 */
export const adminPageTitle = "ds-display-sm";

/** Section / card title — 16px / 600 */
export const adminSectionTitle = "ds-title-sm";

/** Sub-section label — 14px / 600 */
export const adminSubsectionTitle = "ds-body-sm font-semibold text-[var(--ds-ink)]";

/** Body copy — 14px */
export const adminBody = "ds-body-sm";

/** Meta / helper — 13px */
export const adminCaption = "ds-caption";

/** Eyebrow caps */
export const adminEyebrow = "ds-caption-uppercase";

/** Primary content panel */
export const adminPanel = "ds-feature-card is-dashboard";

/** Full-bleed section below a divider inside a dashboard panel */
export const adminPanelSectionDivider = "ds-panel-section-divider";

/** Standalone panel without hover shadow */
export const adminPanelStatic = "ds-admin-panel";

/** Form controls */
export const adminLabel = "ds-field-label";
export const adminInput = "ds-text-input is-sm";
export const adminInputWithMargin = "ds-text-input is-sm mt-1";
export const adminHelper = "ds-field-helper";
export const adminError = "ds-field-error";

/** Tables */
export const adminTableWrap = "ds-table-wrap";
export const adminTableWrapInset = "ds-table-wrap is-inset";
export const adminTable = "ds-table";
export const adminTableScroll = "ds-table-scroll";

/** Toolbar / header regions */
export const adminPageHeader = "ds-page-header";
export const adminPageToolbar = "ds-page-toolbar";

/** Auth catalog hero — KPI boxes on the right */
export const adminCatalogStatGrid = "ds-catalog-stat-grid";
export const adminCatalogStatBox = "ds-catalog-stat-box";
export const adminCatalogStatLabel = "ds-catalog-stat-box__label";
export const adminCatalogStatValue = "ds-catalog-stat-box__value";

/** Inline toolbar filters (auth catalog tabs) */
export const adminFilterLabel =
  "inline-flex shrink-0 items-center gap-2 ds-caption text-[var(--ds-body)] whitespace-nowrap";
export const adminFilterSelect = "ds-filter-select";
export const adminListboxOption = "ds-listbox-option";
export const adminListboxMenu = "ds-filter-select-menu";
export const adminFilterToolbar =
  "flex min-w-0 w-full flex-1 flex-wrap items-center gap-3 sm:w-auto";
export const adminToolbarMeta =
  "inline-flex shrink-0 items-center rounded-full border border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas-soft)] px-3 py-1.5 ds-caption text-[var(--ds-body)]";
export const adminToolbarStrip =
  "ds-admin-panel ds-admin-toolbar-strip sticky top-14 z-20 mt-3 flex flex-col gap-3 sm:flex-row sm:items-center";
export const adminInlineFormBody = "mt-4 border-t border-[var(--ds-hairline)] pt-5";
export const adminTableCellInput = `${adminInput} h-8 min-h-8 py-1 px-2 text-xs font-normal`;
export const adminTableDenseScroll = "ds-table-scroll is-dense-y";
export const adminTableDense = `${adminTable} is-dense`;
export const adminToolbarBtnSecondary = "ds-btn-secondary is-sm shrink-0";
export const adminToolbarBtnPrimary = "ds-btn-primary is-sm shrink-0";
export const adminToolbarBtnDanger =
  "ds-btn-secondary is-sm shrink-0 text-[var(--ds-error)] hover:text-[var(--ds-error)]";

/** Count badge */
export const adminCountBadge = "ds-badge-pill";

/** Empty states */
export const adminEmptyPanel = "ds-admin-empty mt-4 rounded-[var(--ds-radius-lg)] border border-[var(--ds-hairline-strong)] bg-[var(--ds-surface-card)]";

/** Tertiary nav — blue underlined (tables, inline) */
export const adminBackLink = "ds-text-link ds-body-sm inline-flex items-center gap-1";

/** Edit page header — black, no underline, top-right */
export const adminEditBackLink =
  "ds-edit-back-link ds-body-sm inline-flex shrink-0 items-center gap-1.5 no-underline hover:no-underline";

/** Checkbox control — black checked state, spaced from label via ds-form-checkbox-label */
export const adminCheckbox = "ds-admin-checkbox";

/** Checkbox + label row for create/edit forms */
export const adminFormCheckboxLabel = "ds-form-checkbox-label";
export const adminFormCheckboxLabelWide = "ds-form-checkbox-label sm:col-span-2";

/** Create/edit form layouts */
export const adminFormGrid = "ds-form-grid ds-form-grid--2 mt-4";
export const adminFormStack = "ds-feature-card is-dashboard mt-4 space-y-4";
/** Form control value — matches Authentication countries create fields */
export const adminFormInput = `${adminInput} font-normal disabled:opacity-55`;

/** Label-adjacent control with top margin (deployment label wraps input) */
export const adminLegacyInput = `${adminInputWithMargin} font-normal disabled:opacity-55`;

export const adminLegacySelect = adminLegacyInput;

export const adminTextareaMono =
  `${adminInputWithMargin} min-h-[5.5rem] resize-y font-mono font-normal disabled:opacity-55`;
export const adminFormHelper = "text-xs text-[var(--ds-body)] sm:col-span-2";
