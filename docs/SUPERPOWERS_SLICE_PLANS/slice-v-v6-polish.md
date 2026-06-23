# Slice V — Card V6 Futuristic UI Polish (CSS-only)

## Goal

Futuristic animated feel via CSS only — preserve Slice V behavior and blur budget.

## Tasks

- [x] AmbientCanvas v2 — theme orbs + 300ms crossfade; PRM static
- [x] Hero temp-band box-shadow halo on `.hero-weather`
- [x] Metrics bento hover lift + glow (display-only)
- [x] TodayBrief left-border pulse (showpiece-enter-1)
- [x] Pitch CTA opacity shimmer
- [x] tabular-nums on temps/metrics; hero content fade on enter
- [x] PRM disables all new motion
- [x] ui-ux checklist + blur ≤ 1

## Branch

`viva-polish` — **NOT merged to master**

## Verify

```powershell
cd apps\web
npm run test
npm run build
npm run dev
# ?view=pitch — CTA shimmer, 0 blur
# ?view=app&city=Hyderabad — orbs, hero glow, bento hover
```
