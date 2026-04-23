# ⚙️ PLAN DE IMPLEMENTACIÓN - CONFIGURACIÓN DEL SISTEMA

## 🎯 Objetivo
Crear un módulo de configuración general del sistema:
- Datos de la tienda
- Métodos de pago
- Configuración de envío
- Impuestos
- Notificaciones por email

---

## 📋 TAREAS A REALIZAR

### BACKEND - Endpoints Necesarios

#### 1. **GET /api/config** (Obtener configuración general)
```javascript
// Response:
{
  success: true,
  data: {
    store: {
      name: "SYSCOM-GAZA",
      logo: "url",
      description: "Tienda de infraestructura TI",
      email: "contact@syscom-gaza.com",
      phone: "+52 55 1234-5678",
      address: {
        street: "Calle Principal 123",
        city: "CDMX",
        state: "CDMX",
        zipCode: "06600",
        country: "México"
      }
    },
    shipping: {
      methods: [
        {
          id: "standard",
          name: "Estándar (5-7 días)",
          cost: 150.00,
          active: true
        },
        {
          id: "express",
          name: "Express (1-2 días)",
          cost: 350.00,
          active: true
        }
      ],
      freeShippingThreshold: 5000.00
    },
    payment: {
      methods: ["credit_card", "bank_transfer", "cash_on_delivery"],
      currency: "MXN"
    },
    tax: {
      rate: 16, // %
      included: false
    },
    notifications: {
      orderConfirmation: true,
      shippingNotification: true,
      deliveryNotification: true,
      marketingEmails: true
    }
  }
}
```

#### 2. **PUT /api/config/store** (Actualizar datos de tienda)
```javascript
// Body:
{
  name: "SYSCOM-GAZA",
  logo: "url",
  description: "...",
  email: "...",
  phone: "...",
  address: { ... }
}

// Response:
{
  success: true,
  message: "Configuración actualizada",
  data: { ... }
}
```

#### 3. **PUT /api/config/shipping** (Actualizar métodos de envío)
```javascript
// Body:
{
  methods: [
    {
      id: "standard",
      name: "Estándar",
      cost: 150.00,
      active: true
    }
  ],
  freeShippingThreshold: 5000.00
}

// Response:
{
  success: true,
  message: "Configuración de envío actualizada"
}
```

#### 4. **PUT /api/config/payment** (Actualizar métodos de pago)
```javascript
// Body:
{
  methods: ["credit_card", "bank_transfer", "cash_on_delivery"],
  currency: "MXN"
}

// Response:
{
  success: true,
  message: "Métodos de pago actualizados"
}
```

#### 5. **PUT /api/config/tax** (Actualizar impuestos)
```javascript
// Body:
{
  rate: 16,
  included: false
}

// Response:
{
  success: true,
  message: "Configuración de impuestos actualizada"
}
```

#### 6. **PUT /api/config/notifications** (Actualizar notificaciones)
```javascript
// Body:
{
  orderConfirmation: true,
  shippingNotification: true,
  deliveryNotification: true,
  marketingEmails: true
}

// Response:
{
  success: true,
  message: "Configuración de notificaciones actualizada"
}
```

---

### FRONTEND - Componentes Necesarios

#### 1. **Página: SystemSettings.jsx**
- Tabs para diferentes secciones
- Formularios por sección

#### 2. **Componente: StoreSettingsForm.jsx**
- Nombre de tienda
- Logo
- Descripción
- Email de contacto
- Teléfono
- Dirección

#### 3. **Componente: ShippingSettingsForm.jsx**
- Métodos de envío
- Costos
- Umbral de envío gratis
- Editar/Agregar métodos

#### 4. **Componente: PaymentSettingsForm.jsx**
- Métodos de pago (checkboxes)
- Moneda
- Proveedores de pago

#### 5. **Componente: TaxSettingsForm.jsx**
- Porcentaje de impuesto
- ¿Incluido en precio?
- Diferentes tasas por región

#### 6. **Componente: NotificationSettingsForm.jsx**
- Toggle para cada tipo de notificación
- Plantillas de email
- Remitente por defecto

#### 7. **Componente: BackupSettings.jsx**
- Crear backup
- Ver backups anteriores
- Restaurar backup
- Programar backups automáticos

---

### MODELOS - Cambios Necesarios

#### SystemConfig (Nuevo Modelo)
```javascript
{
  store: {
    name: String,
    logo: String (URL),
    description: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  shipping: {
    methods: [{
      id: String,
      name: String,
      cost: Number,
      estimatedDays: Number,
      active: Boolean
    }],
    freeShippingThreshold: Number
  },
  payment: {
    methods: [String],
    currency: String,
    providers: Object
  },
  tax: {
    rate: Number,
    included: Boolean
  },
  notifications: {
    orderConfirmation: Boolean,
    shippingNotification: Boolean,
    deliveryNotification: Boolean,
    marketingEmails: Boolean
  },
  updatedAt: Date,
  updatedBy: ObjectId
}
```

#### Backup Log (Nuevo Modelo)
```javascript
{
  filename: String,
  size: Number,
  createdAt: Date,
  createdBy: ObjectId,
  type: String, // automatic, manual
  status: String // completed, in_progress, failed
}
```

---

## 🔄 FLUJO DE TRABAJO

### 1. Backend - Crear Endpoints
- [ ] GET /api/config
- [ ] PUT /api/config/store
- [ ] PUT /api/config/shipping
- [ ] PUT /api/config/payment
- [ ] PUT /api/config/tax
- [ ] PUT /api/config/notifications
- [ ] Validaciones
- [ ] Tests

### 2. Frontend - Crear Componentes
- [ ] SystemSettings.jsx
- [ ] StoreSettingsForm.jsx
- [ ] ShippingSettingsForm.jsx
- [ ] PaymentSettingsForm.jsx
- [ ] TaxSettingsForm.jsx
- [ ] NotificationSettingsForm.jsx
- [ ] BackupSettings.jsx
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
| Componentes Frontend | 3-4 horas | Media |
| Integración | 1-2 horas | Media |
| Testing | 1 hora | Media |
| **TOTAL** | **7-10 horas** | - |

---

*Plan creado el 4 de Diciembre 2024*
