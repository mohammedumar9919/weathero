"""SWR Cache-Control header helper for weather responses."""

SWR_CACHE_CONTROL = "private, max-age=0, stale-while-revalidate=60"


def apply_swr_cache_headers(headers: dict[str, str]) -> None:
    headers["Cache-Control"] = SWR_CACHE_CONTROL
