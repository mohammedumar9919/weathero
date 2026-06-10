# Slice V — Card V3 Data (Days 2–3)

## Goal

OWM Air Pollution + optional snapshot.air_quality + presentation.today_brief + api-contracts v1.3.0 + gate AQI validation. +4 pytest → 56/56.

## Tasks

### 1. Contract v1.3.0

- [x] docs/api-contracts.md bump
- [x] Optional air_quality; required today_brief on presentation

### 2. Services (TDD)

- [x] test_air_quality_normalize.py (2) → air_quality.py + openweather pollution fetch
- [x] test_today_brief.py (2) → today_brief.py rule templates
- [x] presentation.py — include today_brief in build()
- [x] weather_service.py — parallel pollution on cache miss
- [x] gate.py — optional aqi ∈ 1–5

### 3. Replay compatibility

- [x] replay_mock 12/12 without editing golden fixtures (tolerate missing air_quality)

## Forbidden

- apps/web/**
- LLM
- golden_fixtures.jsonl bulk rewrite

## Verify

```powershell
cd apps\api
pytest -v --tb=short
cd ..\..
python scripts\replay_mock.py
```

Target: **56/56 pytest**, replay **12/12**.
