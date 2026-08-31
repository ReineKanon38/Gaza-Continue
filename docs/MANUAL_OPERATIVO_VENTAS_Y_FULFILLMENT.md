# 📖 Manual Operativo, de Ventas y Fulfillment (SYSCOM - GAZA)
**Guía Integral para la Dirección General, Operaciones y Administradores**

---

## 1. 🏢 Resumen del Modelo de Negocio: GAZA como Intermediario Oficial

La plataforma **GAZA Infraestructura TI** opera como el **intermediario comercial y tecnológico de valor agregado** entre el mayorista (**SYSCOM**) y el **Cliente Final**:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│        1. SYSCOM          │ ───► │         2. GAZA           │ ───► │     3. CLIENTE FINAL      │
│   (Mayorista / Almacén)   │      │ (Intermediario / Etiqueta)│      │  (Comprador / Destino)    │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

1. **Cliente Compra en GAZA:** El cliente adquiere productos en el catálogo web a Precio de Venta al Público (PVP) y paga con tarjeta (Stripe) o transferencia bancaria.
2. **Margen de Ganancia de GAZA:** El dinero entra a tu cuenta con tu utilidad comercial asegurada.
3. **GAZA tramita con SYSCOM:** Se solicita el producto con precio preferencial mayorista.
4. **Etiquetado e Identidad GAZA:** Se genera la etiqueta oficial de **GAZA Infraestructura TI** para que el cliente final identifique a GAZA como su proveedor de tecnología, garantía y soporte.

---

## 2. 🔄 Las 5 Fases Oficiales del Flujo de Pedido

En la plataforma, cada orden pasa por las siguientes 5 etapas visuales visibles tanto en el panel administrativo como en la pantalla de rastreo del cliente:

| Fase | Clave en Sistema | Descripción | Responsable |
| :--- | :--- | :--- | :--- |
| **Fase 1** | `supplier_received` | **Proveedor recibió el pedido:** SYSCOM recibe la solicitud de surtido de los productos. | SYSCOM |
| **Fase 2** | `in_transit` | **En camino al centro de distribución GAZA:** El producto viaja desde el almacén de SYSCOM hacia GAZA. | Paquetería / SYSCOM |
| **Fase 3** | `intermediary_received` / `intermediary_processing` | **Recibido e inspeccionado por GAZA:** GAZA valida el equipo, revisa número de serie y coloca la **Etiqueta Oficial de Envío GAZA**. | GAZA Operaciones |
| **Fase 4** | `out_for_delivery` | **En camino al Cliente Final:** El paquete es despachado con la guía de paquetería asignada. Se dispara el correo automático al cliente. | Paquetería |
| **Fase 5** | `delivered` | **Entregado al Cliente:** El paquete fue recibido y firmado por el cliente. | Cliente Final |

---

## 3. 🏷️ Distribución de Datos del Cliente y Generación de la Etiqueta GAZA

Para hacer el empaque y envío rápido y profesional, el **Panel de Administración (`/admin`)** cuenta con dos herramientas automáticas dentro del detalle de cada orden:

### A. Botón "📋 Copiar Dirección"
Con un solo clic, copia todos los datos del cliente con el formato estándar listo para pegar en el portal de SYSCOM o en la plataforma de tu paquetería (Estafeta, FedEx, DHL, Redpack):
```text
DESTINATARIO: Juan Pérez Gómez
EMAIL: juan.perez@empresa.com
TELÉFONO: 55 1234 5678
DIRECCIÓN: Av. Insurgentes Sur 1602 Interior 4B
COLONIA: Crédito Constructor
CIUDAD / ESTADO: Benito Juárez, Ciudad de México
CÓDIGO POSTAL: 03940
PAÍS: México
ORDEN DE COMPRA: ORD-1772412891
```

### B. Botón "🖨️ Imprimir Etiqueta GAZA"
Abre una ventana de impresión lista con la etiqueta oficial en formato térmico/adhesivo:
* **Encabezado:** Logotipo e Identidad de **GAZA INFRAESTRUCTURA TI**.
* **Remitente:** GAZA Centro de Distribución y Envíos (`contacto@syscomgaza.com`).
* **Destinatario Destacado:** Nombre completo, dirección desglosada, teléfono y CP del cliente en tipografía grande y legible.
* **Ficha de Contenido:** Lista detallada de productos y cantidades incluidas en la caja.
* **Código de Barras:** Identificador de orden para escaneo rápido.

---

## 4. 📚 Inventario Completo de Documentación del Sistema

A continuación se enlistan todos los documentos técnicos, operativos y de despliegue disponibles en el proyecto:

| Archivo | Ubicación | Público Objetivo | Propósito |
| :--- | :--- | :--- | :--- |
| **Manual Operativo y de Ventas** | [`docs/MANUAL_OPERATIVO_VENTAS_Y_FULFILLMENT.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/MANUAL_OPERATIVO_VENTAS_Y_FULFILLMENT.md) | Dirección / Administradores | Guía paso a paso de ventas, cobros, dropshipping y logística con SYSCOM. |
| **Manual Técnico de Arquitectura** | [`docs/MANUAL_TECNICO.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/MANUAL_TECNICO.md) | Desarrolladores / TI | Arquitectura Node.js/React, base de datos MongoDB, variables y seguridad. |
| **Guía de Despliegue en AWS** | [`docs/GUIA_DESPLIEGUE.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/GUIA_DESPLIEGUE.md) | DevOps / TI | Instalación en servidores AWS EC2/Lightsail, PM2, certificados SSL y Nginx. |
| **Checklist Cierre de Producción** | [`docs/CHECKLIST_CIERRE_PRODUCCION.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/CHECKLIST_CIERRE_PRODUCCION.md) | Operaciones / QA | Lista de verificación previa al lanzamiento comercial. |
| **Validación de Pagos Bancarios** | [`docs/CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md) | Finanzas / Contabilidad | Protocolo de validación manual para transferencias SPEI Banamex/Santander. |
| **Plan de Producción a 30 Días** | [`docs/PLAN_PRODUCCION_30_DIAS.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/PLAN_PRODUCCION_30_DIAS.md) | Gerencia de Proyecto | Estrategia de adopción, métricas de ventas y escalabilidad. |
| **Familiarización con la App** | [`docs/GUIA_FAMILIARIZACION_APLICACION.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/docs/GUIA_FAMILIARIZACION_APLICACION.md) | Nuevos Administradores | Recorrido guiado por el catálogo, carrito, perfil y panel de administración. |
| **Integración con SYSCOM** | [`backend/SYSCOM_INTEGRATION.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/backend/SYSCOM_INTEGRATION.md) | TI / Desarrolladores | Documentación técnica del consumo de la API de SYSCOM, tokens y resiliencia. |
| **Guía de Producción & Móvil** | [`PRODUCTION.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/PRODUCTION.md) | Dirección TI | Recomendaciones de memoria Swap, PM2 y roadmap para Flutter / PWA. |
| **Inicio Rápido** | [`INICIO_RAPIDO.md`](file:///c:/Users/Radic/OneDrive/Escritorio/SS/Gaza-Continue-clean/INICIO_RAPIDO.md) | Desarrolladores | Comandos rápidos para levantar el entorno local (`npm run dev`). |

---

## 5. 🔒 Seguridad y Buenas Prácticas

1. **Confirmación Previa Obligatoria:** No realizar compras ni envíos si la orden no figura como `Aprobado` (Stripe) o validada en la app de banco (SPEI).
2. **Inspección de Empaque:** Todo paquete enviado bajo el nombre de GAZA debe llevar la **Etiqueta Oficial de GAZA** para consolidar la marca y facilitar aclaraciones con paqueterías.
3. **Mantenimiento de Datos:** La dirección y teléfono del cliente están protegidos bajo estándares de privacidad y solo se usan para el despacho del pedido.
