# ✅ CHECKLIST DE IMPLEMENTACIÓN - FASE 2

**Objetivo:** Implementar Gestión de Productos en 2-3 días  
**Fecha Inicio:** 7 de Enero, 2026  
**Fecha Target:** 9-10 de Enero, 2026

---

## 📋 DÍA 1: BACKEND (5-6 horas)

### Estructuración y Modelos
- [ ] Actualizar `Product.js` con todos los campos requeridos
- [ ] Verificar que el modelo tenga validaciones
- [ ] Probar creación de producto manualmente

### Validaciones (Zod)
- [ ] Agregar `createProductSchema` a `schemas.js`
- [ ] Agregar `updateProductSchema` a `schemas.js`
- [ ] Agregar `listProductsSchema` a `schemas.js`
- [ ] Probar validaciones con datos válidos e inválidos

### Controlador
- [ ] Crear/actualizar `productController.js` con 7 métodos:
  - [ ] `getProducts()` - Listar pública
  - [ ] `getAdminProducts()` - Listar admin con filtros
  - [ ] `getProductById()` - Obtener uno
  - [ ] `createProduct()` - Crear
  - [ ] `updateProduct()` - Actualizar
  - [ ] `deleteProduct()` - Eliminar (soft delete)
  - [ ] `getProductStats()` - Estadísticas

### Rutas
- [ ] Crear/actualizar `routes/products.js`
- [ ] Conectar rutas con controlador
- [ ] Verificar permisos (públicas vs admin)
- [ ] Agregar validación en rutas

### Testing Backend
- [ ] Crear producto manualmente (Thunder Client o Postman)
  ```
  POST /api/products/admin/create
  {
    "name": "Laptop",
    "description": "Laptop de prueba",
    "category": "Electrónica",
    "price": 999.99,
    "stock": 5
  }
  ```
- [ ] Listar productos ✅
- [ ] Obtener un producto ✅
- [ ] Actualizar producto ✅
- [ ] Eliminar producto ✅
- [ ] Probar filtros (búsqueda, categoría)
- [ ] Verificar paginación

### Integración en app.js
- [ ] Agregar ruta en `app.js`:
  ```javascript
  import productsRouter from './routes/products.js';
  app.use('/api/products', productsRouter);
  ```
- [ ] Reiniciar servidor y verificar que funciona

---

## 📋 DÍA 2: FRONTEND PRINCIPAL (6-7 horas)

### Estructura de Carpetas
- [ ] Crear carpeta `frontend/src/components/products/`
- [ ] Crear archivos vacíos:
  - [ ] `ProductsTable.jsx`
  - [ ] `ProductDetailModal.jsx`
  - [ ] `CreateProductModal.jsx`
  - [ ] `ProductStats.jsx`

### Componente Principal
- [ ] Crear `ManageProducts.jsx` con:
  - [ ] Estado para productos
  - [ ] Estado para filtros
  - [ ] Función `loadProducts()`
  - [ ] Función `handleDeleteProduct()`
  - [ ] Renderizado condicional
  - [ ] Manejo de errores

### Tabla de Productos
- [ ] Crear `ProductsTable.jsx`:
  - [ ] Mostrar columnas (ID, nombre, categoría, precio, stock, acciones)
  - [ ] Botones de acción (Ver, Eliminar)
  - [ ] Estilos básicos
  - [ ] Responsive design

### Modales
- [ ] Crear `ProductDetailModal.jsx`:
  - [ ] Mostrar detalles del producto
  - [ ] Botón editar
  - [ ] Botones cerrar
  - [ ] Validar datos

- [ ] Crear `CreateProductModal.jsx`:
  - [ ] Formulario completo
  - [ ] Campos: nombre, descripción, categoría, precio, stock
  - [ ] Validación del lado del cliente
  - [ ] Manejo de errores

### Estadísticas
- [ ] Crear `ProductStats.jsx`:
  - [ ] KPI cards (Total, Bajo Stock, Agotado)
  - [ ] API call a `/api/products/admin/stats`
  - [ ] Formateo de números

### Estilos
- [ ] Crear `ManageProducts.css`:
  - [ ] Estilos de contenedor
  - [ ] Estilos de tabla
  - [ ] Estilos de modales
  - [ ] Estilos de filtros
  - [ ] Colores consistentes

### Testing Frontend
- [ ] Verificar que se carga sin errores ✅
- [ ] Verificar que se cargan los productos ✅
- [ ] Probar filtros (búsqueda) ✅
- [ ] Probar crear producto ✅
- [ ] Probar editar producto ✅
- [ ] Probar eliminar producto ✅
- [ ] Verificar notificaciones ✅

---

## 📋 DÍA 3: INTEGRACIÓN (4-5 horas)

### Agregar a AdminPanel.jsx
- [ ] Importar `ManageProducts`
- [ ] Agregar tab "Productos" en Dashboard
- [ ] Verificar que se muestra correctamente
- [ ] Probar navegación entre tabs

### Protección de Rutas
- [ ] Verificar que solo admin puede acceder
- [ ] Verificar permisos en endpoints
- [ ] Probar con usuario normal (debe fallar)

### Estilos Finales
- [ ] Asegurar coherencia de colores
- [ ] Verificar responsive en móvil
- [ ] Verificar accesibilidad
- [ ] Ajustar espaciados y tamaños

### Documentación
- [ ] Actualizar archivo de documentación
- [ ] Agregar ejemplos de uso
- [ ] Documentar nuevos endpoints

### Testing E2E
- [ ] Flujo completo crear → listar → editar → eliminar
- [ ] Probar paginación
- [ ] Probar filtros combinados
- [ ] Probar en navegadores (Chrome, Firefox)
- [ ] Probar en dispositivos móviles

---

## 🔧 LÍNEA DE COMANDOS PARA PROBAR

### Backend - Crear Producto
```bash
curl -X POST http://localhost:5000/api/products/admin/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Descripción de prueba del producto",
    "category": "Electrónica",
    "price": 599.99,
    "stock": 10,
    "minStock": 5,
    "sku": "SKU-001"
  }'
```

### Backend - Listar Productos
```bash
curl http://localhost:5000/api/products/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Backend - Actualizar Producto
```bash
curl -X PUT http://localhost:5000/api/products/admin/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "price": 699.99,
    "stock": 15
  }'
```

---

## ⚠️ ERRORES COMUNES A EVITAR

- [ ] ❌ Olvidar agregar `isDeleted: false` en filtros
- [ ] ❌ No validar que el usuario sea admin
- [ ] ❌ No formatear números en tabla
- [ ] ❌ No manejar estados de loading
- [ ] ❌ No cerrar modales después de guardar
- [ ] ❌ No actualizar lista después de eliminar
- [ ] ❌ No validar URL de imágenes
- [ ] ❌ No normalizar nombres a minúsculas para búsqueda

---

## 💡 TIPS DE EFICIENCIA

1. **Copiar de ManageOrders**
   - La estructura es casi idéntica
   - Solo cambiar nombres y campos
   - Reutilizar estilos y hooks

2. **Validar primero en backend**
   - Asegurar que todos los endpoints funcionen
   - Usar Postman/Thunder Client
   - Verificar respuestas JSON

3. **Frontend sin complejidad**
   - Componentes simples al principio
   - Agregar funcionalidades después
   - Mantener código limpio

4. **Testing incremental**
   - Probar cada componente mientras lo creas
   - No esperar a terminar todo
   - Encontrar errores temprano

---

## 🎯 CRITERIOS DE ÉXITO

Al terminar DÍA 3, debes tener:

- ✅ Backend: 7 endpoints funcionando correctamente
- ✅ Frontend: Panel completo de gestión de productos
- ✅ Integración: Funciona en AdminPanel
- ✅ Testing: Sin errores en consola
- ✅ UX: Interfaz intuitiva y responsiva
- ✅ Permisos: Solo admin puede acceder
- ✅ Notificaciones: Mensajes de éxito/error funcionan

---

## 📊 EXPECTEDHORAS

| Tarea | Tiempo | Estado |
|-------|--------|--------|
| Backend - Modelos | 1h | ⏳ |
| Backend - Validaciones | 1h | ⏳ |
| Backend - Controlador | 1.5h | ⏳ |
| Backend - Rutas | 0.5h | ⏳ |
| Backend - Testing | 1.5h | ⏳ |
| **Subtotal Backend** | **5.5h** | ⏳ |
| Frontend - Estructura | 0.5h | ⏳ |
| Frontend - ManageProducts | 1.5h | ⏳ |
| Frontend - Tabla | 1h | ⏳ |
| Frontend - Modales | 2h | ⏳ |
| Frontend - Stats | 0.5h | ⏳ |
| Frontend - Estilos | 1h | ⏳ |
| **Subtotal Frontend** | **6.5h** | ⏳ |
| Integración | 1.5h | ⏳ |
| Testing Total | 1.5h | ⏳ |
| **TOTAL** | **~15h** | ⏳ |

---

## 🚀 DESPUÉS DE COMPLETAR

Una vez listo:

1. Crear issue/PR en GitHub (si usas Git)
2. Hacer screenshot del panel funcionando
3. Actualizar REPORTE_PROYECTO_2026.md con progreso
4. Avanzar a Fase 3: Gestión de Usuarios

---

**Checklist:** Implementación Fase 2  
**Responsable:** Tu nombre  
**Fecha Inicio:** 7/01/2026  
**Fecha Target:** 9-10/01/2026  
**Estado:** 🟡 Pendiente Inicio
