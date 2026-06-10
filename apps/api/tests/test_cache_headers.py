"""TDD tests for swr_cache_headers.py — RED first (Slice B)."""

from app.services.swr_cache_headers import SWR_CACHE_CONTROL, apply_swr_cache_headers


def test_swr_cache_control_constant_value():
    assert SWR_CACHE_CONTROL == "private, max-age=0, stale-while-revalidate=60"


def test_apply_swr_cache_headers_sets_cache_control():
    headers: dict[str, str] = {}
    apply_swr_cache_headers(headers)
    assert headers["Cache-Control"] == SWR_CACHE_CONTROL
