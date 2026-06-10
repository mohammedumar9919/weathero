# Council Orchestration

Karpathy 3-stage pattern adapted for Weathero engineering board.

## Board

`config/council/weathero-board.yaml` — 5 agents (lead, backend, core, frontend, qa).

## Skills

- `council-propose-slice` — Stage 1 task cards
- `council-review-slice` — Stage 2 checklist review
- `council-merge-slice` — Stage 3 merge + state update
- `run-weather-gate` — user terminal gate discipline

## Stage 2 mandatory for

- `gate.py`, `condition_codes.py`, `weather_service.py`
- `docs/api-contracts.md`
- `eval/golden_fixtures.jsonl`
