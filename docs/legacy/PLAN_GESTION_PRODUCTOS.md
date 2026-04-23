# 🛍️ PLAN DE IMPLEMENTACIÓN - GESTIÓN DE PRODUCTOS

## 🎯 Objetivo
Crear un módulo completo de gestión de productos que permita:
- Listar todos los productos
- Agregar nuevos productos
- Editar productos existentes
- Eliminar productos
- Gestionar stock
- Cargar imágenes

---

## 📋 TAREAS A REALIZAR

### BACKEND - Endpoints Necesarios

#### 1. **GET /api/products/admin** (Listar productos para admin)
```javascript
// Query params:
// - category
// - status (active, inactive)
// - search
// - page, limit
// - sortBy, sortOrder

// Response:
{
  success: true,
  data: [
    {
      _id: "...",
      name: "Switch 24P",
      sku: "SW-24P-001",
      category: "networking",
      price: 1500.00,
      stock: 45,
      status: "active",
      description: "...",
      images: ["url1", "url2"],
      createdAt: "2024-01-15"
    }
  ],
  pagination: { total: 432, page: 1, pages: 22 }
}
```

#### 2. **POST /api/products** (Crear nuevo producto)
```javascript
// Body:
{
  name: "Switch 24P",
  sku: "SW-24P-001",
  category: "networking",
  price: 1500.00,
  stock: 45,
  description: "Descripción detallada",
  images: ["url1", "url2"],
  specifications: { ... },
  weight: 5.2,
  dimensions: { ... }
}

// Response:
{
  success: true,
  message: "Producto creado",
  data: { _id: "...", ... }
}
```

#### 3. **PUT /api/products/:id** (Actualizar producto)
```javascript
// Body:
{
  name: "...",
  price: 1500.00,
  stock: 45,
  status: "active",
  // ... otros campos
}

// Response:
{
  success: true,
  message: "Producto actualizado",
  data: { ... }
}
```

#### 4. **DELETE /api/products/:id** (Eliminar producto)
```javascript
// Response:
{
  success: true,
  message: "Producto eliminado"
}
```

#### 5. **PUT /api/products/:id/stock** (Actualizar stock)
```javascript
// Body:
{
  quantity: 50,
  operation: "set" // set, add, subtract
}

// Response:
{
  success: true,
  message: "Stock actualizado",
  data: { stock: 50 }
}
```

#### 6. **POST /api/products/import** (Importar desde CSV)
```javascript
// Body: FormData con archivo CSV
// Response:
{
  success: true,
  message: "Productos importados",
  data: { imported: 50, failed: 2, errors: [...] }
}
```

#### 7. **GET /api/products/categories** (Listar categorías)
```javascript
// Response:
{
  success: true,
  data: [
    { _id: "...", name: "Networking", productCount: 120 },
    { _id: "...", name: "Videovigilancia", productCount: 85 }
  ]
}
```

---

### FRONTEND - Componentes Necesarios

#### 1. **Página: ManageProducts.jsx**
- Tabla con lista de productos
- Filtros y búsqueda
- Paginación
- Botón para agregar producto

#### 2. **Componente: ProductsTable.jsx**
- Tabla con productos
- Columnas: Nombre, SKU, Categoría, Precio, Stock, Estado, Acciones
- Sorteables
- Acciones rápidas

#### 3. **Modal: ProductFormModal.jsx**
- Formulario para crear/editar producto
- Campos: Nombre, SKU, Categoría, Precio, Stock, Descripción
- Carga de imágenes
- Validaciones

#### 4. **Componente: ProductFilters.jsx**
- Filtro por categoría
- Filtro por estado
- Búsqueda por nombre/SKU
- Rango de precios

#### 5. **Componente: ImageUploader.jsx**
- Cargar múltiples imágenes
- Preview de imágenes
- Eliminar imágenes
- Drag & drop

#### 6. **Componente: StockManager.jsx**
- Ver stock actual
- Ajustar stock
- Historial de cambios de stock

#### 7. **Componente: ProductStats.jsx**
- Total de productos
- Productos activos/inactivos
- Productos con bajo stock

---

### MODELOS - Cambios Necesarios

#### Product Model (Ampliado)
```javascript
{
  name: String,
  sku: String (unique),
  barcode: String,
  category: String,
  description: String,
  price: Number,
  cost: Number, // Precio de costo
  stock: Number,
  minStock: Number, // Stock mínimo
  images: [String],
  specifications: {
    // Especificaciones dinámicas
  },
  weight: Number, // kg
  dimensions: {
    width: Number,
    height: Number,
    depth: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

#### Nuevos Modelos
```javascript
// Category
{
  name: String,
  slug: String,
  description: String,
  image: String,
  parent: ObjectId, // Para subcategorías
  createdAt: Date
}

// StockHistory
{
  productId: ObjectId,
  previousStock: Number,
  newStock: Number,
  operation: String, // add, subtract, set
  quantity: Number,
  reason: String, // Motivo del cambio
  changedBy: ObjectId,
  createdAt: Date
}
```

---

## 🔄 FLUJO DE TRABAJO

### 1. Backend - Crear Endpoints
- [ ] GET /api/products/admin
- [ ] POST /api/products
- [ ] PUT /api/products/:id
- [ ] DELETE /api/products/:id
- [ ] PUT /api/products/:id/stock
- [ ] POST /api/products/import
- [ ] GET /api/products/categories
- [ ] Validaciones completas
- [ ] Tests

### 2. Frontend - Crear Componentes
- [ ] ManageProducts.jsx
- [ ] ProductsTable.jsx
- [ ] ProductFormModal.jsx
- [ ] ProductFilters.jsx
- [ ] ImageUploader.jsx
- [ ] StockManager.jsx
- [ ] ProductStats.jsx
- [ ] Integración en AdminPanel

### 3. Integración
- [ ] Conectar con backend
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Notificaciones
- [ ] Confirmaciones de eliminación

### 4. Testing
- [ ] Tests de endpoints
- [ ] Tests de componentes

---

## 📈 ESTIMACIÓN DE TIEMPO

| Tarea | Duración | Prioridad |
|-------|----------|-----------|
| Endpoints Backend | 3-4 horas | Alta |
| Componentes Frontend | 4-5 horas | Alta |
| Integración | 2 horas | Alta |
| Testing | 2 horas | Media |
| **TOTAL** | **11-13 horas** | - |

---

*Plan creado el 4 de Diciembre 2024*
