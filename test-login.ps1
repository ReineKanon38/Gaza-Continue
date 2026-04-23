# Script para probar el login
Start-Sleep -Seconds 3

$uri = "http://localhost:5000/api/auth/login"
$body = @{
    email = "maria@cliente.com"
    password = "123456"
} | ConvertTo-Json

Write-Host "🔍 Probando login en: $uri" -ForegroundColor Cyan
Write-Host "📧 Email: maria@cliente.com" -ForegroundColor Yellow

Try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n✅ LOGIN EXITOSO" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "ID del usuario: $($data.user.id)" -ForegroundColor White
    Write-Host "Nombre: $($data.user.name)" -ForegroundColor White
    Write-Host "Email: $($data.user.email)" -ForegroundColor White
    Write-Host "Rol: $($data.user.role)" -ForegroundColor White
    Write-Host "Token: $($data.token.Substring(0, 20))..." -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
} 
Catch {
    Write-Host "`n❌ ERROR EN LOGIN" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $content = $reader.ReadToEnd()
        Write-Host "Respuesta del servidor: $content" -ForegroundColor Yellow
    }
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
}
