#!/usr/bin/env python3
"""Deterministic mock replay — normalize → gate → presentation (Slice D).

Loads eval/golden_fixtures.jsonl (no live HTTP). Writes eval/reports/latest.txt.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
API_ROOT = REPO_ROOT / "apps" / "api"
FIXTURES_PATH = REPO_ROOT / "eval" / "golden_fixtures.jsonl"
REPORT_PATH = REPO_ROOT / "eval" / "reports" / "latest.txt"
HOURS_STRIP_LENGTH = 8
SMOKE_CITIES = {"Hyderabad", "Chennai", "Mumbai"}

sys.path.insert(0, str(API_ROOT))

from app.services.gate import validate_snapshot  # noqa: E402
from app.services.normalize import normalize_om, normalize_owm  # noqa: E402
from app.services.presentation import build as build_presentation  # noqa: E402

VALID_FAMILIES = {
    "clear",
    "clouds",
    "rain",
    "drizzle",
    "thunderstorm",
    "snow",
    "fog",
    "atmosphere",
}


def _load_fixtures(*, smoke: bool = False) -> list[dict]:
    if not FIXTURES_PATH.is_file():
        raise FileNotFoundError(f"fixtures not found: {FIXTURES_PATH}")

    fixtures: list[dict] = []
    with FIXTURES_PATH.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if smoke and row.get("city") not in SMOKE_CITIES:
                continue
            fixtures.append(row)
    return fixtures


def _normalize_fixture(row: dict) -> tuple[dict, str]:
    provider = row["provider"]
    payload = row["payload"]

    if provider == "openweather":
        snapshot = normalize_owm(payload["geocode"], payload["current"], payload["forecast"])
        return snapshot, "openweather"

    if provider == "open_meteo":
        snapshot = normalize_om(
            lat=float(payload["lat"]),
            lon=float(payload["lon"]),
            om_data=payload["om_data"],
            city=row["city"],
            country=payload["country"],
        )
        return snapshot, "open_meteo"

    raise ValueError(f"unknown provider: {provider}")


def _build_meta(provider: str) -> dict:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "data_source": "live",
        "provider": provider,
        "cached_at": now,
        "stale_fallback": False,
    }


def _assert_rain_prob(value: float, *, label: str) -> None:
    if not isinstance(value, (int, float)):
        raise AssertionError(f"{label}: rain_prob must be numeric")
    if value < 0 or value > 1:
        raise AssertionError(f"{label}: rain_prob must be in [0, 1], got {value}")


def replay_city(row: dict) -> None:
    city = row["city"]
    snapshot, provider = _normalize_fixture(row)

    validate_snapshot(snapshot)

    if len(snapshot["hours_strip"]) != HOURS_STRIP_LENGTH:
        raise AssertionError(f"{city}: hours_strip length {len(snapshot['hours_strip'])}, expected {HOURS_STRIP_LENGTH}")

    _assert_rain_prob(snapshot["current"]["rain_prob"], label=f"{city}.current")
    for idx, slot in enumerate(snapshot["hours_strip"]):
        _assert_rain_prob(slot["rain_prob"], label=f"{city}.hours_strip[{idx}]")

    family = snapshot["current"]["condition_family"]
    if family not in VALID_FAMILIES:
        raise AssertionError(f"{city}: invalid condition_family {family!r}")

    meta = _build_meta(provider)
    if not meta.get("data_source"):
        raise AssertionError(f"{city}: meta.data_source missing")

    presentation = build_presentation(snapshot, meta)
    if not isinstance(presentation.get("advisories"), list):
        raise AssertionError(f"{city}: presentation.advisories must be a list")
    today_brief = presentation.get("today_brief")
    if not isinstance(today_brief, str) or not today_brief.strip():
        raise AssertionError(f"{city}: presentation.today_brief must be a non-empty string")


def run_replay(*, smoke: bool = False) -> tuple[int, int, list[str], list[str]]:
    fixtures = _load_fixtures(smoke=smoke)
    if not fixtures:
        raise RuntimeError("no fixtures loaded")

    passed: list[str] = []
    failed: list[str] = []

    for row in fixtures:
        city = row["city"]
        try:
            replay_city(row)
            passed.append(city)
            print(f"  PASS  {city}")
        except Exception as exc:  # noqa: BLE001 — replay harness reports all cities
            failed.append(f"{city}: {exc}")
            print(f"  FAIL  {city} - {exc}")

    return len(passed), len(failed), passed, failed


def _write_report(
    *,
    passed: int,
    total: int,
    passed_cities: list[str],
    failed: list[str],
    smoke: bool,
) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    mode = "smoke" if smoke else "full"
    lines = [
        f"Weathero mock replay - {mode}",
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}",
        f"Result: {passed}/{total} PASS",
        "",
        "Cities:",
    ]
    lines.extend(f"  ✓ {c}" for c in passed_cities)
    if failed:
        lines.append("")
        lines.append("Failures:")
        lines.extend(f"  ✗ {f}" for f in failed)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    smoke = "--smoke" in sys.argv
    label = "Smoke (3 cities)" if smoke else "Full (12 cities)"

    print(f"Weathero mock replay - {label}")
    print(f"Fixtures: {FIXTURES_PATH}")
    print("")

    try:
        passed, fail_count, passed_cities, failed = run_replay(smoke=smoke)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        return 1

    total = passed + fail_count
    _write_report(passed=passed, total=total, passed_cities=passed_cities, failed=failed, smoke=smoke)

    print("")
    print(f"Replay: {passed}/{total} PASS")
    print(f"Report: {REPORT_PATH}")

    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
