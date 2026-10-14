$projectRoot = Split-Path $PSScriptRoot -Parent
$pythonPath = Join-Path $projectRoot '.venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw 'Create .venv and install tts/requirements.txt first. See README.md.'
}
New-Item -ItemType Directory -Path (Join-Path $projectRoot 'logs') -Force | Out-Null
$server = Start-Process -FilePath $pythonPath -ArgumentList @('-u', 'tts/server.py') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'logs/tts.stdout.log') -RedirectStandardError (Join-Path $projectRoot 'logs/tts.stderr.log') -PassThru
$server.Id | Set-Content (Join-Path $projectRoot 'logs/tts.pid')
Write-Output "KittenTTS server started (PID $($server.Id)): http://127.0.0.1:8765/tts-test.html"
