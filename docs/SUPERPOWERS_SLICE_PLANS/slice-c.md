# Slice C — Showpiece (Days 14–17)

**Card C1:** Backend — presentation + advisory (this file, C1 section)  
**Card C2:** Frontend — HoursStrip, AmbientCanvas, showpiece UI (blocked until C1)

## C1 Goal (backend)

Rule-based advisories + presentation layer on weather bundle. Contract bump v1.2.1.

## C1 Tasks

### 1. Contract

- [x] `docs/api-contracts.md` v1.2.1 — snapshot + presentation + meta envelope

### 2. Services (TDD)

- [x] `test_presentation.py` (5) → `presentation.py`
- [x] `test_advisory.py` (8) → `advisory.py`

### 3. Integration

- [x] Wire `presentation.build()` + advisories into weather route response
- [x] Cache stores `{ snapshot, provider }`; presentation + meta computed at response time
- [x] `meta.data_source`, `meta.provider`, provenance fields

### 4. Gate

- [x] `phase_gate.ps1 -Slice C` backend pytest (46 target)

## C1 Forbidden

- No `apps/web/**`
- No React showpiece components

## C2 Tasks (frontend — READY)

### 1. Envelope migration

- [x] `types/weather.ts` → WeatherEnvelope
- [x] `useWeatherBundle`, `HeroWeather`, `App` → snapshot/presentation/meta

### 2. Showpiece components

- [x] AmbientCanvas, ProvenanceChip, AdvisoryChips
- [x] WindCompass, FeelsLikeGauge, ForecastCardGrid
- [x] HoursStrip + HourDetailExpand

### 3. ui-ux Gate C + gate script frontend checks

- [x] `phase_gate.ps1 -Slice C` frontend: npm build + vitest
- [ ] Manual Gate C (user terminal): HoursStrip drag/tap, theme morph, blur audit

## Verify (C2)

```powershell
cd apps\web
npm run test
npm run build
.\scripts\phase_gate.ps1 -Slice C
```

