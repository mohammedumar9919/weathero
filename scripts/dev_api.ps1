# Start Weathero API for local dev (loads apps/api/.env)
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ApiRoot = Join-Path $RepoRoot "apps\api"

Push-Location $ApiRoot
try {
    if (-not (Test-Path ".venv")) {
        python -m venv .venv
    }
    & .\.venv\Scripts\Activate.ps1
    $env:DATABASE_URL = "postgresql+psycopg://weathero:weathero@localhost:5435/weathero"
    Write-Host "Ensuring database tables..." -ForegroundColor Yellow
    & (Join-Path $RepoRoot "scripts\ensure_db.ps1")
    if ($LASTEXITCODE -ne 0) { throw "ensure_db.ps1 failed" }
    Write-Host "Running alembic upgrade head..." -ForegroundColor Yellow
    alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw "alembic upgrade head failed" }
    Write-Host "Starting API on http://127.0.0.1:8000 (cwd: $ApiRoot)" -ForegroundColor Cyan
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}
finally {
    Pop-Location
}
