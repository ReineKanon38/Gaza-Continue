# Guia de Familiarizacion de la Aplicacion

Objetivo: que un miembro nuevo del equipo entienda el sistema en 60-90 minutos.

## Ruta sugerida (90 min)

1. Contexto general (10 min)
- Leer [README.md](../README.md)
- Leer [INICIO_RAPIDO.md](../INICIO_RAPIDO.md)

2. Flujo de negocio principal (20 min)
- Usuario navega catalogo y agrega productos
- Checkout registra orden con pago bancario
- Orden queda con pago pendiente de validacion
- Admin aprueba/rechaza pago
- Orden avanza a procesamiento/completada o se cancela

3. Flujo operativo de pagos (15 min)
- Leer [CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md](../CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md)

4. Estructura tecnica minima (20 min)
- Backend: rutas, controladores y modelos
- Frontend: paginas principales y servicios

5. Validacion practica (25 min)
- Levantar backend y frontend
- Crear una orden de prueba
- Validar/rechazar pago desde admin
- Confirmar transiciones de estado

## Mapa rapido del codigo

Backend:
- Modelo de orden: [backend/src/models/Order.js](../backend/src/models/Order.js)
- Logica de ordenes: [backend/src/controllers/orderController.js](../backend/src/controllers/orderController.js)
- Rutas de ordenes: [backend/src/routes/orders.js](../backend/src/routes/orders.js)
- Rutas de pago: [backend/src/routes/payment.js](../backend/src/routes/payment.js)

Frontend:
- Checkout: [frontend/src/pages/Checkout.jsx](../frontend/src/pages/Checkout.jsx)
- Admin: [frontend/src/pages/AdminPanel.jsx](../frontend/src/pages/AdminPanel.jsx)
- Servicio de ordenes: [frontend/src/services/orderService.js](../frontend/src/services/orderService.js)
- Servicio de pagos: [frontend/src/services/paymentService.js](../frontend/src/services/paymentService.js)

## Criterios para decir "ya estoy familiarizado"

- Entiendo diferencia entre estado de pago y estado de orden.
- Puedo ejecutar una prueba end-to-end del flujo bancario.
- Puedo ubicar rapidamente archivos clave de backend y frontend.
- Puedo explicar como operar el panel admin para validacion de pagos.
