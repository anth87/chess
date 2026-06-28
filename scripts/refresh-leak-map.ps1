# 12-month blitz leak refresh for anth87
param([string]$Username = "anth87", [int]$MonthsBack = 12)

function Get-MyResult($game, $user) {
    if ($game.white.username -eq $user) { return $game.white.result }
    return $game.black.result
}
function Get-MyColor($game, $user) {
    if ($game.white.username -eq $user) { return "W" } else { return "B" }
}
function Short-Opening($url) {
    if (-not $url) { return "Unknown" }
    $name = $url -replace "https://www.chess.com/openings/", ""
    if ($name.Length -gt 72) { return $name.Substring(0, 72) + "..." }
    return $name
}
function Is-ResultLoss($r) {
    return $r -notin @("win","draw","agreed","repetition","stalemate","timevsinsufficient")
}

$archives = (Invoke-RestMethod "https://api.chess.com/pub/player/$Username/games/archives").archives
$recent = $archives | Select-Object -Last $MonthsBack
$all = foreach ($archive in $recent) {
    (Invoke-RestMethod $archive).games
}
$blitz = $all | Where-Object { $_.time_class -eq "blitz" }
$wins = ($blitz | Where-Object { (Get-MyResult $_ $Username) -eq "win" }).Count
$losses = ($blitz | Where-Object { Is-ResultLoss (Get-MyResult $_ $Username) }).Count
$draws = $blitz.Count - $wins - $losses

Write-Host "=== $Username blitz ($MonthsBack mo) ==="
Write-Host "Games: $($blitz.Count) | W: $wins | L: $losses | D: $draws | WR: $([math]::Round(100*$wins/$blitz.Count,1))%"
Write-Host ""
Write-Host "Loss termination:"
$lossList = $blitz | Where-Object { Is-ResultLoss (Get-MyResult $_ $Username) }
$lossList | ForEach-Object { Get-MyResult $_ $Username } | Group-Object | Sort-Object Count -Descending | ForEach-Object {
    $pct = [math]::Round(100 * $_.Count / $lossList.Count, 0)
    Write-Host ("  {0,-18} {1,4} ({2}%)" -f $_.Name, $_.Count, $pct)
}

Write-Host ""
Write-Host "=== TOP LOSS OPENINGS — BLACK ==="
$lossList | Where-Object { (Get-MyColor $_ $Username) -eq "B" } |
    Group-Object { Short-Opening $_.eco } | Sort-Object Count -Descending | Select-Object -First 15 | ForEach-Object {
    Write-Host ("  {0,3}  {1}" -f $_.Count, $_.Name)
}

Write-Host ""
Write-Host "=== TOP LOSS OPENINGS — WHITE ==="
$lossList | Where-Object { (Get-MyColor $_ $Username) -eq "W" } |
    Group-Object { Short-Opening $_.eco } | Sort-Object Count -Descending | Select-Object -First 15 | ForEach-Object {
    Write-Host ("  {0,3}  {1}" -f $_.Count, $_.Name)
}

Write-Host ""
Write-Host "=== UNCOVERED CLUSTERS (not in L1-L11) ==="
$covered = @(
    "Pirc-Defense-Classical",
    "Pirc-Defense-Modern",
    "Pirc-Defense-150-Attack",
    "Kings-Indian-Defense-Samisch",
    "Owens-Defense",
    "Philidor-Defense-Exchange",
    "Berlin-Defense",
    "Zukertort",
    "Caro-Kann-Defense-Tartakower",
    "Petroff-Defense-Classical",
    "Ruy-Lopez-Old-Steinitz"
)
$lossList | Group-Object { Short-Opening $_.eco } | Sort-Object Count -Descending | ForEach-Object {
    $hit = $false
    foreach ($c in $covered) { if ($_.Name -like "*$c*") { $hit = $true; break } }
    if (-not $hit -and $_.Count -ge 5) {
        Write-Host ("  {0,3}  {1}" -f $_.Count, $_.Name)
    }
}

Write-Host ""
Write-Host "=== RECENT 3mo vs PRIOR 9mo (Pirc/KID/Petroff Black losses) ==="
$cutoff = (Get-Date).AddMonths(-3).ToUniversalTime()
$recent3 = $lossList | Where-Object {
    [DateTimeOffset]::FromUnixTimeSeconds($_.end_time).UtcDateTime -ge $cutoff
}
$prior9 = $lossList | Where-Object {
    [DateTimeOffset]::FromUnixTimeSeconds($_.end_time).UtcDateTime -lt $cutoff
}
$patterns = @("Pirc","Kings-Indian","Petroff")
foreach ($p in $patterns) {
    $r3 = ($recent3 | Where-Object { $_.eco -like "*$p*" -and (Get-MyColor $_ $Username) -eq "B" }).Count
    $p9 = ($prior9 | Where-Object { $_.eco -like "*$p*" -and (Get-MyColor $_ $Username) -eq "B" }).Count
    Write-Host ("  {0,-12} recent 3mo: {1,3} | prior 9mo: {2,3}" -f $p, $r3, $p9)
}