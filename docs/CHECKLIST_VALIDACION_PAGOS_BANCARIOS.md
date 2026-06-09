# Checklist Operativo - Validacion de Pagos Bancarios

## Objetivo
Asegurar que cada orden con transferencia bancaria se valide de forma consistente para proteger al comprador y al vendedor.

## Estados Oficiales
- Estado de orden (`order.status`): `pending` -> `processing` -> `completed` o `cancelled`
- Estado de pago (`order.paymentStatus`): `pending_validation` -> `approved` o `rejected`

## Regla Critica
- Ninguna orden puede pasar a `processing` o `completed` si `paymentStatus` no es `approved`.

## Flujo Diario (Operacion)
1. Abrir panel de administracion y revisar ordenes con pago `Pendiente validacion`.
2. Verificar comprobante y referencia bancaria.
3. Confirmar monto exacto, fecha y cuenta destino.
4. Si coincide:
- Aprobar pago.
- Registrar referencia (si aplica).
- La orden avanza automaticamente a `processing`.
5. Si no coincide:
- Rechazar pago con motivo claro.
- La orden se cancela y el stock se repone automaticamente.

## Criterios de Aprobacion
- Monto depositado igual al total de la orden.
- Referencia/rastreo valida.
- Pago dentro de ventana operativa definida.
- Cuenta origen sin alertas internas de fraude.

## Criterios de Rechazo
- Monto menor o mayor no justificado.
- Comprobante alterado o ilegible.
- Referencia inexistente en conciliacion.
- Evidencia de intento de fraude.

## SLA Recomendado
- Primera revision: <= 2 horas habiles.
- Resolucion maxima: <= 24 horas.
- Si expira sin evidencia valida: rechazar pago y notificar.

## Auditoria Minima
- Registrar en cada aprobacion/rechazo:
- Usuario admin que resolvio.
- Fecha/hora.
- Referencia bancaria.
- Notas operativas y/o motivo de rechazo.

## Controles de Riesgo
- No liberar envio sin pago aprobado.
- No completar orden sin trazabilidad de validacion.
- Toda excepcion debe quedar documentada en notas internas.

## KPI Sugeridos
- % pagos aprobados en primera revision.
- Tiempo promedio de validacion.
- % rechazos por inconsistencia.
- % casos resueltos dentro de SLA.
