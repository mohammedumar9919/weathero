# Weathero — 5-Minute Demo Script (Pyramid v7)

**Audience:** Mini-project viva judges  
**Target:** ≤ 5:30 total · rehearse **3×** before presentation  
**Stack:** `.\scripts\dev_api.ps1` + `cd apps\web; npm run dev`

---

## Pre-demo setup (10 min before)

1. `docker compose up -d` (Postgres on `:5435`)
2. `.\scripts\dev_api.ps1` (alembic + uvicorn on `:8000`)
3. `cd apps\web; npm run dev` → http://localhost:5173
4. `.\scripts\precache_demo.ps1` — weather + saved cities (Hyderabad, Chennai, Mumbai)
5. Set browser localStorage: `weathero-session-id` = `demo-viva-session`
6. Open **pitch URL** in one tab: http://localhost:5173/?view=pitch
7. Open **app URL** in second tab (or same after pitch): http://localhost:5173/?view=app&city=Hyderabad
8. Optional resilience beat: set `WEATHER_FORCE_FAIL=1` in `apps/api/.env` (reset after demo)

---

## Pyramid beats (≤ 5:30)

| # | Time | Beat | What to show | Say (short) |
|---|------|------|--------------|-------------|
| 1 | 0:00–0:30 | **Pitch** | `/?view=pitch` — hero, 3 bento cards, "66 automated checks", CTA | Tier 0: honest weather without map bloat. One bundle, cache-first, eval-backed. CTA opens live dashboard. |
| 2 | 0:30–1:30 | **Hyderabad live** | `/?view=app&city=Hyderabad` — Today Brief + Metrics Bento + hero temp morph | Single v1.3.0 envelope: rule-based today brief, solid bento metrics, ambient theme morphs with condition. |
| 3 | 1:30–2:00 | **HoursStrip** | Tap hour slot | Eight 3-hour slots, rain bar height, scroll-snap. Tap expands inline — no modal, no extra fetch. |
| 4 | 2:00–3:30 | **Trust drawer** | Open Trust → Provenance / Eval / Security tabs; **Esc** closes; **Share** URL paste test | Provenance shows live vs cache. Eval tab cites 56 pytest + 12 replay. Security tab = semester-style controls. Share copies reloadable `?view=app&city=` URL — paste in new tab to prove. |
| 5 | 3:30–4:15 | **Resilience** | Hit refresh; optional `WEATHER_FORCE_FAIL=1` | SWR + 45m cache. Provenance label updates; Open-Meteo fallback or stale envelope. **AttributionFooter** when OM active. |
| 6 | 4:15–4:45 | **Compare (cache-only)** | Carousel hover prefetch → compare dropdown | Hover saved city 200ms prefetch. ComparePreflight enables only when **both** cities in SWR cache — no compare API. |
| 7 | 4:45–5:15 | **Eval terminal** | Terminal: pytest + replay + vitest | **56/56** pytest · **12/12** replay cities · **22/22** vitest. Gate validates snapshot; presentation computed at response time. |
| 8 | 5:15–5:30 | **Security one-liner** | Point to Trust → Security tab or `docs/SECURITY.md` | Input bounds, 503 on missing key, security headers, CORS tighten, health rate limit. Honest limits: no auth, no WAF — production-**style** for semester scope. |

---

## URLs (bookmark these)

| Purpose | URL |
|---------|-----|
| Pitch landing | http://localhost:5173/?view=pitch |
| Live dashboard | http://localhost:5173/?view=app&city=Hyderabad |
| Share test (after copy) | Paste clipboard URL in incognito / new tab |

---

## Pre-cache (alternative to script)

```powershell
.\scripts\precache_demo.ps1
# localStorage: weathero-session-id = demo-viva-session
```

Manual equivalent:

```powershell
$session = "demo-viva-session"
$base = "http://127.0.0.1:8000/api/v1"
$cities = @("Hyderabad", "Chennai", "Mumbai")

foreach ($c in $cities) {
  Invoke-RestMethod "$base/weather?city=$c" | Out-Null
  Invoke-RestMethod -Method Post -Uri "$base/locations" -ContentType "application/json" `
    -Body (@{ session_id = $session; city = $c } | ConvertTo-Json)
}
```

Then reload app, hover each saved card (prefetch), select compare city from dropdown.

---

## Unit toggle beat (optional +15s)

Toggle °C/°F — display converts client-side; fetch URL includes `?units=metric|imperial` for SWR key separation.

---

## Fallback lines

- **502 on first load:** `alembic upgrade head` or use `.\scripts\dev_api.ps1`
- **Empty carousel:** run `.\scripts\precache_demo.ps1` or POST locations with same `session_id` as localStorage
- **Compare disabled:** Visit both cities or hover carousel to prefetch
- **Pitch blur:** Pitch view must have **0** backdrop-filter layers; dashboard **≤ 1**

---

## Manual sign-off (NOT automated)

Before claiming Gate V PASS, user must verify in terminal + browser:

- [ ] Pitch URL loads; CTA → dashboard
- [ ] Blur audit: pitch 0, dashboard ≤ 1
- [ ] Trust drawer: focus trap, Esc, 44px targets, 3 tabs
- [ ] Share URL paste reloads same city
- [ ] `.\scripts\phase_gate.ps1 -Slice V` all automated checks green
- [ ] **3× rehearsal under 5:30**

---

## NOT Gate V PASS

Automated gate + manual checklist above — **user sign-off only** after 3× rehearsal.
