# 👥 PLAN DE IMPLEMENTACIÓN - GESTIÓN DE USUARIOS

## 🎯 Objetivo
Crear un módulo para gestionar usuarios del sistema:
- Listar usuarios
- Ver perfil de usuario
- Cambiar roles
- Bloquear/desbloquear usuarios
- Ver historial de compras

---

## 📋 TAREAS A REALIZAR

### BACKEND - Endpoints Necesarios

#### 1. **GET /api/users/admin** (Listar usuarios para admin)
```javascript
// Query params:
// - role (user, admin)
// - status (active, blocked)
// - search (por nombre o email)
// - page, limit

// Response:
{
  success: true,
  data: [
    {
      _id: "...",
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "555-1234",
      role: "user",
      status: "active",
      totalOrders: 5,
      totalSpent: 12450.00,
      lastLogin: "2024-01-20",
      createdAt: "2024-01-01"
    }
  ],
  pagination: { total: 89, page: 1, pages: 5 }
}
```

#### 2. **GET /api/users/:id/admin** (Ver detalles de usuario)
```javascript
// Response:
{
  success: true,
  data: {
    _id: "...",
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "555-1234",
    role: "user",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
    orders: [
      {
        _id: "...",
        orderId: "#ORD-001",
        date: "2024-01-15",
        total: 2450.00,
        status: "completed"
      }
    ],
    totalOrders: 5,
    totalSpent: 12450.00
  }
}
```

#### 3. **PUT /api/users/:id/role** (Cambiar rol de usuario)
```javascript
// Body:
{
  role: "admin" // user, admin
}

// Response:
{
  success: true,
  message: "Rol actualizado",
  data: { role: "admin" }
}
```

#### 4. **PUT /api/users/:id/status** (Bloquear/Desbloquear usuario)
```javascript
// Body:
{
  status: "blocked", // active, blocked
  reason: "Abuso de la plataforma" // Opcional
}

// Response:
{
  success: true,
  message: "Estatus actualizado",
  data: { status: "blocked" }
}
```

#### 5. **GET /api/users/:id/orders** (Historial de órdenes del usuario)
```javascript
// Response:
{
  success: true,
  data: [
    {
      _id: "...",
      orderId: "#ORD-001",
      date: "2024-01-15",
      total: 2450.00,
      status: "completed"
    }
  ]
}
```

#### 6. **DELETE /api/users/:id** (Eliminar usuario - soft delete)
```javascript
// Response:
{
  success: true,
  message: "Usuario eliminado"
}
```

#### 7. **GET /api/users/stats/summary** (Estadísticas de usuarios)
```javascript
// Response:
{
  success: true,
  data: {
    totalUsers: 89,
    activeUsers: 82,
    blockedUsers: 7,
    adminUsers: 3,
    newUsersThisMonth: 12,
    totalSpent: 456789.50,
    averageOrderValue: 1234.56
  }
}
```

---

### FRONTEND - Componentes Necesarios

#### 1. **Página: ManageUsers.jsx**
- Tabla con lista de usuarios
- Filtros y búsqueda
- Paginación
- Acciones rápidas

#### 2. **Componente: UsersTable.jsx**
- Tabla con usuarios
- Columnas: Nombre, Email, Rol, Estatus, Órdenes, Total Gastado, Acciones
- Estados visuales

#### 3. **Modal: UserDetailModal.jsx**
- Ver información completa del usuario
- Historial de órdenes
- Estadísticas de compra
- Opción de cambiar rol/status

#### 4. **Componente: UserFilters.jsx**
- Filtro por rol
- Filtro por status
- Búsqueda por nombre/email

#### 5. **Componente: UserStats.jsx**
- Total de usuarios
- Usuarios activos
- Usuarios bloqueados
- Admins

#### 6. **Modal: ChangeRoleModal.jsx**
- Cambiar rol de usuario
- Confirmación
- Razón opcional

#### 7. **Modal: BlockUserModal.jsx**
- Bloquear/Desbloquear usuario
- Razón del bloqueo
- Confirmación

---

### MODELOS - Cambios Necesarios

#### User Model (Ampliado)
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  blockedReason: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean,
  
  // Campos adicionales
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    emailNotifications: Boolean,
    marketingEmails: Boolean
  }
}
```

#### Activity Log (Nuevo Modelo)
```javascript
{
  userId: ObjectId,
  action: String, // login, logout, order, profile_update
  details: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

---

## 🔄 FLUJO DE TRABAJO

### 1. Backend - Crear Endpoints
- [ ] GET /api/users/admin
- [ ] GET /api/users/:id/admin
- [ ] PUT /api/users/:id/role
- [ ] PUT /api/users/:id/status
- [ ] GET /api/users/:id/orders
- [ ] DELETE /api/users/:id
- [ ] GET /api/users/stats/summary
- [ ] Validaciones
- [ ] Tests

### 2. Frontend - Crear Componentes
- [ ] ManageUsers.jsx
- [ ] UsersTable.jsx
- [ ] UserDetailModal.jsx
- [ ] UserFilters.jsx
- [ ] UserStats.jsx
- [ ] ChangeRoleModal.jsx
- [ ] BlockUserModal.jsx
- [ ] Integración en AdminPanel

### 3. Integración
- [ ] Conectar con backend
- [ ] Manejo de errores
- [ ] Confirmaciones

### 4. Testing
- [ ] Tests de endpoints
- [ ] Tests de componentes

---

## 📈 ESTIMACIÓN DE TIEMPO

| Tarea | Duración | Prioridad |
|-------|----------|-----------|
| Endpoints Backend | 2-3 horas | Alta |
| Componentes Frontend | 3-4 horas | Alta |
| Integración | 1-2 horas | Alta |
| Testing | 1.5 horas | Media |
| **TOTAL** | **7.5-10 horas** | - |

---

*Plan creado el 4 de Diciembre 2024*
