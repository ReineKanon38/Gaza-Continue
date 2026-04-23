# 📚 Arquitectura de Componentes - Panel de Administrador

## ✅ Componentes Reutilizables Integrados

El panel de administrador ahora utiliza los componentes existentes del sistema, siguiendo las mejores prácticas de desarrollo React.

## 🎯 Componentes Utilizados

### 1. **KpiCard** (`components/KpiCard.jsx`)
**Propósito:** Mostrar métricas clave de forma visual

**Props:**
- `title` (string): Título de la métrica
- `value` (string/number): Valor a mostrar
- `icon` (ReactNode): Icono opcional

**Uso en AdminPanel:**
```jsx
<KpiCard
  title="Órdenes Totales"
  value={stats.totalOrders}
  icon={<FiShoppingCart size={24} className="text-primary" />}
/>
```

**Ventajas:**
- Componente ligero y reutilizable
- Fácil de estilizar con Bootstrap
- Acepta cualquier valor numérico o string

---

### 2. **BarChart** (`components/BarChart.jsx`)
**Propósito:** Visualizar comparaciones entre categorías

**Props:**
- `data` (array): Datos en formato `[{ label, value, color }]`
- `title` (string): Título del gráfico
- `height` (number): Altura en píxeles (default: 200)

**Uso en AdminPanel:**
```jsx
<BarChart
  data={topProducts}
  title="Productos Más Vendidos"
  height={300}
/>
```

**Ejemplo de datos:**
```javascript
const topProducts = [
  { label: 'Switch 24P', value: 45, color: '#007bff' },
  { label: 'Router WiFi', value: 38, color: '#28a745' },
  { label: 'Cámara IP', value: 32, color: '#ffc107' }
];
```

**Características:**
- Gráfico de barras puro CSS/HTML (sin librerías externas)
- Normalización automática de valores
- Animaciones hover suaves
- Manejo de datos vacíos

---

### 3. **DonutChart** (`components/DonutChart.jsx`)
**Propósito:** Mostrar distribución porcentual de categorías

**Props:**
- `data` (array): Datos en formato `[{ label, value, color }]`
- `title` (string): Título del gráfico
- `size` (number): Tamaño del círculo en píxeles (default: 180)

**Uso en AdminPanel:**
```jsx
<DonutChart
  data={salesByCategory}
  title="Ventas por Categoría"
  size={220}
/>
```

**Ejemplo de datos:**
```javascript
const salesByCategory = [
  { label: 'Networking', value: 35, color: '#007bff' },
  { label: 'Videovigilancia', value: 25, color: '#28a745' },
  { label: 'Servidores', value: 20, color: '#ffc107' },
  { label: 'Storage', value: 15, color: '#dc3545' }
];
```

**Características:**
- Gráfico SVG con cálculo de porcentajes automático
- Leyenda con colores y porcentajes
- Tooltips en hover
- Colores personalizables por segmento

---

### 4. **LineChart** (`components/LineChart.jsx`)
**Propósito:** Visualizar tendencias a lo largo del tiempo

**Props:**
- `data` (array): Datos en formato `[{ label, value }]`
- `title` (string): Título del gráfico
- `height` (number): Altura en píxeles (default: 200)
- `width` (number): Ancho en píxeles (default: 400)

**Uso en AdminPanel:**
```jsx
<LineChart
  data={monthlySales}
  title="Ventas Mensuales"
  height={300}
  width={700}
/>
```

**Ejemplo de datos:**
```javascript
const monthlySales = [
  { label: 'Ene', value: 15000 },
  { label: 'Feb', value: 18500 },
  { label: 'Mar', value: 22000 },
  { label: 'Abr', value: 19500 },
  { label: 'May', value: 25000 },
  { label: 'Jun', value: 28000 }
];
```

**Características:**
- Gráfico SVG con línea suave
- Área sombreada bajo la línea
- Cuadrícula de referencia
- Puntos interactivos con tooltips
- Etiquetas de ejes automáticas

---

### 5. **LoadingSkeletons** (`components/LoadingSkeletons.jsx`)
**Propósito:** Mostrar estados de carga mientras se obtienen datos

**Componentes disponibles:**
- `KpiCardSkeleton`: Esqueleto para tarjetas KPI
- `ChartSkeleton`: Esqueleto para gráficas
- `ProductCardSkeleton`: Esqueleto para productos
- `TableSkeleton`: Esqueleto para tablas

**Props de ChartSkeleton:**
- `height` (number): Altura del esqueleto (default: 250)

**Uso en AdminPanel:**
```jsx
{isLoading ? (
  <ChartSkeleton height={300} />
) : (
  <LineChart data={monthlySales} title="Ventas Mensuales" />
)}
```

**Características:**
- Animación de pulso con Bootstrap Placeholder
- Spinner opcional para estados de carga
- Mejora la UX durante peticiones asíncronas

---

## 🏗️ Arquitectura del Panel

### Estructura de Estados
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [isLoading, setIsLoading] = useState(true);
const [stats, setStats] = useState({
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0,
  revenue: 0
});
const [recentOrders, setRecentOrders] = useState([]);
const [topProducts, setTopProducts] = useState([]);
const [salesByCategory, setSalesByCategory] = useState([]);
const [monthlySales, setMonthlySales] = useState([]);
```

### Flujo de Datos

```
1. Usuario accede al panel → useEffect verifica rol
2. loadAdminData() se ejecuta
3. Se activa isLoading = true → Muestra skeletons
4. Se hacen peticiones al backend (o se usan mocks)
5. Se actualizan los estados con datos
6. isLoading = false → Se renderizan componentes con datos
```

### Modo Sin Backend
```javascript
if (!apiUrl || !token) {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Usar datos de ejemplo
  setStats({ totalOrders: 156, ... });
  setRecentOrders([...]);
  // etc.
}
```

---

## 🎨 Layout del Dashboard

### Grid System (Bootstrap)
```jsx
<Row className="g-4">
  {/* 4 KPIs en una fila */}
  <Col md={3}><KpiCard /></Col>
  <Col md={3}><KpiCard /></Col>
  <Col md={3}><KpiCard /></Col>
  <Col md={3}><KpiCard /></Col>

  {/* Gráfico principal (8 columnas) + Donut (4 columnas) */}
  <Col md={8}><LineChart /></Col>
  <Col md={4}><DonutChart /></Col>

  {/* Gráfico de barras (ancho completo) */}
  <Col md={12}><BarChart /></Col>

  {/* Tabla de órdenes (ancho completo) */}
  <Col md={12}><Table /></Col>
</Row>
```

### Sidebar de Navegación
```jsx
<Col md={2}>
  <Card className="admin-sidebar">
    <Nav className="flex-column">
      <Nav.Link onClick={() => setActiveTab('dashboard')}>
        <FiBarChart2 /> Dashboard
      </Nav.Link>
      <Nav.Link onClick={() => setActiveTab('orders')}>
        <FiShoppingCart /> Órdenes
      </Nav.Link>
      {/* ... más enlaces */}
    </Nav>
  </Card>
</Col>
```

---

## 🔄 Ventajas de la Arquitectura Actual

### ✅ Reutilización de Código
- Los mismos componentes usados en `Dashboard.jsx` se usan en `AdminPanel.jsx`
- Menos código duplicado = menos bugs
- Actualizaciones en un componente benefician a todos los usos

### ✅ Mantenibilidad
- Componentes pequeños y enfocados en una sola responsabilidad
- Fácil de testear individualmente
- Cambios aislados no afectan a otros componentes

### ✅ Consistencia Visual
- Todos los gráficos tienen el mismo estilo
- Experiencia de usuario uniforme
- Colores y tipografías centralizados

### ✅ Performance
- Componentes sin dependencias externas pesadas
- Renderizado eficiente con SVG/CSS puro
- Estados de carga que mejoran la percepción de velocidad

---

## 📁 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── KpiCard.jsx          ✅ Usado en AdminPanel
│   ├── BarChart.jsx          ✅ Usado en AdminPanel
│   ├── DonutChart.jsx        ✅ Usado en AdminPanel
│   ├── LineChart.jsx         ✅ Usado en AdminPanel
│   ├── LoadingSkeletons.jsx  ✅ Usado en AdminPanel
│   ├── AppNavbar.jsx         ✅ Usado en todas las páginas protegidas
│   ├── ProductCard.jsx       ⚠️ Disponible para Gestión de Productos
│   ├── Cart.jsx              ⚠️ Disponible para Vista de Carrito
│   ├── AddressForm.jsx       ⚠️ Disponible para Gestión de Direcciones
│   └── PaymentForm.jsx       ⚠️ Disponible para Gestión de Pagos
├── pages/
│   ├── AdminPanel.jsx        ✅ Panel de administrador principal
│   ├── Dashboard.jsx         ℹ️ Dashboard de usuario (referencia)
│   ├── Catalog.jsx           ⚠️ Disponible para Gestión de Productos
│   └── ...
└── hooks/
    └── useCartHooks.js       ⚠️ Disponible para lógica de carrito
```

**Leyenda:**
- ✅ Actualmente integrado en AdminPanel
- ⚠️ Disponible para futuras funcionalidades
- ℹ️ Archivo de referencia/ejemplo

---

## 🚀 Próximos Pasos - Componentes a Integrar

### 1. Gestión de Productos
**Componentes disponibles:**
- `ProductCard.jsx` - Mostrar productos en grid
- `Catalog.jsx` - Referencia para filtros y búsqueda

**Funcionalidad a desarrollar:**
- Listar todos los productos con `ProductCard`
- Formulario de agregar/editar producto
- Integración con API de SYSCOM

### 2. Gestión de Órdenes
**Componentes disponibles:**
- `Cart.jsx` - Vista detallada de productos
- `AddressForm.jsx` - Ver dirección de envío
- `PaymentForm.jsx` - Ver información de pago

**Funcionalidad a desarrollar:**
- Tabla expandible con detalles de orden
- Cambio de estado de órdenes
- Imprimir factura/recibo

### 3. Gestión de Usuarios
**Funcionalidad a desarrollar:**
- Tabla de usuarios con filtros
- Cambiar rol de usuario (user ↔ admin)
- Ver historial de órdenes por usuario

---

## 🛠️ Cómo Agregar Nuevos Componentes

### Patrón a seguir:
```jsx
// 1. Importar componente reutilizable
import MiComponente from '../components/MiComponente';

// 2. Definir estado para datos
const [misDatos, setMisDatos] = useState([]);

// 3. Cargar datos en useEffect o función
const loadData = async () => {
  // ... fetch data
  setMisDatos(data);
};

// 4. Renderizar con skeleton durante carga
{isLoading ? (
  <Skeleton />
) : (
  <MiComponente data={misDatos} />
)}
```

---

## 📊 Ejemplo Completo: Agregar Nueva Gráfica

```jsx
// 1. Agregar estado
const [newChartData, setNewChartData] = useState([]);

// 2. Cargar datos en loadAdminData()
setNewChartData([
  { label: 'Cat A', value: 100 },
  { label: 'Cat B', value: 150 }
]);

// 3. Agregar en renderDashboard()
<Col md={6}>
  {isLoading ? (
    <ChartSkeleton />
  ) : (
    <BarChart
      data={newChartData}
      title="Mi Nueva Gráfica"
      height={250}
    />
  )}
</Col>
```

---

## 🎓 Mejores Prácticas Aplicadas

✅ **Separación de Responsabilidades**
- Componentes de UI separados de lógica de negocio
- Hooks personalizados para lógica reutilizable

✅ **Composición sobre Herencia**
- Componentes pequeños que se combinan
- Props para personalización

✅ **Estados de Carga Explícitos**
- Skeletons durante peticiones asíncronas
- Manejo de errores con mensajes claros

✅ **Datos de Ejemplo (Mocks)**
- Desarrollo sin backend activo
- Testing de componentes aislados

✅ **Responsive Design**
- Grid system de Bootstrap
- Componentes adaptativos

---

## 📞 Soporte

Para agregar más componentes o modificar los existentes, consulta:
- `Dashboard.jsx` - Implementación completa de ejemplo
- Documentación de cada componente en su archivo `.jsx`
- Bootstrap Docs para layout y utilidades

**Recuerda:** Siempre reutiliza componentes existentes antes de crear nuevos.
