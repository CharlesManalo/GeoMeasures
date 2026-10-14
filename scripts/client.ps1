param([ValidateSet('Setup','Start','Stop','Check')][string]$Action = 'Start', [switch]$NoBrowser, [switch]$WithTTS)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $root
$runtime = Join-Path $root '.runtime'
$nodeDir = Join-Path $runtime 'node-v22.23.2-win-x64'
$node = Join-Path $nodeDir 'node.exe'
$uv = Join-Path $runtime 'uv/uv.exe'
$python = Join-Path $root '.venv/Scripts/python.exe'
$env:PATH = "$nodeDir;$env:PATH"
$env:UV_PYTHON_INSTALL_DIR = Join-Path $runtime 'python'
$env:UV_PYTHON_PREFERENCE = 'only-managed'
$env:HF_HOME = Join-Path $runtime 'models'
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:PYTHONUTF8 = '1'
$logs = Join-Path $root 'logs'
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Run($exe, $arguments) {
    & $exe @arguments
    if ($LASTEXITCODE -ne 0) { throw "Command failed ($LASTEXITCODE): $exe $arguments" }
}
function Download-Zip($url, $hash, $destination, $name) {
    $archive = Join-Path $runtime $name
    Write-Host "Downloading $name ..."
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $archive
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $hash) { throw "Download checksum mismatch: $name. Rerun Setup." }
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try { Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force; break }
        catch { if ($attempt -eq 3) { throw }; Start-Sleep -Seconds 2 }
    }
    Remove-Item -LiteralPath $archive
}
function Owned-Process($name) {
    $file = Join-Path $logs "$name.process.json"
    if (!(Test-Path -LiteralPath $file)) { return $null }
    $record = Get-Content -LiteralPath $file -Raw -Encoding UTF8 | ConvertFrom-Json
    $process = Get-Process -Id $record.id -ErrorAction SilentlyContinue
    if ($process -and $process.StartTime.ToUniversalTime().Ticks.ToString() -eq $record.started -and $process.Path -eq $record.path) { return $process }
    return $null
}
function Stop-Owned($name) {
    $process = Owned-Process $name
    if ($process) {
        # Windows venv python.exe starts a child interpreter. Ownership was checked above.
        Run 'taskkill.exe' @('/PID', $process.Id.ToString(), '/T', '/F')
        Write-Host "Stopped $name."
    }
    $file = Join-Path $logs "$name.process.json"
    if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file }
}
function Port-In-Use($port) {
    $client = New-Object Net.Sockets.TcpClient
    try { $client.Connect('127.0.0.1', $port); return $true } catch { return $false } finally { $client.Dispose() }
}
function Launch($name, $exe, $arguments) {
    $process = Start-Process -FilePath $exe -ArgumentList $arguments -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs "$name.stdout.log") -RedirectStandardError (Join-Path $logs "$name.stderr.log") -PassThru
    @{ id = $process.Id; started = $process.StartTime.ToUniversalTime().Ticks.ToString(); path = $process.Path } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $logs "$name.process.json") -Encoding UTF8
}
function Ready($url, $voice = $false) {
    $response = $null
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3
    } catch [System.Net.WebException] { return $false }
    if ($voice) {
        $health = $response.Content | ConvertFrom-Json
        if ($health.status -eq 'error') { throw "Voice model: $($health.error)" }
        return $health.status -eq 'ready'
    }
    return $response.StatusCode -eq 200
}
try {
    if ($Action -eq 'Stop') { Stop-Owned 'web'; Stop-Owned 'tts'; exit 0 }
    if ($Action -eq 'Setup') {
        if ($env:PROCESSOR_ARCHITECTURE -ne 'AMD64') { throw 'This installer supports Windows x64. Use 64-bit PowerShell on an Intel/AMD Windows PC.' }
        if ((Owned-Process 'web') -or (Owned-Process 'tts')) { throw 'Run 3-STOP.cmd before running Setup again.' }
        Start-Transcript -Path (Join-Path $logs 'setup.log') -Force | Out-Null
        New-Item -ItemType Directory -Force -Path $runtime | Out-Null
        $oldMarker = Join-Path $runtime 'installed-root.txt'
        if (Test-Path -LiteralPath $oldMarker) { Remove-Item -LiteralPath $oldMarker }
        if (!(Test-Path -LiteralPath $node)) {
            Download-Zip 'https://nodejs.org/dist/v22.23.2/node-v22.23.2-win-x64.zip' '1177b4137ba5adaa56354ae40f1080c7450e8ae09cecb47da459d1c52ac99f97' $runtime 'node.zip'
        }
        if ($WithTTS) {
        if (!(Test-Path -LiteralPath $uv)) {
            Download-Zip 'https://github.com/astral-sh/uv/releases/download/0.13.0/uv-x86_64-pc-windows-msvc.zip' '088962f9e7b7bd9ea740c04c650b2a21c8928c345bd99ac24350dc924dba656c' (Join-Path $runtime 'uv') 'uv.zip'
        }
        Write-Host 'Installing project-local Python and voice libraries ...'
        Run $uv @('python','install','3.11.9','--no-bin')
        if (!(Test-Path -LiteralPath $python)) { Run $uv @('venv','--seed','--python','3.11.9','.venv') }
        $pythonVersion = & $python -c 'import platform; print(platform.python_version())'
        if ($LASTEXITCODE -ne 0 -or $pythonVersion -ne '3.11.9') { throw 'The existing Python environment does not match 3.11.9. Extract a fresh ZIP copy and run Setup there.' }
        Run $uv @('pip','install','--python',$python,'pip==24.0')
        Run $python @('-m','pip','install','-r','tts/requirements-lock.txt')
        Run $python @('-m','pip','check')
        }
        Write-Host 'Installing website libraries ...'
        Run $node @((Join-Path $nodeDir 'node_modules/npm/bin/npm-cli.js'),'ci','--no-fund','--no-audit')
        Run $node @('--experimental-strip-types','--test','tests/learning.test.mjs')
        Run $node @('node_modules/next/dist/bin/next','build')
        Run $node @('node_modules/typescript/bin/tsc','--noEmit')
        if ($WithTTS) {
            Write-Host 'Downloading and checking all eight voices. Please leave this window open ...'
            Run $python @('tts/prepare.py')
        }
        Run $node @('--experimental-strip-types','scripts/check-narration.mjs')
        $root | Set-Content -LiteralPath (Join-Path $runtime 'installed-root.txt') -Encoding UTF8
        Write-Host 'SETUP COMPLETE. Double-click 2-START.cmd to open Geo Measure.' -ForegroundColor Green
        Stop-Transcript | Out-Null
        exit 0
    }
    $marker = Join-Path $runtime 'installed-root.txt'
    if (!(Test-Path -LiteralPath $marker) -or !(Test-Path -LiteralPath $node) -or !(Test-Path -LiteralPath '.next/BUILD_ID')) { throw 'Setup is incomplete. Run 1-SETUP.cmd first.' }
    if ((Get-Content -LiteralPath $marker -Raw -Encoding UTF8).Trim() -ne $root) { throw 'This installed folder has moved. Extract a fresh copy of the ZIP in the final location and run Setup there.' }
    if ($Action -eq 'Check') {
        if ($WithTTS) { Run $python @('-m','pip','check') }
        Run $node @('--experimental-strip-types','--test','tests/learning.test.mjs')
        Run $node @('node_modules/typescript/bin/tsc','--noEmit')
        Run $node @('--experimental-strip-types','scripts/check-narration.mjs')
        if ($WithTTS) { Run $python @('tts/prepare.py') }
        Write-Host 'CHECKS PASSED.' -ForegroundColor Green
        exit 0
    }
    if ($WithTTS -and !(Test-Path -LiteralPath $python)) { throw 'Run 5-SETUP-VOICE-STUDIO.cmd first.' }
    $services = @(@{name='web';port=3000})
    if ($WithTTS) { $services += @{name='tts';port=8765} }
    foreach ($service in $services) {
        if ((Port-In-Use $service.port) -and !(Owned-Process $service.name)) { throw "Port $($service.port) is used by another application or another copy. Close that server first. Nothing has been stopped." }
    }
    $launched = @()
    try {
        if (!(Owned-Process 'web')) { Launch 'web' $node 'node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000'; $launched += 'web' }
        if ($WithTTS -and !(Owned-Process 'tts')) { Launch 'tts' $python '-u tts/server.py'; $launched += 'tts' }
        Write-Host 'Starting Geo Measure ...'
        $deadline = (Get-Date).AddMinutes(5)
        do {
            if (!(Owned-Process 'web') -or ($WithTTS -and !(Owned-Process 'tts'))) { throw 'A server exited. See logs/web.stderr.log and logs/tts.stderr.log.' }
            $webReady = Ready 'http://127.0.0.1:3000/dashboard'
            $ttsReady = !$WithTTS
            if ($WithTTS) { $ttsReady = Ready 'http://127.0.0.1:8765/health' $true }
            if ($webReady -and $ttsReady) { break }
            Start-Sleep -Seconds 2
        } while ((Get-Date) -lt $deadline)
        if (!$webReady -or !$ttsReady) { throw 'Startup timed out. See the logs folder, then run Setup again if model files are missing.' }
    } catch { foreach ($name in $launched) { Stop-Owned $name }; throw }
    Write-Host 'Geo Measure is running: http://127.0.0.1:3000/dashboard' -ForegroundColor Green
    Write-Host 'You can close this window. Run 3-STOP.cmd when finished.'
    if (!$NoBrowser) { Start-Process 'http://127.0.0.1:3000/dashboard' }
} catch {
    Write-Host "`n$($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Keep the logs folder when requesting help. After correcting the problem, rerun the same command.'
    exit 1
}
