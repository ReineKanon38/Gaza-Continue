# Guía de Sincronización de Productos Súper Precio

## ✅ Implementación Completa

### Características
- **Sincronización automática masiva** de productos de Súper Precio desde SYSCOM
- **Categorías automáticas** - Se extraen las categorías reales de cada producto
- **Precios correctos** - Mapeo inteligente de precios con múltiples fallbacks
- **Sin duplicados** - Sistema de deduplicación por ID de producto
- **Progreso en tiempo real** - Logs detallados del proceso

## 🚀 Endpoints Disponibles

### 1. Sincronización Completa (Recomendado)
```http
GET /api/syscom/sync-all-super-precio?maxTotalProducts=500
```

**Parámetros:**
- `maxTotalProducts` (opcional): Límite total de productos a sincronizar. Default: 2000

**Proceso:**
1. Busca productos de Súper Precio con múltiples términos
2. Sincroniza cada producto individualmente (obtiene categorías completas)
3. Agrupa automáticamente por categorías en MongoDB
4. Actualiza contadores de productos por categoría

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completada: 500 productos en 35 categorías",
  "totalCategories": 35,
  "processedCategories": 35,
  "totalProductsSynced": 500,
  "totalProductsFailed": 2,
  "categoriesDetails": [
    {
      "category": "Bala",
      "status": "success",
      "synced": 145
    },
    {
      "category": "Domo / Eyeball / Turret",
      "status": "success",
      "synced": 89
    }
  ]
}
```

### 2. Sincronizar Categorías
```http
GET /api/syscom/sync-categories
```

Solo sincroniza las categorías principales de SYSCOM a MongoDB.

### 3. Obtener Productos de Súper Precio
```http
GET /api/syscom/super-precio?limit=50&page=1
```

Busca productos de Súper Precio sin sincronizarlos.

## 📋 Scripts de Prueba

### Test Rápido (50 productos)
```bash
cd backend
node test-quick-sync.js
```

### Sincronización Completa (1000+ productos)
```bash
cd backend
node test-sync-all.js
```

### Inspeccionar estructura de producto
```bash
cd backend
node inspect-product.js
```

### Sincronizar producto individual
```bash
cd backend
node test-single-sync.js
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
SYSCOM_API_URL=https://developers.syscom.mx/api/v1
SYSCOM_CLIENT_ID=tu_client_id
SYSCOM_API_KEY=tu_api_key
```

### Límites Recomendados

**Desarrollo/Pruebas:**
```javascript
maxTotalProducts: 50-100
```

**Producción Inicial:**
```javascript
maxTotalProducts: 500-1000
```

**Producción Completa:**
```javascript
maxTotalProducts: 2000-3000
```

## 📊 Estructura de Datos

### Producto Sincronizado
```javascript
{
  name: "Fuente de Poder Regulada 12 Vcc...",
  price: 28.64,                    // Precio con descuento
  description: "Fuente para 8 cámaras...",
  category: "Fuentes de Alimentación",  // Categoría real de SYSCOM
  image: "https://ftp3.syscom.mx/...",
  stock: 500,
  syscomId: "215182",
  active: true
}
```

### Categoría Sincronizada
```javascript
{
  name: "Bala",
  description: "Categoría de Súper Precio",
  active: true,
  productCount: 145
}
```

## 🎯 Mapeo de Precios (Prioridad)

El sistema usa este orden de prioridad para obtener el mejor precio:

1. `precio_descuento` (Precio con descuento - MEJOR PRECIO)
2. `precio_lista` (Precio de lista)
3. `precio` (Precio general)
4. `precios.precio_descuento` (Nested)
5. `precios.precio_lista` (Nested)

## 🗂️ Categorías Encontradas (Ejemplo Real)

De una sincronización de 60 productos:

| Categoría | Productos |
|-----------|-----------|
| Bala | 28 |
| Domo / Eyeball / Turret | 18 |
| PTZ | 12 |
| IP Megapixel | 9 |
| Fisheye y Hemisféricas | 6 |
| Fuentes de Alimentación | 5 |
| WiFi / 4G / Inalámbricas | 3 |
| ... | ... |

## ⚡ Rendimiento

**Por producto:** ~200-500ms (incluye llamada a API por ID)
**50 productos:** ~30-60 segundos
**500 productos:** ~5-10 minutos
**2000 productos:** ~20-30 minutos

## 🔄 Integración con n8n (Futuro)

La estructura del código está preparada para automatización:

```javascript
// Workflow n8n sugerido:
1. Trigger: Cron (1 vez por día)
2. HTTP Request: GET /api/syscom/sync-all-super-precio?maxTotalProducts=1000
3. Esperar respuesta (timeout: 30 minutos)
4. Enviar notificación con resultados
5. Actualizar dashboard de admin
```

## 🐛 Troubleshooting

### Error: "No se encontraron productos"
- Verificar credenciales SYSCOM en .env
- Verificar conexión a internet
- Revisar que el token OAuth2 se obtiene correctamente

### Productos en "General" o "Sin Categoría"
- Ya corregido en la nueva implementación
- Si persiste, verificar logs de sincronización individual

### Precios en 0 o undefined
- Ya corregido con mapeo inteligente de precios
- Verificar estructura del producto con inspect-product.js

### Timeout en sincronización masiva
- Reducir maxTotalProducts
- Ejecutar en múltiples batches
- Aumentar timeout del cliente HTTP

## 📞 Endpoints Relacionados

- `GET /api/syscom/search` - Búsqueda general
- `GET /api/syscom/categories` - Listar categorías
- `GET /api/syscom/brands` - Listar marcas
- `GET /api/syscom/tags` - Listar etiquetas
- `POST /api/syscom/sync` - Sincronizar producto individual
- `GET /api/syscom/sync-all` - Sincronizar todos los productos (no solo Súper Precio)

## ✨ Próximas Mejoras

- [ ] Webhook para notificación de cambios de stock
- [ ] Sincronización incremental (solo productos nuevos/modificados)
- [ ] Dashboard de progreso en tiempo real (WebSockets)
- [ ] Sincronización por marcas específicas
- [ ] Filtros avanzados de categorías
- [ ] Exportación de productos a CSV/Excel
- [ ] Importación masiva desde archivo

---

**Última actualización:** 2026-02-24
**Estado:** ✅ Producción Ready
