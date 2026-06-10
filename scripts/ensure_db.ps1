# Ensure Slice B cache tables exist (fixes alembic 002 stamped but tables missing)
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ApiRoot = Join-Path $RepoRoot "apps\api"
$DatabaseUrl = "postgresql+psycopg://weathero:weathero@localhost:5435/weathero"

function Test-TableExists {
    param([string]$Table)
    $sql = "SELECT to_regclass('public.$Table') IS NOT NULL AS exists;"
    $out = docker exec weathero-postgres-1 psql -U weathero -d weathero -t -A -c $sql 2>&1
    return ($out -match "^t$")
}

Push-Location $ApiRoot
try {
    & .\.venv\Scripts\Activate.ps1
    $env:DATABASE_URL = $DatabaseUrl

    $needGeocode = -not (Test-TableExists "geocode_cache")
    $needForecast = -not (Test-TableExists "forecast_cache")
    $needSaved = -not (Test-TableExists "saved_locations")

    if ($needGeocode -or $needForecast -or $needSaved) {
        Write-Host "Missing tables detected (geocode=$needGeocode forecast=$needForecast saved=$needSaved). Repairing..." -ForegroundColor Yellow
        alembic stamp 001
        if ($LASTEXITCODE -ne 0) { throw "alembic stamp 001 failed" }
        alembic upgrade head
        if ($LASTEXITCODE -ne 0) { throw "alembic upgrade head failed" }
    }

    if (-not (Test-TableExists "geocode_cache")) {
        throw "Repair failed: geocode_cache still missing"
    }
    Write-Host "Database tables OK." -ForegroundColor Green
}
finally {
    Pop-Location
}
