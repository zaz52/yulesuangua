$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
$fallbackPython = "E:\uv-python\cpython-3.12.12-windows-x86_64-none\python.exe"
$envFile = Join-Path $backendDir ".env"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $parts = $line.Split("=", 2)
    if ($parts.Count -eq 2) {
      $name = $parts[0].Trim()
      $value = $parts[1].Trim().Trim('"').Trim("'")
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

if (-not (Test-Path $venvPython)) {
  if (-not (Test-Path $fallbackPython)) {
    throw "No Python runtime found. Expected $fallbackPython or $venvPython."
  }

  Push-Location $backendDir
  try {
    & $fallbackPython -m venv .venv
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install fastapi==0.117.1 uvicorn==0.36.0 pydantic==2.11.9 python-multipart==0.0.20 lunar-python==1.4.8 langchain-core==1.0.2 langchain-openai==1.0.1 openai==2.30.0 httpx==0.28.1
  } finally {
    Pop-Location
  }
}

if (-not $env:LLM_API_KEY) {
  Write-Host "LLM_API_KEY is not set. Backend health will work, but AI inference will be unavailable." -ForegroundColor Yellow
  Write-Host "Create backend\.env from backend\.env.example and put your own provider key there." -ForegroundColor Yellow
}

Push-Location $backendDir
try {
  & $venvPython -m uvicorn main:app --host 127.0.0.1 --port 5000
} finally {
  Pop-Location
}
