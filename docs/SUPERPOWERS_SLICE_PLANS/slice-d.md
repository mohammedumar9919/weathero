# Slice D — Eval (Days 18–21)

**Card D1:** Eval worker — golden fixtures + replay mock

## Goal

12/12 deterministic mock replay proving gate + hours_strip trust. Cumulative **56/56** tests.

## Tasks

### 1. Fixtures

- [x] `eval/golden_fixtures.jsonl` — 12 cities with mock provider payloads

### 2. Replay engine

- [x] `scripts/replay_mock.py` — normalize → gate → presentation → assert
- [x] 12 test cases (one per city)

### 3. User scripts

- [x] `scripts/run_weather_eval.ps1` — `-Smoke` + full run
- [x] `scripts/phase_gate.ps1 -Slice D`

### 4. Evidence

- [x] `eval/reports/latest.txt` for report screenshot

## Cities (12)

Hyderabad, Chennai, Mumbai, Delhi, Bangalore, Kolkata, Pune, Jaipur, Kochi (Open-Meteo), Lucknow, Ahmedabad, Surat

## Forbidden

- Live OWM in replay
- apps/web/** changes
- Editing fixtures after Lead sign-off without approval

## Verify (user)

```powershell
python scripts\replay_mock.py
.\scripts\run_weather_eval.ps1
.\scripts\phase_gate.ps1 -Slice D
```

## Skills

using-superpowers, test-driven-development, run-weather-gate, verification-before-completion
