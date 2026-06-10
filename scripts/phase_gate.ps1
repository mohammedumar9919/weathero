# Weathero phase gate - Slice A foundation
# Usage: .\scripts\phase_gate.ps1 -Slice A
# Authoritative PASS/FAIL: user terminal only

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("A", "B", "C", "D", "E", "V")]
    [string]$Slice
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ApiRoot = Join-Path $RepoRoot "apps\api"
$WebRoot = Join-Path $RepoRoot "apps\web"
$DatabaseUrl = "postgresql+psycopg://weathero:weathero@localhost:5435/weathero"

function Write-GateResult {
    param([string]$Name, [bool]$Pass, [string]$Detail = "")
    $icon = if ($Pass) { "PASS" } else { "FAIL" }
    $color = if ($Pass) { "Green" } else { "Red" }
    $line = "  [$icon] $Name"
    if ($Detail) { $line += " - $Detail" }
    Write-Host $line -ForegroundColor $color
    return $Pass
}

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

function Invoke-Pytest {
    param([string[]]$PytestArgs)
    Ensure-ApiVenv
    Push-Location $ApiRoot
    try {
        & .\.venv\Scripts\Activate.ps1
        $env:DATABASE_URL = $DatabaseUrl
        $prev = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $output = & pytest @PytestArgs 2>&1
        $code = $LASTEXITCODE
        $ErrorActionPreference = $prev
        return @{ Code = $code; Output = ($output -join "`n") }
    }
    finally { Pop-Location }
}

function Test-DockerPostgres {
    Push-Location $RepoRoot
    try {
        $ps = docker compose ps --format json 2>&1 | ConvertFrom-Json
        $pg = $ps | Where-Object { $_.Service -eq "postgres" }
        if (-not $pg) { return @{ Pass = $false; Detail = "postgres service not found" } }
        if ($pg.State -ne "running") { return @{ Pass = $false; Detail = "postgres not running" } }
        if ($pg.Health -and $pg.Health -ne "healthy") {
            return @{ Pass = $false; Detail = "postgres health: $($pg.Health)" }
        }
        return @{ Pass = $true; Detail = "port 5435" }
    }
    catch {
        return @{ Pass = $false; Detail = $_.Exception.Message }
    }
    finally { Pop-Location }
}

function Ensure-WebDeps {
    Push-Location $WebRoot
    try {
        if (-not (Test-Path "node_modules")) {
            npm install --silent 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { return $false }
        }
        return $true
    }
    finally { Pop-Location }
}

function Test-NpmTest {
    Push-Location $WebRoot
    try {
        if (-not (Ensure-WebDeps)) { return @{ Pass = $false; Detail = "npm install failed" } }
        $prev = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $output = npm run test 2>&1
        $code = $LASTEXITCODE
        $ErrorActionPreference = $prev
        if ($code -ne 0) {
            return @{ Pass = $false; Detail = "vitest exit $code"; Output = ($output -join "`n") }
        }
        return @{ Pass = $true; Detail = "vitest ok" }
    }
    finally { Pop-Location }
}

function Test-NpmBuild {
    Push-Location $WebRoot
    try {
        if (-not (Ensure-WebDeps)) { return @{ Pass = $false; Detail = "npm install failed" } }
        $prev = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $null = npm run build 2>&1
        $code = $LASTEXITCODE
        $ErrorActionPreference = $prev
        if ($code -ne 0) { return @{ Pass = $false; Detail = "build exit $code" } }
        return @{ Pass = $true; Detail = "vite build ok" }
    }
    finally { Pop-Location }
}

Write-Host ""
Write-Host "=== Weathero Gate - Slice $Slice ===" -ForegroundColor Cyan
$allPass = $true

switch ($Slice) {
    "A" {
        Write-Host ""
        Write-Host "--- Infrastructure ---" -ForegroundColor Yellow
        $docker = Test-DockerPostgres
        if (-not (Write-GateResult "Docker Postgres :5435" $docker.Pass $docker.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host '--- Backend - 12 tests ---' -ForegroundColor Yellow
        $pytestArgs = @(
            "tests/test_gate.py",
            "tests/test_condition_codes.py",
            "-v",
            "--tb=short"
        )
        $pytest = Invoke-Pytest -PytestArgs $pytestArgs
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest gate + condition_codes" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Frontend ---" -ForegroundColor Yellow
        $build = Test-NpmBuild
        if (-not (Write-GateResult "npm run build" $build.Pass $build.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) -and ($contractsRaw -match "1\.2\.0") -and ($contractsRaw -match "hours_strip")
        if (-not (Write-GateResult "api-contracts v1.2.0 + hours_strip" $contractsPass)) { $allPass = $false }
    }
    "B" {
        Write-Host ""
        Write-Host "--- Infrastructure ---" -ForegroundColor Yellow
        $docker = Test-DockerPostgres
        if (-not (Write-GateResult "Docker Postgres :5435" $docker.Pass $docker.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host '--- Backend - 33 tests (B1) ---' -ForegroundColor Yellow
        Ensure-ApiVenv
        Push-Location $ApiRoot
        try {
            & .\.venv\Scripts\Activate.ps1
            $env:DATABASE_URL = $DatabaseUrl
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $null = alembic upgrade head 2>&1
            $alembicPass = $LASTEXITCODE -eq 0
            $ErrorActionPreference = $prev
        }
        finally { Pop-Location }
        if (-not (Write-GateResult "alembic upgrade head" $alembicPass)) { $allPass = $false }

        $pytest = Invoke-Pytest -PytestArgs @("-v", "--tb=short")
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest all backend (33 target)" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Frontend (B2) ---" -ForegroundColor Yellow
        $vitest = Test-NpmTest
        if (-not (Write-GateResult "npm run test (vitest 2/2)" $vitest.Pass $vitest.Detail)) {
            $allPass = $false
            if ($vitest.Output) { Write-Host $vitest.Output }
        }
        $build = Test-NpmBuild
        if (-not (Write-GateResult "npm run build" $build.Pass $build.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) -and ($contractsRaw -match "1\.2\.0") -and ($contractsRaw -match "hours_strip")
        if (-not (Write-GateResult "api-contracts v1.2.0 + hours_strip" $contractsPass)) { $allPass = $false }
    }
    "C" {
        Write-Host ""
        Write-Host "--- Infrastructure ---" -ForegroundColor Yellow
        $docker = Test-DockerPostgres
        if (-not (Write-GateResult "Docker Postgres :5435" $docker.Pass $docker.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host '--- Backend - 46 tests (C1) ---' -ForegroundColor Yellow
        Ensure-ApiVenv
        Push-Location $ApiRoot
        try {
            & .\.venv\Scripts\Activate.ps1
            $env:DATABASE_URL = $DatabaseUrl
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $null = alembic upgrade head 2>&1
            $alembicPass = $LASTEXITCODE -eq 0
            $ErrorActionPreference = $prev
        }
        finally { Pop-Location }
        if (-not (Write-GateResult "alembic upgrade head" $alembicPass)) { $allPass = $false }

        $pytest = Invoke-Pytest -PytestArgs @("-v", "--tb=short")
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest all backend (46 target)" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) -and ($contractsRaw -match "1\.2\.1") -and ($contractsRaw -match "presentation") -and ($contractsRaw -match "meta")
        if (-not (Write-GateResult "api-contracts v1.2.1 + presentation + meta" $contractsPass)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Frontend (C2) ---" -ForegroundColor Yellow
        $vitest = Test-NpmTest
        if (-not (Write-GateResult "npm run test (vitest)" $vitest.Pass $vitest.Detail)) {
            $allPass = $false
            if ($vitest.Output) { Write-Host $vitest.Output }
        }
        $build = Test-NpmBuild
        if (-not (Write-GateResult "npm run build" $build.Pass $build.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- C2 note ---" -ForegroundColor Yellow
        Write-Host "  Manual Gate C (HoursStrip, theme morph, blur audit) - user terminal only." -ForegroundColor DarkGray
    }
    "D" {
        Write-Host ""
        Write-Host '--- Backend - 46 pytest ---' -ForegroundColor Yellow
        Ensure-ApiVenv
        Push-Location $ApiRoot
        try {
            & .\.venv\Scripts\Activate.ps1
            $env:DATABASE_URL = $DatabaseUrl
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $null = alembic upgrade head 2>&1
            $alembicPass = $LASTEXITCODE -eq 0
            $ErrorActionPreference = $prev
        }
        finally { Pop-Location }
        if (-not (Write-GateResult "alembic upgrade head" $alembicPass)) { $allPass = $false }

        $pytest = Invoke-Pytest -PytestArgs @("-v", "--tb=short")
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest all backend (46 target)" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Mock replay - 12/12 ---" -ForegroundColor Yellow
        $ReplayScript = Join-Path $RepoRoot "scripts\replay_mock.py"
        Push-Location $RepoRoot
        try {
            & (Join-Path $ApiRoot ".venv\Scripts\Activate.ps1")
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $replayOut = python $ReplayScript 2>&1
            $replayCode = $LASTEXITCODE
            $ErrorActionPreference = $prev
            $replayPass = $replayCode -eq 0
            if (-not (Write-GateResult "replay_mock.py 12/12" $replayPass "exit $replayCode")) {
                $allPass = $false
                Write-Host ($replayOut -join "`n")
            }
        }
        finally { Pop-Location }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) -and ($contractsRaw -match "1\.2\.1") -and ($contractsRaw -match "presentation") -and ($contractsRaw -match "meta")
        if (-not (Write-GateResult "api-contracts v1.2.1 + presentation + meta" $contractsPass)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Evidence ---" -ForegroundColor Yellow
        $reportPath = Join-Path $RepoRoot "eval\reports\latest.txt"
        $reportPass = Test-Path $reportPath
        if (-not (Write-GateResult "eval/reports/latest.txt" $reportPass)) { $allPass = $false }
    }
    "E" {
        Write-Host ""
        Write-Host "--- Infrastructure ---" -ForegroundColor Yellow
        $docker = Test-DockerPostgres
        if (-not (Write-GateResult "Docker Postgres :5435" $docker.Pass $docker.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host '--- Backend - 46 pytest ---' -ForegroundColor Yellow
        Ensure-ApiVenv
        Push-Location $ApiRoot
        try {
            & .\.venv\Scripts\Activate.ps1
            $env:DATABASE_URL = $DatabaseUrl
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $null = alembic upgrade head 2>&1
            $alembicPass = $LASTEXITCODE -eq 0
            $ErrorActionPreference = $prev
        }
        finally { Pop-Location }
        if (-not (Write-GateResult "alembic upgrade head" $alembicPass)) { $allPass = $false }

        $pytest = Invoke-Pytest -PytestArgs @("-v", "--tb=short")
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest all backend (46 target)" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Mock replay - 12/12 ---" -ForegroundColor Yellow
        $ReplayScript = Join-Path $RepoRoot "scripts\replay_mock.py"
        Push-Location $RepoRoot
        try {
            & (Join-Path $ApiRoot ".venv\Scripts\Activate.ps1")
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $replayOut = python $ReplayScript 2>&1
            $replayCode = $LASTEXITCODE
            $ErrorActionPreference = $prev
            $replayPass = $replayCode -eq 0
            if (-not (Write-GateResult "replay_mock.py 12/12" $replayPass "exit $replayCode")) {
                $allPass = $false
                Write-Host ($replayOut -join "`n")
            }
        }
        finally { Pop-Location }

        Write-Host ""
        Write-Host "--- Frontend (E1) ---" -ForegroundColor Yellow
        $vitest = Test-NpmTest
        if (-not (Write-GateResult "npm run test (vitest)" $vitest.Pass $vitest.Detail)) {
            $allPass = $false
            if ($vitest.Output) { Write-Host $vitest.Output }
        }
        $build = Test-NpmBuild
        if (-not (Write-GateResult "npm run build" $build.Pass $build.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Ship docs ---" -ForegroundColor Yellow
        $demoPath = Join-Path $RepoRoot "docs\DEMO_SCRIPT.md"
        $appendixPath = Join-Path $RepoRoot "docs\REPORT_APPENDIX.md"
        $abstractPath = Join-Path $RepoRoot "docs\REPORT_ABSTRACT.md"
        if (-not (Write-GateResult "docs/DEMO_SCRIPT.md" (Test-Path $demoPath))) { $allPass = $false }
        if (-not (Write-GateResult "docs/REPORT_APPENDIX.md" (Test-Path $appendixPath))) { $allPass = $false }
        if (-not (Write-GateResult "docs/REPORT_ABSTRACT.md" (Test-Path $abstractPath))) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) -and ($contractsRaw -match "1\.2\.1") -and ($contractsRaw -match "presentation") -and ($contractsRaw -match "meta")
        if (-not (Write-GateResult "api-contracts v1.2.1 + presentation + meta" $contractsPass)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- E1 note ---" -ForegroundColor Yellow
        Write-Host "  Gate E user sign-off: rehearse DEMO_SCRIPT.md 3x under 5 min." -ForegroundColor DarkGray
    }
    "V" {
        Write-Host ""
        Write-Host "--- Infrastructure ---" -ForegroundColor Yellow
        $docker = Test-DockerPostgres
        if (-not (Write-GateResult "Docker Postgres :5435" $docker.Pass $docker.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host '--- Backend - 56 pytest ---' -ForegroundColor Yellow
        Ensure-ApiVenv
        Push-Location $ApiRoot
        try {
            & .\.venv\Scripts\Activate.ps1
            $env:DATABASE_URL = $DatabaseUrl
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $null = alembic upgrade head 2>&1
            $alembicPass = $LASTEXITCODE -eq 0
            $ErrorActionPreference = $prev
        }
        finally { Pop-Location }
        if (-not (Write-GateResult "alembic upgrade head" $alembicPass)) { $allPass = $false }

        $pytest = Invoke-Pytest -PytestArgs @("-v", "--tb=short")
        $testPass = $pytest.Code -eq 0
        if (-not (Write-GateResult "pytest all backend (56 target)" $testPass "exit $($pytest.Code)")) {
            $allPass = $false
            Write-Host $pytest.Output
        }

        Write-Host ""
        Write-Host "--- Mock replay - 12/12 ---" -ForegroundColor Yellow
        $ReplayScript = Join-Path $RepoRoot "scripts\replay_mock.py"
        Push-Location $RepoRoot
        try {
            & (Join-Path $ApiRoot ".venv\Scripts\Activate.ps1")
            $prev = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $replayOut = python $ReplayScript 2>&1
            $replayCode = $LASTEXITCODE
            $ErrorActionPreference = $prev
            $replayPass = $replayCode -eq 0
            if (-not (Write-GateResult "replay_mock.py 12/12" $replayPass "exit $replayCode")) {
                $allPass = $false
                Write-Host ($replayOut -join "`n")
            }
        }
        finally { Pop-Location }

        Write-Host ""
        Write-Host "--- Frontend (V1-V4) ---" -ForegroundColor Yellow
        $vitest = Test-NpmTest
        if (-not (Write-GateResult "npm run test (vitest 22 target)" $vitest.Pass $vitest.Detail)) {
            $allPass = $false
            if ($vitest.Output) { Write-Host $vitest.Output }
        }
        $build = Test-NpmBuild
        if (-not (Write-GateResult "npm run build" $build.Pass $build.Detail)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Contracts ---" -ForegroundColor Yellow
        $contractsPath = Join-Path $RepoRoot "docs\api-contracts.md"
        $contractsRaw = Get-Content $contractsPath -Raw
        $contractsPass = (Test-Path $contractsPath) `
            -and ($contractsRaw -match "1\.3\.0") `
            -and ($contractsRaw -match "today_brief") `
            -and ($contractsRaw -match "air_quality")
        if (-not (Write-GateResult "api-contracts v1.3.0 + today_brief + air_quality" $contractsPass)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- Ship docs ---" -ForegroundColor Yellow
        $demoPath = Join-Path $RepoRoot "docs\DEMO_SCRIPT.md"
        $securityPath = Join-Path $RepoRoot "docs\SECURITY.md"
        $appendixPath = Join-Path $RepoRoot "docs\REPORT_APPENDIX.md"
        $abstractPath = Join-Path $RepoRoot "docs\REPORT_ABSTRACT.md"
        $slicePlansDir = Join-Path $RepoRoot "docs\SUPERPOWERS_SLICE_PLANS"
        $sliceVPlans = @(Get-ChildItem -Path $slicePlansDir -Filter "slice-v-v*.md" -ErrorAction SilentlyContinue)
        if (-not (Write-GateResult "docs/DEMO_SCRIPT.md" (Test-Path $demoPath))) { $allPass = $false }
        if (-not (Write-GateResult "docs/SECURITY.md" (Test-Path $securityPath))) { $allPass = $false }
        if (-not (Write-GateResult "docs/REPORT_APPENDIX.md" (Test-Path $appendixPath))) { $allPass = $false }
        if (-not (Write-GateResult "docs/REPORT_ABSTRACT.md" (Test-Path $abstractPath))) { $allPass = $false }
        $slicePlansPass = $sliceVPlans.Count -ge 1
        if (-not (Write-GateResult "docs/SUPERPOWERS_SLICE_PLANS/slice-v-v*.md ($($sliceVPlans.Count) found)" $slicePlansPass)) { $allPass = $false }

        Write-Host ""
        Write-Host "--- V manual sign-off (user terminal only) ---" -ForegroundColor Yellow
        Write-Host "  Pitch URL: http://localhost:5173/?view=pitch" -ForegroundColor DarkGray
        Write-Host "  Blur audit: pitch 0 layers, dashboard <= 1" -ForegroundColor DarkGray
        Write-Host "  Trust drawer: focus trap, Esc, 3 tabs, Share URL paste" -ForegroundColor DarkGray
        Write-Host "  Rehearse DEMO_SCRIPT.md v7 three times under 5:30" -ForegroundColor DarkGray
        Write-Host "  NOT Gate V PASS until user sign-off." -ForegroundColor DarkGray
    }
    default {
        Write-Host "Slice $Slice gate not implemented yet." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
if ($allPass) {
    Write-Host "Gate Slice $Slice - all checks passed" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Gate Slice $Slice - FAILED" -ForegroundColor Red
    exit 1
}
