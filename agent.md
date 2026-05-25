# Design System — `designd.md`

> **How to use this file**
> This is a **reference document** — read it and apply it manually.
> Do NOT paste CSS blocks directly into `globals.css` or any stylesheet unless you are setting up tokens for the first time on a blank project.
> If your project already has styles, only add what is **missing** — never replace existing layout rules.

---

## ⚠️ Before you apply anything — read this

**Common mistakes that break layouts:**

1. **Do not replace your existing `:root` block** — only *add* missing tokens to it.
2. **Do not wrap your page in a scoped class** (like `.ds-site`) unless the entire page is a design-system surface. These class-scoped styles cascade downward and will override everything inside.
3. **Icons showing as text?** You are missing the font `<link>` in `<head>`. See [Section 0.1 — Icons](#01-fonts--icons).
4. **Sidebar color changed unexpectedly?** The sidebar is intentionally `#171717` (near-black). If your project had a different sidebar color before, that is a conflict — do not apply §2.6 Sidebar to a project that already has its own sidebar.
5. **Layout jumbled?** The CSS blocks in this file are **component-level only**. They do not set page layout, grid, or flex containers. If your layout broke, you accidentally replaced a layout rule.

---

## What this file covers

| Part | Surface | When to apply |
|------|---------|---------------|
| **Foundations (§0)** | Both | Always — tokens, fonts, base components |
| **Part 1 (§1)** | Public website / landing pages | Only for public-facing pages |
| **Part 2 (§2)** | Dashboard / admin UI | Only for signed-in / admin views |
| **§3–§4** | Cross-surface rules | Reference only — no CSS to paste |

---

## 0. Foundations — apply to both surfaces

### 0.1 Fonts & Icons

#### Step 1 — Add to `<head>` (once per project, in `layout.tsx` or `_document.tsx`)

```html
<!-- Material Symbols — required for all icons -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
/>
```

#### Step 2 — Load Inter + Montserrat via `next/font` (in `layout.tsx`)

```ts
import { Inter, Montserrat } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

// Apply both variables to <body>:
// <body className={`${inter.variable} ${montserrat.variable}`}>
```

#### Step 3 — Set font variables in CSS (add to `:root` if not already there)

```css
:root {
  --font-sans:   var(--font-inter), Inter, -apple-system, system-ui, sans-serif;
  --font-accent: var(--font-montserrat), Montserrat, sans-serif;
}
```

#### How to use icons correctly

Icons use **Material Symbols Outlined**. The `<span>` contains the icon **name as text** — this is intentional and correct. The font converts it to a glyph automatically.

```html
<!-- ✅ Correct — the font renders "play_arrow" as the play icon -->
<span class="material-symbols-outlined">play_arrow</span>

<!-- ✅ Correct — with sizing -->
<span class="material-symbols-outlined" style="font-size: 20px;">settings</span>
```

**If the icon name is showing as literal text** (e.g. you see the word "play_arrow" on screen), the font `<link>` is missing from `<head>`. Add it as shown in Step 1 above.

Icon sizes by context:

| Context | Size |
|---------|------|
| Inside buttons or inputs | `20px` |
| Section headers | `24px` |
| Dense table cells | `16px` |

Icons inherit `currentColor` — never set a hard-coded color on a `<span class="material-symbols-outlined">`.

**Icon family rule:** Use only Material Symbols Outlined. Do not mix with Lucide, Heroicons, Font Awesome, or any other set.

---

### 0.2 Color tokens

Add these to your `:root` in `globals.css`. **Only add what is missing — do not delete existing tokens.**

```css
:root {
  /* Surfaces */
  --ds-canvas:          #ffffff;   /* page background */
  --ds-canvas-soft:     #fafafa;   /* dashboard bg / row hover */
  --ds-surface-card:    #ffffff;   /* card / dropdown / modal */
  --ds-surface-strong:  #f0f0f3;   /* chip / muted pill bg */
  --ds-surface-dark:    #171717;   /* sidebar / dark accent (near-black) */

  /* Borders */
  --ds-hairline:        #f0f0f3;   /* whisper row divider */
  --ds-hairline-soft:   #f5f5f7;
  --ds-hairline-strong: #dcdee0;   /* default border — used everywhere */

  /* Text */
  --ds-ink:             #171717;   /* primary text */
  --ds-body:            #60646c;   /* secondary / muted text */
  --ds-muted:           #999999;   /* caption / placeholder / disabled icon */
  --ds-muted-soft:      #cccccc;   /* placeholder text */
  --ds-on-primary:      #ffffff;   /* text on primary (black) button */
  --ds-on-dark:         #ffffff;   /* text on dark surface */

  /* Actions */
  --ds-primary:         #000000;   /* primary button fill (black) */
  --ds-primary-active:  #1a1a1a;   /* primary button hover */
  --ds-text-link:       #0d74ce;   /* inline text links */
  --ds-text-link-hover: #476cff;   /* inline text link hover */

  /* Semantic (icons + inline text only — never button backgrounds) */
  --ds-success:         #16a34a;
  --ds-error:           #dc2626;
  --ds-warning:         #ab6400;

  /* Radius */
  --ds-radius-xs:   4px;
  --ds-radius-sm:   6px;
  --ds-radius-md:   8px;
  --ds-radius-lg:   12px;
  --ds-radius-xl:   16px;
  --ds-radius-pill: 9999px;

  /* Shadow — only one in the system */
  --ds-shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.04);
}
```

---

### 0.3 Color rules (read before using any color)

| Token | Allowed use | Never use for |
|-------|-------------|---------------|
| `--ds-primary` `#000000` | Primary button background | Body text, borders, chips |
| `--ds-ink` `#171717` | Headings, body text, dark surface | Button fills, borders |
| `--ds-text-link` `#0d74ce` | Inline links, tertiary button text | Primary button fill, heading text |
| `--ds-error` `#dc2626` | Error text, error icon, error input border | Button background |
| `--ds-success` `#16a34a` | Success icon, delta captions | Button background, heading text |
| `--ds-hairline-strong` `#dcdee0` | All borders everywhere | Text, button fills |

**Note:** `--ds-ink` (`#171717`) and `--ds-surface-dark` (`#171717`) share the same hex value but serve different roles — one is for text, the other is the dark surface background. Always reference the correct variable name so the intent is clear in code.

**No gradients.** Every background, button, card, and surface is a solid fill. `linear-gradient`, `radial-gradient`, and `backdrop-filter: blur()` are not used anywhere in this system.

---

### 0.4 Buttons

These classes are safe to add. They are component-scoped and will not affect page layout.

#### Primary button

```css
.ds-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 18px;
  background: var(--ds-primary);       /* #000000 */
  color: var(--ds-on-primary);         /* #ffffff */
  font: 500 14px/1 var(--font-sans);
  border: none;
  border-radius: var(--ds-radius-md);  /* 8px */
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.ds-btn-primary:hover    { background: var(--ds-primary-active); } /* #1a1a1a */
.ds-btn-primary:active   { transform: translateY(1px); }
.ds-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
```

#### Secondary button

```css
.ds-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 10px 18px;
  background: var(--ds-surface-card);          /* #ffffff */
  color: var(--ds-ink);                        /* #171717 */
  font: 500 14px/1 var(--font-sans);
  border: 1px solid var(--ds-hairline-strong); /* #dcdee0 */
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.ds-btn-secondary:hover    { background: var(--ds-canvas-soft); } /* #fafafa */
.ds-btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }
```

#### Tertiary / link-style button

```css
.ds-btn-tertiary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 8px 0;
  color: var(--ds-text-link);          /* #0d74ce */
  font: 500 14px/1 var(--font-sans);
  cursor: pointer;
  transition: color 0.2s ease;
}
.ds-btn-tertiary:hover { color: var(--ds-text-link-hover); } /* #476cff */
```

#### Small button variant (dashboard only)

Add `.is-sm` alongside `.ds-btn-primary` or `.ds-btn-secondary`:

```css
.ds-btn-primary.is-sm,
.ds-btn-secondary.is-sm {
  min-height: 32px;
  padding: 6px 12px;
  font-size: 13px;
  border-radius: var(--ds-radius-sm); /* 6px */
}
```

#### Icon button (square, 40×40)

```css
.ds-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-md);
  color: var(--ds-ink);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.ds-btn-icon:hover { background: var(--ds-canvas-soft); }
```

**Button rules:**
- Never fill a button with `--ds-text-link` (blue `#0d74ce`) — that is for inline text links only.
- Never fill a button with a semantic color (`--ds-success`, `--ds-error`, `--ds-warning`).
- Hover changes only the background (or text color for tertiary). Never changes border, radius, or size.

---

### 0.5 Text inputs

```css
.ds-text-input {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  background: var(--ds-surface-card);
  color: var(--ds-ink);
  font: 400 16px/1.5 var(--font-sans); /* 16px prevents iOS zoom */
  border: 1px solid var(--ds-hairline-strong);
  border-radius: var(--ds-radius-md);
  outline: none;
  transition: border-color 0.2s ease;
}
.ds-text-input:focus {
  border-width: 2px;
  border-color: var(--ds-ink);
  padding: 11px 15px; /* compensate for thicker border so content doesn't shift */
}
.ds-text-input.is-error {
  border-color: var(--ds-error);
}
.ds-text-input::placeholder {
  color: var(--ds-muted-soft);
}
```

Global focus ring (add once to `globals.css`):

```css
:focus-visible {
  outline: 2px solid var(--ds-ink);
  outline-offset: 3px;
}
```

---

### 0.6 Cards & panels

```css
.ds-feature-card {
  background: var(--ds-surface-card);
  border: 1px solid var(--ds-hairline-strong);
  border-radius: var(--ds-radius-lg); /* 12px */
  padding: 24px;
  transition: box-shadow 0.2s ease;
}
.ds-feature-card:hover {
  box-shadow: var(--ds-shadow-soft);
}

/* Dark/accent card variant — use sparingly for CTA strips */
.ds-feature-card-dark {
  background: var(--ds-surface-dark); /* #171717 */
  color: var(--ds-on-dark);
  border: none;
}
```

---

### 0.7 Badges & chips

```css
.ds-badge-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--ds-surface-strong); /* #f0f0f3 */
  color: var(--ds-ink);
  font: 600 11px/1.4 var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: var(--ds-radius-pill);
  white-space: nowrap;
}
```

---

### 0.8 Links in copy

```css
.ds-text-link {
  color: var(--ds-text-link);          /* #0d74ce */
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}
.ds-text-link:hover {
  color: var(--ds-text-link-hover);    /* #476cff */
}
```

---

### 0.9 Scrollbar (optional — only add if your project doesn't already style scrollbars)

```css
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--ds-canvas-soft); }
::-webkit-scrollbar-thumb { background: var(--ds-hairline-strong); border-radius: 3px; }
```

---

### 0.10 Reduced motion (add once to `globals.css`)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

---

## 1. Public website (home / landing / hero)

> Apply only to public-facing pages. Scope under a root body class if your project hosts both surfaces (e.g. `body.ds-site`).

### 1.1 Page shell

| Property | Value |
|----------|-------|
| Background | `#ffffff` |
| Max content width | `1200px`, centered |
| Horizontal padding | `clamp(20px, 4vw, 48px)` |
| Section spacing (top + bottom) | `96px` desktop, `64px` ≤768px |
| Top nav height | `64px`, white, no border at rest |
| Nav border on scroll | `1px solid #dcdee0` (add via JS after 8px scroll) |

### 1.2 Typography — website

| Class | Use | Size | Weight | Line-height | Tracking |
|-------|-----|------|--------|-------------|----------|
| `.ds-display-mega` | Hero H1 | `clamp(2rem, 5vw, 4rem)` | 600 | 1.05 | −0.03em |
| `.ds-display-xl` | Page H1 | `clamp(1.75rem, 4vw, 3rem)` | 600 | 1.10 | −0.03em |
| `.ds-display-lg` | Section title | `clamp(1.5rem, 3vw, 2.25rem)` | 600 | 1.15 | −0.03em |
| `.ds-display-md` | Card group title | `1.75rem` (28px) | 600 | 1.20 | −0.03em |
| `.ds-title-md` | Card title | `1.125rem` (18px) | 600 | 1.40 | 0 |
| `.ds-body-md` | Lead paragraph / body | `1rem` (16px) | 400 | 1.50 | 0 |
| `.ds-body-sm` | Card body text | `0.875rem` (14px) | 400 | 1.50 | 0 |
| `.ds-caption-uppercase` | Eyebrow labels | `0.6875rem` (11px) | 600 | 1.40 | +0.08em + UPPERCASE |

```css
.ds-display-mega    { font: 600 clamp(2rem, 5vw, 4rem)/1.05 var(--font-sans); letter-spacing: -0.03em; }
.ds-display-xl      { font: 600 clamp(1.75rem, 4vw, 3rem)/1.10 var(--font-sans); letter-spacing: -0.03em; }
.ds-display-lg      { font: 600 clamp(1.5rem, 3vw, 2.25rem)/1.15 var(--font-sans); letter-spacing: -0.03em; }
.ds-display-md      { font: 600 1.75rem/1.20 var(--font-sans); letter-spacing: -0.03em; }
.ds-title-md        { font: 600 1.125rem/1.40 var(--font-sans); }
.ds-body-md         { font: 400 1rem/1.50 var(--font-sans); }
.ds-body-sm         { font: 400 0.875rem/1.50 var(--font-sans); }
.ds-caption-uppercase {
  font: 600 0.6875rem/1.40 var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ds-muted);
}
```

### 1.3 Hero block structure

```
[eyebrow (.ds-caption-uppercase, muted)]
  ↓ 8px gap
[H1 (.ds-display-mega)]
  ↓ 16px gap
[lead paragraph (.ds-body-md, max-width: 60ch)]
  ↓ 32px gap
[.ds-btn-primary]  [.ds-btn-secondary]   ← row, 12px gap between buttons
```

Two-column desktop layout: `grid-template-columns: 1fr 1fr`, gap `48px`. Stacks at ≤960px.

### 1.4 Feature cards

Structure inside `.ds-feature-card`:

```
[thumbnail — border-radius: 8px]
  ↓ 16px
[category chip (.ds-badge-pill)]
  ↓ 8px
[title (.ds-title-md)]
  ↓ 8px
[description, 2 lines max (.ds-body-sm)]
  ↓ 16px
[meta row — duration / views (.ds-body-sm muted)]
```

Card grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap `24px`.

### 1.5 Section header pattern

```
[icon 24px]  [section title (.ds-display-md)]
             [subtitle (.ds-body-md, color: --ds-body)]     [optional count badge]
```

- 24px gap between icon and text block.
- 64px gap between section header and the card grid below it.
- 96px between top-level sections.

### 1.6 Footer

- Top border: `1px solid var(--ds-hairline-strong)`
- Vertical padding: `48px`
- Text: `.ds-body-sm`, color `var(--ds-body)`

---

## 2. Dashboard (signed-in / admin)

> Apply only to admin/dashboard views. Scope under a root class (e.g. `body[data-surface="dashboard"]`) so these rules don't leak into public pages.

### 2.1 Page shell

| Property | Value |
|----------|-------|
| Background | `#fafafa` (so white cards read as elevated) |
| Layout | Fixed left sidebar 240px + fluid content area |
| Sidebar background | `#171717` (near-black, `--ds-surface-dark`) |
| Top bar height | `56px`, white, `1px` bottom border `#dcdee0` |
| Content padding | `24px` (≤1280px) → `32px` (>1280px) |

**Important:** The sidebar being `#171717` is intentional and correct. If your project already has a sidebar with a different color, do not apply §2.6 — keep your existing sidebar structure and only adopt the typography and spacing rules from §2.2 onwards.

### 2.2 Typography — dashboard

Same families and weights as the website, one step smaller:

| Role | Size | Weight | Line-height |
|------|------|--------|-------------|
| Page title (H1) | 22px | 600 | 1.25 |
| Section / card title | 16px | 600 | 1.40 |
| Sub-section label | 14px | 600 | 1.40 |
| Body | 14px | 400 | 1.50 |
| Meta / helper | 13px | 400 | 1.40 |
| Table rows | 14px | 400 | 1.40 |
| KPI big number | 28px | 600 | 1.20 |
| Numbers in tables | Montserrat 13px | 400 | 1.40 |
| Eyebrow caps | 11px + UPPERCASE | 600 | 1.40, +0.08em |

No 48px or 64px display sizes in the dashboard. The largest text on screen is the KPI number at 28px.

### 2.3 Spacing — dashboard

```
Element gap inside a card:     12px
Card padding:                   20px
Card-to-card gap in grid:       16px
Section padding (top + bottom): 24–32px
Form field vertical gap:        16px
Table row height:               44px (comfortable) / 36px (compact)
```

### 2.4 Tables

```css
/* Apply to your table container */
.ds-table-wrap {
  border: 1px solid var(--ds-hairline-strong);
  border-radius: var(--ds-radius-lg);
  overflow: hidden;
}

/* Table itself — no outer border */
.ds-table {
  width: 100%;
  border-collapse: collapse;
}

/* Header row */
.ds-table thead tr {
  background: var(--ds-canvas-soft);
}
.ds-table thead th {
  padding: 12px 16px;
  font: 600 11px/1.4 var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ds-body);
  text-align: left;
}

/* Body rows */
.ds-table tbody td {
  padding: 12px 16px;
  font: 400 14px/1.4 var(--font-sans);
  color: var(--ds-ink);
  border-top: 1px solid var(--ds-hairline); /* #f0f0f3 — lighter than default border */
}
.ds-table tbody tr:hover td {
  background: var(--ds-canvas-soft);
}

/* Numeric cells — right-aligned, Montserrat */
.ds-table td.is-numeric {
  text-align: right;
  font: 400 13px/1.4 var(--font-accent);
}
```

### 2.5 Forms — dashboard

```css
/* Dense input variant for dashboard forms */
.ds-text-input.is-dense {
  min-height: 36px;
  padding: 8px 12px;
  font-size: 14px;
}

/* Form field label */
.ds-field-label {
  display: block;
  font: 600 13px/1 var(--font-sans);
  color: var(--ds-ink);
  margin-bottom: 6px;
}

/* Helper text below field */
.ds-field-helper {
  font: 400 12px/1.4 var(--font-sans);
  color: var(--ds-body);
  margin-top: 4px;
}

/* Inline error text below field */
.ds-field-error {
  font: 600 12px/1.4 var(--font-sans);
  color: var(--ds-error);
  margin-top: 4px;
}
```

### 2.6 Sidebar nav

> **Only apply this if you are building a new sidebar from scratch.** Do not apply to an existing sidebar.

```css
.ds-sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--ds-surface-dark); /* #171717 */
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Section heading inside sidebar (above a group of links) */
.ds-sidebar-heading {
  padding: 16px 16px 8px;
  font: 600 11px/1.4 var(--font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #b0b4ba;
}

/* Nav row */
.ds-sidebar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 40px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.88);
  font: 500 14px/1 var(--font-sans);
  text-decoration: none;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background-color 0.15s ease;
}
.ds-sidebar-row:hover {
  background: rgba(255, 255, 255, 0.08);
}
.ds-sidebar-row.is-active {
  background: rgba(255, 255, 255, 0.12);
  border-left-color: #ffffff;
}
```

### 2.7 Top bar — dashboard

```css
.ds-topbar {
  height: 56px;
  background: var(--ds-surface-card);
  border-bottom: 1px solid var(--ds-hairline-strong);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
```

### 2.8 KPI card

Structure inside `.ds-feature-card` (with `padding: 20px`):

```
[eyebrow (.ds-caption-uppercase, --ds-muted)]
  ↓ 8px
[big number — 28px / 600 / var(--ds-ink)]
  ↓ 4px
[delta caption — 14px / var(--ds-body)]
  (only the +/– glyph gets --ds-success or --ds-error color, not the whole line)
```

### 2.9 Charts

| Element | Value |
|---------|-------|
| Primary series | `#171717` |
| Secondary series | `#60646c` |
| Tertiary series | `#dcdee0` |
| Grid lines | `1px dashed #f0f0f3` |
| Axis labels | `11px #999999` |
| Tooltip | White card, `1px #dcdee0` border, `12px` radius, soft shadow |

No gradient fills under line charts. Use flat `#f0f0f3` if an area fill is needed.

### 2.10 Density toggle (optional)

Add `data-density="comfortable"` or `data-density="compact"` to the dashboard root element:

```css
[data-density="compact"] .ds-feature-card   { padding: 16px; }
[data-density="compact"] .ds-table tbody td { padding: 8px 12px; }
[data-density="compact"] .ds-table tbody tr { height: 36px; }
[data-density="compact"] .ds-text-input     { min-height: 36px; padding: 8px 12px; }
```

---

## 3. What stays the same across both surfaces

| Item | Value |
|------|-------|
| Font (UI) | Inter |
| Font (numerics / accent) | Montserrat |
| Icons | Material Symbols Outlined only |
| Primary button | `#000000` fill → `#1a1a1a` hover, `8px` radius |
| Secondary button | white, `#dcdee0` border, `#fafafa` hover |
| Border color | `#dcdee0` everywhere |
| Card radius | `12px` |
| Button radius | `8px` (small variant: `6px`) |
| Shadow | `0 4px 12px rgba(0,0,0,0.04)` — the only shadow |
| Focus ring | `2px solid #171717`, offset `3px` |
| Link color | `#0d74ce` → `#476cff` hover |
| Disabled state | `opacity: 0.55` |
| Transition speed | `150–220ms ease` |
| Gradients | **None.** Solid fills only. |

---

## 4. What differs between website and dashboard

| Dimension | Website | Dashboard |
|-----------|---------|-----------|
| Page background | `#ffffff` | `#fafafa` |
| Layout | Centered, 1200px max | Fluid, sidebar + content |
| Sidebar | None (top nav) | `#171717` dark, 240px |
| Nav / top-bar height | 64px | 56px |
| Largest type on screen | 64px (hero H1) | 28px (KPI number) |
| Body text size | 16px | 14px |
| Section padding | 96px | 24–32px |
| Card padding | 24px | 20px |
| Card grid gap | 24px | 16px |
| Default button | 40px tall | 40px tall + `sm` 32px variant |

---

## 5. Radius reference

| Element | Radius |
|---------|--------|
| Buttons (default) | `8px` |
| Buttons (small variant) | `6px` |
| Text inputs / selects | `8px` |
| Cards / panels / modals / toasts | `12px` |
| Hero / large media thumbnail | `16px` |
| Card thumbnail (inside card) | `8px` |
| Checkbox | `4px` |
| Radio / switch track / avatar / badge / chip / progress bar | `9999px` (pill / circle) |
| Table cells | `0px` (no rounding) |
| Outer table container | `12px` |
| Tooltip | `6px` |
| Inline code / tag | `4px` |

Nothing uses a radius larger than `16px`. Do not use `10px`, `14px`, or any value not in this table.

---

## 6. Hover behavior — quick reference

| Element | Hover changes |
|---------|--------------|
| Primary button | background only: `#000000` → `#1a1a1a` |
| Secondary button | background only: `#fff` → `#fafafa` |
| Tertiary button | text color only: `#0d74ce` → `#476cff` |
| Icon button | background only: transparent → `#fafafa` |
| Card | box-shadow only: none → `0 4px 12px rgba(0,0,0,0.04)` |
| Inline link | color only: `#0d74ce` → `#476cff` |
| Nav link (public) | color only: `#60646c` → `#171717` |
| Table / list row | background only: white → `#fafafa` |
| Chip / tag | background only: `#f0f0f3` → `#dcdee0` |

Hover never changes: radius, size, border width, border color, font weight, or position.

---

## 7. Implementation checklist

Before shipping any new page or component, verify:

- [ ] Fonts loaded: Inter + Montserrat via `next/font`, Material Symbols `<link>` in `<head>`
- [ ] Icons render as glyphs, not text (if text shows, the `<link>` is missing)
- [ ] Color tokens in `:root` — referencing variables, not hardcoded hex
- [ ] No `linear-gradient` on any button, card, nav, hero, or header
- [ ] No colored borders (all borders are `#dcdee0`)
- [ ] No shadows on buttons at rest or hover
- [ ] Sidebar is `#171717` if dashboard; public site has top nav only
- [ ] `prefers-reduced-motion` removes all transitions
- [ ] Dashboard styles scoped to dashboard root class — not leaking into public pages
