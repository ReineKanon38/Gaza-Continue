# Script de Inicio Rapido para el Sistema Gaza (Sin Docker)
# Este script de PowerShell detecta la IP local dinamica, configura el Frontend y arranca el Backend/Frontend.

Clear-Host
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "            SISTEMA GAZA - ARRANQUE LOCAL PREMIUM          " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Detectar IP Local activa
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and 
    $_.InterfaceAlias -notmatch "Loopback" -and 
    $_.InterfaceAlias -notmatch "vEthernet" 
} | Select-Object -First 1).IPAddress

if ($localIP) {
    Write-Host "IP Local detectada: $localIP" -ForegroundColor Green
    Write-Host "Actualizando frontend/.env con la API dinamica..." -ForegroundColor Cyan
    "VITE_API_URL=http://${localIP}:5000" | Out-File -FilePath "frontend/.env" -Encoding utf8 -Force
} else {
    $localIP = "localhost"
    Write-Host "No se detecto IP local activa. Usando localhost." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:5000" | Out-File -FilePath "frontend/.env" -Encoding utf8 -Force
}

# 2. Validar que las dependencias de node_modules existan
if (!(Test-Path "backend/node_modules")) {
    Write-Host "No se detecto la carpeta node_modules en backend/." -ForegroundColor Yellow
    Write-Host "Instalando dependencias del Backend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-Wait", "-NoExit", "-Command", "cd backend; npm install"
}

if (!(Test-Path "frontend/node_modules")) {
    Write-Host "No se detecto la carpeta node_modules en frontend/." -ForegroundColor Yellow
    Write-Host "Instalando dependencias del Frontend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-Wait", "-NoExit", "-Command", "cd frontend; npm install"
}

# 3. Levantar el Backend (Puerto 5000)
Write-Host "Iniciando Backend (Node.js/Express)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    `$host.UI.RawUI.WindowTitle = 'GAZA - Backend (Port 5000)';
    Write-Host 'Iniciando Backend en modo desarrollo con nodemon...' -ForegroundColor Cyan;
    cd backend;
    npm run dev
"

# 4. Levantar el Frontend (Vite/React)
Write-Host "Iniciando Frontend (Vite/React)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
    `$host.UI.RawUI.WindowTitle = 'GAZA - Frontend (Vite)';
    Write-Host 'Iniciando servidor de desarrollo de Vite...' -ForegroundColor Green;
    cd frontend;
    npm run dev
"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Servicios levantados con exito!" -ForegroundColor Green
Write-Host "API Backend disponible en: http://${localIP}:5000" -ForegroundColor Cyan
Write-Host "Aplicacion Frontend disponible en: http://localhost:5173" -ForegroundColor Green
Write-Host "Acceso movil (misma red Wi-Fi): http://${localIP}:5173" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Puedes cerrar esta ventana. Las consolas del backend y frontend seguiran activas." -ForegroundColor White
Write-Host ""
Start-Sleep -Seconds 4
