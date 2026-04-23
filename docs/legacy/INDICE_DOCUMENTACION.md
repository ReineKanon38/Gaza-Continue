# 📚 Índice de Documentación - Sistema GAZA-SYSCOM

## 🎯 Documentación del Proyecto

### Sistema de Diseño y Estilos
- **[SISTEMA_DISENO.md](./SISTEMA_DISENO.md)** - Sistema de diseño unificado completo
  - Variables CSS globales
  - Componentes reutilizables
  - Clases utilitarias
  - Guía de uso y mejores prácticas

### Panel de Administrador
- **[ADMIN_PANEL.md](./ADMIN_PANEL.md)** - Guía del panel de administrador
  - Funcionalidades implementadas
  - Cómo usar el panel
  - Cómo agregar más administradores
  - Seguridad y protección

- **[COMPONENTES_ADMIN.md](./COMPONENTES_ADMIN.md)** - Arquitectura de componentes del admin
  - Componentes reutilizables integrados
  - Props y uso de cada componente
  - Flujo de datos
  - Próximos pasos

- **[INVENTARIO_COMPONENTES.md](./INVENTARIO_COMPONENTES.md)** - Inventario completo de componentes
  - Dashboard y visualizaciones
  - Navegación y layout
  - Productos y catálogo
  - Plan de integración

- **[RESUMEN_INTEGRACION_ADMIN.md](./RESUMEN_INTEGRACION_ADMIN.md)** - Resumen de integración
  - Componentes integrados
  - Arquitectura mejorada
  - Comparación de código
  - Checklist de verificación

### Sistema de Checkout
- **[CHECKOUT_README.md](./CHECKOUT_README.md)** - Sistema de checkout estilo Mercado Libre
  - Detección automática de tarjetas
  - Formularios de dirección y pago
  - Validaciones implementadas

- **[INSTALACION_CHECKOUT.md](./INSTALACION_CHECKOUT.md)** - Guía de instalación del checkout
  - Pasos de instalación
  - Configuración
  - Verificación

### Integración SYSCOM
- **[SYSCOM_INTEGRATION.md](./backend/SYSCOM_INTEGRATION.md)** - Integración con API de SYSCOM
  - Configuración de credenciales
  - Endpoints disponibles
  - Sincronización de productos

---

## 📁 Estructura del Proyecto

```
SISTEMA-GAZA/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Controladores de API
│   │   ├── models/          # Modelos de MongoDB
│   │   ├── routes/          # Rutas de Express
│   │   ├── services/        # Servicios (SYSCOM)
│   │   ├── middleware/      # Middleware de autenticación
│   │   └── utils/           # Utilidades
│   ├── scripts/             # Scripts de utilidad
│   │   ├── seedUsers.js     # Poblar usuarios de prueba
│   │   └── makeAdmin.js     # Convertir usuario a admin
│   └── tests/               # Tests unitarios
│
├── frontend/
│   ├── src/
│   │   ├── styles/          # ✨ Sistema de diseño modular
│   │   │   ├── variables.css    # Variables globales
│   │   │   ├── base.css         # Estilos base
│   │   │   ├── components.css   # Componentes reutilizables
│   │   │   ├── utilities.css    # Clases helper
│   │   │   └── main.css         # Punto de entrada
│   │   ├── components/      # Componentes React
│   │   │   ├── AppNavbar.jsx        # Navegación principal
│   │   │   ├── KpiCard.jsx          # Tarjetas de métricas
│   │   │   ├── BarChart.jsx         # Gráfico de barras
│   │   │   ├── DonutChart.jsx       # Gráfico de dona
│   │   │   ├── LineChart.jsx        # Gráfico de línea
│   │   │   ├── LoadingSkeletons.jsx # Skeletons de carga
│   │   │   ├── ProductCard.jsx      # Tarjeta de producto
│   │   │   ├── AddressForm.jsx      # Formulario de dirección
│   │   │   └── PaymentForm.jsx      # Formulario de pago
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── Login.jsx            # Inicio de sesión
│   │   │   ├── Register.jsx         # Registro
│   │   │   ├── Catalog.jsx          # Catálogo de productos
│   │   │   ├── Cart.jsx             # Carrito de compras
│   │   │   ├── Checkout.jsx         # Proceso de checkout
│   │   │   ├── Profile.jsx          # Perfil de usuario
│   │   │   ├── Dashboard.jsx        # Dashboard de usuario
│   │   │   └── AdminPanel.jsx       # Panel de administrador
│   │   ├── context/         # Contextos de React
│   │   │   ├── AuthContext.jsx      # Autenticación
│   │   │   ├── CartContext.jsx      # Carrito
│   │   │   └── NotificationContext.jsx  # Notificaciones
│   │   └── hooks/           # Hooks personalizados
│   │       └── useCartHooks.js      # Lógica del carrito
│   └── public/              # Archivos estáticos
│
└── Documentación/           # 📚 Documentación del proyecto
    ├── README.md                    # Este archivo
    ├── SISTEMA_DISENO.md            # Sistema de diseño
    ├── ADMIN_PANEL.md               # Guía del admin panel
    ├── COMPONENTES_ADMIN.md         # Arquitectura de componentes
    ├── INVENTARIO_COMPONENTES.md    # Inventario de componentes
    ├── RESUMEN_INTEGRACION_ADMIN.md # Resumen de integración
    ├── CHECKOUT_README.md           # Sistema de checkout
    └── INSTALACION_CHECKOUT.md      # Instalación checkout
```

---

## 🚀 Quick Start

### Instalación

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Configuración

1. Crear archivo `.env` en `backend/`:
```env
MONGODB_URI=tu_mongodb_uri
JWT_SECRET=tu_secret_key
SYSCOM_USERNAME=tu_usuario_syscom
SYSCOM_PASSWORD=tu_password_syscom
```

2. Crear archivo `.env` en `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

### Ejecutar

```bash
# Backend (puerto 3000)
cd backend
npm start

# Frontend (puerto 5173)
cd frontend
npm run dev
```

---

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño modular ubicado en `frontend/src/styles/`:

### Archivos Principales

- **variables.css**: Variables CSS globales (colores, espaciado, tipografía)
- **base.css**: Reset CSS y configuración base
- **components.css**: Componentes reutilizables (cards, botones, badges)
- **utilities.css**: Clases helper (spacing, colors, animations)
- **main.css**: Punto de entrada que importa todo

### Uso

```jsx
// En cualquier componente React
import './MiComponente.css';

// En el CSS del componente, usar variables globales
.mi-componente {
  background: var(--bg-white);
  color: var(--text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
}
```

**📖 Ver [SISTEMA_DISENO.md](./SISTEMA_DISENO.md) para documentación completa**

---

## 👥 Roles de Usuario

### Usuario Regular (role: "user")
- Acceso al catálogo de productos
- Carrito de compras
- Proceso de checkout
- Perfil de usuario

### Administrador (role: "admin")
- Todo lo de usuario regular
- Panel de administrador (`/admin`)
- Dashboard con estadísticas
- Gestión de órdenes, productos y usuarios

### Crear Administrador

```bash
cd backend
node scripts/makeAdmin.js
```

Editar el email en `scripts/makeAdmin.js` antes de ejecutar.

**📖 Ver [ADMIN_PANEL.md](./ADMIN_PANEL.md) para más detalles**

---

## 🛒 Sistema de Checkout

El sistema de checkout está inspirado en Mercado Libre con:

- ✅ Detección automática de tipo de tarjeta (Visa, Mastercard, Amex, Discover)
- ✅ Formulario de dirección detallado (calle, número, colonia, ciudad, estado)
- ✅ 32 estados de México con dropdown
- ✅ Validación de código postal (5 dígitos)
- ✅ Formato de tarjeta con espacios cada 4 dígitos
- ✅ Validación de CVV (3-4 dígitos)
- ✅ Validación de fecha de expiración MM/YY

**📖 Ver [CHECKOUT_README.md](./CHECKOUT_README.md) para más detalles**

---

## 🎯 Componentes Principales

### Visualización de Datos
- **KpiCard**: Tarjetas de métricas
- **BarChart**: Gráfico de barras CSS puro
- **DonutChart**: Gráfico de dona SVG
- **LineChart**: Gráfico de línea SVG
- **LoadingSkeletons**: Estados de carga

### Navegación
- **AppNavbar**: Barra de navegación principal
- **ProtectedRoute**: Rutas protegidas por autenticación

### Productos
- **ProductCard**: Tarjeta de producto
- **Catalog**: Catálogo con filtros y búsqueda

### Checkout
- **AddressForm**: Formulario de dirección de envío
- **PaymentForm**: Formulario de pago con detección de tarjeta
- **Cart**: Carrito de compras

**📖 Ver [INVENTARIO_COMPONENTES.md](./INVENTARIO_COMPONENTES.md) para lista completa**

---

## 📊 Tecnologías Utilizadas

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- Zod para validación
- API de SYSCOM

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- React Icons
- Vite

### Estilos
- CSS Variables (Custom Properties)
- CSS Modules
- Sistema de diseño modular
- Responsive design

---

## 🔐 Seguridad

- Autenticación con JWT
- Contraseñas hasheadas con bcrypt
- Middleware de autorización
- Validación de datos con Zod
- Protección de rutas en frontend

---

## 📝 Scripts Útiles

### Backend
```bash
npm start           # Iniciar servidor
npm run dev         # Modo desarrollo con nodemon
npm test            # Ejecutar tests
node scripts/seedUsers.js    # Crear usuarios de prueba
node scripts/makeAdmin.js    # Convertir usuario a admin
```

### Frontend
```bash
npm run dev         # Iniciar desarrollo
npm run build       # Build para producción
npm run preview     # Vista previa del build
npm run lint        # Linter
```

---

## 🐛 Solución de Problemas

### El frontend no se conecta al backend
- Verifica que `VITE_API_URL` esté configurado correctamente
- Verifica que el backend esté corriendo en el puerto correcto

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado en el backend
- Limpia localStorage del navegador

### Errores de CSS
- Verifica que `frontend/src/index.css` importe `./styles/main.css`
- Revisa que no haya conflictos de nombres de variables

### Panel de admin no aparece
- Verifica que el usuario tenga `role: 'admin'` en MongoDB
- Cierra sesión y vuelve a iniciar sesión

**Para más ayuda, consulta los documentos específicos de cada módulo.**

---

## 📞 Contacto y Soporte

Para preguntas o problemas:
1. Revisa la documentación correspondiente
2. Verifica los ejemplos en el código
3. Consulta los comentarios en los archivos CSS/JSX

---

## 📅 Historial de Versiones

### v1.0.0 - Diciembre 2024
- ✅ Sistema de diseño modular implementado
- ✅ Panel de administrador con componentes reutilizables
- ✅ Sistema de checkout estilo Mercado Libre
- ✅ Integración con SYSCOM
- ✅ Roles de usuario (user/admin)
- ✅ Documentación completa

---

*Sistema GAZA-SYSCOM - Infraestructura TI*  
*Última actualización: Diciembre 2024*
