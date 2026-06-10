# Slice A — Foundation (Days 1–5)

**Executing-plans reference for Card A1.**

## Goal

Full monorepo scaffold: Docker + FastAPI + Vite shell, contracts v1.2.0, TDD gate/condition_codes (12 tests), skill stack, orchestration docs, design-system persist, `phase_gate.ps1 -Slice A`.

## Tasks

### 1. Infrastructure

- [x] `docker-compose.yml` — Postgres 16 on **5435**
- [x] `.gitignore`, `README.md`, `AGENTS.md`

### 2. Backend (TDD)

- [x] Write `test_gate.py` (6) → RED
- [x] Implement `gate.py` → GREEN
- [x] Write `test_condition_codes.py` (6) → RED
- [x] Implement `condition_codes.py` → GREEN
- [x] FastAPI `/api/v1/health`, CORS, lifespan stub
- [x] Alembic init + stub migration
- [x] `.env.example`

### 3. Frontend

- [x] Vite + React placeholder
- [x] `vite.config.ts` proxy `/api` → :8000
- [x] Jakarta Sans 400/600, Dark OLED tokens in `performance.css`
- [x] Design system persist (ui-ux-pro-max)

### 4. Orchestration

- [x] Copy gsd-*, council-*, ui-ux-pro-max from zeref
- [x] Adapt rules + `run-weather-gate` skill
- [x] `config/council/weathero-board.yaml`
- [x] Docs: api-contracts, CURRENT_STATE, failures-checklist, etc.
- [x] `scripts/phase_gate.ps1 -Slice A`

### 5. Forbidden (Slice A)

- No `weather_service.py`, OWM clients, weather route
- No showpiece UI, eval fixtures, maps/radar/LLM

## Verify (user terminal)

```powershell
.\scripts\phase_gate.ps1 -Slice A
```

## Skills invoked

1. using-superpowers
2. test-driven-development
3. executing-plans (this file)
4. verification-before-completion
5. gsd-config (ports in .env.example)
