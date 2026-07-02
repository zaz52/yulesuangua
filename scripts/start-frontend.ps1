$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot "frontend"

Push-Location $frontendDir
try {
  npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
} finally {
  Pop-Location
}
