# Weathero

6th Sem Mini Project — MJCET. Ambient weather dashboard with hybrid provider strategy.

**Team A15** | Student: Mohammed Umar Salam

## Stack

- **API:** FastAPI + SQLAlchemy + Alembic + Postgres 16 (`:5435`)
- **Web:** Vite + React + TypeScript
- **Orchestration:** GSD Redux + Superpowers + Karpathy council

## Quick start (Slice A)

```powershell
cd C:\Projects\weathero
docker compose up -d
cd apps\api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
pytest tests/test_gate.py tests/test_condition_codes.py -v
cd ..\web
npm install
npm run build
cd ..\..
.\scripts\phase_gate.ps1 -Slice A
```

## Slices

| Slice | Scope | Gate |
|-------|-------|------|
| A | Foundation scaffold | Gate A |
| B | Weather API + cache | Gate B |
| C | Showpiece UI | Gate C |
| D | Eval + replay | Gate D |

## Docs

- [API contracts v1.2.0](docs/api-contracts.md)
- [Current state](docs/CURRENT_STATE.md)
- [Worker queue](docs/WORKER_TASK_CARDS_QUEUE.md)
