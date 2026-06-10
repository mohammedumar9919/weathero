# Slice V — Card V1 Pitch (Day 3)

## Goal

Pitch landing + ?view=pitch|app routing (no react-router) + Outfit font + CTA to dashboard.

## Tasks

- [x] ui-ux persist: design-system/pages/viva.md
- [x] PitchLanding.tsx — hero + 3 bento features + "66 automated checks"
- [x] useViewMode.ts (or URL helpers) — view=pitch|app
- [x] App.tsx — conditional pitch vs dashboard
- [x] CTA → ?view=app&city=Hyderabad
- [x] types/weather.ts v1.3.0 fields (types only)

## Forbidden

- react-router
- MetricsBento, TodayBrief (V2)
- apps/api/**

## Verify

```powershell
cd apps\web
npm run test
npm run build
npm run dev
# http://localhost:5173/?view=pitch
# http://localhost:5173/?view=app&city=Hyderabad
```
