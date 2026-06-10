# Weathero — Report Appendix

## Competitive comparison

| Capability | Weathero (Tier 0) | Apple Weather | lotus-weather (reference) |
|------------|-------------------|---------------|---------------------------|
| Maps / radar | No (by design) | Yes | Varies |
| LLM / chat | No | No | Some forks |
| Provider strategy | OWM 2-call + Open-Meteo fallback | Proprietary | Single-provider typical |
| Cache / offline honesty | 45m JSONB + SWR; provenance chip | Opaque | Varies |
| Compare mode | Cache-only client compare | No | Rare |
| Saved cities | Max 3, session-scoped | Unlimited iCloud | Varies |
| Eval / gate | 56/56 pytest + 12 replay + 22 vitest | N/A | Uncommon in student projects |
| Bundle contract | v1.3.0 envelope + today_brief + gate.py | Closed | Ad hoc |
| Pitch / trust UI | `?view=pitch` landing + Trust drawer + Share | N/A | Rare in student scope |
| Security (semester) | Input bounds, 503, headers, CORS, rate limit | Enterprise | Often skipped |
| Attribution | Open-Meteo footer when active | N/A | Often missing |
| Ship scope | 390px OLED dashboard | Full OS integration | Desktop-first |

**Weathero positioning:** Honest, cache-first ambient dashboard for MJCET mini-project viva — depth over breadth.

---

## Five research passes (summary)

| Pass | Focus | Outcome |
|------|-------|---------|
| 1 | Provider APIs (OWM vs Open-Meteo) | Hybrid: geocode + 2-call OWM primary; OM fallback without API key |
| 2 | Cache & SWR patterns | 45m Postgres JSONB; sessionStorage SWR provider; prefetch on carousel hover |
| 3 | UX / OLED ambient | Single backdrop-filter layer; CSS gradient ambient (no WebGL); HoursStrip tap detail |
| 4 | Eval & trust | 12-city golden fixtures; replay_mock; gate validates snapshot only |
| 5 | Ship / demo | Pyramid demo script v7; pitch landing; trust drawer; cache-only compare; security one-liner |

---

## Slice V evidence (viva shock)

| Card | Deliverable | Evidence |
|------|-------------|----------|
| V3b | Security hardening | `docs/SECURITY.md`; 503, input bounds, headers |
| V3 | Data v1.3.0 | `today_brief`, optional `air_quality`; 56/56 pytest |
| V1 | Pitch landing | `/?view=pitch`; hero + 3 bento; "66 automated checks" |
| V2 | Dashboard bento | TodayBrief + MetricsBento; temp morph |
| V4 | Trust + Share | TrustDrawer (Provenance / Eval / Security); Share URL |
| V5 | Demo + Gate V | `docs/DEMO_SCRIPT.md` v7; `phase_gate.ps1 -Slice V` |

Gate V automated budget: **56 pytest + 12 replay + 22 vitest + build**. Manual: pitch URL, blur audit, Trust a11y, 3× rehearsal.

---

## Architecture snapshot

- **API:** FastAPI + SQLAlchemy + Alembic + Postgres `:5435`
- **Web:** Vite + React 19 + SWR + Lucide
- **Orchestration:** GSD Redux + Superpowers + Karpathy council

---

## Evidence paths (screenshots for report)

| Artifact | Path |
|----------|------|
| Gate D / E | Terminal output `.\scripts\phase_gate.ps1 -Slice E` |
| Replay eval | `eval/reports/latest.txt` |
| Contracts | `docs/api-contracts.md` v1.3.0 |
| Security | `docs/SECURITY.md` |
| Demo script | `docs/DEMO_SCRIPT.md` v7 |
| Gate V | Terminal output `.\scripts\phase_gate.ps1 -Slice V` |
