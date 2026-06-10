# Pre-cache demo cities for viva carousel + compare (Slice E)
$ErrorActionPreference = "Stop"
$Base = "http://127.0.0.1:8000/api/v1"
$Session = if ($env:WEATHERO_DEMO_SESSION) { $env:WEATHERO_DEMO_SESSION } else { "demo-viva-session" }
$Cities = @("Hyderabad", "Chennai", "Mumbai")

Write-Host "Pre-caching weather + saved locations (session: $Session)" -ForegroundColor Cyan

foreach ($city in $Cities) {
    $null = Invoke-RestMethod -Uri "$Base/weather?city=$city"
    Write-Host "  weather OK: $city"
    try {
        $null = Invoke-RestMethod -Method Post -Uri "$Base/locations" -ContentType "application/json" `
            -Body (@{ session_id = $Session; city = $city } | ConvertTo-Json)
        Write-Host "  saved OK: $city"
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) {
            Write-Host "  saved skip (max 3 or duplicate): $city" -ForegroundColor DarkYellow
        }
        else { throw }
    }
}

Write-Host ""
Write-Host "Set browser localStorage key weathero-session-id = $Session" -ForegroundColor Green
Write-Host "Then reload http://localhost:5173/?city=Hyderabad"
