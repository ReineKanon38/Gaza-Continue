# 🏦 Manual Operativo: Pagos por Transferencia Bancaria Directa (SPEI)
**Protocolo Oficial para Ventas, Finanzas y Administración de GAZA Infraestructura TI**

---

## 1. 📋 Resumen del Método de Transferencia Bancaria (SPEI)

El método de **Transferencia Bancaria Directa (SPEI)** permite a los clientes realizar compras corporativas o de alto valor sin pagar con tarjeta, transfiriendo directamente desde su banca móvil (BBVA, Banamex, Santander, Banorte, Nu, etc.) a las cuentas empresariales de GAZA.

### Ventajas Estratégicas para GAZA:
* **0% de Comisión Financiera:** El 100% del dinero ingresa íntegro a la cuenta de GAZA sin retenciones de pasarelas.
* **Margen de Ganancia Máximo:** Se conserva el **15% completo de utilidad neta**.
* **Cero Riesgo de Contracargo:** Una transferencia SPEI confirmada en la cuenta bancaria es irrevocable.

---

## 2. 🔄 Flujo Operativo Paso a Paso

```
┌────────────────────────────────────────┐
│ 1. Cliente Selecciona Banco en Checkout│
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 2. Web Muestra CLABE y Número de Orden │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 3. Bot Notifica al Grupo de Telegram   │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 4. Cliente Transfiere SPEI con su App  │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 5. Administrador Valida en Banco       │
└───────────────────┬────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│ 6. Clic en "Aprobar Pago" en /admin    │
└────────────────────────────────────────┘
```

---

## 3. 🖥️ Lo que ve el Cliente en su Pantalla al Comprar

Una vez que el cliente hace clic en **"Confirmar Pedido con Pago Bancario"**, el sistema genera su orden con estado `Pendiente de Validación` y le muestra una ficha formal con:

* **Banco Destino:** Citibanamex / Santander (según el banco elegido).
* **Nombre del Beneficiario:** GAZA INFRAESTRUCTURA TI.
* **CLABE Interbancaria:** 18 dígitos bancarios oficiales.
* **Monto Exacto a Transferir:** Desglose con Subtotal + 16% IVA + Envío.
* **Concepto / Referencia de Pago:** Su número de orden único (ej. `ORD-1772412891`).
* **Medio de Envío de Comprobante:** Correo electrónico (`syscom.gaza.ma9@gmail.com`) o WhatsApp de atención.

---

## 4. 🔍 Protocolo de Validación y Aprobación (Paso a Paso en `/admin`)

Para garantizar la seguridad financiera de la empresa y evitar fraudes con comprobantes falsificados:

1. **Recepción del Comprobante:**
   * El cliente envía la captura o PDF de la transferencia con la referencia `ORD-XXXXX`.
2. **Cotejo en la Aplicación Bancaria:**
   * El administrador abre la app de Banamex o Santander y verifica que el saldo real disponible haya incrementado por el monto exacto de la orden.
   * *(Opcional)* En compras mayores a $10,000 MXN, se puede validar el comprobante en el portal oficial de **Banxico CEP** ([banxico.org.mx/cep](https://www.banxico.org.mx/cep/)).
3. **Aprobación en el Panel Web (`syscomgaza.com/admin`):**
   * Ir a la pestaña **Órdenes**.
   * Localizar el pedido y hacer clic en **Ver Detalle**.
   * Presionar el botón verde: **`✓ Aprobar pago y procesar`**.
4. **Disparo Automático:**
   * El sistema actualiza la orden a `En Proceso de Preparación`.
   * El cliente recibe un correo formal de confirmación de pago.
   * El equipo operativo procede a surtir el producto en **SYSCOM** e imprimir la **Etiqueta Oficial de GAZA**.

---

## 5. ⚠️ Buenas Prácticas y Ética Operativa

1. **Regla de Oro:** **Nunca despachar ni comprar en SYSCOM un producto sin antes verificar los fondos reales en la cuenta bancaria de GAZA**.
2. **Tiempos de Espera:** Las órdenes por transferencia bancaria se mantienen apartadas durante **24 horas hábiles**. Si el cliente no transfiere en ese lapso, el administrador puede presionar **`Rechazar Pago`** para liberar el inventario.
3. **Atención Personalizada:** Si el cliente tiene dudas sobre cómo transferir, brindar asistencia vía WhatsApp compartiendo amablemente los datos bancarios y el número de su orden.
