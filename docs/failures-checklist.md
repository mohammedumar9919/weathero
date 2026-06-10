# Do-not-repeat checklist (Weathero)

## Tier 0 HARD (never in Tier 0)

- No maps, radar, LLM, ensemble models
- No Redis — Postgres cache only
- No PWA / service workers

## API

- No `GET /api/v1/weather` implementation before Gate A PASS (Slice B)
- No vector-only or single-provider without OM fallback (Slice B)
- Cache TTL must be **45 minutes** — not configurable per-request
- `rain_prob` must stay ∈ [0, 1] — gate enforces

## Gate / contracts

- `hours_strip` must be exactly **8** slots — gate rejects other lengths
- `condition_family` must include **fog** for OWM 741
- Do not edit `docs/api-contracts.md` in worker tasks without orchestrator bump

## Process

- Worker never claims gate PASS — user runs `phase_gate.ps1`
- pytest DB creds must match `docker-compose.yml` (`:5435`)
- One file, one owner — see `AGENTS.md`

## Slice boundaries

- Slice A: no `weather_service.py`, no OpenWeather clients
- Slice C: no API changes without contract bump
- Slice D: no `golden_fixtures.jsonl` edits without human approval
