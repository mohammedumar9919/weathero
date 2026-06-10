# Slice B — Core (Days 6–13)

**Card B1:** Backend — Weather API + cache (this file, backend section)  
**Card B2:** Frontend — SWR L1, URL city, core UI (READY — B1 complete)

## B1 Goal (backend)

Weather BFF: OWM 2-call + OM fallback, normalize to v1.2.0 bundle with `hours_strip`, Postgres cache-aside 45m, single-flight lock, rate limit, Cache-Control headers.

## B1 Tasks

### 1. Database

- [x] Alembic `002_slice_b_cache_tables` — `geocode_cache`, `forecast_cache`, `saved_locations`
- [x] SQLAlchemy models match `docs/api-contracts.md`

### 2. Providers (TDD with httpx mocks)

- [x] `openweather.py` — geocode, current, forecast
- [x] `open_meteo.py` — fallback fetch
- [x] `retry.py` — tenacity 2× 0.5s/1s

### 3. Normalize + service

- [x] `normalize.py` — 8-slot `hours_strip`, `condition_codes` mapping (fog 741)
- [x] `weather_service.py` — cache-aside, lock, `WEATHER_FORCE_FAIL` hook
- [x] `swr_cache_headers.py` — Cache-Control header helper

### 4. Routes

- [x] `GET /api/v1/weather?city=` — returns gated bundle
- [x] `GET/POST/DELETE /api/v1/locations` — max 3 saved
- [x] slowapi 60/min on `/api/v1/*`

### 5. Tests (21 new → 33 cumulative)

- [x] `test_normalize.py` (8) — RED → GREEN
- [x] `test_fallback.py` (3)
- [x] `test_cache.py` (3)
- [x] `test_retry.py` (2)
- [x] `test_locations.py` (3)
- [x] `test_cache_headers.py` (2)

### 6. Gate script

- [x] Extend `scripts/phase_gate.ps1 -Slice B` — backend pytest scope (B2 adds frontend)

## B1 Forbidden

- No `apps/web/**` changes
- No SWR, SearchSuggestions, showpiece UI
- No contract version bump

## B2 Tasks (frontend — Card B2 READY)

### 1. SWR L1 (D22–D23)

- [x] `SWRProvider.tsx` — sessionStorage persistence
- [x] `useWeatherBundle.ts` — `keepPreviousData: true`, dedupingInterval 5000

### 2. URL state (D24)

- [x] `useUrlCity.ts` — `?city=` sync + `history.replaceState`
- [x] vitest ×2 (TDD first)

### 3. Core UI (not showpiece)

- [x] `HeroWeather.tsx` — skeleton + `aria-busy`
- [x] `CitySearch.tsx` — Enter submit, `/` focus
- [x] `SearchSuggestions.tsx` — debounced suggestions
- [x] `RefreshButton.tsx` — 30s debounce + `mutate()`

### 4. Gate

- [x] Extend `phase_gate.ps1 -Slice B` — vitest step
- [x] ui-ux B2 checklist pass

**Gate B sign-off:** PENDING user `phase_gate.ps1 -Slice B` + manual UX checks

## B2 Forbidden

- No `apps/api/**`
- No HoursStrip, AmbientCanvas, provenance/advisory showpieces (Slice C)

## Verify (B1 worker self-check)

```powershell
cd apps\api
pytest -v
```

## Verify (user — partial Gate B after B1)

```powershell
.\scripts\phase_gate.ps1 -Slice B
```

Full Gate B criteria (cache hit <50ms, SWR reload, URL `?city=`) require B2.
