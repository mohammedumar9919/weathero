# Slice V — Card V3b Security (Day 1)

## Goal

Production-style security hardening: 503 missing key, input bounds, security headers, SECURITY.md, +6 pytest.

## Tasks

### 1. TDD (RED → GREEN)

- [x] `test_security_headers.py` (2)
- [x] `test_security_input_bounds.py` (2)
- [x] `test_missing_api_key_503.py` (1)
- [x] `test_session_id_validation.py` (1)

### 2. Implementation

- [x] `middleware/security_headers.py`
- [x] `weather.py` — 503 if no key; city max_length=100
- [x] `locations.py` — session_id regex `^[\w-]+$`, max 64
- [x] `health.py` — 30/min rate limit
- [x] `main.py` — CORS tighten; docs_url=None when ENV=production
- [x] `config.py` — `env: str = "development"`

### 3. Docs

- [x] `docs/SECURITY.md`
- [x] `.env.example` — ENV, key required note

## Forbidden

- apps/web/**
- api-contracts v1.3.0 (V3)
- air_quality / today_brief

## Verify

```powershell
cd apps\api
pytest -v --tb=short
cd ..\..
python scripts\replay_mock.py
```

Target: **52/52 pytest**, replay **12/12** unchanged.
