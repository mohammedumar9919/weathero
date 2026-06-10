# Weathero Security (Slice V3b)

Production-**style** security hardening for semester deployment — not bank-grade production.

## Threat model

| Threat | Exposure | Mitigation (V3b) |
|--------|----------|------------------|
| Missing weather provider config | Opaque 502 confuses ops / leaks provider errors | **503** with `"weather provider not configured"` before any OWM call |
| Oversized / malformed inputs | DoS via long query strings, injection-style session IDs | `city` max 100 chars; `session_id` max 64, regex `^[\w-]+$` → **422** |
| Clickjacking / MIME sniffing | Browser embeds API responses | Security headers middleware on all responses |
| Cross-origin abuse | Over-broad CORS | Methods: GET, POST, DELETE only; headers: Content-Type only |
| Health endpoint probing | Unbounded `/health` scans | slowapi **30/min** rate limit |
| Swagger exposure in prod | `/docs` reveals API surface | `ENV=production` → `docs_url=None`, `redoc_url=None` |

## Controls shipped (V3b)

| Control | Status |
|---------|--------|
| 503 missing API key | Shipped |
| Input bounds (city, session_id) | Shipped |
| Security headers (nosniff, DENY frame, referrer, permissions) | Shipped |
| CORS tighten | Shipped |
| Health rate limit 30/min | Shipped |
| Production docs disabled | Shipped |

## Honest limits (viva line)

- **No authentication** — session_id is client-supplied, not verified identity.
- **No WAF** — rate limits are application-level (slowapi) only.
- **Dev Postgres creds** — default `weathero:weathero@localhost:5435` in docker-compose; rotate for real deployment.
- **No secrets in responses** — 503 message is generic; API keys never echoed.
- **Semester scope** — production-**style** controls suitable for demo deployment, not PCI/SOC2.

## Environment

| Variable | Purpose |
|----------|---------|
| `ENV` | `development` (default) or `production` — disables `/docs` when production |
| `OPENWEATHER_API_KEY` | Required for live weather; empty → 503 |

See `apps/api/.env.example`.
