"""Transient retry helper — tenacity 2× (0.5s, 1s)."""

from __future__ import annotations

import httpx
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_chain, wait_fixed

TRANSIENT_STATUS_CODES = {429, 500, 502, 503, 504}


def _is_transient(exc: BaseException) -> bool:
    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in TRANSIENT_STATUS_CODES
    return False


@retry(
    retry=retry_if_exception(_is_transient),
    stop=stop_after_attempt(3),
    wait=wait_chain(wait_fixed(0.5), wait_fixed(1.0)),
    reraise=True,
)
async def with_transient_retry(coro_factory):
    """Execute an async callable with transient retry (initial + 2 retries)."""
    return await coro_factory()
