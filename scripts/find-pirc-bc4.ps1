$Username = "anth87"
$archives = (Invoke-RestMethod "https://api.chess.com/pub/player/$Username/games/archives").archives
$recent = $archives | Select-Object -Last 12
$all = foreach ($archive in $recent) { (Invoke-RestMethod $archive).games }
$blitz = $all | Where-Object { $_.time_class -eq "blitz" }
function Get-MyResult($g,$u){ if($g.white.username -eq $u){$g.white.result}else{$g.black.result}}
function Get-MyColor($g,$u){ if($g.white.username -eq $u){"W"}else{"B"}}

$bc4 = $blitz | Where-Object {
    (Get-MyColor $_ $Username) -eq "B" -and
    ($_.eco -like "*Pirc*2.Bc4*" -or $_.eco -like "*Pirc-Defense-2.Bc4*")
}
Write-Host "Pirc 2.Bc4 as Black: $($bc4.Count) games"
$losses = $bc4 | Where-Object { (Get-MyResult $_ $Username) -notin @("win","draw","agreed","repetition","stalemate","timevsinsufficient") }
$wins = $bc4 | Where-Object { (Get-MyResult $_ $Username) -eq "win" }
Write-Host "Losses: $($losses.Count) | Wins: $($wins.Count)"
Write-Host ""
Write-Host "--- LOSSES ---"
$losses | Sort-Object end_time -Descending | Select-Object -First 8 | ForEach-Object {
    $id = $_.url -replace ".*/",""
    $pgn = ($_.pgn -split '\n' | Where-Object { $_ -notmatch '^\[' -and $_.Trim() } | Select-Object -First 1)
    Write-Host "$id vs $($_.white.username) | $(($_.eco -replace 'https://www.chess.com/openings/',''))"
    Write-Host "  $pgn"
    Write-Host ""
}
Write-Host "--- WINS ---"
$wins | Sort-Object end_time -Descending | ForEach-Object {
    $id = $_.url -replace ".*/",""
    $pgn = ($_.pgn -split '\n' | Where-Object { $_ -notmatch '^\[' -and $_.Trim() } | Select-Object -First 1)
    if ($pgn.Length -gt 100) { $pgn = $pgn.Substring(0,100) + "..." }
    Write-Host "$id vs $($_.white.username)"
    Write-Host "  $pgn"
    Write-Host ""
}