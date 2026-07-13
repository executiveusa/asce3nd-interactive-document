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
**Flyer-accurate: Black · Gold #F5A617 · White.**

### 2.1 Color tokens

| Token        | Hex       | Role                                            |
|--------------|-----------|-------------------------------------------------|
| `--white`    | `#ffffff` | Primary surface. Dominant.                      |
| `--off`      | `#f9f5f0` | Warm off-white background (Apple-paper feel).   |
| `--black`    | `#000000` | True ink, used sparingly.                       |
| `--ink`      | `#15110b` | Primary text. Warm near-black.                  |
| `--ink2`     | `#3e382f` | Secondary text.                                 |
| `--muted`    | `#6d665b` | Tertiary text, captions, metadata.              |
| `--gold`     | `#F5A617` | **The single accent.** CTAs, active states, eyebrows. |
| `--gold-lt`  | `#FFB733` | Gold highlights, gradients.                     |
| `--gray`     | `#777777` | Neutral details.                                |
| `--gray2`    | `#444444` | Neutral text.                                   |

### 2.2 Color rules

- **White dominates.** Backgrounds are `--white` or `--off`. ≥ 70% of every screen.
- **Gold is the only accent.** Never introduce a second brand color.
  - ❌ No green. ❌ No blue. ❌ No purple. ❌ No red (except true error states).
- **Gold is detail, not filler.** Use it for eyebrows, active states, the CTA,
  progress fill, and small accents — never for large background areas.
- **Dark surfaces are rare and intentional.** Reserved for the cover, the
  Welcome hero, and chapter dividers only. Even there, prefer deep warm ink
  (`#15110b`) over pure black, and keep text light on a confident gold accent.

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

---

## 3. Component Rules

| Component       | Rule                                                                              |
|-----------------|-----------------------------------------------------------------------------------|
| CTA button      | Gold gradient (`#F5A617 → #FFB733`), dark ink text, pill, 44px min height.       |
| Ghost button    | White/transparent, ink text, 1px border. Secondary actions only.                  |
| Cards           | White surface, 1px hairline border, soft shadow, 14–20px radius.                  |
| Eyebrow label   | 11px, uppercase, gold, letter-spacing .14em. Marks every section.                 |
| Active state    | Gold-tinted background `rgba(245,166,23,.14)`, gold border, ink text.            |
| Tabs            | Pill chips. Active = ink background, white text. Inactive = white, ink text.      |
| Checklist       | Native checkbox, gold `accent-color`, progress bar = gold gradient fill.          |
| Drawer item     | Full-width, 44px min height, active = gold fill, white text.                      |

---

## 4. Motion

- Subtle, fast, purposeful. Page-turn = `.38s` cubic-bezier flip-in.
- Respect `prefers-reduced-motion`: animations off when set.
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
