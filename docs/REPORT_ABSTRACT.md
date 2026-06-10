# Weathero — Abstract (Professor Stub)

**Title:** Weathero — An Ambient, Cache-First Weather Dashboard with Hybrid Provider Fallback

**Author:** Mohammed Umar Salam · Team A15 · MJCET (6th Sem Mini Project)

---

## Abstract

Weathero is a minimal weather dashboard that prioritizes **trustworthy data presentation** over feature breadth. The system exposes a single versioned bundle endpoint (`GET /api/v1/weather`) returning a v1.3.0 envelope: normalized snapshot with optional air-quality fields, a rule-based `today_brief` presentation layer, and provenance metadata. A hybrid provider strategy uses OpenWeatherMap for geocoding, forecast, and pollution retrieval, with Open-Meteo as fallback when the primary provider fails.

Server-side cache-aside storage (45-minute TTL in PostgreSQL JSONB) pairs with client-side SWR and session-scoped prefetch to reduce redundant live calls. A deterministic evaluation suite combines 56 backend pytest cases with a 12-city mock replay pipeline and 22 frontend vitest cases, enforcing gate invariants on snapshot shape, rain probability bounds, and eight-slot hourly strips without live API keys in CI.

The React frontend delivers a viva-ready experience: a pitch landing (`?view=pitch`) with eval social proof, an OLED-oriented ambient dashboard with Today Brief and Metrics Bento, an interactive HoursStrip, a Trust drawer (provenance, eval, and security tabs) with shareable city URLs, saved-city carousel with hover prefetch, cache-only city comparison, and Open-Meteo attribution when applicable. Semester-style security hardening (input bounds, 503 on missing provider config, security headers, tightened CORS, health rate limiting) is documented with honest scope limits. The project demonstrates disciplined Tier 0 scope control (no maps, radar, LLM, or PWA) while meeting mini-project requirements for API design, persistence, testing, and demonstration.

**Keywords:** weather API, cache-aside, SWR, FastAPI, hybrid providers, software evaluation, ambient UI, security hardening

---

## Stub sections (expand for final report)

- **Introduction** — Problem statement; Tier 0 constraints
- **Related work** — Apple Weather, open-source dashboards, cache patterns
- **System design** — Envelope contract, provider fallback, gate service
- **Implementation** — Backend BFF, pitch + dashboard + trust UI (Slice V)
- **Evaluation** — 56 pytest + 12 replay + 22 vitest; replay methodology
- **Security** — See `docs/SECURITY.md` for threat model and honest limits
- **Conclusion** — Lessons learned; future work (maps, PWA out of scope)

---

*Replace stub prose with final report text before submission.*
