# 🎨 Inventario de Componentes Reutilizables

## Dashboard y Visualizaciones

### ✅ KpiCard.jsx
**Ubicación:** `frontend/src/components/KpiCard.jsx`
**Usado en:** AdminPanel ✅, Dashboard
```jsx
<KpiCard title="Total Ventas" value="$25,000" icon={<FiDollar />} />
```

### ✅ BarChart.jsx
**Ubicación:** `frontend/src/components/BarChart.jsx`
**Usado en:** AdminPanel ✅, Dashboard
```jsx
<BarChart data={products} title="Top Productos" height={300} />
```

### ✅ DonutChart.jsx
**Ubicación:** `frontend/src/components/DonutChart.jsx`
**Usado en:** AdminPanel ✅, Dashboard
```jsx
<DonutChart data={categories} title="Por Categoría" size={220} />
```

### ✅ LineChart.jsx
**Ubicación:** `frontend/src/components/LineChart.jsx`
**Usado en:** AdminPanel ✅, Dashboard
```jsx
<LineChart data={monthly} title="Tendencia" height={300} width={700} />
```

### ✅ LoadingSkeletons.jsx
**Ubicación:** `frontend/src/components/LoadingSkeletons.jsx`
**Usado en:** AdminPanel ✅, Dashboard
- `KpiCardSkeleton` - Para tarjetas KPI
- `ChartSkeleton` - Para gráficas
- `ProductCardSkeleton` - Para productos
- `TableSkeleton` - Para tablas

---

## Navegación y Layout

### ✅ AppNavbar.jsx
**Ubicación:** `frontend/src/components/AppNavbar.jsx`
**Usado en:** Todas las páginas protegidas
- Menú de categorías con dropdown
- Enlace al panel de admin (solo admins)
- Carrito con contador
- Perfil y logout

### ✅ ProtectedRoute.jsx
**Ubicación:** `frontend/src/components/ProtectedRoute.jsx`
**Usado en:** App.jsx para proteger rutas
- Verifica autenticación
- Redirige a login si no hay token

---

## Productos y Catálogo

### ⚠️ ProductCard.jsx
**Ubicación:** `frontend/src/components/ProductCard.jsx`
**Usado en:** Catalog, Dashboard
**Disponible para:** Gestión de productos en AdminPanel
```jsx
<ProductCard
  product={{
    id: 1,
    name: "Switch 24 Puertos",
    price: 2500,
    image: "url",
    stock: 10
  }}
  onAddToCart={handleAdd}
/>
```

### ⚠️ Catalog.jsx
**Ubicación:** `frontend/src/pages/Catalog.jsx`
**Referencia para:** Sistema de filtros, búsqueda, categorías
- Filtro por categoría (URL params)
- Búsqueda por nombre
- Toggle vista grid/list
- Paginación

---

## Checkout y Pagos

### ⚠️ AddressForm.jsx
**Ubicación:** `frontend/src/components/AddressForm.jsx`
**Usado en:** Checkout
**Disponible para:** Ver/editar direcciones de usuarios/órdenes
- 32 estados de México
- Validación de código postal (5 dígitos)
- Campos separados: calle, número, colonia, ciudad, estado

### ⚠️ PaymentForm.jsx
**Ubicación:** `frontend/src/components/PaymentForm.jsx`
**Usado en:** Checkout
**Disponible para:** Ver información de pago de órdenes
- Detección automática de tipo de tarjeta
- Formato con espacios cada 4 dígitos
- Validación de CVV (3-4 dígitos)
- Validación de fecha MM/YY

### ⚠️ Cart.jsx (componente)
**Ubicación:** `frontend/src/components/Cart.jsx`
**Usado en:** Varias páginas
**Disponible para:** Mostrar detalles de productos en órdenes

---

## Notificaciones y Errores

### ✅ NotificationToast.jsx
**Ubicación:** `frontend/src/components/NotificationToast.jsx`
**Usado en:** Todas las páginas (via NotificationContext)
- Toast de Bootstrap
- Variantes: success, error, warning, info
- Auto-dismiss después de 3 segundos

### ✅ ErrorBoundary.jsx
**Ubicación:** `frontend/src/components/ErrorBoundary.jsx`
**Usado en:** main.jsx (envuelve toda la app)
- Captura errores de React
- Muestra pantalla de error amigable

---

## Páginas Disponibles como Referencia

### Dashboard.jsx (Usuario)
**Ubicación:** `frontend/src/pages/Dashboard.jsx`
**Uso:** Referencia completa de implementación
- Carga datos del backend
- Maneja estados de loading
- Usa todos los componentes de gráficas
- Modo offline con mocks

### Checkout.jsx
**Ubicación:** `frontend/src/pages/Checkout.jsx`
**Uso:** Flujo completo de pago
- Validación de formularios
- Integración con AddressForm y PaymentForm
- Resumen de orden
- Página de éxito

---

## Hooks Personalizados

### ⚠️ useCartHooks.js
**Ubicación:** `frontend/src/hooks/useCartHooks.js`
**Disponible para:** Lógica de carrito en AdminPanel
```javascript
const {
  cart,
  totalItems,
  subtotal,
  tax,
  total,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} = useCartHelpers();
```

---

## Contextos Disponibles

### AuthContext
**Ubicación:** `frontend/src/context/AuthContext.jsx`
- `user` - Datos del usuario actual
- `token` - JWT token
- `login(token, userData)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `isAdmin()` - Verificar si es admin ✅

### CartContext
**Ubicación:** `frontend/src/context/CartContext.jsx`
- Estado global del carrito
- Persistencia en localStorage
- Funciones de manipulación

### NotificationContext
**Ubicación:** `frontend/src/context/NotificationContext.jsx`
- `showSuccess(message)` - Toast verde
- `showError(message)` - Toast rojo
- `showWarning(message)` - Toast amarillo
- `showInfo(message)` - Toast azul

---

## 🎯 Componentes Pendientes de Crear

### Para AdminPanel

#### 1. OrderDetailsModal
**Propósito:** Ver detalles completos de una orden
**Props:** `order`, `onClose`, `onUpdateStatus`
**Componentes a reutilizar:** AddressForm, PaymentForm, Cart

#### 2. ProductForm
**Propósito:** Agregar/editar productos
**Props:** `product` (opcional), `onSubmit`, `onCancel`
**Campos:** nombre, descripción, precio, categoría, stock, imagen

#### 3. UserTable
**Propósito:** Listar usuarios con filtros
**Props:** `users`, `onChangeRole`, `onDelete`
**Columnas:** nombre, email, rol, fecha registro, acciones

#### 4. StatsCard (extendido)
**Propósito:** KPI con comparación temporal
**Props:** `title`, `value`, `previousValue`, `icon`, `trend`
**Ejemplo:** "Ventas hoy: $2,500 (+15% vs ayer)"

---

## 📊 Resumen de Integración

| Componente | Ubicación | Estado | Usado en AdminPanel |
|-----------|-----------|--------|---------------------|
| KpiCard | components/ | ✅ Completo | ✅ Sí |
| BarChart | components/ | ✅ Completo | ✅ Sí |
| DonutChart | components/ | ✅ Completo | ✅ Sí |
| LineChart | components/ | ✅ Completo | ✅ Sí |
| LoadingSkeletons | components/ | ✅ Completo | ✅ Sí |
| AppNavbar | components/ | ✅ Completo | ✅ Visible en todas |
| ProductCard | components/ | ✅ Completo | ⏳ Pendiente |
| AddressForm | components/ | ✅ Completo | ⏳ Pendiente |
| PaymentForm | components/ | ✅ Completo | ⏳ Pendiente |
| Cart | components/ | ✅ Completo | ⏳ Pendiente |
| NotificationToast | components/ | ✅ Completo | ✅ Disponible global |
| ErrorBoundary | components/ | ✅ Completo | ✅ Envuelve app |

---

## 🚀 Plan de Integración Recomendado

### Fase 1: Dashboard (✅ COMPLETADO)
- ✅ KpiCard para métricas
- ✅ Gráficas de ventas
- ✅ Tabla de órdenes recientes
- ✅ Loading skeletons

### Fase 2: Gestión de Órdenes (⏳ SIGUIENTE)
```jsx
// Integrar componentes existentes
import AddressForm from '../components/AddressForm';
import PaymentForm from '../components/PaymentForm';

// Mostrar detalles de orden
<AddressForm
  addressData={order.shippingAddress}
  disabled={true}  // Solo lectura
/>
<PaymentForm
  paymentData={order.paymentInfo}
  disabled={true}  // Solo lectura
/>
```

### Fase 3: Gestión de Productos
```jsx
// Reutilizar ProductCard
import ProductCard from '../components/ProductCard';

<Row>
  {products.map(product => (
    <Col md={3} key={product.id}>
      <ProductCard
        product={product}
        showEditButton={true}
        onEdit={handleEditProduct}
      />
    </Col>
  ))}
</Row>
```

### Fase 4: Gestión de Usuarios
```jsx
// Crear nuevo componente UserTable
// Similar a tabla de órdenes recientes
```

---

## 💡 Tips de Desarrollo

1. **Siempre busca componentes existentes antes de crear nuevos**
2. **Usa LoadingSkeletons durante cargas asíncronas**
3. **Aprovecha NotificationContext para feedback al usuario**
4. **Mantén los componentes pequeños y con una sola responsabilidad**
5. **Documenta props y uso esperado**
6. **Testea componentes de forma aislada primero**

---

## 📚 Referencias Útiles

- **Dashboard.jsx** - Ejemplo completo de implementación
- **Checkout.jsx** - Ejemplo de formularios complejos
- **Catalog.jsx** - Ejemplo de filtros y búsqueda
- **Bootstrap Docs** - https://react-bootstrap.netlify.app/

---

*Última actualización: Diciembre 2024*
*Mantén este documento actualizado al agregar nuevos componentes*
