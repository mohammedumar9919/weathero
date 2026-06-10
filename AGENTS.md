# Agent instructions (Weathero)

**New chat:** Boot from [docs/LEAD_ORCHESTRATOR.md](docs/LEAD_ORCHESTRATOR.md) and [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md).

Concise rules for Cursor worker agents. Lead uses [docs/orchestrator.md](docs/orchestrator.md) for phase gates.

## Read first (every task)

1. [`docs/api-contracts.md`](docs/api-contracts.md) — frozen schemas (v1.2.0)
2. [`docs/failures-checklist.md`](docs/failures-checklist.md) — do-not-repeat rules
3. [`docs/SUPERPOWERS_SLICE_PLANS/slice-a.md`](docs/SUPERPOWERS_SLICE_PLANS/slice-a.md) — active slice plan

Do **not** edit `.cursor/plans/*.plan.md`.

## Ownership (Slice A–D)

| If you are | You may edit | Forbidden |
|------------|--------------|-----------|
| **Backend (A/B)** | `apps/api/**` per task card | `apps/web/**` (unless card says otherwise) |
| **Frontend (C)** | `apps/web/**` | `apps/api/app/services/weather_service.py` without orchestrator OK |
| **Eval (D)** | `eval/**`, `scripts/replay_mock.py` | `gate.py`, `condition_codes.py` |
| **Orchestrator** | `docs/**`, `scripts/**`, merges | — |

**One file, one owner.** Stop and ask lead if your task requires a forbidden path.

## Tier 0 locked

- Single bundle `GET /api/v1/weather?city=`
- Cache TTL 45m; OWM 2-call + OM fallback
- No maps, radar, LLM, ensemble, Redis, PWA

## Verification

```powershell
cd apps\api
pytest tests/test_gate.py tests/test_condition_codes.py -v
cd ..\..
.\scripts\phase_gate.ps1 -Slice A
```

User runs gate; worker does **not** claim PASS.
