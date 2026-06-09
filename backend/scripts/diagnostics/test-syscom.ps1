# Script de prueba para SYSCOM API con usuarios reales
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PRUEBA SYSCOM-GAZA API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# TEST 1: Rotsen Leon
Write-Host "🔹 TEST 1: Rotsen Leon (Admin)" -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"rotsenleon38@gmail.com","password":"Rotsen2026!"}' `
        -UseBasicParsing
    
    $login1 = $response1.Content | ConvertFrom-Json
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($login1.user.name)" -ForegroundColor White
    Write-Host "   Email: $($login1.user.email)" -ForegroundColor White
    Write-Host "   Rol: $($login1.user.role)" -ForegroundColor White
    
    Write-Host "`n   🔍 Buscando 'mouse' en SYSCOM..." -ForegroundColor Cyan
    $syscomResponse1 = Invoke-WebRequest -Uri "http://localhost:5000/api/syscom/search?query=mouse&limit=2" `
        -Headers @{"Authorization"="Bearer $($login1.token)"} `
        -UseBasicParsing
    
    $syscom1 = $syscomResponse1.Content | ConvertFrom-Json
    Write-Host "   Success: $($syscom1.success)" -ForegroundColor $(if($syscom1.success) {"Green"} else {"Red"})
    if ($syscom1.message) {
        Write-Host "   Mensaje: $($syscom1.message)" -ForegroundColor Yellow
    }
    if ($syscom1.error) {
        Write-Host "   Error: $($syscom1.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

# TEST 2: Wilberth
Write-Host "🔹 TEST 2: Wilberth (Admin)" -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"wilberth@syscom-gaza.com","password":"Wilberth2026!"}' `
        -UseBasicParsing
    
    $login2 = $response2.Content | ConvertFrom-Json
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($login2.user.name)" -ForegroundColor White
    Write-Host "   Rol: $($login2.user.role)" -ForegroundColor White
    
    Write-Host "`n   🔍 Buscando 'laptop' en SYSCOM..." -ForegroundColor Cyan
    $syscomResponse2 = Invoke-WebRequest -Uri "http://localhost:5000/api/syscom/search?query=laptop&limit=2" `
        -Headers @{"Authorization"="Bearer $($login2.token)"} `
        -UseBasicParsing
    
    $syscom2 = $syscomResponse2.Content | ConvertFrom-Json
    Write-Host "   Success: $($syscom2.success)" -ForegroundColor $(if($syscom2.success) {"Green"} else {"Red"})
    if ($syscom2.message) {
        Write-Host "   Mensaje: $($syscom2.message)" -ForegroundColor Yellow
    }
    if ($syscom2.error) {
        Write-Host "   Error: $($syscom2.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n----------------------------------------`n" -ForegroundColor Gray

# TEST 3: Brandon
Write-Host "🔹 TEST 3: Brandon (Admin)" -ForegroundColor Yellow
try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"brandon@syscom-gaza.com","password":"Brandon2026!"}' `
        -UseBasicParsing
    
    $login3 = $response3.Content | ConvertFrom-Json
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($login3.user.name)" -ForegroundColor White
    Write-Host "   Rol: $($login3.user.role)" -ForegroundColor White
    
    Write-Host "`n   🔍 Buscando 'teclado' en SYSCOM..." -ForegroundColor Cyan
    $syscomResponse3 = Invoke-WebRequest -Uri "http://localhost:5000/api/syscom/search?query=teclado&limit=2" `
        -Headers @{"Authorization"="Bearer $($login3.token)"} `
        -UseBasicParsing
    
    $syscom3 = $syscomResponse3.Content | ConvertFrom-Json
    Write-Host "   Success: $($syscom3.success)" -ForegroundColor $(if($syscom3.success) {"Green"} else {"Red"})
    if ($syscom3.message) {
        Write-Host "   Mensaje: $($syscom3.message)" -ForegroundColor Yellow
    }
    if ($syscom3.error) {
        Write-Host "   Error: $($syscom3.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FIN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
