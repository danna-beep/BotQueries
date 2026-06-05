# MD2 — Esquema de Base de Datos: payments_db

> Referencia completa de las 25 tablas de payments_db: estructura, índices, relaciones y guías de uso para generación de queries SQL.

---

## RESUMEN DE TABLAS Y TAMAÑOS

| Tabla | Filas aprox. | Datos | Índices | Grupo |
|---|---|---|---|---|
| `entities_activity_log` | 139M | 53 GB | 42 GB | Operacional |
| `payment_tape` | 61M | 90 GB | 86 GB | Operacional |
| `payments` | 74M | 35 GB | 74 GB | Operacional |
| `disbursements_payments` | 48M | 15 GB | 21 GB | Operacional |
| `borrower_db_payments` | 40M | 8 GB | 13 GB | Operacional |
| `payments_same_day_collisions_log` | 3.8M | 1.1 GB | — | Log |
| `payments_deleted_dupes_log` | 1.6M | 793 MB | — | Log |
| `payments_extra` | 1.6M | 183 MB | 441 MB | Config |
| `funds_transfers` | 1.5M | 734 MB | 535 MB | Operacional |
| `payments_historic` | 5.6M | 2 GB | 118 MB | Histórico |
| `borrower_db_payments_historic` | 4.3M | 591 MB | — | Histórico |
| `scheduled_payments_installments` | 103K | 111 MB | 39 MB | Config |
| `payments_notifications` | 10K | 1.5 MB | — | Config |
| `conciliations` | 5.7K | 11 MB | 2 MB | Conciliación |
| `process_execution` | 400 | — | — | Config |
| `notifications_by_last_update_date` | 1K | — | — | Config |
| `manual_conciliation_payments` | 55 | — | — | Conciliación |
| `models_versions_config` | 2 | — | — | Migración |
| `webhook_integration_config` | 2 | — | — | Config |
| `payments_history` | 0 | — | — | Nueva arquitectura |
| `payments_partitioned` | 0 | — | — | Nueva arquitectura |
| `payment_supplier` | 0 | — | — | Config |
| `sequence_table` | 0 | — | — | Utilidad |
| `payments_flyway_schema_history` | 26 | — | — | Migración |

---

## GRUPO 1 — DATOS OPERACIONALES PRINCIPALES

### payments
**Tabla central.** Registro canónico de cada transacción recibida desde un gateway. 74M filas.

**Columnas clave:**
- `id` (UUID) — PK
- `borrower_code` — identificador del borrower (ej: ADDI, INKLUSIVA)
- `payment_gateway_code` — gateway de origen (WOMPI, PSE, EFECTY, etc.)
- `status` — estado del pago
- `amount` — monto bruto
- `net_amount` — monto neto
- `provider_id` — ID del pago en el gateway (clave de match con payment_tape)
- `provider_creation_date` — fecha de creación en el gateway
- `provider_last_update_date` — fecha de última actualización en el gateway
- `provider_extra_information` (JSON) — información adicional del gateway
- `payer_legal_id` — ID del pagador real
- `loan_debtor_legal_id` — ID del deudor del crédito
- `currency` — moneda de la transacción

**Columnas de conciliación** (se llenan cuando el pago es conciliado):
- `borrower_db_payment_id` — ID del pago en el sistema del borrower (concil. tipo C)
- `borrower_db_conciliation_id` — ID del proceso de conciliación vs borrower
- `disbursement_id` — FK a disbursements (concil. tipo B)
- `disbursement_conciliation_id` — ID del proceso de conciliación vs banco
- `fund_transfer_id` — FK a funds_transfers (concil. bancaria directa)
- `fund_transfer_conciliation_id` — ID del proceso de conciliación bancaria
- `payment_tape_conciliation_id` — ID del proceso de conciliación vs payment tape

**Columnas virtuales (computed):**
- `approved_date` — fecha de aprobación calculada según gateway/borrower (⚠️ ver reglas de negocio en MD3)
- `provider_extra_information_reference` — extraída del JSON de provider_extra_information
- `v_normalized_provider_id` — provider_id normalizado para matching (lowercase, sin espacios)

**Índices:**
```sql
PK:     (id)
UNIQUE: (borrower_code, payment_gateway_code, provider_id)
UNIQUE: (borrower_db_payment_id)                           -- 1:1 con borrower_db_payments
IDX:    (borrower_code, approved_date, status, disbursement_id, fund_transfer_id, currency, amount, gateway_code)
IDX:    (borrower_code, approved_date, status, borrower_db_payment_id, currency, amount, gateway_code)
IDX:    (borrower_code, approved_date, status, payment_tape_conciliation_id, currency, amount, gateway_code)
IDX:    (borrower_code, payment_gateway_code, v_normalized_provider_id)
IDX:    (disbursement_id, disbursement_reference_code)
IDX:    (fund_transfer_id)
```

**FK reales:**
- `disbursement_id` → `disbursements.id`
- `fund_transfer_id` → `funds_transfers.id`

---

### borrower_db_payments
Pagos según la BD propia del borrower. Se usa para verificar que VAAS y el borrower tienen los mismos pagos (conciliación tipo C). 40M filas.

**Columnas clave:**
- `id` (PK del sistema del borrower)
- `borrower_code`
- `payment_gateway_code`
- `date` — fecha del pago según el borrower
- `amount`
- `currency`
- `payer_legal_id`
- `loan_debtor_legal_id`
- `active` — indica si el registro está activo
- `payments_conciliation_id` — ID del proceso de conciliación

**Índices:**
```sql
PK:  (id)
IDX: (borrower_code, creation_date)
IDX: (payments_conciliation_id)
IDX: (date, borrower_code, payments_conciliation_id, currency, amount, gateway_code, payer_legal_id)
```

---

### funds_transfers
Transferencias reales de dinero del gateway al banco del borrower. Fuente de verdad bancaria. 1.5M filas.

**Columnas clave:**
- `id` (UUID) — PK
- `borrower_code`
- `gateway_code`
- `concept_code` — tipo de transferencia (WOMPI, DRUO, PSE, BANCOLOMBIA, etc.)
- `concept` — descripción
- `account_id` — cuenta bancaria destino
- `date` — fecha de la transferencia
- `amount`
- `currency`
- `provider_id` — ID en el gateway
- `provider_extra_data` (JSON)

**Índices:**
```sql
PK:     (id)
UNIQUE: (borrower_code, concept_code, provider_id)
IDX:    (date, borrower_code, concept_code)
```

---

### disbursements
Reportes de liquidación agrupados del gateway (un reporte diario = un disbursement con N pagos). 

**Columnas clave:**
- `id` (UUID) — PK
- `borrower_code`
- `payment_gateway_code`
- `status`
- `total_gross_amount`, `total_net_amount`, `total_fee_amount`
- `currency`
- `report_date` — fecha del reporte de liquidación
- `provider_id` — ID del reporte en el gateway
- `provider_extra_information` (JSON)
- `fund_transfer_id` — FK a funds_transfers (se llena al conciliar)
- `fund_transfer_conciliation_id`

**Índices:**
```sql
PK:     (id)
UNIQUE: (borrower_code, payment_gateway_code, provider_id)
IDX:    (fund_transfer_id)
IDX:    (report_date)
IDX:    (report_date, payment_gateway_code, borrower_code, status)
```

**FK reales:** `fund_transfer_id` → `funds_transfers.id`

---

### disbursements_payments
Detalle por transacción individual dentro de un reporte de liquidación. 48M filas.

**Columnas clave:**
- `id` — PK
- `borrower_code`
- `payment_gateway_code`
- `disbursement_id` — FK a disbursements
- `gross_amount`, `net_amount`, `fee_amount`
- `currency`
- `provider_id` — ID del pago en el gateway
- `disbursement_reference_code` — código de referencia para matching con payments
- `conciliation_id` — ID del proceso de conciliación

**Índices:**
```sql
PK:     (id)
UNIQUE: (borrower_code, payment_gateway_code, provider_id)
IDX:    (conciliation_id)
IDX:    (disbursement_id)
IDX:    (disbursement_id, conciliation_id)   -- covering para filtrar no-conciliados
```

**FK reales:** `disbursement_id` → `disbursements.id`

---

### payment_tape
Cinta de pagos del borrower con desglose por contrato/deudor. Une el pago del gateway con el contrato específico. **Tabla más pesada: 176 GB total.** 61M filas.

**Columnas clave:**
- `id` — PK
- `company_id` — ID del borrower
- `gateway_code`
- `gateway_payment_id` — ID del pago en el gateway (clave de match con payments.provider_id)
- `payment_id` — FK a payments (se llena al conciliar)
- `borrower_contract_id` — ID del contrato en el sistema del borrower
- `contract_type` — tipo de contrato: LOAN / SUSCRIPTION / INVOICE
- `borrower_payment_id`
- `payment_date`
- `owner_name`
- `total_payment` — monto total del pago
- `net_amount`
- `distribution_id` — ID de distribución (se llena al distribuir)
- `status` — PENDING (conciliado) / REJECTED (no conciliado) / DISTRIBUTED

**Columnas financieras de detalle:**
- `current_principal`, `current_interest`, `moratory_interest`
- `current_guarantee`, `interest_overdue`, `principal_overdue`
- `leftover`, `sweep`, `capital`
- `borrower_amount`, `lender_amount`

**Columna virtual:** `v_normalized_gateway_payment_id` — gateway_payment_id normalizado para matching

**Índices:**
```sql
PK:     (id)
UNIQUE: (company_id, gateway_code, contract_type, idempotency_key)
IDX:    (company_id, payment_date, gateway_code)
IDX:    (company_id, gateway_code, v_normalized_gateway_payment_id)
IDX:    (company_id, gateway_code, gateway_payment_id)
IDX:    (company_id, gateway_code, contract_type, borrower_contract_id)
IDX:    (company_id, gateway_code, borrower_payment_id)
IDX:    (company_id, distribution_id)
IDX:    (payment_id)
```

---

### entities_activity_log
Log de actividad del sistema. La tabla con más filas (139M). Append-only.

**Columnas:**
- `id` (UUID) — PK
- `entity_type` — tipo de entidad logueada
- `entity_id` — ID de la entidad
- `source_reference` (VARCHAR 500) — contexto de origen
- `processed_by` — servicio que procesó
- `creation_date`
- `last_update_date`

**Índices:**
```sql
PK:  (id)
IDX: (entity_type, entity_id)
IDX: (processed_by)
IDX: (creation_date)
```

⚠️ **SIEMPRE filtrar por `entity_type` + `entity_id` juntos. Full scan = 139M filas.**

---

## GRUPO 2 — CONCILIACIÓN

### conciliations
Log de cada proceso de conciliación ejecutado. Todas las tablas operacionales referencian esta tabla.

**Columnas:**
- `id` (BIGINT AUTO_INCREMENT) — PK
- `company_id`
- `company_code`
- `type` — tipo de conciliación:
  - `PAYMENTS___VS___PAYMENT_TAPE`
  - `PAYMENTS___VS___BANK`
  - `PAYMENTS___VS___BORROWER_DB`
  - `DISBURSEMENTS___VS___FUNDS_TRANSFERS`
  - `PAYMENT_TAPE___VS___BANK`
- `from_date`, `until_date` — rango de fechas conciliado
- `status` — SUCCESS / ERROR / PENDING
- `result_checks_context` (JSON)
- `result_checks_description`

**Índices:** `type`, `from_date`, `until_date`, `status`, `company_id`, `company_code`

---

### manual_conciliation_payments
55 registros. Casos excepcionales resueltos manualmente.

**Columnas:**
- `payment_id` (UNIQUE FK a `borrower_db_payments`)
- `loan_debtor_legal_id`, `loan_debtor_legal_id_type`
- `reason`
- `conciliation_date`, `payment_date`
- `amount`, `payment_gateway_code`
- `approved_by_client`

---

## GRUPO 3 — HISTÓRICAS / LOGS DE AUDITORÍA

### borrower_db_payments_historic
Archivo de registros movidos desde `borrower_db_payments`. **Sin índices — solo lectura bulk.** 4.3M filas. Misma estructura que la original sin `active` ni `payments_conciliation_id`.

### payments_historic
Archivo de registros movidos desde `payments`. **Sin PK.** 5.6M filas. Índices mínimos para no penalizar escritura masiva.

⚠️ **Ambas son tablas frías para análisis histórico, no operacional.**

### payments_deleted_dupes_log
Log de pagos duplicados eliminados. PK compuesta `(id, deleted_at)`. 1.6M filas.
Campos extra: `delete_reason`, `reported_at`, `fund_transfer_id`, `payment_tape_conciliation_id`.

### payments_same_day_collisions_log
Log de pagos con colisión de fecha/proveedor dentro del mismo día. PK `(id, logged_at)`. 3.8M filas.

---

## GRUPO 4 — NUEVA ARQUITECTURA (en migración)

### payments_history / payments_partitioned
Nuevo esquema de `payments`, actualmente **vacías**. Diferencias clave vs. tabla actual:
- `id_v7` (binary(16)) — UUID v7 ordenable cronológicamente
- PK compuesta: `(approved_at, borrower_id, id_v7)` — particionada por fecha/borrower
- `extra_attrs` (JSON) reemplaza `provider_extra_information`
- Nuevos campos de primera clase: `aggregator_code`, `method_code`, `fee_amount`
- Campos renombrados con sufijo `_v7`: `borrower_payment_id_v7`, `disbursement_report_id_v7`, `fund_transfer_id_v7`

### models_versions_config
Control de versión dual lectura/escritura durante migración. Campos: `read_from_version`, `write_to_versions`.

---

## GRUPO 5 — CONFIGURACIÓN Y UTILIDADES

### payments_extra
Atributos extra en esquema key-value flexible. PK `(payment_id, k)`. 1.6M filas.
- `v_text`, `v_number`, `v_date` — tres tipos de valor
- Índices cubrientes por tipo para queries eficientes

### scheduled_payments_installments
Cuotas de pagos programados por contrato. 103K filas.
UNIQUE en `(company_code, borrower_contract_id, borrower_installment_reference, date)`.
Campos: `gross_amount`, `net_amount`, `interest_amount`, `principal_amount`, `guarantee_amount`.

### webhook_integration_config
Configuración de webhooks por borrower. Tipos: `PAYMENTS_NEW_DATA_INFORMER`, `FUND_TRANSFERS_NEW_DATA_INFORMER`.

### payments_notifications
Notificaciones enviadas asociadas a pagos. 10K filas. Campos: `company_id`, `metadata` (JSON), `payment_id`.

### process_execution
Estado de ejecuciones de procesos. 400 filas. Campos: `id`, `borrower_id`, `borrower_code`, `type`, `status`, `created_at`, `updated_at`.

---

## RELACIONES (FK REALES EN BD)

```
funds_transfers ←────────────── disbursements.fund_transfer_id
funds_transfers ←────────────── payments.fund_transfer_id

disbursements   ←────────────── disbursements_payments.disbursement_id
disbursements   ←────────────── payments.disbursement_id

payments        ←────────────── payment_tape.payment_id  (sin FK formal, por performance)

borrower_db_payments ←───────── manual_conciliation_payments.payment_id
```

⚠️ Las FKs hacia `conciliations` que existen en las migrations **no existen en producción** — fueron eliminadas por performance en tablas de alto volumen.

---

## DIAGRAMA DE FLUJO DE DATOS

```
Deudor paga al gateway
        ↓
payments  (74M filas — registro central del gateway)
        ↓ match por v_normalized_provider_id
payment_tape  (61M filas — desglose por contrato)
        ↓ match por disbursement_reference_code
disbursements_payments  (48M filas — detalle de liquidación)
        ↓ agrupado en
disbursements  (reportes diarios del gateway)
        ↓ match por account_id + date + amount
funds_transfers  (1.5M filas — movimientos bancarios reales)
```
