param(
  [string]$OutputDir = "docs/evidencias"
)

$ErrorActionPreference = "Continue"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportPath = Join-Path $OutputDir "reporte_estado_$timestamp.md"

$content = @()
$content += "# Reporte de estado del proyecto"
$content += ""
$content += "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$content += ""

$commands = @(
  @{ Title = "Git status"; Cmd = "git status --short" },
  @{ Title = "Ultimos commits"; Cmd = "git log --oneline -n 10" },
  @{ Title = "Docker compose status"; Cmd = "docker compose ps" },
  @{ Title = "Backend tests"; Cmd = "Push-Location backend; npm test -- --run; Pop-Location" },
  @{ Title = "Frontend lint"; Cmd = "Push-Location frontend; npm run lint; Pop-Location" },
  @{ Title = "Frontend build"; Cmd = "Push-Location frontend; npm run build; Pop-Location" }
)

foreach ($item in $commands) {
  $result = ""
  try {
    $result = (Invoke-Expression $item.Cmd | Out-String)
  } catch {
    $result = "ERROR: $($_.Exception.Message)"
  }

  $content += "## $($item.Title)"
  $content += ""
  $content += "Comando: $($item.Cmd)"
  $content += ""
  $content += "Salida:"
  $content += $result
  $content += ""
}

$content -join "`n" | Set-Content -Path $reportPath -Encoding UTF8
Write-Output "Reporte generado: $reportPath"
