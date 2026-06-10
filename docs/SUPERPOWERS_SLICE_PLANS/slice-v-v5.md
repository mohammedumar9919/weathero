# Slice V — Card V5 Demo Script v7 + Gate V (Day 6–7)

## Goal

Ship pyramid demo script v7 (full viva shock flow), report appendix/abstract updates, and `phase_gate.ps1 -Slice V` wiring. **Do not claim Gate V PASS** — user runs gate + 3× rehearsal.

## Tasks

- [x] `docs/DEMO_SCRIPT.md` v7 — pitch → bento → trust → share → resilience → compare → eval → security (≤ 5:30)
- [x] `docs/REPORT_APPENDIX.md` — Slice V evidence row
- [x] `docs/REPORT_ABSTRACT.md` — pitch, today_brief, trust/share, security paragraph
- [x] `scripts/phase_gate.ps1` — add `"V"` ValidateSet + automated checks
- [x] `docs/WORKER_TASK_CARDS_QUEUE.md` — V4 DONE, V5 tasks
- [x] `docs/CURRENT_STATE.md` — V cards DONE; gate sign-off pending

## Forbidden

- `apps/api/**` logic changes (gate pytest invocation OK)
- `apps/web/**` component changes (copy typos only)
- Claiming Gate V PASS in docs or worker return

## Gate V automated checks

| Check | Target |
|-------|--------|
| Docker Postgres | `:5435` running |
| Alembic | `upgrade head` |
| pytest | 56/56 |
| replay_mock.py | 12/12 |
| vitest | 22/22 |
| npm run build | pass |
| api-contracts.md | v1.3.0 + `today_brief` + optional `air_quality` |
| Docs present | DEMO_SCRIPT.md, SECURITY.md, slice-v-v*.md |

## Manual sign-off (user only)

- Pitch URL `/?view=pitch` + CTA
- Blur audit (pitch 0, dashboard ≤ 1)
- Trust drawer a11y (focus trap, Esc, tabs)
- Share URL paste test
- 3× rehearsal ≤ 5:30

## Verify

```powershell
cd C:\Projects\weathero
.\scripts\phase_gate.ps1 -Slice V

cd apps\web
npm run test
npm run build

cd ..\api
pytest -q

cd ..\..
python scripts\replay_mock.py
```

Browser rehearsal:

```
http://localhost:5173/?view=pitch
http://localhost:5173/?view=app&city=Hyderabad
```

Pre-cache:

```powershell
.\scripts\dev_api.ps1
.\scripts\precache_demo.ps1
```
