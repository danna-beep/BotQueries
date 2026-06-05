# MD3 — Lógica de Negocio y Reglas para Queries SQL

> Este documento captura el conocimiento implícito del sistema VAAS que NO está en el esquema de tablas ni en el diccionario de variables. Es obligatorio consultarlo antes de generar cualquier query SQL para evitar resultados incorrectos o queries que destruyan performance.

---

## QUÉ ES VAAS

VAAS es un **master servicer financiero**: recibe pagos de deudores finales a través de múltiples gateways, los reconcilia contra las fuentes de verdad de cada empresa prestamista (borrower), y distribuye los fondos recaudados a quienes corresponde.

**Actores principales:**
- **Borrowers** (clientes de VAAS): empresas de crédito — ADDI, INKLUSIVA, VEMO, SOMOS, HAYCASH, BIA, NIKO, EXITUS, LIQUITECH, PAYJOY, SISTECREDITO, WELLI, CESIONBNK
- **Gateways de pago**: WOMPI, NEQUI, PSE, BANCOLOMBIA_COLLECT, BANCOLOMBIA_CORRESPONDENT, BANCOLOMBIA_TRANSFER, DRUO, EFECTY, GANA, REFACIL, MOVII, DAVIPLATA, STRIPE, PAYU, DAVIVIENDA, BANCO_BOGOTA

---

## REGLAS CRÍTICAS PARA QUERIES

### ⚠️ REGLA 1 — No usar `status` directamente para filtrar pagos aprobados

**MAL:**
```sql
WHERE status = 'approved'
```

**BIEN:**
```sql
WHERE approved_date IS NOT NULL
-- o filtrar por rango de approved_date
WHERE approved_date BETWEEN '2024-01-01' AND '2024-12-31'
```

`approved_date` es una columna virtual computed que calcula la fecha de aprobación con lógica distinta **por gateway y por borrower**. Para ADDI la lógica difiere según el gateway usado. No hay un valor `status = 'approved'` confiable para todos los borrowers.

---

### ⚠️ REGLA 2 — Saber cuándo un pago está conciliado

**Conciliado contra el borrower core (Tipo C):**
```sql
WHERE borrower_db_conciliation_id IS NOT NULL
-- o verificar el ID del pago en el sistema del borrower
WHERE borrower_db_payment_id IS NOT NULL
```

**Conciliado contra el banco (Tipo B — vía fund transfer directo):**
```sql
WHERE fund_transfer_id IS NOT NULL
```

**Conciliado contra el payment tape (Tipo A):**
```sql
-- En payment_tape:
WHERE payment_id IS NOT NULL          -- tape conciliado
WHERE status = 'PENDING'              -- PENDING = conciliado en VAAS (nombre confuso)
WHERE status = 'REJECTED'             -- no encontró match
WHERE status = 'DISTRIBUTED'          -- ya fue distribuido
```

**⚠️ IMPORTANTE:** En `payment_tape`, `status = 'PENDING'` significa que el pago **sí fue conciliado** exitosamente. El nombre es contraintuitivo pero es el comportamiento del sistema.

---

### ⚠️ REGLA 3 — Qué tabla usar según el objetivo de la query

| Objetivo | Tabla correcta | Motivo |
|---|---|---|
| Análisis de pagos por contrato específico | `payment_tape` | Tiene `borrower_contract_id` |
| Verificar si un pago llegó al banco | `funds_transfers` | Fuente de verdad bancaria |
| Ver pagos del gateway | `payments` | Registro canónico del gateway |
| Desglose de una liquidación diaria | `disbursements_payments` | Detalle por transacción |
| Resumen de liquidación del gateway | `disbursements` | Reporte agrupado diario |
| Verificar conciliación vs borrower | `borrower_db_payments` | BD del borrower |
| Historial de procesos de conciliación | `conciliations` | Log de procesos |
| Análisis histórico (no operacional) | `payments_historic` / `borrower_db_payments_historic` | Solo lectura bulk |

---

### ⚠️ REGLA 4 — Tablas que NUNCA deben usarse sin precaución extrema

**`entities_activity_log` (139M filas):**
```sql
-- MAL — full scan de 139M filas:
WHERE source_reference LIKE '%contract_id%'

-- BIEN — siempre filtrar por entity_type + entity_id primero:
WHERE entity_type = 'PAYMENT' AND entity_id = 'uuid-aqui'
```

**`payments_historic` y `borrower_db_payments_historic`:**
- Son tablas frías sin índices operacionales
- Solo para análisis analítico en bulk, nunca para queries transaccionales
- No usar en joins con tablas operacionales grandes

**`payment_tape` (176 GB):**
- Siempre incluir `company_id` como primer filtro (usa el índice)
- Siempre incluir `gateway_code` como segundo filtro
- El índice principal es `(company_id, payment_date, gateway_code)`

---

### ⚠️ REGLA 5 — CESIONBNK: relación N:1 en fund_transfers

Para CESIONBNK, **un solo `fund_transfer` puede cubrir múltiples filas del `payment_tape`** (N facturas = 1 giro bancario). Nunca asumir relación 1:1 entre payment_tape y funds_transfers para este borrower.

```sql
-- Para CESIONBNK el match es:
payment_tape.gateway_payment_id = funds_transfers.provider_id
-- Un fund_transfer.provider_id puede aparecer N veces en payment_tape
```

---

### ⚠️ REGLA 6 — Columnas de matching usan versiones normalizadas

El match entre `payments` y `payment_tape` NO se hace con los campos originales sino con columnas virtuales normalizadas:

```sql
-- MATCH CORRECTO:
payments.v_normalized_provider_id = payment_tape.v_normalized_gateway_payment_id

-- NO usar directamente:
payments.provider_id = payment_tape.gateway_payment_id  -- puede fallar por espacios/case
```

---

### ⚠️ REGLA 7 — WELLI tiene lógica de match diferente por gateway

**WELLI + WOMPI** — el match usa el campo dentro del JSON:
```sql
JSON_EXTRACT(payment.provider_extra_information, '$.order_id') = payment_tape.gateway_payment_id
AND payment.payment_gateway_code = payment_tape.gateway_code
```

**WELLI + BANCOLOMBIA_CORRESPONDENT** — match exacto por monto y fecha, sin ID:
```sql
payment.approved_amount = payment_tape.amount
AND payment.approved_date = payment_tape.date
```

---

### ⚠️ REGLA 8 — NIKO (México) tiene lógica de match en 3 niveles en cascada

Para NIKO con STRIPE, la conciliación opera en cascada. Un pago se considera conciliado solo si los 3 niveles coinciden:

```
Nivel 1: payment_tape.gateway_payment_id = payments.provider_id
         (tolerancia: abs(PT.amount - payment.amount/100) < 1)

Nivel 2: payment_tape.disbursement_reference_code = disbursements_payments.provider_id
         (tolerancia: abs(gross_amount - PT.amount) < 1)

Nivel 3: disbursements.account_id + report_date = funds_transfers.account_id + date
         (tolerancia: abs(gross_amount - fund_transfer.amount) < 1)
```

**Mapeo de cuentas bancarias NIKO:**
```
(BBVA,    MXN) → bbva_mxn
(BBVA,    USD) → bbva_usd
(STRIPE,  MXN) → actinver_mxn
(STRIPE,  USD) → actinver_usd
(ACTINVER,MXN) → actinver_mxn
(ACTINVER,USD) → actinver_usd
```

---

### ⚠️ REGLA 9 — INKLUSIVA tiene tolerancias de monto variables por gateway

| Gateway | Tolerancia de monto |
|---|---|
| PSE | `abs(diff) < 0.1` |
| WOMPI | `abs(diff) < 0.1` |
| BANCOLOMBIA_TRANSFER | `abs(diff) < 0.1` |
| EFECTY | `abs(diff) < 0.1` (clave compuesta: gateway_payment_id + transfer_date + payer_legal_id) |
| BANCOLOMBIA_CORRESPONDENT | Exacto (con lógica de sufijo `-iN` para account_sweep) |
| BANCOLOMBIA_FUNDS_TRANSFERS | Siempre reconciliado = True (hardcoded) |

**Check de aplicación adicional para INKLUSIVA:**
```sql
(current_principal + current_interest + moratory_interest + current_guarantee) - total_payment < 1.1
```

---

### ⚠️ REGLA 10 — Ventanas de fechas para match Payment → Disbursement

| Gateway | Campo fecha base | Ventana |
|---|---|---|
| WOMPI | `provider_last_update_date` | + 30 días |
| DRUO | `provider_creation_date` | + 30 días |
| Resto | `provider_creation_date` | + 5 días |
| BANCOLOMBIA_CORRESPONDENT | No aplica | No tiene relación con disbursements |

**Match Disbursement → FundTransfer:**
```sql
disbursement.account_id = fund_transfer.account_id
AND fund_transfer.date BETWEEN disbursement.report_date AND DATE_ADD(disbursement.report_date, INTERVAL 6 DAY)
AND abs(disbursement.total_net_amount - fund_transfer.amount) < 1000  -- tolerancia default
-- Si total_net_amount no matchea, reintenta con total_gross_amount (caso SOMOS)
```

---

### ⚠️ REGLA 11 — ADDI es el borrower más complejo

ADDI tiene los **tres tipos de conciliación activos simultáneamente**. Al consultar datos de ADDI:

- `approved_date` tiene lógica distinta según el gateway (no asumir comportamiento genérico)
- La conciliación vs borrower DB usa `from_date` hardcodeado a `2024-02-01`
- Tiene conciliaciones del tipo A, B y C activas — verificar cuál aplica al análisis

---

## CICLO DE VIDA COMPLETO DE UN PAGO

```
1. Deudor paga → Gateway
   ↓
2. INSERT en payments (registro central)
   payments.status = (según gateway)
   ↓
3. Borrower envía su payment_tape (archivo)
   INSERT en payment_tape
   payment_tape.payment_id = NULL (aún no conciliado)
   payment_tape.status = REJECTED (default)
   ↓
4. CONCILIACIÓN TIPO A: payments ↔ payment_tape
   Si match: payment_tape.payment_id = payments.id
             payment_tape.status = 'PENDING'  ← ojo: PENDING = CONCILIADO
             payments.payment_tape_conciliation_id = conciliations.id
   ↓
5. Gateway envía reporte de liquidación
   INSERT en disbursements + disbursements_payments
   ↓
6. Banco recibe transferencia
   INSERT en funds_transfers
   ↓
7. CONCILIACIÓN TIPO B: disbursements ↔ funds_transfers
   Si match: disbursements.fund_transfer_id = funds_transfers.id
             payments.fund_transfer_id = funds_transfers.id
   ↓
8. DISTRIBUCIÓN:
   (requiere payment_tape.payment_id != NULL)
   payment_tape.distribution_id = distribución calculada
   payment_tape.status = 'DISTRIBUTED'
```

---

## TIPOS DE CONCILIACIÓN Y TABLAS INVOLUCRADAS

| Tipo | Sigla | Tabla izquierda | Tabla derecha | Campo match izquierda | Campo match derecha |
|---|---|---|---|---|---|
| Tipo A | `PAYMENTS___VS___PAYMENT_TAPE` | `payments` | `payment_tape` | `v_normalized_provider_id` | `v_normalized_gateway_payment_id` |
| Tipo B | `PAYMENTS___VS___BANK` | `disbursements` | `funds_transfers` | `account_id + report_date` | `account_id + date` |
| Tipo C | `PAYMENTS___VS___BORROWER_DB` | `payments` | `borrower_db_payments` | `provider_id` | `id` |
| Tipo B2 | `DISBURSEMENTS___VS___FUNDS_TRANSFERS` | `disbursements` | `funds_transfers` | `account_id + total_net_amount` | `account_id + amount` |
| Tipo NIKO | `PAYMENT_TAPE___VS___BANK` | `payment_tape` | `funds_transfers` | lógica 3 niveles | lógica 3 niveles |

---

## PATRONES DE QUERY FRECUENTES

### Pagos conciliados de un borrower en un período

```sql
SELECT p.id, p.amount, p.approved_date, p.borrower_code, p.payment_gateway_code
FROM payments p
WHERE p.borrower_code = 'ADDI'
  AND p.approved_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND p.payment_tape_conciliation_id IS NOT NULL  -- conciliados vs tape
ORDER BY p.approved_date DESC;
```

### Pagos del tape con desglose financiero por contrato

```sql
SELECT pt.borrower_contract_id, pt.total_payment,
       pt.current_principal, pt.current_interest, pt.moratory_interest,
       pt.status, pt.distribution_id
FROM payment_tape pt
WHERE pt.company_id = 'INKLUSIVA'
  AND pt.payment_date BETWEEN '2024-01-01' AND '2024-01-31'
  AND pt.gateway_code = 'WOMPI'
ORDER BY pt.payment_date DESC;
```

### Verificar si un pago llegó al banco

```sql
SELECT p.id, p.amount, p.approved_date,
       ft.date AS bank_date, ft.amount AS bank_amount, ft.concept_code
FROM payments p
LEFT JOIN funds_transfers ft ON p.fund_transfer_id = ft.id
WHERE p.borrower_code = 'VEMO'
  AND p.approved_date >= '2024-01-01'
  AND ft.id IS NOT NULL;  -- solo los que llegaron al banco
```

### Pagos no conciliados (pendientes de reconciliar)

```sql
-- Pagos sin conciliación vs tape
SELECT p.id, p.borrower_code, p.payment_gateway_code, p.amount, p.approved_date
FROM payments p
WHERE p.borrower_code = 'SOMOS'
  AND p.payment_tape_conciliation_id IS NULL
  AND p.approved_date BETWEEN '2024-01-01' AND '2024-01-31';

-- Tape sin match (REJECTED)
SELECT pt.id, pt.gateway_payment_id, pt.total_payment, pt.payment_date
FROM payment_tape pt
WHERE pt.company_id = 'SOMOS'
  AND pt.status = 'REJECTED'
  AND pt.payment_date BETWEEN '2024-01-01' AND '2024-01-31';
```

### Historial de procesos de conciliación

```sql
SELECT c.type, c.from_date, c.until_date, c.status, c.result_checks_description
FROM conciliations c
WHERE c.company_code = 'ADDI'
  AND c.type = 'PAYMENTS___VS___PAYMENT_TAPE'
  AND c.from_date >= '2024-01-01'
ORDER BY c.from_date DESC;
```

### Distribución de fondos por contrato

```sql
SELECT pt.borrower_contract_id,
       SUM(pt.lender_amount) AS total_lender,
       SUM(pt.borrower_amount) AS total_borrower,
       pt.distribution_id
FROM payment_tape pt
WHERE pt.company_id = 'INKLUSIVA'
  AND pt.status = 'DISTRIBUTED'
  AND pt.payment_date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY pt.borrower_contract_id, pt.distribution_id;
```

---

## INFRAESTRUCTURA AWS RELEVANTE PARA CONTEXTO

| Servicio | Uso |
|---|---|
| SQS | Cola de entrada de tareas BPM |
| SNS | Alertas de error + eventos de tarea completada |
| S3 | Archivos de borrowers (cintas, reportes) |
| Secrets Manager | Credenciales DB, tokens, OAuth secrets |

Los archivos de payment_tape y borrower_db_payments llegan vía S3 antes de ser insertados en la BD.
