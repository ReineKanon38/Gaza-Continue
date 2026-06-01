# Checklist de Cierre a Produccion

## 1) Seguridad

- [x] JWT access + refresh con rotacion habilitado.
- [ ] Revocacion de sesiones validada en logout.
- [ ] Variables sensibles solo por entorno.
- [x] CORS y rate limit validados para despliegue.

## 2) Calidad de codigo

- [x] Frontend build exitoso.
- [x] Frontend lint sin errores criticos.
- [x] Backend test suite en verde.
- [ ] No hay errores en rutas principales.

## 3) Integracion de datos

- [x] Busqueda por nombre/distribuidor validada.
- [x] Sincronizacion SYSCOM estable.
- [x] Carga incremental de catalogo funcional.
- [ ] MongoDB con indices revisados para consultas clave.

## 4) UX y navegacion

- [x] Navbar mobile tipo hamburguesa final.
- [x] Botones de regreso/inicio en mobile.
- [x] No hay accesos redundantes al catalogo.
- [x] Flujo de compra sin recargas completas innecesarias.

## 5) Operacion y observabilidad

- [x] Docker compose levanta servicios healthy.
- [x] Script de reporte de estado ejecuta correctamente.
- [x] Logs de backend/frontend revisados.
- [ ] Estrategia de rollback documentada.

## 6) Documentacion final

- [ ] Guia de despliegue actualizada.
- [ ] Manual tecnico de arquitectura actualizado.
- [x] Evidencias (capturas, reportes, commits) organizadas.
- [ ] Acta de cierre del proyecto preparada.

## Pendientes de cierre

- Ejecutar prueba de revocacion de refresh token en logout (caso positivo y token revocado).
- Completar hardening de variables sensibles en entornos de despliegue.
- Revisar y documentar indices MongoDB para consultas de catalogo, ordenes y usuarios.
- Documentar playbook de rollback y acta de cierre final.
