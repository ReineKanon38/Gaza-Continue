# 🛡️ Sistema de Roles - Panel de Administrador

## ✅ Configuración Completada

### Usuario Administrador Creado
- **Nombre:** Rotsen Leon
- **Email:** rotsenleon38@gmail.com
- **Rol:** admin

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Roles
El sistema ahora diferencia entre dos tipos de usuarios:
- **`user`** (Usuario Regular): Acceso al catálogo y funciones de compra
- **`admin`** (Administrador): Acceso completo al panel administrativo

### 2. Redirección Automática
Al iniciar sesión, el sistema redirige automáticamente según el rol:
- **Admins** → `/admin` (Panel de Administrador)
- **Users** → `/catalog` (Catálogo de Productos)

### 3. Panel de Administrador
Ubicación: `frontend/src/pages/AdminPanel.jsx`

Incluye:
- **Dashboard**: Estadísticas generales (órdenes, productos, usuarios, ingresos)
- **Gestión de Órdenes**: Ver y administrar todas las órdenes
- **Gestión de Productos**: Agregar, editar y eliminar productos
- **Gestión de Usuarios**: Administrar usuarios del sistema
- **Configuración**: Ajustes del sistema

### 4. Navegación Mejorada
- Los administradores ven un enlace "Admin" en el navbar
- El icono ⚙️ (`FiSettings`) indica acceso administrativo
- Solo visible para usuarios con rol `admin`

## 🚀 Cómo Usar

### Iniciar Sesión como Admin
1. Ve a `/login`
2. Ingresa:
   - **Email:** rotsenleon38@gmail.com
   - **Contraseña:** (tu contraseña actual)
3. Serás redirigido automáticamente al panel de administrador

### Navegar en el Panel
El panel tiene un sidebar con 5 secciones:
- 📊 **Dashboard**: Vista general de estadísticas
- 🛒 **Órdenes**: Gestión de pedidos
- 📦 **Productos**: Gestión de catálogo
- 👥 **Usuarios**: Gestión de usuarios
- ⚙️ **Configuración**: Ajustes del sistema

### Ver el Catálogo (como Admin)
Desde el panel de admin, haz clic en "📦 Ver Catálogo" en el sidebar para acceder al catálogo de productos.

## 🔧 Agregar Más Administradores

### Opción 1: Ejecutar el Script (Recomendado)
```bash
cd backend
node scripts/makeAdmin.js
```
Luego edita el script para cambiar el email en la constante `ADMIN_EMAIL`.

### Opción 2: Modificar Directamente en MongoDB
```javascript
db.users.updateOne(
  { email: "nuevo-admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Opción 3: Crear Script para Email Dinámico
```bash
cd backend
node scripts/makeAdmin.js correo@ejemplo.com
```

## 📁 Archivos Modificados

### Backend
- ✅ `models/User.js` - Ya tenía el campo `role`
- ✅ `controllers/authController.js` - Ya incluía `role` en JWT y respuestas
- ✅ `scripts/makeAdmin.js` - Script para asignar rol admin

### Frontend
- ✅ `context/AuthContext.jsx` - Agregado método `isAdmin()`
- ✅ `pages/AdminPanel.jsx` - Panel de administrador completo
- ✅ `pages/AdminPanel.css` - Estilos del panel
- ✅ `pages/Login.jsx` - Redirección según rol
- ✅ `components/AppNavbar.jsx` - Enlace Admin visible solo para admins
- ✅ `App.jsx` - Ruta `/admin` agregada

## 🎨 Características del Panel

### Dashboard
- **Tarjetas de Estadísticas**: Órdenes, Productos, Usuarios, Ingresos
- **Tabla de Órdenes Recientes**: Vista rápida de las últimas órdenes
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla

### Estilo Visual
- **Gradiente de Fondo**: Tono azul grisáceo profesional
- **Sidebar Sticky**: Se mantiene visible al hacer scroll
- **Animaciones**: Efectos hover suaves en las tarjetas
- **Tema Consistente**: Colores que coinciden con el navbar

## 🔒 Seguridad

### Protección Frontend
- Verificación de rol en `AdminPanel.jsx`
- Redirección automática si el usuario no es admin
- Enlaces visibles solo para usuarios autorizados

### Protección Backend (Recomendación)
Para producción, deberías crear un middleware de autorización:

```javascript
// backend/src/middleware/adminAuth.js
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};
```

Luego aplicarlo a rutas sensibles:
```javascript
router.get('/api/admin/users', authenticate, requireAdmin, getUsersController);
```

## 📝 Próximos Pasos

### Desarrollo del Panel
Los módulos están preparados pero necesitan implementación:
1. **Órdenes**: Conectar con `/api/orders` para ver todas las órdenes
2. **Productos**: Crear CRUD completo con Syscom
3. **Usuarios**: Listar usuarios y cambiar roles
4. **Configuración**: Ajustes de la tienda (descuentos, envío, etc.)

### Endpoints Backend Sugeridos
```javascript
// Ejemplo de endpoints que podrías necesitar
GET    /api/admin/stats          // Estadísticas generales
GET    /api/admin/orders         // Todas las órdenes
PATCH  /api/admin/orders/:id     // Actualizar estado de orden
GET    /api/admin/users          // Todos los usuarios
PATCH  /api/admin/users/:id/role // Cambiar rol de usuario
```

## 🐛 Solución de Problemas

### El usuario no puede acceder al panel
1. Verifica que el rol sea `admin` en MongoDB
2. Cierra sesión y vuelve a iniciar
3. Revisa la consola del navegador por errores

### El enlace "Admin" no aparece
1. Asegúrate de que el usuario tenga `role: 'admin'`
2. Verifica que `isAdmin()` esté importado en `AppNavbar.jsx`
3. Limpia la caché del navegador

### Error al ejecutar el script
1. Verifica que MongoDB esté corriendo
2. Confirma la variable `MONGODB_URI` en `.env`
3. Asegúrate de que el usuario exista en la base de datos

## 📧 Contacto y Soporte

Para agregar más funcionalidades al panel de administrador o modificar permisos, contacta al equipo de desarrollo.

---

**Nota**: Este es un panel básico funcional. Para producción, considera agregar:
- Paginación en las tablas
- Filtros y búsqueda avanzada
- Exportación de reportes
- Logs de auditoría
- Autenticación de dos factores para admins
