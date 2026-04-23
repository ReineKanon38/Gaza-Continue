# 👥 Usuarios Administradores - SYSCOM-GAZA

## 📋 Descripción

Este documento contiene la información de los usuarios administradores del sistema SYSCOM-GAZA. Estos usuarios tienen acceso completo al panel de administración para gestionar órdenes, productos y usuarios.

---

## 👤 Administrador 1: Wilberth

### Credenciales de Acceso
| Campo | Valor |
|-------|-------|
| **Nombre** | Wilberth |
| **Email** | wilberth@syscom-gaza.com |
| **Contraseña** | admin123 |
| **Teléfono** | 3331234567 |
| **Rol** | Administrador |

### Datos en la Base de Datos
```json
{
  "_id": "ObjectId",
  "name": "Wilberth",
  "email": "wilberth@syscom-gaza.com",
  "password": "hash_bcrypt_generado",
  "role": "admin",
  "phone": "3331234567",
  "createdAt": "2026-01-16T08:25:00Z"
}
```

### Permisos
- ✅ Ver y gestionar órdenes
- ✅ Aprobar/rechazar órdenes pendientes
- ✅ Ver todos los usuarios del sistema
- ✅ Cambiar roles de usuarios
- ✅ Crear, editar y eliminar productos
- ✅ Ver estadísticas y reportes del dashboard

---

## 👤 Administrador 2: Brandon

### Credenciales de Acceso
| Campo | Valor |
|-------|-------|
| **Nombre** | Brandon |
| **Email** | brandon@syscom-gaza.com |
| **Contraseña** | admin123 |
| **Teléfono** | 3331234568 |
| **Rol** | Administrador |

### Datos en la Base de Datos
```json
{
  "_id": "ObjectId",
  "name": "Brandon",
  "email": "brandon@syscom-gaza.com",
  "password": "hash_bcrypt_generado",
  "role": "admin",
  "phone": "3331234568",
  "createdAt": "2026-01-16T08:25:00Z"
}
```

### Permisos
- ✅ Ver y gestionar órdenes
- ✅ Aprobar/rechazar órdenes pendientes
- ✅ Ver todos los usuarios del sistema
- ✅ Cambiar roles de usuarios
- ✅ Crear, editar y eliminar productos
- ✅ Ver estadísticas y reportes del dashboard

---

## 🔐 Seguridad

### Notas Importantes
1. **Contraseñas Hasheadas**: Las contraseñas se almacenan hasheadas con bcrypt en la base de datos, no en texto plano
2. **Acceso al Panel**: Los administradores acceden a través de http://localhost:5173/admin
3. **Autenticación JWT**: Se utiliza JWT para mantener sesiones seguras
4. **Cambio de Contraseña**: Se recomienda cambiar las contraseñas por defecto en un entorno de producción

### Cómo Cambiar la Contraseña
Aunque no existe un endpoint dedicado en esta versión, puedes actualizar la contraseña directamente en MongoDB:

```javascript
// En MongoDB
db.users.updateOne(
  { email: "wilberth@syscom-gaza.com" },
  { $set: { password: newHashedPassword } }
);
```

---

## 🚀 Cómo Iniciar Sesión

### Paso 1: Navegar al Login
- Ve a http://localhost:5173/login

### Paso 2: Ingresar Credenciales
```
Email: wilberth@syscom-gaza.com (o brandon@syscom-gaza.com)
Contraseña: admin123
```

### Paso 3: Acceder al Panel
- Una vez autenticado, ve a http://localhost:5173/admin
- El sistema detectará automáticamente que eres administrador

---

## 📊 Panel de Administración

Una vez dentro del panel, dispondrás de:

### 📦 Gestión de Órdenes
- Ver todas las órdenes del sistema
- Aprobar órdenes pendientes
- Rechazar órdenes
- Marcar órdenes como completadas
- Ver detalles completos de cada orden

### 📝 Gestión de Productos
- Ver catálogo completo
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Monitorear stock

### 👥 Gestión de Usuarios
- Ver todos los usuarios registrados
- Cambiar roles (cliente ↔ admin)
- Ver detalles de usuarios
- Eliminar usuarios (excepto ti mismo)

### 📈 Dashboard
- Estadísticas de órdenes, productos y usuarios
- Ingresos totales
- Gráficos de productos más vendidos
- Análisis de ventas por categoría
- Tendencias mensuales

---

## 📅 Historial de Creación

| Fecha | Evento |
|-------|--------|
| 2026-01-16 | Creación de usuarios administradores: Wilberth y Brandon |
| 2026-01-16 | Script ejecutado: `backend/scripts/createAdmins.js` |

---

## 🔗 Enlaces Útiles

- **Aplicación**: http://localhost:5173
- **Login**: http://localhost:5173/login
- **Panel Admin**: http://localhost:5173/admin
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

---

## 📞 Soporte

Para cambiar contraseñas, crear más administradores o realizar cambios en los permisos, contacta al equipo de desarrollo.

Script disponible: `backend/scripts/createAdmins.js`

---

**Última actualización**: 16 de Enero de 2026
