# Weathero

Ambient **weather dashboard** with a FastAPI backend, React / TypeScript frontend, and Postgres. Pulls from multiple weather providers, caches intelligently, and includes an optional LLM assistant with a rule-based fallback.

## Stack

| Layer | Technology |
|-------|------------|
| API | FastAPI, SQLAlchemy, Alembic, Postgres 16 |
| Web | Vite, React, TypeScript, Framer Motion, Recharts |
| Auth | JWT + Argon2 |
| Assistant | Groq LLM when configured; rule engine otherwise |
| Tests | pytest (API), Vitest (UI) |
| Infra | Docker Compose |

## Features

- Multi-provider weather ingest with caching
- Compare cities, ambient panels, moon / sun data
- Premium motion UI with reduced-motion support
- Demo login seed for local demos
- Rate limiting and health checks on the API

## Quick start

```powershell
docker compose up -d
cd apps\api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
pytest tests/ -q
cd ..\web
npm install
npm run build
npm run dev
```

API default (check `apps/api/.env.example`): often port **8001**.

Demo credentials (when seed is run): see `docs/CURRENT_STATE.md` or seed scripts.

## Docs

- `docs/api-contracts.md` — API surface
- `docs/CURRENT_STATE.md` — runtime status

## Author

Mohammed Umar Salam — MJCET mini project · [Portfolio](https://mohammedumar9919.github.io)

## License

MIT — see [LICENSE](LICENSE).
