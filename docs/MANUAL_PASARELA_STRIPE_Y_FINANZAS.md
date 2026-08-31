# 💳 Manual Financiero: Pasarela de Pagos Stripe, Comisiones y Rendimiento
**Guía Oficial para Finanzas, Dirección General y Administración de GAZA Infraestructura TI**

---

## 1. 🏢 Introducción: El Rol de Stripe en la Plataforma GAZA

**Stripe** es la infraestructura financiera y pasarela de pagos líder a nivel global utilizada por GAZA para procesar transacciones electrónicas de manera segura y automatizada.

### Beneficios Principales para GAZA:
1. **Seguridad Certificada:** Cumple con la certificación más estricta de la industria financiera (**PCI-DSS Nivel 1**). Ni el servidor de GAZA ni sus empleados tienen acceso a los números de tarjeta de los clientes; todo viaja cifrado bajo tokens criptográficos.
2. **Aprobación Inmediata:** Valida los fondos de las tarjetas en menos de 2 segundos mediante Webhooks en tiempo real.
3. **Protección Antifraude (Stripe Radar & 3D Secure):** Bloquea automáticamente transacciones sospechosas o tarjetas clonadas y solicita el código de seguridad dinámico de la app bancaria del cliente para evitar contracargos.

---

## 2. 🧮 Estructura Oficial de Comisiones de Stripe en México

Por cada cobro procesado con tarjeta de crédito o débito (Visa, Mastercard, American Express, Carnet), Stripe aplica la siguiente tarifa en México:

$$\mathbf{3.6\% + \$3.00\text{ MXN}} \ (+ 16\% \text{ de IVA sobre dicha comisión})$$

> 💡 **Nota Fiscal Importante:** El 16% de IVA sobre la comisión de Stripe **no es una pérdida**. Al final de cada mes, Stripe emite un **CFDI (Factura electrónica con XML y PDF)** con el RFC de GAZA, permitiendo a la empresa acreditar el IVA y deducir la comisión como gasto operativo ante el SAT.

---

## 3. 📊 Tabla Comparativa de Comisiones y Ganancia Neta

A continuación se presentan ejemplos reales de transacciones comerciales en GAZA considerando el **Margen de Ganancia del 15%** y la comisión de Stripe:

| Total Venta al Cliente | Comisión Stripe (3.6% + $3) | IVA Comisión (16%) | Retención Total Stripe | Depósito Neto a Banco GAZA | Costo SYSCOM (aprox) | Ganancia Neta Limpia GAZA |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$1,000.00 MXN** | $39.00 MXN | $6.24 MXN | **$45.24 MXN** | **$954.76 MXN** | $770.00 MXN | **+$184.76 MXN** |
| **$2,500.00 MXN** | $93.00 MXN | $14.88 MXN | **$107.88 MXN** | **$2,392.12 MXN** | $1,930.00 MXN | **+$462.12 MXN** |
| **$5,000.00 MXN** | $183.00 MXN | $29.28 MXN | **$212.28 MXN** | **$4,787.72 MXN** | $3,860.00 MXN | **+$927.72 MXN** |
| **$10,000.00 MXN** | $363.00 MXN | $58.08 MXN | **$421.08 MXN** | **$9,578.92 MXN** | $7,720.00 MXN | **+$1,858.92 MXN** |

---

## 4. 🏦 Ciclo de Transferencias Bancarias (Payouts)

1. **Recaudación Diaria:** Cada venta aprobada se acumula en el balance disponible de tu cuenta de Stripe.
2. **Programación Automática (Rolling 2 Días):** Stripe realiza transferencias bancarias automáticas vía **SPEI / CLABE** a la cuenta de cheques de GAZA cada 24 a 48 horas hábiles.
3. **Conciliación:** Cada depósito bancario incluye una referencia que coincide con el reporte descargable en el [Dashboard de Stripe](https://dashboard.stripe.com/).

---

## 5. ⚖️ Comparativa de Métodos: Tarjeta (Stripe) vs SPEI Bancario

| Característica | Tarjeta con Stripe | Transferencia Bancaria (SPEI Banamex / Santander) |
| :--- | :--- | :--- |
| **Velocidad de Aprobación** | Instantánea (1 segundo) | Manual (Revisión de comprobante en app bancaria) |
| **Costo por Transacción** | ~4.2% (Comisión + IVA) | **$0.00 MXN (0% Comisión)** |
| **Margen de Ganancia** | ~11% - 12% libre de comisión | **15% íntegro para GAZA** |
| **Riesgo de Aclaración** | Protegido por 3D Secure | Sin riesgo de contracargo |
| **Preferencia del Cliente** | Clientes particulares / Compras rápidas | Empresas / Compras corporativas de alto valor |

---

## 6. 🛡️ Protocolo Ético y Prevención Operativa

1. **Revisión de Órdenes:** Antes de surtir en SYSCOM, verificar que el estado en el panel administrativo (`/admin`) figure como `Aprobado`.
2. **Transparencia con el Cliente:** Entregar siempre el número de guía oficial y comprobante desglosado (Subtotal + IVA + Envío).
3. **Gestión de Reembolsos:** En caso de cancelación antes del envío, Stripe permite realizar reembolsos totales o parciales con un solo clic directamente a la tarjeta original del cliente.
