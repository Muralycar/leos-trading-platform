# Design System

Source of truth: `source/styles.css` (`:root` custom properties). Translate 1:1 into `tailwind.config.ts` `theme.extend`.

## Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--bg-0` | `#0b0c0e` | Base background, header, footer |
| `--bg-1` | `#141619` | Section fills, stat strip, page-header band |
| `--bg-2` | `#1b1e22` | Card/media surfaces |
| `--bg-3` | `#24282d` | Dropdown hover fill |
| `--line` | `rgba(255,255,255,.09)` | Hairline borders, grid gaps |
| `--line-strong` | `rgba(255,255,255,.16)` | Input/button borders |
| `--text-0` | `oklch(0.96 0.003 90)` | Headlines, primary text |
| `--text-1` | `oklch(0.72 0.01 90)` | Body copy |
| `--text-2` | `oklch(0.52 0.01 90)` | Labels, muted meta |
| `--brass` | `oklch(0.74 0.11 78)` | Primary accent — CTAs, links, active states |
| `--brass-dim` | `oklch(0.52 0.08 78)` | Muted brass (badges) |
| `--brass-glow` | `oklch(0.86 0.09 85)` | Hover state on brass elements |
| `--safety` | `oklch(0.68 0.17 45)` | Reserved, not currently used in UI |
| `--ok` | `oklch(0.68 0.13 150)` | "In Stock" status only |
| `--warn` | `oklch(0.75 0.15 85)` | "Limited Stock" status only |

Rule: brass is the **only** decorative accent. Never use it decoratively — only on actionable elements (buttons, links, active nav, key numerals). Max one accent + two functional status colors.

## Typography
- **Display** — Barlow Condensed, weights 500/600/700, uppercase, tight letter-spacing. Used for `h1`–`h3`, section eyebrows, stat numerals, step numbers. `h1`: `clamp(40px, 6vw, 76px)`. `h2`: `clamp(30px, 4vw, 48px)`. `h3`: `20px`.
- **Body/UI** — Inter, weights 400/500/600/700. Body text `p`: browser default size scaled up to 15–19px per context; line-height 1.5.
- **Mono** — IBM Plex Mono, weights 500/600. Used for part numbers/SKUs, eyebrow labels, tags, stat labels, buttons. Buttons are mono, uppercase, letter-spacing `.06em`, size 13px (11px for `.btn-sm`).
- Google Fonts import: `Barlow+Condensed:wght@500;600;700`, `Inter:wght@400;500;600;700`, `IBM+Plex+Mono:wght@500;600`.

## Spacing / Radius / Grid
- Content container: `max-width: 1280px`, side padding 32px desktop / 20px mobile (`.wrap`).
- Section vertical rhythm: 96px padding (`section`), 64px for `.section-tight`, 64px on both at ≤1180px.
- Radius: `--radius-s: 3px` (buttons, inputs, tags), `--radius-m: 5px` (cards, panels). No large rounded corners anywhere — deliberately sharp/industrial.
- Grid pattern used throughout: CSS grid with `1px` gap and `background: var(--line)` behind, cards as `var(--bg-0)` — produces hairline dividers instead of individual card borders/shadows (see `.cat-grid`, `.why-grid`, `.featured-grid`, `.related-grid`, `.step-list`, `.photo-grid`, `.brand-directory`).

## Breakpoints
- **1180px** — header collapses to hamburger + mobile drawer (raised from a naive 900px after the nav grew to 7 top-level items; keep ≥1180px or measure actual nav width before changing).
- **900px** — page-level content reflow (stat grid → 2 cols, category/why/featured grids → 1 col, two-col splits → 1 col, product/RFQ layouts stack).

## Buttons
- `.btn-primary` — brass fill, `#181300`-equivalent dark text, hover → `--brass-glow`.
- `.btn-ghost` — transparent, `--line-strong` border, hover → brass border/text.
- `.btn-wa` — dark green fill (`#1e2b22`), mint text (`#7fe0a0`), for WhatsApp actions specifically.
- `.btn-sm` — 9px/16px padding, 11px text.
- All buttons: 150ms ease transitions, no scale/shadow hover effects.

## Inputs
- Dark fill (`--bg-1`), `--line-strong` border, focus → brass border, no glow/shadow. Labels are mono, uppercase, 11px, muted.

## Status Tags
- `.tag-stock` (green dot + green text) = In Stock.
- `.tag-sourcing` (amber dot + amber text) = Limited Stock.
- `.tag-soon` (muted gray) = Availability On Request / Coming Soon / Onboarding.
- Never show a specific fabricated quantity — only real imported quantities or one of these three states.

## Motion
150–200ms ease transitions on hover/focus only. No parallax, no autoplay carousels, no on-load animation. Filtering and RFQ confirmation swap state instantly (no artificial delay/spinner unless a real network request is in flight).
