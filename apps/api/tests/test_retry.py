"""TDD tests for retry.py — RED first (Slice B)."""

import httpx
import pytest

from app.services.retry import with_transient_retry


async def test_retry_succeeds_after_503():
    attempts = 0

    async def flaky():
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            response = httpx.Response(503, request=httpx.Request("GET", "http://test"))
            raise httpx.HTTPStatusError("503", request=response.request, response=response)
        return "ok"

    result = await with_transient_retry(flaky)
    assert result == "ok"
    assert attempts == 3


async def test_retry_succeeds_after_timeout():
    attempts = 0

    async def flaky():
        nonlocal attempts
        attempts += 1
        if attempts < 2:
            raise httpx.TimeoutException("timeout")
        return "recovered"

    result = await with_transient_retry(flaky)
    assert result == "recovered"
    assert attempts == 2
