# Serve lessons locally so boards load all bundled assets reliably.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 8765
Start-Process py -ArgumentList "-m", "http.server", "$port" -WindowStyle Hidden
Start-Sleep -Milliseconds 800
Start-Process "http://localhost:$port/lessons/0008-pirc-geller-strike-c5.html"