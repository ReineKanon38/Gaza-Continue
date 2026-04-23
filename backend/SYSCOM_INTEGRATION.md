# 🔌 Integración SYSCOM API

Sistema completo de sincronización de productos con la API de SYSCOM.

## 📋 Configuración

### 1. Obtener Credenciales SYSCOM

1. Regístrate en [SYSCOM Developers](https://developers.syscom.mx)
2. Crea una aplicación y obtén:
   - `CLIENT_ID`
   - `API_KEY`

### 2. Variables de Entorno

Agrega las siguientes variables en tu archivo `.env`:

```bash
# SYSCOM API Configuration
SYSCOM_API_URL=https://developers.syscom.mx/api/v1
SYSCOM_CLIENT_ID=tu_client_id_aqui
SYSCOM_API_KEY=tu_api_key_aqui
```

## 🚀 Endpoints Disponibles

### Búsqueda de Productos

**GET** `/api/syscom/search`

Busca productos en el catálogo de SYSCOM.

**Headers:**
```
Authorization: Bearer {tu_jwt_token}
```

**Query Parameters:**
- `query` (string): Término de búsqueda
- `brand` (string): Filtrar por marca
- `category` (string): Filtrar por categoría
- `page` (integer): Número de página (default: 1)
- `limit` (integer): Productos por página (default: 50)

**Ejemplo:**
```bash
curl -X GET "http://localhost:5000/api/syscom/search?query=laptop&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1
}
```

---

### Sincronizar Producto Individual

**POST** `/api/syscom/sync` 🔒 *Admin only*

Importa un producto de SYSCOM a tu base de datos.

**Body:**
```json
{
  "syscomId": "ABC123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto importado correctamente",
  "action": "created",
  "product": {...}
}
```

---

### Sincronizar Múltiples Productos

**POST** `/api/syscom/sync-multiple` 🔒 *Admin only*

Importa varios productos en una sola petición.

**Body:**
```json
{
  "syscomIds": ["ABC123", "XYZ789", "DEF456"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completada: 2 exitosos, 1 fallidos",
  "results": {
    "success": [...],
    "failed": [...],
    "total": 3
  }
}
```

---

### Sincronizar Todos los Productos

**POST** `/api/syscom/sync-all` 🔒 *Admin only*

Actualiza todos los productos que ya tienen `syscomId` en la base de datos.

**Respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completa: 45 actualizados, 2 fallidos",
  "results": {
    "updated": 45,
    "failed": 2,
    "details": [...]
  }
}
```

---

### Actualizar Stock

**PUT** `/api/syscom/products/:id/stock` 🔒 *Admin only*

Actualiza el stock de un producto desde SYSCOM.

**Parámetros:**
- `id`: ID del producto en tu base de datos

**Respuesta:**
```json
{
  "success": true,
  "message": "Stock actualizado",
  "stock": 25
}
```

---

### Actualizar Precio

**PUT** `/api/syscom/products/:id/price` 🔒 *Admin only*

Actualiza el precio de un producto desde SYSCOM.

**Respuesta:**
```json
{
  "success": true,
  "message": "Precio actualizado",
  "price": 1299.99
}
```

---

## 🔄 Flujo de Trabajo Recomendado

### 1. Búsqueda y Selección
```bash
# Usuario busca productos en SYSCOM
GET /api/syscom/search?query=monitor

# Ve los resultados y selecciona productos
```

### 2. Importación (Admin)
```bash
# Admin importa productos seleccionados
POST /api/syscom/sync
{
  "syscomId": "PROD_123"
}
```

### 3. Sincronización Periódica (Admin)
```bash
# Actualizar todos los productos importados
POST /api/syscom/sync-all
```

### 4. Actualizaciones Individuales
```bash
# Actualizar stock de producto específico
PUT /api/syscom/products/507f1f77bcf86cd799439011/stock

# Actualizar precio
PUT /api/syscom/products/507f1f77bcf86cd799439011/price
```

## 📊 Modelo de Datos

### Producto Importado
```javascript
{
  name: "Laptop Dell Inspiron 15",
  price: 15999.99,
  description: "Laptop con procesador Intel Core i5...",
  category: "Computadoras",
  image: "https://syscom.mx/images/products/...",
  stock: 10,
  syscomId: "DELL_INS15", // ID único de SYSCOM
  active: true,
  createdAt: "2025-11-25T10:00:00Z",
  updatedAt: "2025-11-25T10:00:00Z"
}
```

## 🛡️ Seguridad

- ✅ Todos los endpoints requieren autenticación JWT
- ✅ Endpoints de sincronización requieren rol `admin`
- ✅ Credenciales SYSCOM en variables de entorno
- ✅ Rate limiting aplicado (100 req/15min)

## ⚠️ Manejo de Errores

### Sin Configuración
```json
{
  "success": false,
  "message": "SYSCOM API no configurada. Agregue SYSCOM_CLIENT_ID y SYSCOM_API_KEY al .env"
}
```

### Producto No Encontrado
```json
{
  "success": false,
  "message": "Error al obtener producto de SYSCOM: Product not found"
}
```

### Error de Red
```json
{
  "success": false,
  "message": "Error al buscar en SYSCOM",
  "error": "Network timeout"
}
```

## 🧪 Testing

```bash
# Probar búsqueda (requiere credenciales configuradas)
curl -X GET "http://localhost:5000/api/syscom/search?query=mouse" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Importar producto
curl -X POST "http://localhost:5000/api/syscom/sync" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"syscomId": "TEST_PRODUCT_ID"}'
```

## 📝 Notas

- Los productos importados mantienen el `syscomId` para seguimiento
- Las sincronizaciones actualizan precio, stock y datos del producto
- Si un producto existe (mismo `syscomId`), se actualiza en lugar de duplicar
- La API de SYSCOM tiene límites de rate, considerar esto en sincronizaciones masivas

## 🔗 Referencias

- [SYSCOM API Docs](https://developers.syscom.mx/docs)
- Swagger UI local: `http://localhost:5000/api/docs`

---

**Nota:** Asegúrate de tener credenciales válidas de SYSCOM antes de usar estos endpoints.
