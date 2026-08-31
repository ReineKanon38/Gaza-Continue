# 📚 Índice Maestro de Documentación del Sistema GAZA

Este índice concentra la documentación oficial, actualizada y clasificada para operar, auditar, financiar y desplegar la plataforma **GAZA Infraestructura TI** (`syscomgaza.com`).

---

## 🏢 1. Manuales Operativos y Comerciales (Dirección y Administración)

1. [📖 Manual Operativo, Ventas y Fulfillment](MANUAL_OPERATIVO_VENTAS_Y_FULFILLMENT.md)  
   *Flujo de dropshipping mayorista SYSCOM, 5 fases del pedido, rol de GAZA como intermediario e impresión de etiquetas.*
2. [💳 Manual Pasarela Stripe y Finanzas](MANUAL_PASARELA_STRIPE_Y_FINANZAS.md)  
   *Comisiones oficiales en México (3.6% + $3 + IVA), cálculo de utilidad neta, deducciones ante el SAT y transferencias bancarias.*
3. [🏦 Manual Transferencias Bancarias Directas (SPEI)](MANUAL_TRANSFERENCIAS_BANCARIAS_SPEI.md)  
   *Recepción de transferencias Banamex/Santander, validación en app bancaria y aprobación en 1 clic desde `/admin`.*
4. [✅ Checklist de Validación de Pagos Bancarios](CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md)  
   *Protocolo antifraude y verificación de saldos.*
5. [📈 Plan de Producción a 30 Días](PLAN_PRODUCCION_30_DIAS.md)  
   *Estrategia de adopción, escalabilidad y metas comerciales.*

---

## 🛠️ 2. Manuales Técnicos y de Arquitectura (TI y Desarrolladores)

1. [📐 Manual Técnico de Arquitectura](MANUAL_TECNICO.md)  
   *Arquitectura Node.js Express 5, modelos MongoDB, Webhooks con idempotencia, notificaciones por Telegram Bot y seguridad JWT.*
2. [🚀 Guía de Despliegue en Servidores AWS](GUIA_DESPLIEGUE.md)  
   *Instalación en AWS EC2/Lightsail, configuración de Nginx, certificados SSL con Certbot, PM2 y script de despliegue `deploy.sh`.*
3. [📋 Checklist de Cierre y Verificación de Producción](CHECKLIST_CIERRE_PRODUCCION.md)  
   *Puntos críticos de auditoría previos al lanzamiento en vivo.*
4. [🧭 Guía de Familiarización con la Aplicación](GUIA_FAMILIARIZACION_APLICACION.md)  
   *Recorrido por las rutas principales, catálogo, carrito, perfil y panel de administración.*
5. [🔌 Integración Técnica SYSCOM API](../backend/SYSCOM_INTEGRATION.md)  
   *Consumo de endpoints OAuth2, sistema de resiliencia, reintentos y fallback.*
6. [📱 Producción y Roadmap de App Móvil](../PRODUCTION.md)  
   *Configuración de memoria Swap de 2GB, PM2 cluster y estrategia para PWA / Flutter.*

---

## ⚡ 3. Guías Rápidas de Inicio

* [Inicio Rápido](../INICIO_RAPIDO.md): Comandos locales para levantar frontend y backend.
* [Documentación Histórica y Legacy](legacy/README.md): Archivos de etapas previas de desarrollo.
