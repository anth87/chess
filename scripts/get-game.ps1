param([string]$GameId)
$archives = (Invoke-RestMethod "https://api.chess.com/pub/player/anth87/games/archives").archives
foreach ($archive in $archives) {
    $data = Invoke-RestMethod $archive
    $g = $data.games | Where-Object { $_.url -like "*/$GameId" }
    if ($g) {
        Write-Host "URL: $($g.url)"
        Write-Host "White: $($g.white.username) ($($g.white.result))"
        Write-Host "Black: $($g.black.username) ($($g.black.result))"
        Write-Host "ECO: $($g.eco)"
        Write-Host "Date: $([DateTimeOffset]::FromUnixTimeSeconds($g.end_time).DateTime.ToString('yyyy-MM-dd'))"
        $moves = ($g.pgn -split '\n' | Where-Object { $_ -notmatch '^\[' -and $_.Trim() })
        Write-Host ($moves -join ' ')
        exit 0
    }
}
Write-Host "Game not found"
exit 1