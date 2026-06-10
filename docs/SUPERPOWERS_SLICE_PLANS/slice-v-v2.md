# Slice V — Card V2 Bento (Day 4)

## Goal

TodayBrief + MetricsBento + Outfit on dashboard + temp morph. Render v1.3.0 fields.

## Tasks

- [x] TodayBrief.tsx — presentation.today_brief + optional air_quality badge
- [x] MetricsBento.tsx — humidity, wind, feels-like, rain, optional AQI
- [x] Integrate in HeroWeather / App layout
- [x] Outfit font on dashboard; temp morph 300ms PRM-safe
- [x] ui-ux checklist + blur ≤ 1

## Forbidden

- apps/api/**
- TrustDrawer, Share (V4)
- pressure/visibility without API fields

## Verify

```powershell
cd apps\web
npm run test
npm run build
npm run dev
# ?view=app&city=Hyderabad — see today_brief + bento
```
