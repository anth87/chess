# Refresh blitz leak stats from Chess.com PubAPI for anth87.
param(
    [string]$Username = "anth87",
    [int]$MonthsBack = 4
)

function Get-MyResult($game, $user) {
    if ($game.white.username -eq $user) { return $game.white.result }
    return $game.black.result
}

function Get-MyColor($game, $user) {
    if ($game.white.username -eq $user) { return "W" }
    return "B"
}

function Short-Opening($url) {
    if (-not $url) { return "Unknown" }
    $name = $url -replace "https://www.chess.com/openings/", ""
    if ($name.Length -gt 60) { return $name.Substring(0, 60) + "..." }
    return $name
}

$archives = (Invoke-RestMethod "https://api.chess.com/pub/player/$Username/games/archives").archives
$recent = $archives | Select-Object -Last $MonthsBack

$all = foreach ($archive in $recent) {
    $month = $archive -replace ".*/games/", ""
    $data = Invoke-RestMethod $archive
    $data.games
}

$blitz = $all | Where-Object { $_.time_class -eq "blitz" }
$wins = ($blitz | Where-Object { (Get-MyResult $_ $Username) -eq "win" }).Count
$losses = ($blitz | Where-Object { (Get-MyResult $_ $Username) -notin @("win","draw","agreed","repetition","stalemate","timevsinsufficient") }).Count

Write-Host "=== $Username blitz ($MonthsBack mo) ==="
Write-Host "Games: $($blitz.Count) | Wins: $wins | Losses: $losses"
Write-Host ""
Write-Host "Loss termination:"
$lossesList = $blitz | Where-Object { (Get-MyResult $_ $Username) -notin @("win","draw","agreed","repetition","stalemate","timevsinsufficient") }
$lossesList | ForEach-Object { Get-MyResult $_ $Username } | Group-Object | Sort-Object Count -Descending | ForEach-Object {
    Write-Host ("  {0,-12} {1}" -f $_.Name, $_.Count)
}
Write-Host ""
Write-Host "Top loss openings:"
$lossesList | Group-Object { Short-Opening $_.eco } | Sort-Object Count -Descending | Select-Object -First 10 | ForEach-Object {
    Write-Host ("  {0,3}  {1}" -f $_.Count, $_.Name)
}