# 🚀 Guía de Despliegue en Producción - Sistema GAZA (`syscomgaza.com`)

Esta guía detalla los pasos para configurar, compilar y desplegar el **Sistema GAZA Infraestructura TI** en servidores **AWS EC2 / Lightsail** con Ubuntu 22.04 LTS, Nginx, Certificados SSL de Let's Encrypt y PM2.

---

## 1. Requisitos Previos e Infraestructura
- **Servidor:** AWS EC2 / Lightsail (Ubuntu 22.04 LTS, 1-2 vCPU, 1-2 GB RAM).
- **Memoria Swap (Recomendado 2GB):** Previene saturación de RAM durante el build de Vite.
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- **Node.js & Gestor:** Node.js v20.x / v22.x y npm v10+.
- **Servidor Web & Proxy:** Nginx con proxy inverso HTTP/2 y SSL.
- **Gestor de Procesos:** PM2.

---

## 2. Variables de Entorno de Producción

### 2.1 Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://syscomgaza.com

# Base de Datos MongoDB Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@syscom-gaza.mongodb.net/syscom-gaza?retryWrites=true&w=majority

# Autenticación JWT & Seguridad
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_REFRESH_SECRET=tu_clave_secreta_refresh_jwt_muy_segura
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# SYSCOM API Oficial
SYSCOM_API_URL=https://developers.syscom.mx/api/v1
SYSCOM_CLIENT_ID=tu_client_id_syscom
SYSCOM_CLIENT_SECRET=tu_client_secret_syscom

# Estrategia de Precios
PROFIT_MARGIN_PERCENT=15
IVA_PERCENT=16
FREE_SHIPPING_THRESHOLD_MXN=2499
STANDARD_SHIPPING_COST_MXN=185

# Pasarela Stripe (Producción Live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notificaciones Instantáneas (Telegram Bot & Email)
TELEGRAM_BOT_TOKEN=8887009732:AAEivSGboAm5kaPLSTpHkSHrqTk7OXC3hxE
TELEGRAM_CHAT_ID=-5326017751
ADMIN_EMAIL=syscom.gaza.ma9@gmail.com
```

### 2.2 Frontend (`frontend/.env`)
```env
VITE_API_URL=https://syscomgaza.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 3. Despliegue Automatizado con `deploy.sh`

El repositorio incluye el script automatizado [deploy.sh](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/deploy.sh). Para actualizar el servidor con los últimos cambios de la rama `Jerzain`:

```bash
# Conectarse por SSH a la terminal de AWS y ejecutar:
bash deploy.sh Jerzain
```

### ¿Qué hace `deploy.sh` automáticamente?
1. Realiza `git fetch` y `git checkout Jerzain` trayendo los últimos commits.
2. Instala dependencias y compila el frontend optimizado con `npm run build`.
3. Copia los archivos estáticos de `frontend/dist/` a la raíz servida por Nginx (`/var/www/html` o `/var/www/syscomgaza`).
4. Reinicia la API del backend en PM2 con cero tiempo de inactividad (`pm2 restart gaza-backend`).

---

## 4. Configuración de Nginx y Certificados SSL

### Archivo de Configuración Nginx (`/etc/nginx/sites-available/syscomgaza.com`):
```nginx
server {
    listen 80;
    server_name syscomgaza.com www.syscomgaza.com;

    root /var/www/syscomgaza/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Certificados SSL con Let's Encrypt:
```bash
sudo certbot --nginx -d syscomgaza.com -d www.syscomgaza.com
```

---

## 5. Monitoreo y Mantenimiento

- **Ver logs en tiempo real:** `pm2 logs gaza-backend`
- **Ver estado del cluster:** `pm2 status`
- **Monitorear CPU / RAM:** `pm2 monit`
- **Ver logs de acceso Nginx:** `tail -f /var/log/nginx/access.log`
- **Ver logs de error Nginx:** `tail -f /var/log/nginx/error.log`
