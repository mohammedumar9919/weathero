# Weathero API Contracts

**Version:** 1.3.0  
**Status:** Slice V backend — optional `snapshot.air_quality`; required `presentation.today_brief`.

## Changelog

| Version | Delta |
|---------|-------|
| 1.1.0 | Initial bundle schema, cache tables, single `GET /api/v1/weather` |
| 1.2.0 | Add `hours_strip` (8×3h slots) to snapshot; gate validates shape in Slice A |
| 1.2.1 | Response envelope: `{ snapshot, presentation, meta }`; gate validates `snapshot` only |
| 1.3.0 | Optional `snapshot.air_quality`; required `presentation.today_brief`; OWM 4th call (air pollution) on cache miss, 45m cache TTL unchanged |

## Tier 0 (locked)

- Single bundle endpoint: `GET /api/v1/weather?city=<name>`
- Cache TTL: **45 minutes**
- Provider strategy: OWM 2-call + Open-Meteo fallback (Slice B)
- Max **3** saved locations per user/session
- **No** maps, radar, LLM, ensemble, Redis, or PWA in Tier 0

---

## Endpoints

### `GET /api/v1/health`

**Implemented:** Slice A  
**Response:**

```json
{ "status": "ok", "slice": "A" }
```

### `GET /api/v1/weather?city=<name>`

**Implemented:** Slice B (documented only in Slice A)  
**Cache:** `forecast_cache` table, TTL 45m  
**Providers:** Geocode (OWM) → Current+Forecast+Air Pollution (OWM 3-call parallel on cache miss) → OM fallback

**Response:** `WeatherEnvelope` (v1.3.0) — see schema below

---

## `WeatherEnvelope` schema (v1.3.0)

```json
{
  "snapshot": {
    "city": "Hyderabad",
    "country": "IN",
    "lat": 17.385,
    "lon": 78.4867,
    "fetched_at": "2026-06-08T12:00:00Z",
    "current": { "...": "..." },
    "hours_strip": [ "...8 slots..." ],
    "air_quality": {
      "aqi": 3,
      "category": "Moderate",
      "pm2_5": 18.5
    }
  },
  "presentation": {
    "ambient_theme": "clear",
    "temp_band": "warm",
    "source_badge": "OpenWeather",
    "advisories": [
      { "text": "Chance of rain later", "severity": "info", "icon": "rain" }
    ],
    "provenance_label": "Live · just now",
    "provenance_pulse": true,
    "provenance_tone": "live",
    "today_brief": "Warm afternoon with clear skies moderate air quality — limit outdoor exertion if sensitive."
  },
  "meta": {
    "data_source": "live",
    "provider": "openweather",
    "cached_at": "2026-06-08T12:00:00Z",
    "stale_fallback": false
  }
}
```

### `presentation` object (v1.3.0)

| Field | Type | Notes |
|-------|------|-------|
| `ambient_theme` | string | `clear`, `cloud`, `rain`, `storm`, `snow`, `fog`, `atmosphere` |
| `temp_band` | string | `mild` (<20°C), `warm` (20–30°C), `hot` (>30°C) |
| `source_badge` | string | `OpenWeather` or `Open-Meteo` |
| `advisories` | array | Rule-based chips; see advisory slot |
| `provenance_label` | string | Human-readable data freshness |
| `provenance_pulse` | bool | `true` when `meta.data_source` is `live` |
| `provenance_tone` | string | `live`, `cache`, or `stale` |
| `today_brief` | string | **v1.3.0** — required rule-generated summary (no LLM) |

### Advisory slot

| Field | Type | Constraints |
|-------|------|-------------|
| `text` | string | Human-readable advisory |
| `severity` | string | `info`, `warn`, or `danger` |
| `icon` | string | `rain`, `heat`, or `wind` |

### `meta` object (v1.2.1)

| Field | Type | Notes |
|-------|------|-------|
| `data_source` | string | `live`, `cache`, or `stale_fallback` |
| `provider` | string | `openweather` or `open_meteo` |
| `cached_at` | string | ISO 8601 UTC |
| `stale_fallback` | bool | `true` when served from expired cache after provider failure |

**Cache storage:** `forecast_cache.bundle_json` stores `{ snapshot, provider }`; `presentation` and `meta` are computed at response time.

---

## `WeatherSnapshot` schema (v1.2.0)

```json
{
  "city": "Hyderabad",
  "country": "IN",
  "lat": 17.385,
  "lon": 78.4867,
  "fetched_at": "2026-06-08T12:00:00Z",
  "current": {
    "temp_c": 32.0,
    "feels_like_c": 35.0,
    "humidity_pct": 65,
    "wind_speed_mps": 3.5,
    "condition_code": 800,
    "condition_family": "clear",
    "rain_prob": 0.1
  },
  "hours_strip": [
    {
      "offset_hours": 0,
      "temp_c": 32.0,
      "rain_prob": 0.1,
      "condition_code": 800,
      "condition_family": "clear"
    }
  ]
}
```

### Required fields

| Field | Type | Notes |
|-------|------|-------|
| `city` | string | Display name |
| `country` | string | ISO 3166-1 alpha-2 |
| `lat` | float | WGS84 |
| `lon` | float | WGS84 |
| `fetched_at` | string | ISO 8601 UTC |
| `current` | object | See below |
| `hours_strip` | array[8] | **v1.2.0** — exactly 8 slots, 3h intervals |

### `current` object

| Field | Type | Constraints |
|-------|------|-------------|
| `temp_c` | float | Celsius |
| `feels_like_c` | float | Celsius |
| `humidity_pct` | int | 0–100 |
| `wind_speed_mps` | float | m/s |
| `condition_code` | int | OWM code |
| `condition_family` | string | Mapped via `condition_codes.py` |
| `rain_prob` | float | **∈ [0, 1]** |

### `hours_strip` slot (v1.2.0)

Exactly **8** slots at 3-hour offsets (0, 3, 6, …, 21).

| Field | Type | Constraints |
|-------|------|-------------|
| `offset_hours` | int | 0, 3, 6, 9, 12, 15, 18, 21 |
| `temp_c` | float | Celsius |
| `rain_prob` | float | **∈ [0, 1]** |
| `condition_code` | int | OWM code |
| `condition_family` | string | Mapped via `condition_codes.py` |

Data populated in Slice B; gate validates shape in Slice A.

### `air_quality` object (v1.3.0, optional)

Omitted when OWM Air Pollution fetch fails or provider is Open-Meteo fallback.

| Field | Type | Constraints |
|-------|------|-------------|
| `aqi` | int | OWM index **∈ [1, 5]** |
| `category` | string | `Good`, `Fair`, `Moderate`, `Poor`, `Very Poor` |
| `pm2_5` | float | PM2.5 μg/m³, **≥ 0** |

---

## `condition_family` values

| Family | OWM codes (representative) |
|--------|--------------------------|
| `clear` | 800 |
| `clouds` | 801–804 |
| `rain` | 500–531 |
| `drizzle` | 300–321 |
| `thunderstorm` | 200–232 |
| `snow` | 600–622 |
| `fog` | 741 |
| `atmosphere` | 701–781 (excl. 741) |

---

## Database tables

### `geocode_cache`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `city_query` | text UNIQUE | Normalized search string |
| `lat` | float | |
| `lon` | float | |
| `country` | text | |
| `cached_at` | timestamptz | |

### `forecast_cache`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `city_query` | text UNIQUE | |
| `bundle_json` | jsonb | Full `WeatherBundle` |
| `cached_at` | timestamptz | TTL 45m |

### `saved_locations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `session_id` | text | Client session |
| `city` | text | |
| `sort_order` | int | Max 3 per session |

---

## Gate service (`gate.py`)

`validate_snapshot(snapshot: dict) -> bool`

- Validates **`snapshot`** object only (not envelope `presentation` or `meta`)
- All required fields present
- `current.rain_prob` ∈ [0, 1]
- `hours_strip` length == 8
- Each slot has required fields; slot `rain_prob` ∈ [0, 1]
- **v1.3.0:** if `air_quality` key present: `aqi` ∈ [1, 5]; `pm2_5` ≥ 0

Raises `GateValidationError` on failure.

---

## Condition codes (`condition_codes.py`)

`map_owm_code_to_family(code: int) -> str`

Maps OWM condition codes to `condition_family`. Raises `ConditionCodeError` for unknown codes.
