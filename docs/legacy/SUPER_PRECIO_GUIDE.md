# 🎯 Guía de Productos Súper Precio - SYSCOM

## ✅ ¿Qué se implementó?

Se ha actualizado la integración con SYSCOM para **automáticamente** obtener y sincronizar productos con la etiqueta **"Súper Precio"** sin necesidad de modificar código.

---

## 🚀 Nuevos Endpoints Disponibles

### 1. Ver Productos de Súper Precio
```
GET /api/syscom/super-precio
```

**Query Parameters:**
- `page` (int): Número de página (default: 1)
- `limit` (int): Productos por página (default: 50)
- `category` (string): Filtrar por categoría
- `brand` (string): Filtrar por marca

**Ejemplo:**
```bash
curl "http://localhost:5000/api/syscom/super-precio?limit=20&page=1"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "producto_id": "ABC123",
        "titulo": "Monitor LG 27 pulgadas",
        "precio_lista": 3599.00,
        "descripcion": "...",
        "img_portada": "...",
        "categorias": [...],
        "existencia": { "nuevo": 15 }
      }
    ]
  },
  "pagination": {
    "pagina": 1,
    "total_paginas": 5,
    "total_registros": 235
  }
}
```

---

### 2. Sincronizar Productos de Súper Precio Automáticamente
```
GET /api/syscom/sync-super-precio
```

Este endpoint **automáticamente**:
1. Obtiene productos de Súper Precio de SYSCOM
2. Los importa a tu base de datos
3. Actualiza los existentes

**Query Parameters:**
- `limit` (int): Cuántos productos sincronizar (default: 50)
- `page` (int): Página a sincronizar (default: 1)

**Ejemplo:**
```bash
curl "http://localhost:5000/api/syscom/sync-super-precio?limit=30"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completada: 28 productos sincronizados, 2 fallidos",
  "synced": 28,
  "failed": 2,
  "details": [
    {
      "id": "ABC123",
      "name": "Monitor LG 27",
      "action": "created"
    },
    {
      "id": "XYZ789",
      "name": "Teclado Mecánico",
      "action": "updated"
    }
  ]
}
```

---

### 3. Ver Todas las Categorías Disponibles
```
GET /api/syscom/categories
```

**Ejemplo:**
```bash
curl "http://localhost:5000/api/syscom/categories"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "CAT001",
      "nombre": "Monitores",
      "total_productos": 1250
    },
    {
      "id": "CAT002",
      "nombre": "Laptops",
      "total_productos": 850
    }
  ]
}
```

---

### 4. Ver Todas las Marcas Disponibles
```
GET /api/syscom/brands
```

**Ejemplo:**
```bash
curl "http://localhost:5000/api/syscom/brands"
```

---

### 5. Ver Todas las Etiquetas (Súper Precio, Envío Gratis, etc.)
```
GET /api/syscom/tags
```

**Ejemplo:**
```bash
curl "http://localhost:5000/api/syscom/tags"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "Super Precio",
    "Envío Gratis",
    "Nuevos Productos",
    "Outlet"
  ]
}
```

---

## 🔄 Flujo de Trabajo Recomendado

### Opción A: Sincronización Manual (Recomendada)

1. **Ver productos disponibles de Súper Precio:**
   ```bash
   GET /api/syscom/super-precio?limit=50
   ```

2. **Sincronizar automáticamente:**
   ```bash
   GET /api/syscom/sync-super-precio?limit=50
   ```

3. **Los productos ya están en tu base de datos** listos para vender

---

### Opción B: Por Categorías Específicas

1. **Ver categorías:**
   ```bash
   GET /api/syscom/categories
   ```

2. **Filtrar Súper Precio por categoría:**
   ```bash
   GET /api/syscom/super-precio?category=Monitores&limit=30
   ```

3. **Sincronizar esa categoría:**
   ```bash
   GET /api/syscom/sync-super-precio?limit=30
   ```

---

## 🎨 Integración en Frontend

### Ejemplo en React:

```javascript
// Obtener productos de Súper Precio
const getSuperPrecio = async () => {
  const response = await fetch(
    'http://localhost:5000/api/syscom/super-precio?limit=20'
  );
  const data = await response.json();
  return data;
};

// Sincronizar productos automáticamente
const syncSuperPrecio = async () => {
  const response = await fetch(
    'http://localhost:5000/api/syscom/sync-super-precio?limit=50'
  );
  const result = await response.json();
  console.log(`Sincronizados: ${result.synced} productos`);
};

// Obtener categorías para filtros
const getCategories = async () => {
  const response = await fetch(
    'http://localhost:5000/api/syscom/categories'
  );
  const data = await response.json();
  return data;
};
```

---

## 🔧 Configuración de Sincronización Automática

Si quieres que los productos se sincronicen automáticamente cada cierto tiempo, puedes crear un cron job o tarea programada:

### Opción 1: Usando node-cron (Backend)

```javascript
// En tu backend/server.js o un archivo separado
import cron from 'node-cron';
import syscomService from './src/services/syscomService.js';

// Sincronizar Súper Precio cada día a las 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('🔄 Sincronizando productos de Súper Precio...');
  try {
    const result = await syscomService.syncSuperPrecioProducts({ limit: 100 });
    console.log(`✅ Sincronización completada: ${result.synced} productos`);
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
  }
});
```

### Opción 2: Trigger Manual desde Admin Panel

Agrega un botón en tu panel de administración:

```javascript
<button onClick={syncSuperPrecio}>
  🔄 Sincronizar Súper Precio
</button>
```

---

## 📊 Ventajas del Nuevo Sistema

✅ **Automático**: No necesitas modificar código para ver nuevos productos  
✅ **Filtrable**: Puedes filtrar por categoría, marca, página  
✅ **Actualizable**: Los productos se actualizan automáticamente  
✅ **Escalable**: Sincroniza de 1 a 1000 productos fácilmente  
✅ **Sin duplicados**: El sistema detecta productos existentes y los actualiza  

---

## 🧪 Prueba Rápida

```bash
# 1. Ver productos de Súper Precio disponibles
curl "http://localhost:5000/api/syscom/super-precio?limit=5"

# 2. Sincronizar esos productos a tu BD
curl "http://localhost:5000/api/syscom/sync-super-precio?limit=5"

# 3. Ver tus productos en la BD
curl "http://localhost:5000/api/products"
```

---

## 🆘 Solución de Problemas

### "No hay productos de Súper Precio disponibles"
- Verifica que SYSCOM tenga productos con esa etiqueta actualmente
- Prueba con diferentes páginas: `?page=2`

### "SYSCOM API no configurada"
- Verifica que `SYSCOM_CLIENT_ID` y `SYSCOM_API_KEY` estén en tu `.env`
- Reinicia el servidor backend

### "Error al sincronizar"
- Verifica tu conexión a internet
- Verifica que las credenciales de SYSCOM sean válidas

---

## 📝 Notas Importantes

- Los productos sincronizados tendrán el campo `syscomId` para rastrearlos
- Puedes actualizar stock/precios individuales con los endpoints existentes
- La sincronización es **incremental**: no duplica productos, los actualiza
- Se recomienda sincronizar máximo 100 productos a la vez para evitar timeouts

---

**¿Necesitas ayuda?** Revisa los logs del servidor o contacta al equipo de desarrollo.
