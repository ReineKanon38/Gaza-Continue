# 📦 PLAN DE IMPLEMENTACIÓN - GESTIÓN DE ÓRDENES

## 🎯 Objetivo
Crear un módulo completo de gestión de órdenes en el Admin Panel que permita:
- Listar todas las órdenes
- Ver detalles de cada orden
- Cambiar estado de órdenes
- Filtrar y buscar órdenes
- Exportar datos

---

## 📋 TAREAS A REALIZAR

### BACKEND - Endpoints Necesarios

#### 1. **GET /api/orders** (Listar órdenes)
```javascript
// Query params opcionales:
// - status (pending, processing, completed, cancelled)
// - startDate, endDate
// - userId
// - search (por cliente o ID)
// - page, limit (paginación)

// Response:
{
  success: true,
  data: [
    {
      _id: "...",
      customerName: "Juan Pérez",
      customerEmail: "juan@example.com",
      orderId: "#ORD-001",
      total: 2450.00,
      status: "completed",
      createdAt: "2024-01-15",
      items: [...]
    }
  ],
  pagination: {
    total: 156,
    page: 1,
    pages: 8
  }
}
```

#### 2. **GET /api/orders/:id** (Obtener orden por ID)
```javascript
// Response:
{
  success: true,
  data: {
    _id: "...",
    orderId: "#ORD-001",
    customer: {
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "123456789"
    },
    items: [
      {
        productId: "...",
        name: "Switch 24P",
        price: 1500.00,
        quantity: 1
      }
    ],
    shippingAddress: {
      street: "Calle 123",
      city: "CDMX",
      state: "CDMX",
      zipCode: "06600",
      country: "México"
    },
    total: 2450.00,
    status: "completed",
    trackingNumber: "TRACK123456",
    notes: "Entregar después de las 3pm",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-16"
  }
}
```

#### 3. **PUT /api/orders/:id/status** (Actualizar estado)
```javascript
// Body:
{
  status: "processing" // pending, processing, completed, cancelled
}

// Response:
{
  success: true,
  message: "Orden actualizada",
  data: { ... }
}
```

#### 4. **PUT /api/orders/:id** (Actualizar orden completa)
```javascript
// Body:
{
  status: "processing",
  trackingNumber: "TRACK123456",
  notes: "Nueva nota",
  shippingAddress: { ... }
}

// Response:
{
  success: true,
  message: "Orden actualizada",
  data: { ... }
}
```

#### 5. **DELETE /api/orders/:id** (Eliminar orden - soft delete)
```javascript
// Response:
{
  success: true,
  message: "Orden eliminada"
}
```

#### 6. **GET /api/orders/stats/summary** (Estadísticas de órdenes)
```javascript
// Response:
{
  success: true,
  data: {
    totalOrders: 156,
    pendingOrders: 23,
    processingOrders: 45,
    completedOrders: 82,
    cancelledOrders: 6,
    totalRevenue: 245680.50,
    averageOrderValue: 1574.36
  }
}
```

---

### FRONTEND - Componentes Necesarios

#### 1. **Página: ManageOrders.jsx**
- Tabla con lista de órdenes
- Filtros (estado, fecha, búsqueda)
- Paginación
- Botones de acción (Ver, Editar, Eliminar)

#### 2. **Componente: OrdersTable.jsx**
- Tabla responsiva
- Sorteables por columnas
- Estados con badges de color
- Acciones rápidas

#### 3. **Modal: OrderDetailModal.jsx**
- Ver detalles completos de la orden
- Información del cliente
- Detalles de los productos
- Dirección de envío
- Historial de cambios de estado

#### 4. **Modal: EditOrderModal.jsx**
- Editar estado de la orden
- Editar tracking number
- Editar notas
- Editar dirección de envío

#### 5. **Componente: OrderFilters.jsx**
- Filtro por estado (select)
- Filtro por fecha (date range)
- Búsqueda por cliente o ID
- Botones para aplicar/limpiar filtros

#### 6. **Componente: OrderStats.jsx**
- Cards con estadísticas
- Total de órdenes
- Órdenes pendientes
- Órdenes en proceso
- Órdenes completadas

---

### MODELOS - Cambios Necesarios

#### Order Model (Actualización)
```javascript
{
  orderId: String (unique), // #ORD-001
  userId: ObjectId,
  customer: {
    name: String,
    email: String,
    phone: String
  },
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String,
  subtotal: Number,
  tax: Number,
  shippingCost: Number,
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean (soft delete)
}
```

---

## 🔄 FLUJO DE TRABAJO

### 1. Backend - Crear Endpoints (Prioridad Alta)
- [ ] GET /api/orders (con filtros y paginación)
- [ ] GET /api/orders/:id
- [ ] PUT /api/orders/:id/status
- [ ] PUT /api/orders/:id
- [ ] DELETE /api/orders/:id
- [ ] GET /api/orders/stats/summary
- [ ] Validar permisos de admin
- [ ] Tests de endpoints

### 2. Frontend - Crear Componentes (Prioridad Alta)
- [ ] Crear ManageOrders.jsx
- [ ] Crear OrdersTable.jsx
- [ ] Crear OrderDetailModal.jsx
- [ ] Crear EditOrderModal.jsx
- [ ] Crear OrderFilters.jsx
- [ ] Crear OrderStats.jsx
- [ ] Integrar en AdminPanel
- [ ] Tests de componentes

### 3. Integración (Prioridad Media)
- [ ] Conectar frontend con backend
- [ ] Manejar errores
- [ ] Loading states
- [ ] Notificaciones
- [ ] Validaciones

### 4. Testing (Prioridad Media)
- [ ] Tests de endpoints
- [ ] Tests de componentes
- [ ] Tests de integración

### 5. Documentación (Prioridad Baja)
- [ ] Documentar endpoints en Swagger
- [ ] Documentar componentes
- [ ] Guía de uso

---

## 💾 SQL/MONGODB

### Datos de Ejemplo
```javascript
{
  _id: ObjectId,
  orderId: "#ORD-001",
  userId: ObjectId("..."),
  customer: {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "555-1234"
  },
  items: [
    {
      productId: ObjectId("..."),
      name: "Switch 24P",
      price: 1500.00,
      quantity: 1
    },
    {
      productId: ObjectId("..."),
      name: "Router WiFi 6",
      price: 950.00,
      quantity: 1
    }
  ],
  shippingAddress: {
    street: "Calle Principal 123",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06600",
    country: "México"
  },
  paymentMethod: "credit_card",
  subtotal: 2450.00,
  tax: 392.00,
  shippingCost: 150.00,
  total: 2992.00,
  status: "completed",
  trackingNumber: "MX123456789",
  notes: "Entregar después de las 3pm",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-16T14:45:00Z"),
  isDeleted: false
}
```

---

## 🎨 DISEÑO DE UI

### Tabla de Órdenes
```
┌─────────────────────────────────────────────────────────────────┐
│ ID          │ Cliente        │ Fecha      │ Total    │ Estado   │
├─────────────────────────────────────────────────────────────────┤
│ #ORD-001    │ Juan Pérez     │ 15/01/24   │ $2,450   │ ✅ Comp  │
│ #ORD-002    │ María García   │ 14/01/24   │ $1,890   │ ⏳ Proc  │
│ #ORD-003    │ Carlos López   │ 13/01/24   │ $3,200   │ ⏳ Pend  │
└─────────────────────────────────────────────────────────────────┘
```

### Filtros
```
┌──────────────────────────────────────────────────────────┐
│ Estado: [Todas ▼]  Fecha: [Desde - Hasta]  Buscar: [___] │
│ [Aplicar Filtros]  [Limpiar]                             │
└──────────────────────────────────────────────────────────┘
```

### Modal de Detalles
```
┌────────────────────────────────────┐
│ Orden: #ORD-001                    │
├────────────────────────────────────┤
│ Cliente: Juan Pérez                │
│ Email: juan@example.com            │
│ Teléfono: 555-1234                 │
│                                    │
│ Productos:                         │
│ • Switch 24P (1) - $1,500          │
│ • Router WiFi (1) - $950           │
│                                    │
│ Dirección de Envío:                │
│ Calle Principal 123, CDMX 06600    │
│                                    │
│ Total: $2,450                      │
│ Estado: Completada                 │
│ Tracking: MX123456789              │
│                                    │
│ [Editar] [Descargar PDF] [Cerrar]  │
└────────────────────────────────────┘
```

---

## 📈 ESTIMACIÓN DE TIEMPO

| Tarea | Duración | Prioridad |
|-------|----------|-----------|
| Endpoints Backend | 2-3 horas | Alta |
| Componentes Frontend | 3-4 horas | Alta |
| Integración | 1-2 horas | Alta |
| Testing | 2 horas | Media |
| Documentación | 1 hora | Baja |
| **TOTAL** | **9-12 horas** | - |

---

## ✅ DEFINICIÓN DE HECHO

- [x] Diseño completado
- [x] Plan detallado creado
- [ ] Backend implementado
- [ ] Frontend implementado
- [ ] Integración completa
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Listo para producción

---

*Plan creado el 4 de Diciembre 2024*  
*Status: Listo para implementación*
