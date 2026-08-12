#!/bin/bash
# ============================================================
#  deploy.sh — Script de deploy para SYSCOM-GAZA en AWS
#  Uso: bash deploy.sh [rama]
#  Sin argumento: usa la rama actual automáticamente
# ============================================================

set -e  # Detener si cualquier comando falla

BRANCH=${1:-$(git -C ~/Gaza-Continue rev-parse --abbrev-ref HEAD)}  # Auto-detecta la rama actual
REPO_DIR=~/Gaza-Continue
FRONTEND_DIR=$REPO_DIR/frontend
BACKEND_DIR=$REPO_DIR/backend
NGINX_ROOT=/var/www/gaza


# ── Colores para output ──────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

log()  { echo -e "${GREEN}[✔] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
fail() { echo -e "${RED}[✘] $1${NC}"; exit 1; }

echo ""
echo "🚀 ============================================"
echo "   SYSCOM-GAZA — Deploy automático"
echo "   Rama: $BRANCH"
echo "============================================"
echo ""

# ── 1. Pull del código más reciente ────────────────────────
log "Actualizando código desde GitHub ($BRANCH)..."
cd $REPO_DIR
git fetch origin
git stash                           # Guarda cambios locales del servidor
git checkout $BRANCH
git pull origin $BRANCH
log "Código actualizado"

# ── 2. Dependencias del backend ─────────────────────────────
log "Instalando dependencias del backend..."
cd $BACKEND_DIR
npm install --omit=dev
log "Dependencias backend listas"

# ── 3. Build del frontend ────────────────────────────────────
log "Construyendo frontend (React + Vite)..."
cd $FRONTEND_DIR
npm install
npm run build
log "Build frontend completado"

# ── 4. Publicar en Nginx ─────────────────────────────────────
log "Copiando build a $NGINX_ROOT..."
sudo cp -r $FRONTEND_DIR/dist/* $NGINX_ROOT/
sudo chown -R www-data:www-data $NGINX_ROOT 2>/dev/null || true
log "Archivos publicados en Nginx"

# ── 5. Reload Nginx ──────────────────────────────────────────
log "Recargando Nginx..."
sudo systemctl reload nginx
log "Nginx recargado"

# ── 6. Reiniciar backend (PM2) ───────────────────────────────
log "Reiniciando backend con PM2..."
cd $BACKEND_DIR
pm2 restart all --update-env
log "Backend reiniciado"

# ── Resumen ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================"
echo "   ✅ Deploy completado exitosamente"
echo "   Rama desplegada: $BRANCH"
echo "   URL: http://$(curl -s ifconfig.me 2>/dev/null || echo 'tu-ip')"
echo -e "============================================${NC}"
echo ""
