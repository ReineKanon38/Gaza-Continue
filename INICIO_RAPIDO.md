# INICIO RAPIDO

Guia minima para levantar el sistema, entender los flujos actuales y empezar a operar sin leer toda la documentacion historica.

## 1) Levantar proyecto

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 2) Entrar y validar flujo principal

1. Login en la aplicacion.
2. Crear pedido desde checkout.
3. Seleccionar transferencia bancaria.
4. Confirmar orden.
5. Revisar en panel admin:
- Pago pendiente de validacion.
- Aprobar o rechazar pago.
- Continuar flujo de orden.

## 3) Documentos vigentes (lectura recomendada)

1. [README.md](README.md): vista general del repositorio.
2. [CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md](CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md): operacion diaria de pagos.
3. [docs/INDICE_ACTUAL.md](docs/INDICE_ACTUAL.md): mapa de documentacion vigente.
4. [docs/GUIA_FAMILIARIZACION_APLICACION.md](docs/GUIA_FAMILIARIZACION_APLICACION.md): ruta de onboarding por perfil.

## 4) Nota sobre documentacion antigua

La documentacion historica (planes, reportes, auditorias y fases anteriores) se movio a [docs/legacy/README.md](docs/legacy/README.md).

## 5) Estado funcional actual

- Flujo Stripe descontinuado.
- Flujo bancario con validacion manual habilitado.
- Panel admin preparado para aprobar/rechazar pago y continuar orden.
