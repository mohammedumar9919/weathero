# Slice E — Ship (Days 22–28)

**Card E1:** Final ship — carousel, compare, units, attribution, demo docs

## Goal

Judge-ready demo: saved-city carousel with prefetch, honest compare, units toggle, OM attribution, 390px audit, DEMO_SCRIPT + REPORT_APPENDIX.

## Tasks

### 1. Frontend showpiece (Slice E)

- [x] `SavedCityCarousel.tsx` — max 3 saved cities; hover prefetch 200ms (D25)
- [x] `CompareBars.tsx` + `ComparePreflight.tsx` — cache-only; disable until both cached
- [x] `UnitToggle.tsx` — °C/°F; localStorage + `?units=` (D17)
- [x] `AttributionFooter.tsx` — when `meta.provider === open_meteo`
- [x] `React.lazy` code-split CompareBars + Carousel
- [x] 390px responsive audit pass

### 2. Docs (report + demo)

- [x] `docs/DEMO_SCRIPT.md` — 5 min Pyramid order (masterplan Part XI)
- [x] `docs/REPORT_APPENDIX.md` — competitive table + 5 research passes
- [x] `docs/REPORT_ABSTRACT.md` — professor abstract stub

### 3. Gate

- [x] `scripts/phase_gate.ps1 -Slice E` — 56/56 + build + replay + vitest + ship docs
- [ ] Manual: pre-cache Hyderabad/Chennai/Mumbai for viva
- [ ] Gate E user sign-off (3x rehearsal)

## Forbidden

- Maps, radar, LLM, Redis, PWA
- New backend compare route unless cache-only client insufficient (prefer SWR cache)
- Editing `eval/golden_fixtures.jsonl` without Lead approval

## Verify (user)

```powershell
.\scripts\phase_gate.ps1 -Slice E
# Rehearse DEMO_SCRIPT.md 3x under 5 min
```

## Gate E

User sign-off — not automated PASS claim by worker.
