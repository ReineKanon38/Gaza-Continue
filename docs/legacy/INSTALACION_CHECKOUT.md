# 🚀 Instrucciones de Instalación - Nuevo Sistema de Checkout

## 📋 Prerequisitos

Asegúrate de tener instalado:
- Node.js (v16 o superior)
- MongoDB Atlas configurado
- Git

## 🔧 Instalación

### 1. Instalar Dependencias del Frontend

```powershell
cd frontend
npm install react-icons
```

**Nota**: Las siguientes dependencias ya deberían estar instaladas:
- `react-bootstrap`
- `bootstrap`
- `react-router-dom`

Si no están instaladas, ejecuta:
```powershell
npm install react-bootstrap bootstrap react-router-dom
```

### 2. Verificar Backend

El backend no requiere nuevas dependencias. Solo asegúrate de que estén instaladas:
```powershell
cd ..\backend
npm install
```

## 🗄️ Migración de Base de Datos

Si tienes órdenes existentes en la base de datos, debes migrarlas al nuevo formato:

```powershell
cd backend
node scripts/migrateOrders.js
```

Este script:
- ✅ Convierte el formato antiguo de dirección (string) al nuevo formato (objeto)
- ✅ Convierte el campo `paymentMethod` al nuevo `paymentInfo`
- ✅ Mantiene todas las órdenes existentes funcionando

## ⚙️ Configuración

### Variables de Entorno

Asegúrate de tener configurado tu `.env` en el backend:

```env
# Backend (.env)
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/gaza-syscom
JWT_SECRET=tu_secreto_jwt_super_seguro
PORT=5000
NODE_ENV=development
```

### Variables de Entorno Frontend

En `frontend/.env`:

```env
# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

## 🏃 Ejecutar la Aplicación

### 1. Iniciar Backend
```powershell
cd backend
npm run dev
```

El backend debería estar corriendo en `http://localhost:5000`

### 2. Iniciar Frontend (en otra terminal)
```powershell
cd frontend
npm run dev
```

El frontend debería estar corriendo en `http://localhost:5173`

## ✅ Verificación

### 1. Verificar que el Backend esté corriendo
Abre tu navegador y ve a:
```
http://localhost:5000/api/products
```

Deberías ver una respuesta JSON con los productos.

### 2. Verificar que el Frontend esté corriendo
Abre tu navegador y ve a:
```
http://localhost:5173
```

Deberías ver la página de inicio del sistema.

### 3. Probar el Nuevo Checkout

1. **Registra un usuario** (si no tienes uno):
   - Ve a `/register`
   - Completa el formulario

2. **Inicia sesión**:
   - Ve a `/login`
   - Ingresa tus credenciales

3. **Agrega productos al carrito**:
   - Ve a `/catalog`
   - Agrega productos al carrito

4. **Prueba el checkout**:
   - Ve a `/cart`
   - Haz clic en "Proceder al Pago"
   - Completa el formulario de dirección
   - Completa el formulario de pago
   - Confirma la orden

### Datos de Prueba

**Dirección:**
```
Calle: Avenida Reforma
Número: 123
Colonia: Centro
Ciudad: Ciudad de México
Estado: Ciudad de México
CP: 06000
```

**Tarjeta de Prueba (Visa):**
```
Número: 4111 1111 1111 1111
Titular: JUAN PEREZ
Vencimiento: 12/25
CVV: 123
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'react-icons'"
```powershell
cd frontend
npm install react-icons
```

### Error: "MongoDB connection failed"
- Verifica que tu string de conexión en `.env` sea correcto
- Asegúrate de que tu IP esté permitida en MongoDB Atlas
- Verifica que el usuario y contraseña sean correctos

### Error: "Port 5000 already in use"
- Cambia el puerto en el archivo `.env` del backend
- O detén el proceso que está usando el puerto 5000

### Los estilos no se aplican
- Asegúrate de que `Checkout.css` esté importado en `Checkout.jsx`
- Verifica que Bootstrap esté importado en `main.jsx` o `App.jsx`

### Las órdenes antiguas no se muestran
- Ejecuta el script de migración:
  ```powershell
  cd backend
  node scripts/migrateOrders.js
  ```

## 📱 Pruebas en Diferentes Dispositivos

### Desktop
- Chrome: `http://localhost:5173`
- Firefox: `http://localhost:5173`
- Edge: `http://localhost:5173`

### Mobile (con el mismo WiFi)
1. Obtén tu IP local:
   ```powershell
   ipconfig
   ```
2. Encuentra tu dirección IPv4 (ej: 192.168.1.100)
3. En tu móvil, ve a: `http://192.168.1.100:5173`

**Nota**: Asegúrate de que el backend también esté accesible desde la red local.

## 📊 Verificar la Base de Datos

### Con MongoDB Compass
1. Abre MongoDB Compass
2. Conecta usando tu string de conexión
3. Ve a la base de datos `gaza-syscom`
4. Revisa la colección `orders`
5. Verifica que las órdenes tengan el nuevo formato:
   ```json
   {
     "shippingAddress": {
       "street": "...",
       "number": "...",
       // etc
     },
     "paymentInfo": {
       "method": "...",
       "cardType": "...",
       // etc
     }
   }
   ```

### Con MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Selecciona tu cluster
3. Haz clic en "Browse Collections"
4. Selecciona `gaza-syscom` → `orders`

## 🎉 ¡Listo!

Si todo funcionó correctamente, deberías tener:
- ✅ Un carrito de compras funcional
- ✅ Un sistema de checkout al estilo Mercado Libre
- ✅ Detección automática de tipo de tarjeta
- ✅ Formularios con validación en tiempo real
- ✅ Una experiencia de usuario profesional

## 📞 Soporte

Si tienes algún problema, revisa:
1. Los logs del backend (terminal donde ejecutaste `npm run dev`)
2. La consola del navegador (F12)
3. El archivo `CHECKOUT_README.md` para más detalles

---

**¡Disfruta tu nuevo sistema de checkout!** 🎊
