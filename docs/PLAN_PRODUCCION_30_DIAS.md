# Plan de Produccion 30 Dias

## Objetivo

Dejar la aplicacion lista para produccion, con documentacion completa, evidencia de estado y checklist de cierre tecnico.

## Semana 1: Estabilidad y seguridad

- Completar refresh token en todos los flujos.
- Unificar servicios frontend al cliente HTTP comun.
- Verificar proteccion de rutas admin y expiracion de sesion.
- Ejecutar bateria base: build frontend, tests backend, smoke de docker.

Entregables:

- Flujo de autenticacion estable con renovacion automatica.
- Pipeline CI activo con pruebas/build.
- Reporte de errores criticos corregidos.

## Semana 2: Datos y rendimiento

- Endurecer sincronizacion SYSCOM con reintentos y fallback.
- Consolidar busqueda aproximada y por distribuidor.
- Mejorar tiempos en endpoints de catalogo y carga incremental.
- Preparar estrategia de sincronizacion continua (job/cola).

Entregables:

- Reporte de rendimiento de catalogo.
- Evidencia de sincronizacion masiva controlada.

## Semana 3: UX final y pruebas E2E

- Revisar navegacion mobile completa.
- Eliminar rutas o botones duplicados.
- Pruebas funcionales end-to-end en login, catalogo, carrito, checkout y admin.
- Validar mensajes de error y recuperacion.

Entregables:

- Checklist UX completado.
- Matriz de pruebas funcionales con resultados.

## Semana 4: Cierre de produccion y documentacion

- Documentacion tecnica final (arquitectura, flujos, despliegue, respaldo).
- Evidencias finales: capturas, reportes de estado, historial de cambios.
- Checklist de release, rollback y monitoreo.
- Ensayo general de despliegue.

Entregables:

- Paquete de cierre del proyecto.
- Release candidate listo para despliegue.

## Criterio de salida

- Sin errores bloqueantes en pruebas criticas.
- Build y CI en verde.
- Documentacion completa y validada.
- Checklist de release al 100%.
