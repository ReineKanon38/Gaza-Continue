# Guía de Despliegue en Producción - Sistema Gaza

Esta guía detalla los pasos requeridos para configurar, compilar y desplegar el **Sistema Gaza E-Commerce** en un entorno de producción (servidor VPS Linux, hosting de aplicaciones o nube corporativa), garantizando estabilidad y seguridad.

---

## 1. Requisitos Previos del Servidor
- **Sistema Operativo:** Ubuntu Server 22.04 LTS o superior (recomendado) o Windows Server.
- **Entorno de Ejecución:** Node.js v20.x o superior.
- **Gestor de Paquetes:** npm v10.x o superior.
- **Base de Datos:** Instancia de MongoDB Atlas (Cloud) o servidor local de MongoDB configurado.
- **Servidor Web:** Nginx (como proxy inverso y servidor estático).
- **Gestor de Procesos:** PM2 (para mantener la API de Node.js corriendo continuamente en segundo plano).

---

## 2. Configuración y Despliegue de la API Backend

### Paso 1: Clonar y Preparar el Backend
Navega a la carpeta del backend e instala las dependencias de producción únicamente:
```bash
cd backend
npm install --omit=dev
```

### Paso 2: Crear el Archivo de Entorno (`.env`)
Crea un archivo `.env` en la raíz de la carpeta `backend/` y configura las variables reales para producción:
```env
# Servidor y Entorno
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio-ecommerce.com

# Base de Datos (MongoDB Atlas)
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/gaza-prod?retryWrites=true&w=majority

# Seguridad JWT
JWT_SECRET=un_secreto_muy_largo_y_complejo_generado_con_crypto
JWT_REFRESH_SECRET=otro_secreto_muy_largo_y_diferente
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
JWT_MAX_REFRESH_SESSIONS=20

# Credenciales de SYSCOM API
SYSCOM_API_URL=https://developers.syscom.mx/api/v1
SYSCOM_CLIENT_ID=client_id_real_de_produccion
SYSCOM_API_KEY=api_key_real_de_produccion
```
> [!CAUTION]
> Asegúrate de que este archivo `.env` tenga permisos restrictivos en el servidor (`chmod 600 .env`) y nunca se suba al sistema de control de versiones.

### Paso 3: Arrancar el Backend con PM2
PM2 monitoriza la aplicación y la reinicia automáticamente si se cae:
```bash
# Instalar PM2 de forma global si no está instalado
npm install -g pm2

# Arrancar la API
pm2 start index.js --name "gaza-backend"

# Configurar PM2 para que se inicie con el arranque del sistema
pm2 startup
pm2 save
```

---

## 3. Configuración y Despliegue del Frontend (Vite/React)

### Paso 1: Configurar Variables de Entorno del Frontend
En la raíz de la carpeta `frontend/`, crea un archivo `.env` apuntando a la URL pública de la API de producción:
```env
VITE_API_URL=https://api.tu-dominio-ecommerce.com
```

### Paso 2: Generar el Build de Producción
Ejecuta el script de compilación para que Vite empaquete, minifique y optimice todos los recursos estáticos (HTML, JS, CSS):
```bash
cd frontend
npm install
npm run build
```
Esto creará una carpeta llamada `dist/` en la raíz de `frontend/` que contiene todos los archivos estáticos listos para producción.

### Paso 3: Configurar Nginx para Servir el Frontend
Configura Nginx para que sirva el frontend estático y actúe como proxy inverso para la API del backend.

Crea un archivo de configuración en `/etc/nginx/sites-available/gaza-ecommerce`:
```nginx
server {
    listen 80;
    server_name tu-dominio-ecommerce.com www.tu-dominio-ecommerce.com;

    # Directorio de los archivos estáticos del frontend
    root /var/www/gaza-ecommerce/frontend/dist;
    index index.html;

    # Soporte para React Router (redirección a index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirección de las llamadas de la API al Backend corriendo en PM2 (puerto 5000)
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Habilita el sitio y reinicia Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/gaza-ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4. Certificados SSL (HTTPS)
Para producción es indispensable asegurar la comunicación con HTTPS. Usa Let's Encrypt (Certbot) para generar certificados SSL gratuitos:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio-ecommerce.com -d www.tu-dominio-ecommerce.com
```
Certbot actualizará automáticamente la configuración de Nginx para redirigir todo el tráfico HTTP a HTTPS de manera segura.

---

## 5. Playbook de Monitoreo y Rollback

### Monitoreo en Tiempo Real
- **Ver logs del Backend:** `pm2 logs gaza-backend`
- **Monitorear recursos (CPU/RAM):** `pm2 monit`
- **Logs de Nginx (Errores de conexión):** `tail -f /var/log/nginx/error.log`

### Estrategia de Rollback (Retorno a versión anterior)
Si una actualización en producción falla y necesitas volver a la versión estable anterior inmediatamente, ejecuta los siguientes comandos en el servidor:

```bash
# 1. Volver al commit estable anterior en Git
git checkout <hash_commit_estable_anterior>

# 2. Re-construir el frontend
cd frontend
npm install
npm run build

# 3. Reiniciar el backend en PM2
cd ../backend
npm install --omit=dev
pm2 restart gaza-backend

# 4. Limpiar caché del proxy inverso
sudo systemctl restart nginx
```
Esto restaurará la aplicación al último estado funcional documentado en menos de 2 minutos.
