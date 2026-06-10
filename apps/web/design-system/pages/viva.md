# Viva Pitch Page Overrides

> **PROJECT:** Weathero  
> **Page:** Pitch landing (`?view=pitch`)  
> Rules here override `apps/web/design-system/MASTER.md` for the pitch view only.

---

## Layout

- **Max width:** 72rem (`max-width: 72rem`)
- **Sections:** Hero → 3-column bento grid → social proof strip → sticky CTA footer
- **Mobile (390px):** Single column stack; bento cards full width

## Typography

- **Font:** Outfit 400 (body), 600 (subheads), 700 (hero headline)
- Load via Google Fonts in `index.html`

## Color (OLED pitch)

| Role | Value |
|------|-------|
| Background | `#0a0a0a` |
| Card surface | `rgba(255,255,255,0.08)` solid — **no backdrop-filter on pitch cards** |
| Accent | `#38bdf8` |
| CTA | `#38bdf8` on `#0a0a0a` border |
| Text primary | `#f5f5f5` |
| Text muted | `#a3a3a3` |

## Components

- **Bento cards:** solid rgba background, 1px border, 12px radius, Lucide icon + title + one-line copy
- **CTA "Launch Weathero":** min-height 44px, full width on mobile
- **Blur budget:** pitch page uses **zero** backdrop-filter (dashboard keeps single `.showpiece-glass` blur)

## Motion

- `prefers-reduced-motion`: disable card hover translate; keep color transitions only

## Copy pillars (rule-based, no LLM)

1. **Trust** — provenance chip, cache honesty, hybrid providers  
2. **Eval** — 66 automated checks (56 pytest + 12 replay)  
3. **Hours strip** — 8-slot forecast, tap-to-expand detail
