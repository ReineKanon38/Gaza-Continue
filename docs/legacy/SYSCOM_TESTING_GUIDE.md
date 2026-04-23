# 🧪 Guía de Pruebas - API SYSCOM

## ✅ Estado Actual

**Backend**: ✅ Corriendo en http://localhost:5000  
**Frontend**: ✅ Corriendo en http://localhost:5173  
**SYSCOM**: ✅ Credenciales configuradas  
**Usuario Admin**: ✅ Creado (usar credenciales locales de desarrollo)

---

## 🔐 Credenciales Configuradas

```dotenv
SYSCOM_CLIENT_ID=<CONFIGURAR_EN_ENTORNO_LOCAL>
SYSCOM_API_KEY=<CONFIGURAR_EN_ENTORNO_LOCAL>
```

---

## 🚀 Cómo Probar SYSCOM

### Opción 1: Desde el Navegador (Recomendado)

1. **Abrir** http://localhost:5173
2. **Login** con:
  - Email: tu email admin local
  - Password: tu password admin local
3. **Navegar** al panel de administración
4. **Buscar** productos (si hay una sección de SYSCOM)

---

### Opción 2: Usando Postman

#### Paso 1: Obtener Token JWT

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "TU_EMAIL_ADMIN",
  "password": "TU_PASSWORD_ADMIN"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Admin SYSCOM",
    "email": "TU_EMAIL_ADMIN",
    "role": "admin"
  }
}
```

Copia el `token`.

#### Paso 2: Buscar Productos en SYSCOM

**Request:**
```
GET http://localhost:5000/api/syscom/search?query=mouse&limit=5
Authorization: Bearer TU_TOKEN_AQUI
```

**Response esperada:**
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1
}
```

---

### Opción 3: Usando curl (Terminal)

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"TU_EMAIL_ADMIN","password":"TU_PASSWORD_ADMIN"}'

# 2. Copiar el token de la respuesta

# 3. Buscar productos
curl "http://localhost:5000/api/syscom/search?query=laptop&limit=5" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📋 Endpoints SYSCOM Disponibles

### 1. Buscar Productos
```
GET /api/syscom/search
Query Params:
  - query (string): Término de búsqueda
  - brand (string): Filtrar por marca
  - category (string): Filtrar por categoría
  - page (int): Número de página
  - limit (int): Productos por página

Headers:
  - Authorization: Bearer {token}
```

### 2. Obtener Categorías
```
GET /api/syscom/categories
Headers:
  - Authorization: Bearer {token}
```

### 3. Obtener Marcas
```
GET /api/syscom/brands
Headers:
  - Authorization: Bearer {token}
```

### 4. Sincronizar Producto (Admin Only)
```
POST /api/syscom/sync
Headers:
  - Authorization: Bearer {token}
Body:
{
  "syscomId": "ABC123"
}
```

### 5. Sincronizar Múltiples (Admin Only)
```
POST /api/syscom/sync-multiple
Headers:
  - Authorization: Bearer {token}
Body:
{
  "syscomIds": ["ABC123", "XYZ789"]
}
```

### 6. Sincronizar Todos (Admin Only)
```
POST /api/syscom/sync-all
Headers:
  - Authorization: Bearer {token}
```

---

## 🔧 Implementación Actual

### Cliente SYSCOM Mejorado

El cliente ahora implementa:

1. **OAuth2 Flow**: Intenta obtener access token usando client credentials
2. **Fallback**: Si OAuth2 falla, usa client_secret directamente como Bearer token
3. **Token Refresh**: Auto-refresh del token cuando expira (401)
4. **Retry Logic**: Reintenta automáticamente con nuevo token si falla

### Flujo de Autenticación

```
1. Usuario hace request a /api/syscom/search
   ↓
2. Middleware requireAuth valida JWT token
   ↓
3. syscomClient.ensureValidToken() verifica token SYSCOM
   ↓
4. Si no hay token o expiró:
   - Intenta POST /token con client_credentials
   - Si falla, usa client_secret como Bearer
   ↓
5. Agrega Authorization: Bearer {syscom_token}
   ↓
6. Hace request a SYSCOM API
   ↓
7. Si 401: invalida token, refresca, reintenta
```

---

## 🐛 Troubleshooting

### Problema: "Token inválido"

**Causa**: JWT token de tu sistema está mal o expiró

**Solución**:
1. Hacer login de nuevo
2. Copiar el token fresco
3. Usarlo en el header `Authorization: Bearer {token}`

### Problema: SYSCOM devuelve 401

**Causa**: Credenciales de SYSCOM inválidas o API cambió

**Solución**:
1. Verificar en https://developers.syscom.mx que las credenciales sean correctas
2. Ver logs del backend: `SYSCOM API Error: 401 {...}`
3. Contactar soporte de SYSCOM si persiste

### Problema: "No autenticado"

**Causa**: No se envió el header Authorization

**Solución**:
```
Agregar header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Problema: "Se requiere rol 'admin'"

**Causa**: El endpoint requiere rol admin y tu usuario es 'user'

**Solución**:
- Usar la cuenta `admin@syscom.com` que ya tiene rol admin
- O actualizar tu usuario a admin en la BD

Nota: evita documentar passwords reales en repositorios.

---

## 📊 Estado de Implementación

| Componente | Estado | Detalles |
|-----------|--------|----------|
| Backend SYSCOM Client | ✅ | OAuth2 + fallback implementado |
| Autenticación JWT | ✅ | Login/register funcionando |
| Endpoints SYSCOM | ✅ | 8 endpoints disponibles |
| Usuario Admin | ✅ | cuenta admin local creada |
| Credenciales SYSCOM | ✅ | Configuradas en .env |
| Frontend | ✅ | Corriendo en localhost:5173 |
| Documentación | ✅ | Este archivo |

---

## 🎯 Próximos Pasos

1. **Probar en navegador**: Más fácil para ver la interfaz
2. **Verificar con SYSCOM**: Asegurar que las credenciales son válidas
3. **Implementar UI**: Agregar sección en AdminPanel para buscar productos SYSCOM
4. **Sincronización**: Importar productos de SYSCOM a tu BD

---

## 📞 Soporte

Si SYSCOM sigue dando 401, es probable que:

1. Las credenciales necesiten activación en el dashboard de SYSCOM
2. El endpoint de autenticación de SYSCOM haya cambiado
3. Se requiera IP whitelisting o configuración adicional

**Contacta a SYSCOM**: https://developers.syscom.mx/support

---

**Última actualización**: 22 Enero 2026  
**Estado**: ✅ Sistema listo para pruebas
