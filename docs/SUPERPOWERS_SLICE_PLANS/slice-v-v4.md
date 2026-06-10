# Slice V — Card V4 Trust + Share (Day 5)

## Goal

Trust drawer (provenance / eval / security) + share URL. Full a11y: focus trap, Esc, 44px targets.

## Tasks

- [x] TrustDrawer.tsx — 3 tabs, live envelope + static copy
- [x] TrustDrawerTrigger — 44px, near provenance row
- [x] ShareWeatherButton.tsx — clipboard + fallback + status
- [x] useFocusTrap + useDrawerState helpers + vitest
- [x] buildShareWeatherUrl + vitest
- [x] trust.css — solid panel, scrim opacity, PRM-safe motion
- [x] Wire in HeroWeather (dashboard only)
- [x] ui-ux checklist + blur ≤ 1

## Forbidden

- apps/api/**
- Rewriting MetricsBento / TodayBrief / PitchLanding
- Second backdrop-filter

## Verify

```powershell
cd apps\web
npm run test
npm run build
npm run dev
# ?view=app&city=Hyderabad — Trust + Share
# ?view=pitch — unchanged
```
