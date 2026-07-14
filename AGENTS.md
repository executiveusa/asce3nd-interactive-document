# AGENTS.md — asc3nd Interactive Document Design Law

> Source of truth for every design decision in the **asc3nd Interactive Document**
> (interactive workbook delivered from **Macs Digital Media** to **ASC3ND Collective**).
> Authored by the Social Media Strategist & Brand Designer.

---

## 0. The One Rule Above All

> **"Don't make me think." — Steve Krug**

Everything below exists to serve that sentence. If a design choice makes the
reader pause, wonder, or hunt — it fails. When two rules conflict, Krug wins.

---

## 1. Steve Krug — The Laws We Never Break

These are the usability laws from *Don't Make Me Think, Revisited*. They apply
to every screen, every component, every breakpoint.

### 1.1 The Purpose Law
- A page's purpose must be obvious in the first **glance (< 2 seconds)**.
- The reader should never have to ask: *"Where am I? What is this? What can I do here?"*

### 1.2 The Convention Law
- Use familiar patterns. Don't invent interaction models.
  - Logo top-left → home. Hamburger top-right → menu. Back/Next at the bottom.
  - Tabs look like tabs. Checkboxes look like checkboxes. Buttons look clickable.
- Creativity lives in **style**, never in **structure**. Structure is invisible and trusted.

### 1.3 The Hierarchy Law
- One clear visual hierarchy per page. The eye follows a single intended path.
- Use **size + weight + color + spacing** to point at what matters. Never compete.

### 1.4 The Click Law
- The number of clicks to any destination must be **the minimum possible**.
- Every destination is reachable in **≤ 1 tap** from the contents drawer.
- Every action's outcome must be **obvious before** the reader clicks.

### 1.5 The Words Law
- Headlines are short and concrete. Labels describe what happens on click.
- Never use clever labels that hide meaning. *"Begin"* not *"Initiate your journey."*
- Body copy uses plain language. A 12-year-old should follow it.

### 1.6 The Search-Don't-Hunt Law
- Readers scan, they don't read. Make scanning effortless.
- Bold the nouns that matter. Group related items visually. Break walls of text.

### 1.7 The Happy-Path Law
- The default path through the document should feel effortless and obvious.
- Never block, never require a choice the reader isn't ready to make.

### 1.8 The Forgiveness Law
- Every action is reversible. Back is always available (except at step 1).
- Mistakes should never destroy data. Inputs persist; the workbook auto-saves.

### 1.9 The Accessibility Law
- All interactive elements are keyboard reachable and screen-reader labeled.
- Color is never the only signal — pair it with text or shape.
- Touch targets ≥ 44×44px. Contrast ≥ WCAG AA (4.5:1 for body text).

### 1.10 The Mobile Law
- Design mobile-first. If it fails on a 375px phone, it fails.
- No hover-dependent interactions. No horizontal scroll. No tiny taps.

---

## 2. The asc3nd Brand System

Source: `asc3nd-frontend-website` → `apps/site/app/globals.css` (Design System v2).
**Monochrome workbook. Black · White · Gold (restrained accent).**

### 2.0 The Aesthetic Law (Apple-level, monochrome)
- **Pure white dominates.** `#ffffff` is the default surface everywhere.
- **Near-black ink** (`#0a0a0a`) for all text and primary actions.
- **Gold `#F5A617` is a flourish, not a palette.** Used at most **once per screen**
  as the single accent — e.g. one CTA button, one price, one progress bar, one
  active drawer eyebrow. Never as a background tint, never on body text.
- **No warm tones, no off-whites, no clashing tints.** If a color isn't in
  §2.1, it doesn't exist in this workbook.
- **Contrast is sacred.** Body text is `#0a0a0a` on `#ffffff` (≈ 20:1). Anything
  below WCAG AA fails the Krug Accessibility Law.

### 2.1 Color tokens

| Token             | Hex       | Role                                            |
|-------------------|-----------|-------------------------------------------------|
| `--bg` / `--card` | `#ffffff` | Primary surface. Dominant everywhere.           |
| `--card2`         | `#f7f7f8` | Neutral section/card fill (cool, not warm).     |
| `--card3`         | `#efefef` | Subtle fill (progress tracks, dividers).        |
| `--ink`           | `#0a0a0a` | Primary text. All headings, body, primary CTA.  |
| `--ink2`          | `#1d1d1f` | Secondary text.                                 |
| `--muted`         | `#6e6e73` | Captions, metadata, placeholder.                |
| `--gold`          | `#F5A617` | **The single accent.** One flourish per screen. |
| `--border`        | `rgba(0,0,0,.10)` | Hairline borders.                        |

### 2.2 Color rules

- **White is the design.** ≥ 80% of every content screen is white.
- **Gold is rationed.** Count gold uses on a screen. More than one prominent
  use = redesign. Allowed: one CTA, one price, one progress fill, one active
  eyebrow. That's it.
- **No green. No blue. No purple. No red** (except a true, semantic error state).
- **Dark surfaces are true black `#0a0a0a`** — never warm-tinted (`#1a140d`,
  `#241a0e`, `#f9f5f0` are all banned). Reserved for cover, welcome, chapter
  dividers, and phase cards only.

### 2.3 Type system

- **Headings:** Barlow Condensed — 600/700/800/900. Tight, confident, uppercase-friendly.
- **Body:** Barlow — 400/500/600/700. Highly legible, humanist sans.
- Display sizes use `clamp()` so they scale fluidly from mobile to desktop.
- Line-height: 1.55–1.65 for body. Headings stay tight (1.05–1.2).

### 2.4 Spacing & whitespace

- **Generous whitespace is the design.** Apple-polish = room to breathe.
- Section vertical padding: `clamp(28px, 5vw, 64px)`.
- Card padding: 16–20px mobile, 20–24px desktop.
- Gap between grid items: 12–16px. Never crowd.

### 2.5 Surfaces & shape

- Cards: `--white` on `--off` background. 1px subtle border `rgba(21,17,11,.10)`.
- Radii: small `8px`, medium `14px`, large `20–24px`. Pills = `999px`.
- Soft shadows only: `0 2px 16px rgba(0,0,0,.06)`. Never hard, never heavy.

### 2.6 Icons — Lucide is the default (all projects)

- **Lucide** (https://lucide.dev · MIT) is the default icon set for **every**
  Macs Digital Media deliverable, including this workbook and the asc3nd brand kit.
- **No emojis. Ever.** Emojis render inconsistently across OS/browser, clash with
  the monochrome system, and break at small sizes. They are banned.
- **No mixed icon families.** Do not combine Lucide with Heroicons, Material,
  Font Awesome, or emoji. One set, always Lucide.
- **Usage rules:**
  - Inline the raw SVG directly from lucide.dev/icons (copy → paste). No npm
    dependency, no icon-font, no network call for the workbook.
  - Set `stroke="currentColor"` so icons inherit the surrounding text color
    (`--ink` by default; `#ffffff` on dark surfaces).
  - Default size: `24×24` viewBox, rendered at `18–20px`. Stroke-width: `1.5–2`.
  - Never recolor an icon with a fill outside the brand palette (§2.1).
- **Why Lucide:** 1,500+ icons, uniform 24×24 grid, single stroke weight,
  rounded corners — matches the Apple-level, monochrome aesthetic exactly.

---

## 3. Component Rules

| Component       | Rule                                                                              |
|-----------------|-----------------------------------------------------------------------------------|
| Primary button  | **Solid ink** `#0a0a0a`, white text, pill, 44px min height. The default CTA.     |
| Gold CTA        | Gold `#F5A617` with ink text. **One per screen max.** Reserved for the hero CTA.  |
| Ghost button    | Transparent, ink text, .5px border. Secondary actions only.                       |
| Cards           | White surface, .5px hairline border, soft shadow on hover, 14px radius.           |
| Eyebrow label   | 11px, uppercase, muted gray, .2em letter-spacing. Marks every section.            |
| Active state    | Ink background, white text (tabs, chips, drawer items). Never gold as a fill.    |
| Tabs            | Pill chips. Active = ink fill + white text. Inactive = white + ink2 text.        |
| Checklist       | Native checkbox, ink `accent-color`, ink progress bar fill.                       |
| Drawer item     | Full-width, 44px min height, active = ink fill, white text, gold eyebrow chip.   |
| Inputs          | White, .5px border, ink focus ring (3px soft shadow). 44px min height.           |
| Icons           | **Lucide only.** Inline SVG, `currentColor`, 18–20px, stroke-width 1.5–2. No emojis. |

---

## 4. Motion (Apple-level polish)

- **Subtle, fast, purposeful.** Default transition `.18s` ease-out.
- Page entry: `.4s` fade + 6px rise (`.page-body` animation).
- Hover lift: `translateY(-1px)`. Active press: `scale(.98)`.
- Focus: 2px gold outline with 2px offset — the one place gold appears on interaction.
- `prefers-reduced-motion`: all animations/transitions drop to `.01ms`.
- No parallax, no autoplay video, no decorative motion that competes with content.

---

## 5. Mobile & Tablet

- Mobile-first. Test at **375px** (small phone), **768px** (tablet), **1280px** (desktop).
- Touch targets ≥ 44px. Tap spacing ≥ 8px.
- Hamburger menu appears ≤ 920px. Drawer = full list of steps, grouped by chapter.
- Single-column at ≤ 620px. Two-column on tablet. Three-column only on desktop where it aids scanning.
- No horizontal scroll. Ever.

---

## 6. What We Never Do

- ❌ Change the client's words. **Wording is locked.** Design only.
- ❌ Introduce colors outside the brand system.
- ❌ Use dark backgrounds for content sections (reserved for hero/dividers).
- ❌ Crowd the screen. If it feels busy, remove something.
- ❌ Invent interaction patterns. Use conventions.
- ❌ Ship anything that fails on a 375px phone.
- ❌ Use color alone to convey meaning.
- ❌ Use emojis or non-Lucide icon families.
- ❌ Make the reader think.

---

## 7. Change Protocol

When updating this document:
1. **Words never change** unless the client requests it in writing.
2. Design changes must keep ≥ 70% white/off surfaces.
3. Any new component must follow §2 (brand) and §3 (components).
4. Any new color must come from §2.1. No exceptions.
5. Test at 375 / 768 / 1280 before considering it done.

---

*AGENTS.md v1.0 — asc3nd Interactive Document Design Law*
*Built on Steve Krug's Don't Make Me Think and the asc3nd Design System v2.*
*Black · Gold #F5A617 · White.*
