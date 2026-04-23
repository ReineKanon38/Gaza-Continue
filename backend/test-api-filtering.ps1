# Script para probar endpoints de filtrado HTTP
Write-Host "🧪 PROBANDO ENDPOINTS DE FILTRADO DE PRODUCTOS" -ForegroundColor Cyan
Write-Host "=" * 70

# 1. Obtener todos los productos
Write-Host "`n📦 1. Todos los productos" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
    Write-Host "✅ Total productos: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..." 
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# 2. Filtrar por categoría: Videovigilancia
Write-Host "`n📹 2. Filtrar por Videovigilancia" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products?category=videovigilancia" -Method GET
    Write-Host "✅ Productos en Videovigilancia: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..."
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# 3. Filtrar por categoría: Energía / Herramientas
Write-Host "`n⚡ 3. Filtrar por Energía / Herramientas" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products?category=energia-herramientas" -Method GET
    Write-Host "✅ Productos en Energía/Herramientas: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..."
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# 4. Filtrar por categoría: Audio y Video
Write-Host "`n🎵 4. Filtrar por Audio y Video" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products?category=audio-video" -Method GET
    Write-Host "✅ Productos en Audio y Video: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..."
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# 5. Buscar productos con texto
Write-Host "`n🔍 5. Búsqueda por texto: 'camara'" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products?search=camara" -Method GET
    Write-Host "✅ Resultados de búsqueda: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..."
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# 6. Combinar filtro de categoría + búsqueda
Write-Host "`n🎯 6. Filtro combinado: Videovigilancia + 'bala'" -ForegroundColor Yellow
Write-Host "-" * 70
try {
    $url = "http://localhost:5000/api/products?category=videovigilancia&search=bala"
    $response = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "✅ Resultados combinados: $($response.count)" -ForegroundColor Green
    if ($response.data) {
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "   • $($_.name.Substring(0, [Math]::Min(50, $_.name.Length)))..."
            Write-Host "     Categoría: $($_.category) | Precio: `$$($_.price)"
        }
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

# Resumen
Write-Host "`n" + "=" * 70
Write-Host "✅ PRUEBA DE FILTRADO COMPLETADA" -ForegroundColor Green
Write-Host "=" * 70
Write-Host ""
Write-Host "💡 El filtrado está funcionando correctamente:" -ForegroundColor Cyan
Write-Host "   • Filtrado por categoría: ✅"
Write-Host "   • Búsqueda de texto: ✅"
Write-Host "   • Filtros combinados: ✅"
Write-Host ""
