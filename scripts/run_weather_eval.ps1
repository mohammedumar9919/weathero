# Weathero mock eval replay - user PowerShell only
# Usage:
#   .\scripts\run_weather_eval.ps1           # full 12/12
#   .\scripts\run_weather_eval.ps1 -Smoke    # 3-city smoke

param(
    [switch]$Smoke
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ApiRoot = Join-Path $RepoRoot "apps\api"
$ReplayScript = Join-Path $RepoRoot "scripts\replay_mock.py"
$ReportPath = Join-Path $RepoRoot "eval\reports\latest.txt"

function Ensure-ApiVenv {
    Push-Location $ApiRoot
    try {
        if (-not (Test-Path ".venv")) { python -m venv .venv }
        $prev = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        & .\.venv\Scripts\Activate.ps1
        python -m pip install -e ".[dev]" -q *> $null
        $ErrorActionPreference = $prev
    }
    finally { Pop-Location }
}

Write-Host ""
if ($Smoke) {
    Write-Host "=== Weathero Eval - Smoke (3 cities) ===" -ForegroundColor Cyan
}
else {
    Write-Host "=== Weathero Eval - Full (12 cities) ===" -ForegroundColor Cyan
}

Ensure-ApiVenv
Push-Location $RepoRoot
try {
    & (Join-Path $ApiRoot ".venv\Scripts\Activate.ps1")
    $replayArgs = @($ReplayScript)
    if ($Smoke) { $replayArgs += "--smoke" }

    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    python @replayArgs
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev

    Write-Host ""
    if ($code -eq 0) {
        Write-Host "Eval replay PASSED" -ForegroundColor Green
        Write-Host "Report: $ReportPath" -ForegroundColor DarkGray
        exit 0
    }
    else {
        Write-Host "Eval replay FAILED (exit $code)" -ForegroundColor Red
        exit $code
    }
}
finally {
    Pop-Location
}
