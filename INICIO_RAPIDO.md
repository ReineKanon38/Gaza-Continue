# INICIO RAPIDO

Guia minima para levantar el sistema, entender los flujos actuales y empezar a operar sin leer toda la documentacion historica.

## 1) Levantar proyecto

Puedes levantar todo el ecosistema (backend y frontend) de forma automatizada o manual:

### Opción A: Inicio rápido automático (PowerShell)
En la raíz del proyecto, ejecuta el script `iniciar.ps1` (puedes hacer clic derecho y elegir "Ejecutar con PowerShell" o desde la terminal de comandos):
```powershell
.\iniciar.ps1
```
*Este script instalará las dependencias que hagan falta y abrirá de forma automática dos consolas independientes para el backend (puerto 5000) y el frontend (puerto 5173).*

### Opción B: Inicio manual por separado
Si prefieres controlarlo de forma manual, abre dos terminales e inicia cada servicio por separado:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
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
2. [docs/CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md](docs/CHECKLIST_VALIDACION_PAGOS_BANCARIOS.md): operacion diaria de pagos.
3. [docs/INDICE_ACTUAL.md](docs/INDICE_ACTUAL.md): mapa de documentacion vigente.
4. [docs/GUIA_FAMILIARIZACION_APLICACION.md](docs/GUIA_FAMILIARIZACION_APLICACION.md): ruta de onboarding por perfil.

## 4) Nota sobre documentacion antigua

La documentacion historica (planes, reportes, auditorias y fases anteriores) se movio a [docs/legacy/README.md](docs/legacy/README.md).

## 5) Estado funcional actual

- Flujo bancario con validacion manual habilitado.
- Panel admin preparado para aprobar/rechazar pago y continuar orden.
