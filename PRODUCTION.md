# Guía de Producción y Desarrollo Móvil (SYSCOM-GAZA)

Este documento detalla los pasos necesarios para llevar la aplicación web de entorno de desarrollo local (localhost) a un entorno de producción, así como la estrategia para construir la aplicación móvil en Flutter o PWA.

## 1. Escenarios fuera de localhost (Despliegue a Producción)

Para que el sistema esté disponible en internet de manera segura y escalable, se deben configurar los siguientes elementos:

### 1.1 Infraestructura (VPS o Cloud)
Se recomienda un servidor virtual (VPS) en proveedores como **DigitalOcean, AWS, Linode o Google Cloud**.
- **Backend (Node.js):**
  - Utilizar `PM2` para mantener el proceso de Node.js corriendo en segundo plano y reiniciar automáticamente si hay fallos.
  - Comando: `pm2 start src/index.js --name "gaza-backend"`
- **Frontend (React/Vite):**
  - Generar el build de producción: `npm run build`
  - Servir los archivos estáticos generados en la carpeta `dist/` usando **Nginx** o alojarlos en **Vercel / Netlify** para mayor rendimiento mediante CDN.

### 1.2 Dominio y SSL (HTTPS)
SYSCOM y Stripe **exigen** que el sitio funcione bajo `HTTPS` por seguridad.
- Adquirir un dominio (ej. `syscom-gaza.com`).
- Configurar los registros DNS (A record) apuntando a la IP del VPS.
- Instalar **Certbot (Let's Encrypt)** en el servidor para generar certificados SSL gratuitos.
  - Comando: `sudo certbot --nginx -d syscom-gaza.com`

### 1.3 Base de Datos (MongoDB)
- Si actualmente usas MongoDB local, debes migrar a **MongoDB Atlas** (Cloud) o asegurar tu instancia local:
  - Crear usuario administrador y deshabilitar acceso anónimo.
  - Habilitar autenticación (`security.authorization: enabled` en `mongod.conf`).
  - Abrir el puerto `27017` solo para la IP del servidor backend.

### 1.4 Variables de Entorno (.env)
Asegurar que el `.env` en el servidor tenga:
- `NODE_ENV=production`
- `FRONTEND_URL=https://syscom-gaza.com`
- Credenciales reales de `STRIPE_SECRET_KEY` (modo live).
- `EMAIL_USER` y `EMAIL_PASS` (Credenciales SMTP reales para enviar correos).

---

## 2. Aplicaciones Móvil (Flutter / PWA)

Existen dos vías para llevar el sistema a los celulares de los usuarios:

### Opción A: Progressive Web App (PWA) - Rápido
Dado que el frontend está en React/Vite, se puede convertir fácilmente en una PWA (aplicación web que se instala en el celular como si fuera nativa).
1. Instalar el plugin de PWA: `npm i vite-plugin-pwa`
2. Configurar `vite.config.js` para generar el `manifest.json` y el Service Worker.
3. Los usuarios podrán entrar a la web desde Chrome/Safari y presionar "Agregar a la pantalla de inicio".

### Opción B: Aplicación Nativa con Flutter (Recomendado a largo plazo)
Para publicar en **Google Play** y **App Store**:
1. **Crear proyecto en Flutter:** `flutter create gaza_app`
2. **Consumo de API:** La app móvil no se conectará directamente a MongoDB, sino que usará la **misma API (Backend en Node.js)** que ya construimos.
   - Usar paquetes como `http` o `dio` en Flutter para hacer peticiones a `https://api.syscom-gaza.com`.
3. **Autenticación (JWT):**
   - El inicio de sesión en Flutter recibirá el token JWT y lo guardará usando `flutter_secure_storage`.
   - Todas las peticiones de Flutter enviarán el token en el header: `Authorization: Bearer <token>`.
4. **Catálogo SYSCOM:**
   - Crear pantallas (Widgets) en Flutter consumiendo las rutas de `/api/syscom/search` y `/api/syscom/super-precio`.
5. **Pagos:**
   - Utilizar el paquete oficial `flutter_stripe` para integrarlo de forma segura en la app nativa.

## Resumen de próximos pasos
1. [ ] Contratar VPS y configurar Nginx.
2. [ ] Configurar dominio y certificados SSL.
3. [ ] Probar la pasarela de pagos con Stripe y SMTP en el servidor real.
4. [ ] Iniciar el proyecto de la app en Flutter conectando al backend en vivo.
