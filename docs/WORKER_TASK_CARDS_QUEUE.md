# Weathero — Worker Task Cards Queue

**Slice V order:** V3b ✅ → V3 ✅ → V1 ✅ → V2 ✅ → V4 ✅ → **V5**

## Queue status

| Card | Worker | Status | Gate |
|------|--------|--------|------|
| V3b | Backend/Security | **DONE** | 52→56 pytest |
| V3 | Backend/Data | **DONE** | 56/56 |
| V1 | Frontend/Pitch | **DONE** | vitest + build |
| V2 | Frontend/Bento | **DONE** | vitest + build |
| V4 | Frontend/Trust | **DONE** | a11y + share |
| **V5** | Docs/Gate | **AUTOMATED PASS** | Manual sign-off pending |

---

## Card V5 — Demo script v7 + Gate V (Day 6–7)

**Owner:** Docs/Gate Worker  
**Prerequisite:** V1–V4 DONE  
**Demo beat:** Full pyramid ≤ 5:30 (see `docs/DEMO_SCRIPT.md` v7)

### Deliverables

| Item | Status |
|------|--------|
| `docs/DEMO_SCRIPT.md` v7 | Done |
| `docs/REPORT_APPENDIX.md` Slice V row | Done |
| `docs/REPORT_ABSTRACT.md` paragraph update | Done |
| `scripts/phase_gate.ps1 -Slice V` | Done |
| `docs/SUPERPOWERS_SLICE_PLANS/slice-v-v5.md` | Done |
| `docs/CURRENT_STATE.md` | Done |

### Acceptance

- [x] `.\scripts\phase_gate.ps1 -Slice V` — user terminal **PASS**
- [x] pytest 56/56 + replay 12/12 + vitest 22/22 + build — **PASS**
- [ ] Pitch URL + blur audit + Trust a11y + Share paste — user browser
- [ ] 3× rehearsal under 5:30 — user
- [ ] **NOT full Gate V PASS** until manual checklist + rehearsal done

### Verify

```powershell
cd C:\Projects\weathero
.\scripts\phase_gate.ps1 -Slice V
cd apps\web; npm run test; npm run build
cd ..\api; pytest -q
cd ..\..; python scripts\replay_mock.py
```

---

## Card V4 — Frontend/Trust drawer + Share (Day 5) — DONE

**Owner:** Frontend Worker  
**Demo beat:** ~2:00–3:30 Trust drawer + share URL

### Implemented

| Component | Status |
|-----------|--------|
| `TrustDrawer.tsx` — Provenance / Eval / Security tabs | Done |
| `ShareWeatherButton.tsx` — `?view=app&city=` clipboard | Done |
| Focus trap, Esc, tab keyboard nav | Done |
| Solid drawer panel (no backdrop-filter) | Done |

---

## Archive — V1 / V2 / V3 / V3b

<details><summary>V1 Pitch</summary>
PitchLanding, useViewMode, 66 checks social proof, CTA → Hyderabad.
</details>

<details><summary>V2 Bento</summary>
TodayBrief, MetricsBento, temp morph, Outfit on dashboard.
</details>

<details><summary>V3 / V3b</summary>
v1.3.0 + today_brief + optional air_quality; SECURITY.md hardening; 56/56 pytest.
</details>
