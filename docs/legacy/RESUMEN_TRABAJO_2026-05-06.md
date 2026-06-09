# Reporte de Trabajo — 6 de Mayo 2026
**Proyecto:** Gaza E-Commerce  
**Rama:** `Rotsen`  
**Repositorio:** https://github.com/ReineKanon38/Gaza-Continue  

---

## Resumen Ejecutivo

Sesión de trabajo enfocada en **estabilidad de infraestructura**, **corrección de errores críticos** y **nuevas funcionalidades** de UX. Se realizaron 6 commits con un total de **443 líneas añadidas** y **138 eliminadas** en **17 archivos**.

---

## Commits del Día

| Hash | Descripción |
|------|-------------|
| `bdbe523` | fix: mostrar precio unitario separado del subtotal de línea en carrito |
| `b4eb0c0` | feat: mejorar ProductDetailModal, agregar página OrderTracking y ruta `/orders/:id` |
| `b124e9a` | feat: persistir carrito tras refresh y logout |
| `3a523cc` | fix: rutas compat en nginx para paths mixtos `/api/api/` |
| `94a338f` | fix: eliminar doble `/api` en URLs del frontend |
| `582be32` | fix: proxy nginx + trust proxy para acceso remoto LAN |

---

## Problemas Resueltos

### 🔴 Error: App inaccesible desde teléfono / red local
- **Causa:** Containers Docker detenidos + firewall de Windows bloqueando puertos en perfil "Public"
- **Solución:** `docker compose up -d` + reglas de firewall con PowerShell admin para puertos 80 y 5000 con `-Profile Public`
- **Resultado:** App accesible en `http://192.168.1.81` desde cualquier dispositivo de la red

### 🔴 Error: "is not valid JSON" al hacer login
- **Causa 1:** Nginx tenía `/api/` con trailing slash → generaba `/api/api/auth/login`
- **Causa 2:** Archivos fuente (Login, Register, Reset, Dashboard, AdminPanel) tenían `${apiUrl}/api/auth/...` cuando `apiUrl` ya era `/api`
- **Solución:** Corrección en todos los archivos fuente + rutas de compatibilidad en nginx para `/auth/` y `/api/api/`
- **Archivos modificados:** `frontend/nginx.conf`, `Login.jsx`, `Register.jsx`, `Reset.jsx`, `Dashboard.jsx`, `AdminPanel.jsx`

### 🟡 Bug: Carrito se vaciaba al hacer refresh o logout
- **Causa:** La acción `CLEAR_CART` del reducer disparaba el `useEffect` de persistencia, sobreescribiendo `localStorage` con array vacío
- **Solución:** Flag `_skipPersist` en el payload de `CLEAR_CART`. El `useEffect` verifica la flag antes de escribir. `clearCart()` del hook pasa `{ skipPersist: true }`
- **Archivos modificados:** `CartContext.jsx`, `useCartHooks.js`

### 🟡 Bug: Precio unitario no visible en el carrito
- **Causa:** La fila del producto solo mostraba `precio × cantidad`, pareciendo que el precio subía al agregar más
- **Solución:** Se añadió línea de precio unitario (`$X,XXX c/u`) en gris, y el monto grande muestra el total de la línea
- **Archivo modificado:** `Cart.jsx`

---

## Nuevas Funcionalidades

### ✅ ProductDetailModal — Rediseño completo
**Archivo:** `frontend/src/components/ProductDetailModal.jsx`

**Antes:** Modal básico de 68 líneas, solo texto e imagen pequeña, sin interacción.

**Ahora:**
- Imagen grande con fondo neutro y fallback emoji 📦
- Precio con descuento tachado + badge porcentaje (ej. `-20%`)
- Ahorro en texto verde (`Ahorras $X,XXX MXN`)
- **Tabs:**
  - *Descripción* — texto del producto
  - *Especificaciones* — tabla scrollable con atributos si están disponibles
  - *Información* — ID/SKU, categoría, proveedor (SYSCOM), comercializador (GAZA)
- Badges de estado: `Super Precio`, `Últimas X piezas`, `Disponible` / `Sin stock`
- **Selector de cantidad** con botones −/+ respetando stock máximo
- **Botón "Agregar al carrito"** con hook `useCartHelpers` — si ya está en carrito muestra la cantidad actual
- Modal tamaño `xl` para mejor visibilidad en pantallas grandes

---

### ✅ Página de Rastreo de Pedido — Nueva
**Archivo:** `frontend/src/pages/OrderTracking.jsx`  
**Ruta:** `/orders/:id`

Página dedicada para el seguimiento individual de cada pedido, accesible desde el perfil del usuario.

**Secciones:**
1. **Cabecera** — Número de orden, fecha, badges de estado (pendiente/en proceso/completado/cancelado), estado de pago, badge GAZA. Número de guía si está asignado.
2. **Timeline visual** — 5 etapas con iconos, estado completado en verde, etapa actual marcada con badge azul "Actual", timestamps del historial de cada etapa:
   - 🏪 Proveedor recibió el pedido (SYSCOM)
   - 🚚 En camino a GAZA
   - 📦 Recibido por GAZA
   - 🚚 En camino al cliente
   - 👤 Entregado
3. **Lista de productos** — imagen, nombre, cantidad, total de línea
4. **Dirección de envío** — datos completos del destino

**Integración con Profile:** Se añadió botón 🚚 al lado de cada número de orden en la sección "Rastreo de Paquetes" del perfil que navega a `/orders/:id`.

---

### ✅ Ruta nueva en App.jsx
```jsx
<Route path="/orders/:id" element={<OrderTracking />} />
```
Ruta protegida (requiere autenticación).

---

## Archivos Modificados — Detalle

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `frontend/nginx.conf` | fix | Rutas compat `/auth/`, `/api/api/` + trust proxy |
| `frontend/src/App.jsx` | feat | Import + ruta `/orders/:id` |
| `frontend/src/components/ProductDetailModal.jsx` | feat | Rediseño completo con carrito, tabs, specs |
| `frontend/src/context/CartContext.jsx` | fix | Flag `_skipPersist` en `CLEAR_CART` |
| `frontend/src/hooks/useCartHooks.js` | fix | `clearCart()` pasa `skipPersist: true` |
| `frontend/src/pages/Cart.jsx` | fix | Precio unitario + total de línea separados |
| `frontend/src/pages/OrderTracking.jsx` | feat | **Archivo nuevo** — página de rastreo |
| `frontend/src/pages/Profile.jsx` | feat | Link 🚚 a `/orders/:id` por cada orden |
| `frontend/src/pages/Login.jsx` | fix | Eliminar doble `/api` en URL |
| `frontend/src/pages/Register.jsx` | fix | Eliminar doble `/api` en URL |
| `frontend/src/pages/Reset.jsx` | fix | Eliminar doble `/api` en URL |
| `frontend/src/pages/Dashboard.jsx` | fix | Eliminar doble `/api` en URL |
| `frontend/src/pages/AdminPanel.jsx` | fix | Eliminar doble `/api` en URL |
| `backend/src/app.js` | fix | `trust proxy` para Express detrás de nginx |
| `backend/src/controllers/authController.js` | fix | Limpieza validaciones |
| `docker-compose.yml` | fix | Build args, healthchecks, restart policy |

---

## Estado de Features — Checklist Final

| Feature | Estado |
|---------|--------|
| Acceso LAN (teléfono/PC) vía `http://192.168.1.81` | ✅ Completo |
| Login/Register sin error JSON | ✅ Completo |
| Carrito persiste tras refresh y logout | ✅ Completo |
| Autocompletar dirección por CP (zippopotam.us) | ✅ Ya existía |
| Dirección de envío persistida para recompra | ✅ Ya existía |
| ProductDetailModal con carrito y especificaciones | ✅ Completo |
| Página de rastreo de pedido `/orders/:id` | ✅ Completo |
| Marca GAZA en órdenes (backend) | ✅ Ya existía |
| Precio unitario vs subtotal de línea en carrito | ✅ Completo |

---

## Infraestructura

- **Frontend:** React 19 + Vite + Bootstrap 5 → Nginx 1.27-alpine (puerto 80)
- **Backend:** Node.js 20 + Express + MongoDB Atlas → Docker (puerto 5000)
- **Política de reinicio:** `restart: unless-stopped` en ambos servicios
- **Docker Desktop:** Configurar "Start on login" para arranque automático con Windows

### Capturas recomendadas para adjuntar
> Tomar en `http://192.168.1.81` con Ctrl+Shift+R (sin caché)

1. **Catálogo** → abrir modal de producto → mostrar tabs + precio + botón carrito
2. **Carrito** → con 2+ unidades del mismo producto → verificar precio c/u vs subtotal
3. **Perfil** → sección "Rastreo de Paquetes" → clic en ícono 🚚 de una orden
4. **OrderTracking** `/orders/:id` → timeline de etapas con historial

---

*Reporte generado el 6 de Mayo 2026*
