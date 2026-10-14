$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$delivery = Join-Path $root 'CLIENT-DELIVERY'
New-Item -ItemType Directory -Force -Path $delivery | Out-Null
$archive = Join-Path $delivery 'Geo-Measure-Client.zip'
$files = @('1-SETUP.cmd','2-START.cmd','3-STOP.cmd','4-CHECK.cmd','START-HERE.txt','README.md','package.json','package-lock.json','next.config.mjs','next-env.d.ts','postcss.config.mjs','tsconfig.json','.gitignore')
$folders = @('src','public','tests','scripts','docs','Mascot')
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
if (Test-Path -LiteralPath ($archive + '.new')) { Remove-Item -LiteralPath ($archive + '.new') }
$zip = [IO.Compression.ZipFile]::Open($archive + '.new', [IO.Compression.ZipArchiveMode]::Create)
try {
    $paths = @($files | ForEach-Object { Get-Item -LiteralPath (Join-Path $root $_) })
    foreach ($folder in $folders) { $paths += Get-ChildItem -LiteralPath (Join-Path $root $folder) -File -Recurse }
    foreach ($file in $paths) {
        $relative = $file.FullName.Substring($root.Length + 1).Replace('\','/')
        if ($relative -match '(^|/)(__pycache__|node_modules|\.git|\.venv|\.runtime)/|(^|/)\.env|\.(pyc|log|tsbuildinfo)$' -or $relative -in @('public/tts-test.html','docs/development-setup.md')) { continue }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, "Geo-Measure/$relative", [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $zip.Dispose() }
if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }
Move-Item -LiteralPath ($archive + '.new') -Destination $archive
(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash | Set-Content -LiteralPath ($archive + '.sha256') -Encoding ASCII
Copy-Item -LiteralPath (Join-Path $root 'START-HERE.txt') -Destination (Join-Path $delivery 'START-HERE.txt') -Force
Write-Host "Client delivery folder: $delivery"
Write-Host "Client ZIP: $archive"
