# Lógica de Conciliación — Todos los Clientes del Master Servicer

> **Propósito**: Este documento describe la lógica de conciliación de pagos para todos los borrowers/clientes activos en el repositorio `master-servicer-apps`. Está pensado para alimentar un chatbot que diagnostique por qué un pago específico no se concilió, qué errores ocurrieron en una corrida, y cómo resolverlos.

> **Fecha de generación**: 2026-05-28
> **Repositorios**: `master-servicer-apps` (lógica Python de conciliación) + `master-trust-servicer-api` (Kotlin — llaves de conciliación, modos por borrower, condiciones de conciliado)
> **Fuente de verdad de llaves de conciliación**: `master-trust-servicer-api` (prioridad sobre `master-servicer-apps` cuando hay discrepancia)

---

## Índice

1. [Marco general — ¿qué es conciliación?](#1-marco-general--qué-es-conciliación)
2. [Tipos de conciliación (enum `Type`)](#2-tipos-de-conciliación-enum-type)
3. [Tablas y entidades clave](#3-tablas-y-entidades-clave)
4. [Arquitectura — Scrappy (BPM) vs Entrypoints (script)](#4-arquitectura--scrappy-bpm-vs-entrypoints-script)
5. [Catálogo de clientes con su lógica](#5-catálogo-de-clientes-con-su-lógica)
   - 5.1 [INKLUSIVA](#51-inklusiva)
   - 5.2 [COOGRANCOLOMBIANA](#52-coograncolombiana)
   - 5.3 [EQUITY_LINK](#53-equity_link)
   - 5.4 [EXITUS](#54-exitus)
   - 5.5 [HILCO_ARRENDAMIENTOPRODUCTIVO](#55-hilco_arrendamientoproductivo)
   - 5.6 [NIKO](#56-niko)
   - 5.7 [VEMO](#57-vemo)
   - 5.8 [SOLVE / SOLVENTO](#58-solve--solvento)
   - 5.9 [ADDI / ADDI_BNPN](#59-addi--addi_bnpn)
   - 5.10 [WELLI](#510-welli)
   - 5.11 [SOMOS](#511-somos)
   - 5.12 [PAYJOY](#512-payjoy)
   - 5.13 [SISTECREDITO](#513-sistecredito)
   - 5.14 [CREDIORBE](#514-crediorbe)
   - 5.15 [DELTACREDIT](#515-deltacredit)
   - 5.16 [YUPPI](#516-yuppi)
   - 5.17 [Clientes sin conciliación activa (BIA, CESIONBANK, FINKARGO_COLOMBIA, HAYCASH, LIQUITECH, PRESTAVALE, JTP)](#517-clientes-sin-conciliación-activa)
6. [Catálogo de errores comunes — diagnóstico transversal](#6-catálogo-de-errores-comunes--diagnóstico-transversal)
7. [Árbol de decisión: ¿por qué no concilió el pago X?](#7-árbol-de-decisión-por-qué-no-concilió-el-pago-x)
8. [Queries útiles de diagnóstico](#8-queries-útiles-de-diagnóstico)
9. [Tabla resumen comparativa de todos los clientes](#9-tabla-resumen-comparativa-de-todos-los-clientes)
10. [Tips de implementación para el chatbot](#10-tips-de-implementación-para-el-chatbot)

---

## 1. Marco general — ¿qué es conciliación?

La **conciliación** es el proceso que cruza dos (o más) fuentes de datos de pagos para determinar:

- Qué pagos **hacen match** → marcar como `reconciled`, asignar IDs cruzados.
- Qué pagos **no hacen match** → marcar como `REJECTED` (en `payment_tape`) o dejar pendiente, notificar revisión manual.

El resultado se persiste en `payments_db` y es la base de la posterior **distribución** (envío del dinero a los inversionistas correspondientes).

### Pipeline general
```
Deudor paga → Gateway captura → VAAS registra Payment
                                    ↓
Banco/borrower envía archivo → file_parsing → payment_tape (PT)
                                    ↓
       Conciliación: cruza Payments ↔ PT ↔ Funds_Transfers ↔ Disbursements
                                    ↓
       Distribución: divide los reconciled entre los dueños del contrato
```

---

## 2. Tipos de conciliación (enum `ConciliationType`)

> **Fuente**: `master-trust-servicer-api/core/conciliation/Model.kt` (Kotlin — fuente de verdad del enum y persistence codes)

| Enum Kotlin | `persistence_code` en DB | Cruza | Cuándo aplica |
|-------------|--------------------------|-------|---------------|
| `PAYMENTS_VS_BORROWERS_CORE` | `PAYMENTS___VS___BORROWER_DB` | `payments` ↔ `borrower_payments` (sistema interno del borrower) | ADDI principalmente. Condición: `p.borrower_db_payment_id IS NOT NULL` |
| `BORROWERS_CORE_VS_PAYMENTS` | `PAYMENTS___VS___BORROWER_DB` | Inverso: `borrower_payments` ↔ `payments` | Mismo persistence code que el anterior. Condición: `bp.payments_conciliation_id IS NOT NULL` |
| `PAYMENTS_VS_PAYMENT_TAPE` | `PAYMENTS___VS___PAYMENT_TAPE` | `payments` ↔ `payment_tape` | Gateway-mediated (la mayoría de clientes). Condición: `p.payment_tape_conciliation_id IS NOT NULL` |
| `PAYMENT_TAPE_VS_PAYMENTS` | `PAYMENTS___VS___PAYMENT_TAPE` | Inverso: `payment_tape` ↔ `payments` | Mismo persistence code. Condición: `pt.payment_id IS NOT NULL` |
| `PAYMENTS_VS_BANK` | `PAYMENTS___VS___BANK` | `payments` ↔ `funds_transfers` o `disbursements` según gateway | ADDI, SOMOS, PAYJOY, SISTECREDITO, WELLI, YUPPI, DELTACREDIT, CREDIORBE. Ver lógica de `hasDisbursements` abajo. |
| `DISBURSEMENTS_VS_PAYMENTS` | — | `disbursements` ↔ `payments` | Condición: todos los `disbursements_payments.conciliation_id IS NOT NULL` para ese disbursement |
| `DISBURSEMENTS_VS_FUNDS_TRANSFERS` | — | `disbursements` ↔ `funds_transfers` | Stripe/Niko. Condición: `d.fund_transfer_id IS NOT NULL` |
| `PAYMENT_TAPE_VS_BANK` | — | `payment_tape` ↔ `funds_transfers` (sin Payment registrado) | Niko BBVA/ACTINVER — transferencia bancaria directa sin gateway |

> **Nota importante** (del código): `PAYMENTS_VS_BORROWERS_CORE` y `BORROWERS_CORE_VS_PAYMENTS` comparten el mismo `persistence_code = "PAYMENTS___VS___BORROWER_DB"` en la base de datos. Lo mismo ocurre con `PAYMENTS_VS_PAYMENT_TAPE` y `PAYMENT_TAPE_VS_PAYMENTS`. El índice MySQL usado cambia según la dirección de la conciliación:
> - `PAYMENTS_VS_BORROWERS_CORE` → `FORCE INDEX (idx_multi_payments_borrowerscore_by_prov_approved_date)`
> - `PAYMENTS_VS_PAYMENT_TAPE` → `FORCE INDEX (idx_multi_payments_paymenttape_by_prov_approved_date)`
> - `PAYMENTS_VS_BANK` → `FORCE INDEX (idx_multi_payments_bank_by_prov_approved_date)`

### Lógica `hasDisbursements` — cuándo se concilia vía `fund_transfer_id` directo vs vía `disbursement`

> **Fuente**: `master-trust-servicer-api/infra/repository/utils/conciliation/ConciliationRepositoryHelper.kt`

Para `PAYMENTS_VS_BANK`, la condición de "conciliado" depende de si el **gateway tiene disbursements** (agrupador intermedio como Stripe/Wompi payouts) o no:

```
GatewayConfig.hasDisbursements = true  → conciliado si d.fund_transfer_id IS NOT NULL
                                         (JOIN: payments → disbursements → fund_transfers)

GatewayConfig.hasDisbursements = false → conciliado si p.fund_transfer_id IS NOT NULL
                                         (conciliación directa payment → fund_transfer)
```

Cuando un borrower tiene **mezcla de gateways** (algunos con disbursements, otros sin), se genera un `CASE WHEN` dinámico:
```sql
CASE
  WHEN p.payment_gateway_code IN ('NEQUI', 'DRUO', ...)
  THEN p.fund_transfer_id IS NOT NULL
  ELSE d.fund_transfer_id IS NOT NULL
END
```

### Status de una `Conciliation`
- `PENDING`
- `SUCCESS`
- `INTERRUPTED` — el proceso se cortó a la mitad
- `ERROR` — falló con excepción

---

## 3. Tablas y entidades clave

### `payments_db.payments`
Pagos registrados por VAAS vía gateway.

| Columna | Uso en conciliación |
|---------|---------------------|
| `id` | UUID interno (suele renombrarse a `payments_uuid` en el código) |
| `provider_id` | ID del gateway (Stripe `pi_...`, Bancolombia, Efecty, etc.) — **llave principal** |
| `disbursement_reference_code` | `txn_...` de Stripe |
| `amount` | Monto (centavos en Stripe; moneda real en el resto) |
| `borrower_code` | EXITUS, NIKO, VEMO, ADDI, ... |
| `payment_gateway_code` | STRIPE, BBVA, ACTINVER, EFECTY, PSE, WOMPI, BANCOLOMBIA_TRANSFER, ... |
| `status` | APPROVED / PENDING / REJECTED |
| `approved_date` | Fecha de aprobación del gateway |
| `payment_tape_conciliation_id` | NULL = no conciliado contra PT. FK a `conciliations.id`. Condición de conciliado en master-trust-servicer-api: `p.payment_tape_conciliation_id IS NOT NULL` |
| `fund_transfer_conciliation_id` | NULL = no conciliado contra banco directamente (sin disbursement). Condición: `p.fund_transfer_id IS NOT NULL` |
| `disbursement_conciliation_id` | NULL = no conciliado contra payout (Stripe). FK a `conciliations.id` |
| `borrower_db_conciliation_id` | NULL = no conciliado contra sistema del borrower. Condición: `p.borrower_db_payment_id IS NOT NULL` |
| `borrower_db_payment_id` | ID en el sistema del borrower. **Unique constraint** en DB. Si NOT NULL → conciliado contra borrower core (`PAYMENTS_VS_BORROWERS_CORE`) |
| `disbursement_id` | FK a `disbursements.id`. Si NOT NULL y `disbursements.fund_transfer_id IS NOT NULL` → conciliado contra banco vía disbursement (`hasDisbursements=true`) |
| `fund_transfer_id` | FK a `funds_transfers.id`. Si NOT NULL → conciliado directamente contra banco (`hasDisbursements=false`) |
| `disbursement_reference_code` | `txn_...` de Stripe — usado para match en `disbursements_payments` |
| `provider_extra_information` | JSON con `reference`, `order_id`, etc. |
| `contract_id` | Contrato del deudor |

### `payments_db.payment_tape`
Archivo del banco/borrower con lo que efectivamente recibió.

| Columna | Uso |
|---------|-----|
| `id` | UUID interno |
| `gateway_payment_id` | Match contra `payments.provider_id` |
| `gateway_code` | STRIPE, BBVA, EFECTY, PSE, WOMPI, BANCOLOMBIA_CORRESPONDENT, ... |
| `borrower_payment_id` | "Número de recibo" en clientes mexicanos (Vemo / Exitus / Hilco) |
| `borrower_contract_id` | Contrato — usado para ownership |
| `total_payment` | Monto registrado |
| `net_amount` | Monto neto |
| `payment_date` | Fecha de depósito |
| `owner` | Dueño actual del contrato según el archivo |
| `payment_id` | Se setea cuando concilia (apunta a `payments.id`) |
| `status` | PENDING / RECONCILED / REJECTED |
| `extra_data.other_columns` | JSON adicional (`transfer_amount`, `transfer_date`, `aux_var_2`, etc.) |

### `payments_db.funds_transfers`
Movimientos reales del extracto bancario.

| Columna | Uso |
|---------|-----|
| `id` | UUID — `ft_uuid` |
| `account_id` | `bbva_mxn`, `actinver_mxn`, `bbva_usd`, ... |
| `date` | Fecha del movimiento |
| `amount` | Monto |
| `currency` | MXN / USD / COP |
| `provider_extra_data.aux_var_string_1` | Referencia/key del FT |
| `provider_extra_data.reference` | Reference adicional |

### `payments_db.disbursements` y `disbursements_payments` (Stripe)
- `disbursements`: payouts de Stripe (`po_...`) que agrupan múltiples transacciones individuales.
- `disbursements_payments`: transacciones individuales (`txn_...`) dentro de cada payout. Sus amounts vienen **negativos**.

### `payments_db.conciliations`
> **Fuente**: `master-trust-servicer-api/.claude/skills/ops.triage/references/table-schema.md`

Registro de cada ejecución de conciliación.

| Columna | Tipo | Uso |
|---------|------|-----|
| `id` | BIGINT PK | FK desde `payment_tape_conciliation_id`, `fund_transfer_conciliation_id`, `disbursement_conciliation_id`, `borrower_db_conciliation_id` en `payments` |
| `type` | VARCHAR | Persistence code del `ConciliationType` (ej: `PAYMENTS___VS___PAYMENT_TAPE`) |
| `from_date` | DATE | Inicio del rango de fechas del proceso |
| `until_date` | DATE | Fin del rango de fechas |
| `status` | VARCHAR | `PENDING`, `SUCCESS`, `INTERRUPTED`, `ERROR` |
| `result_checks_context` | JSON | Contexto de checks del resultado |
| `result_checks_description` | TEXT | Descripción legible del resultado |

### `payments_db.disbursements`
| Columna | Tipo | Uso |
|---------|------|-----|
| `id` | VARCHAR(36) UUID | FK desde `payments.disbursement_id` |
| `borrower_code` | VARCHAR | Borrower |
| `payment_gateway_code` | VARCHAR | Gateway (STRIPE, WOMPI, etc.) |
| `total_gross_amount` | DECIMAL | Monto bruto del payout |
| `total_net_amount` | DECIMAL | Monto neto |
| `total_fee_amount` | DECIMAL | Comisión |
| `report_date` | DATE | Fecha del reporte (usada para match con `funds_transfers.date`) |
| `status` | VARCHAR | Estado del disbursement |
| `fund_transfer_id` | CHAR(36) | Si NOT NULL → disbursement conciliado contra extracto bancario |
| `fund_transfer_conciliation_id` | BIGINT | FK a `conciliations.id` para la conciliación del FT |

### `payments_db.borrower_payments` (sistema interno del borrower)
Tabla del lado del borrower que se cruza en `PAYMENTS_VS_BORROWERS_CORE`.

| Columna | Uso |
|---------|-----|
| `id` | PK — match contra `payments.borrower_db_payment_id` |
| `payments_conciliation_id` | Si NOT NULL → conciliado contra `payments`. Condición `BORROWERS_CORE_VS_PAYMENTS`: `bp.payments_conciliation_id IS NOT NULL` |

### Ownership API
```python
self._ownership_client.get_atom_owners(contract_ids=[...], company_id=...)
# Retorna: originator_contract_id → owner_company_id
```

| Cliente | owner_company_id → dueño |
|---------|--------------------------|
| EXITUS | `187` = Hilco (LENDER_EXITUSMAESTRO_HILCO) |
| VEMO | `189` = LENDER_VEMOMAESTRO5902_HILCO, `190` = ..._1401_HILCO, `191` = ..._5926_HILCO |
| HILCO_ARRENDAMIENTOPRODUCTIVO | `234` = LENDER_ARRENDAMIENTOPROD11957_HILCO, `235` = LENDER_ARRENDAMIENTOPROD6156_HILCO |
| INKLUSIVA (en distribution) | Accial=`68`, Iris=`15`, Bancolombia=`72` |

---

## 4. Arquitectura — Scrappy (BPM) vs Entrypoints (script)

Existen **dos** arquitecturas:

### 4.1 Scrappy (BPM)
Tasks que reciben input por SQS desde un workflow BPM y ejecutan `ConciliationCalculationTask.job(input)`. Aplica a:
- INKLUSIVA, COOGRANCOLOMBIANA, EQUITY_LINK, EXITUS, HILCO_ARRENDAMIENTOPRODUCTIVO, NIKO, VEMO, SOLVE.

Estructura común:
```
python_apps/scrappy/<client>/conciliation/conciliation_calculation/
├── task.py          # Lógica principal
├── model.py         # Input/Output pydantic
├── sql_functions.py # Queries auxiliares (opcional)
└── test.py
```

Flujo:
```
BPM → SQS → queue_polling/bpm_task_trigger_queue_consumer.py
              → ScrappyManager.get_first_executable_task(input)
                → ConciliationCalculationTask.job(input)
```

### 4.2 Entrypoints (CLI / script directo)
Scripts que se corren manualmente o por cron. Aplica a:
- ADDI, ADDI_BNPN, SOMOS, PAYJOY, SISTECREDITO, WELLI, YUPPI, DELTACREDIT, CREDIORBE.

Estructura:
```
python_apps/entrypoints/conciliation/
├── payment_vs_bank/        # Cruzar payment ↔ funds_transfers (extracto)
├── payment_vs_payment_tape/# Cruzar payment ↔ payment_tape
└── payment_vs_borrowers_core/ # Cruzar payment ↔ sistema interno del borrower
```

Cada `main_<borrower>.py` invoca el `EntryPoint().handle_request(Request(Borrower.X))` y delega a los conciliators de `python_apps/core/conciliation/`:
- `payment_vs_bank/payment/conciliator.py` — implementaciones por gateway (Wompi, BancolombiaCorrespondent, DRUO, PayU, ...).
- `payment_vs_payment_tape/conciliator.py` — implementación genérica con casos especiales por borrower.
- `payment_vs_borrowers_core/conciliator.py` — usado por ADDI principalmente.

---

## 5. Catálogo de clientes con su lógica

### 5.1 INKLUSIVA

**Ruta**: `python_apps/scrappy/inklusiva/conciliation/conciliation_calculation/task.py`
**País**: Colombia | **Borrower ID**: 129 | **Roam group**: `a2d0a0a7-7f0f-4b1b-b4a3-c9c88b419036`
**Tolerancia unreconciled**: 10% por count
**Gateways**: EFECTY, PSE, WOMPI, BANCOLOMBIA_CORRESPONDENT, BANCOLOMBIA_FUNDS_TRANSFERS

#### Fuentes que carga
| Fuente | Filtro |
|--------|--------|
| `unreconciled_payments` | `status=APPROVED, conciliated=False, against=payment_tape` (provider_id .str.upper()) |
| `PT` | `get_unreconciled(company_id=129)` |
| `funds_transfer` | `against=payment_tape` |

#### Llaves de match por gateway

| Gateway | Llave del PT | Match con |
|---------|--------------|-----------|
| `EFECTY` | `gateway_payment_id + "-" + transfer_date(YYYY-MM-DD) + "-" + payer_legal_id` | `payments.provider_id` |
| `PSE` | `gateway_payment_id` | `payments.provider_id` |
| `WOMPI` (en PT, BANCOLOMBIA_TRANSFER en payments) | `gateway_payment_id` | `payments.provider_id` |
| `BANCOLOMBIA_CORRESPONDENT` | `YYYY-MM-DDT05:00:00+00:00 + "-" + amount_str + "-" + payer_legal_id + "-iN"` (uppercase) | `payments.provider_id` |
| `BANCOLOMBIA_FUNDS_TRANSFERS` | Forzado `reconciled=True` (TODO pendiente) | — |

#### Sufijo `-iN` (Bancolombia Correspondent)
Maneja duplicados: si la misma `(formatted_date, amount_str, payer_legal_id)` aparece 2+ veces, la primera es `-i1`, la segunda `-i2`, etc.
Si `borrower_contract_id == 'account_sweep'`, se hace match **tolerante**: se quita el sufijo `-iN` y se cruza por secuencia (`cumcount`).

#### Checks
```python
reconciled        = abs(total_PT_amount_per_key - payment.amount) < 0.1
application_check = ((capital + interes + interes_mora + garantia) - total_payment) < 1.1
final             = reconciled AND application_check
```

#### Manejo de unreconciled
- Si `unreconciled_count / total_pt_count > 10%` → Roam + `raise Exception` (HALT, no persiste).
- Si está entre 0-10% → Roam con warning, continúa.

#### Persistencia
- `Conciliation(type=PAYMENTS___VS___PAYMENT_TAPE, status=SUCCESS)`
- Linkea `payment_tape.payment_id` y `payments.payment_tape_conciliation_id`.

> **Bug detectado en código actual**: la variable `conciliation_process` se usa antes de ser definida en el bloque de persistencia (línea 300). Esto en sí es un error que puede hacer fallar la corrida.

---

### 5.2 COOGRANCOLOMBIANA

**Ruta**: `python_apps/scrappy/coograncolombiana/conciliation/conciliation_calculation/task.py`
**País**: Colombia | **Es prácticamente copia de Inklusiva** (incluso usa `Borrower("INKLUSIVA")` para insertar la Conciliation y manda email a equipos de Inklusiva).
**Gateways**: EFECTY, PSE, WOMPI, BANCOLOMBIA_CORRESPONDENT

#### Llaves
Iguales que Inklusiva (sección 5.1), con dos diferencias:
- `BANCOLOMBIA_CORRESPONDENT.amount_str` se redondea a `int` (no preserva decimales).
- No tiene path `BANCOLOMBIA_FUNDS_TRANSFERS` ni `account_sweep`.

#### Checks
```python
reconciled = abs(total_per_key - payment.amount) < 0.1
# Sin application_check ni ownership.
```

#### Diferencias clave vs Inklusiva
- **No tiene HALT** por unreconciled — siempre persiste lo que pudo conciliar y manda email con los rechazados (CSV adjunto vía `send_notification_with_attachment`).
- Persiste como `Borrower("INKLUSIVA")` (heredado del fork, no como COOGRANCOLOMBIANA).

> **Bug detectado**: `unreconciled_payments` se referencia pero nunca se carga en el código actual (sólo se carga PT y funds_transfer). La task no compilaría como está.

---

### 5.3 EQUITY_LINK

**Ruta**: `python_apps/scrappy/equity_link/conciliation/conciliation_calculation/task.py`
**País**: México | **Borrower ID**: 222 | **Roam group**: `f8f52506-a2fd-4400-a58d-c58840fe6a77`
**Tolerancia unreconciled**: SIN HALT — persiste todo lo que pueda y manda reporte por email.

#### Fuentes
- `unreconciled_payments` (Stripe-like: aplica prefix stripping `^sitb2` al `provider_id`).
- `PT`.

#### Llaves
```python
unreconciled_payments['provider_id'] = unreconciled_payments['provider_id'].str.replace(r'^sitb2', '', regex=True)
PT_aug = pd.merge(PT, payments,
                  left_on='gateway_payment_id', right_on='provider_id')
```

#### Checks
```python
pt_vs_dbst_conci      = abs(total_borrower_payment_id_amount - payment.amount) < 1
check_funds_transfers = True   # forzado: no concilia vs banco
check_ownership       = True   # fiso de garantías, no revisa ownership
reconciled            = pt_vs_dbst_conci
```

#### Persistencia
- `Conciliation(type=PAYMENTS___VS___PAYMENT_TAPE, status=SUCCESS)`.
- Manda Excel completo (reconciled + unreconciled + unmatched payments) vía `send_xlsx_notification` a equipos de Accial / Equity Link.
- Wraps todo en try/except: cualquier excepción → Roam + re-raise.

---

### 5.4 EXITUS

**Ruta**: `python_apps/scrappy/exitus/conciliation/conciliation_calculation/task.py`
**País**: México | **Borrower ID**: 165 | **Roam group**: `e38b3644-6c1a-4aa4-a76b-4a724dd24de4`
**Tolerancia unreconciled**: 0% (cualquier fallo → HALT)
**Gateway único**: 1 (sin diferenciar por gateway en código)

#### Llaves
```python
# Quitar sufijo -N del provider_id
unreconciled_payments['provider_id'] = unreconciled_payments['provider_id'].str.rsplit('-', n=1).str[0]

# Match: PT.gateway_payment_id ↔ payment.provider_id
PT_aug = pd.merge(PT, payments, left_on='gateway_payment_id', right_on='provider_id')
PT['total_borrower_payment_id_amount'] = PT.groupby('gateway_payment_id')['total_payment'].transform('sum')
```

#### Checks
```python
pt_vs_dbst_conci      = abs(total_borrower_payment_id_amount - payment.amount) < 1
check_funds_transfers = True  # No concilia vs banco
check_ownership       = (owner_api.lower() == PT.owner.lower())
reconciled            = AND de los 3
```

#### Ownership
- Default: `owner_api = 'Exitus'`.
- Si `owner_company_id == '187'` (Hilco): `owner_api = 'LENDER_EXITUSMAESTRO_HILCO'`.

#### Manejo de unreconciled
**HALT total** si hay cualquier item no conciliado. Mensaje a Roam con desglose:
```
EXITUS conciliation: N unreconciled item(s) out of TOTAL. Manual review required.
  - Amount mismatch (PT vs payments): X item(s)
  - Ownership mismatch: Y item(s)
```

---

### 5.5 HILCO_ARRENDAMIENTOPRODUCTIVO

**Ruta**: `python_apps/scrappy/hilco_arrendamientoproductivo/conciliation/conciliation_calculation/task.py`
**País**: México | **Borrower ID**: 233 | **Roam group**: `e38b3644-6c1a-4aa4-a76b-4a724dd24de4`
**Tolerancia unreconciled**: 0% (HALT)
**Cuenta única** (sin gateway split)

#### Funcionalidad especial: blacklist diaria
Antes de la conciliación se carga un archivo de S3:
```
s3://6fc5w786-clients-uploads-bucket/62da1067-e6ec-4813-94e0-9b5cb8246586/blacklists_constancias/
```
- Toma el archivo más reciente del día (en zona horaria America/Mexico_City).
- Lee columna `ID Contrato`.
- Filtra esos contratos del PT **antes** de cualquier conciliación (no entran al proceso).

#### Llave
```python
# borrower_payment_id (Número de recibo) ↔ payment.provider_extra_information.reference
pt_aug = pd.merge(pt, payments,
                  left_on='borrower_payment_id',
                  right_on='provider_extra_information.reference')
pt['total_by_recibo'] = pt.groupby('borrower_payment_id')['total_payment'].transform('sum')
```

#### Checks
```python
AMOUNT_TOLERANCE = 1
amount_match     = abs(total_by_recibo - payment.amount) < 1
check_ownership  = (owner_api.lower() == PT.owner.lower())
reconciled       = amount_match AND check_ownership
```

#### Ownership
- Default: `owner_api = 'Hilco_ArrendamientoProductivo'` (ORIGINATOR_NAME).
- Si `owner_company_id == '234'` → `LENDER_ARRENDAMIENTOPROD11957_HILCO`.
- Si `owner_company_id == '235'` → `LENDER_ARRENDAMIENTOPROD6156_HILCO`.

#### Manejo de unreconciled
HALT total. Mensaje a Roam con desglose por reason.

---

### 5.6 NIKO

**Ruta**: `python_apps/scrappy/niko/conciliation/conciliation_calculation/task.py`
**País**: México | **Borrower ID**: 151 | **Roam group**: `5caf710f-edd2-4d32-8650-af5b1ddf8e4d`
**Tolerancia unreconciled**: **10% por monto** (no por count)
**Gateways**: STRIPE, BBVA, ACTINVER

Niko mezcla dos modelos:
- **Path A: Stripe** — gateway con capa intermedia de Disbursements (payouts).
- **Path B: Banco directo (BBVA / ACTINVER)** — sin Payment registrado en VAAS; sólo PT y funds_transfers.

#### Mapa de cuentas bancarias
```python
BANK_ACCOUNT_IDS = {
    ('BBVA', 'MXN'):     'bbva_mxn',
    ('BBVA', 'USD'):     'bbva_usd',
    ('STRIPE', 'MXN'):   'actinver_mxn',
    ('STRIPE', 'USD'):   'actinver_usd',
    ('ACTINVER', 'MXN'): 'actinver_mxn',
    ('ACTINVER', 'USD'): 'actinver_usd',
}
```

#### Path A — STRIPE

Cadena: `PT → Payment → DisbursementPayment → Disbursement → FundTransfer`

```python
# 1. PT ↔ Payment
PT_stripe.merge(payments, left_on='gateway_payment_id', right_on='provider_id')

# 2. Payment ↔ DisbursementPayment (vía txn_id)
PT_stripe.merge(disbursements_payments,
                left_on='disbursement_reference_code', right_on='provider_id')

# 3. Disbursement ↔ FundTransfer (vía account + report_date)
disbursements['disb_account_id'] = BANK_ACCOUNT_IDS[(gateway, currency)]
merge_on=['disb_account_id', 'report_date_str'] vs ['account_id', 'date_str']

# Resolución de duplicados: tomar el FT con menor amount_diff
disb_ft = disb_ft.sort_values('amount_diff').drop_duplicates(['disbursement_uuid'], keep='first')
```

Tres checks (tolerancia < 1 MXN):
| Check | Validación |
|-------|------------|
| `payments_amount_check` | `payment.amount/100 ≈ PT.total_borrower_payment_id_amount` (Stripe en centavos) |
| `payments_disbursement_amount_check` | `disbursement_payment.gross_amount ≈ PT total` (gross_amount se recompone como `net + fee`) |
| `check_funds_transfers` | `disbursement.total_gross_amount ≈ FT.amount` |

#### Path B — BBVA / ACTINVER

```python
# Extrae transfer_amount del JSON extra_data.other_columns
PT_bank['transfer_amount'] = PT_bank['extra_data.other_columns'].apply(extract_transfer_amount)

# Agrupa filas del PT que comparten (gateway, currency, payment_date, transfer_amount)
# La suma del grupo debe igualar el transfer_amount.
# Match contra un FT (account_id, currency, date_str == pay_date) con menor amount_diff < 1.
```

#### Tolerancia (por monto)
```python
unreconciled_ratio = total_unreconciled_amount / total_amount
if unreconciled_ratio >= 0.10:
    raise Exception(...)  # HALT
else:
    proceed
```

#### Tipos persistidos
| Camino | Conciliation Type |
|--------|-------------------|
| Stripe matched | `DISBURSEMENTS___VS___FUNDS_TRANSFERS` + `PAYMENTS___VS___PAYMENT_TAPE` |
| Bank matched | `PAYMENT_TAPE___VS___BANK` |

---

### 5.7 VEMO

**Ruta**: `python_apps/scrappy/vemo/conciliation/conciliation_calculation/task.py`
**País**: México | **Borrower ID**: 160 | **Roam group**: `e38b3644-6c1a-4aa4-a76b-4a724dd24de4`
**Tolerancia unreconciled**: 0% (HALT)

Vemo sí concilia contra extracto bancario y usa `borrower_payment_id` (Número de Recibo) como llave.

#### Llaves
```python
# 1) PT ↔ Payments
PT.groupby('borrower_payment_id')['total_payment'].transform('sum')
merge(PT, payments,
      left_on='borrower_payment_id',
      right_on='provider_extra_information.reference')

# 2) PT ↔ Funds Transfers
funds_transfer['aux_var_string_1'].str.replace(r'^\d{4}-\d{2}-\d{2}-', '', regex=True)
funds_transfer['merge_key'] = date(YYYY-MM-DD) + "-" + aux_var_string_1
merge(PT, funds_transfer,
      left_on='borrower_payment_id', right_on='merge_key')
```

#### Checks
```python
pt_vs_dbst_conci      = abs(total_borrower_payment_id_amount - payment.amount) < 1
check_funds_transfers = abs(PT.amount - FT.amount) < 1 AND FT.amount IS NOT NULL
check_ownership       = (owner_api.lower() == PT.owner.lower())
reconciled = AND de los 3
```

#### Ownership (3 maestros de Hilco)
- Default: `owner_api = 'Vemo'`
- `189` → `LENDER_VEMOMAESTRO5902_HILCO`
- `190` → `LENDER_VEMOMAESTRO1401_HILCO`
- `191` → `LENDER_VEMOMAESTRO5926_HILCO`

#### Persistencia
- `Conciliation(type=PAYMENTS___VS___FUNDS_TRANSFERS, status=SUCCESS)`
- `Conciliation(type=PAYMENTS___VS___PAYMENT_TAPE, status=SUCCESS)`
- Linkea payment ↔ ft y payment ↔ pt.

---

### 5.8 SOLVE / SOLVENTO

**Ruta**: `python_apps/scrappy/solve/conciliation/conciliation_calculation/task.py`
**Es la implementación más simple**: lee CSVs (no usa storages).

#### Lógica
```python
payment_tape = pd.read_csv(config["payment_tape_path"], sep=";")
extracto     = pd.read_csv(config["extracto_path"], sep=";")

# Group PT por transfer_id, sumar amounts
pt_grouped = payment_tape.groupby("transfer_id").agg(pt_total_amount=("payment_amount", "sum"))

# Merge: transfer_id == payment_reference
merged = pd.merge(pt_grouped, extracto,
                  left_on="transfer_id", right_on="payment_reference")
merged["reconciled"] = abs(merged["pt_total_amount"] - merged["payment_amount"]) < 0.1
```

#### Características
- Tolerancia: < 0.1
- Sin HALT. Sólo loguea unreconciled.
- No persiste en DB (es ad-hoc).
- Output: `reconciled_count` y `unreconciled_count`.

---

### 5.9 ADDI / ADDI_BNPN

**Ruta**: `python_apps/entrypoints/conciliation/{payment_vs_bank,payment_vs_payment_tape,payment_vs_borrowers_core}/main_addi.py`
**País**: Colombia | **Borrower ID**: 1 (ADDI), 154 (ADDI_BNPN)
**Notifier**: Slack canal `NOTIFIER___SLACK___ADDI___CHANNEL`
**Tipo**: PAYMENTS___VS___BANK + PAYMENTS___VS___BORROWER_DB + PAYMENTS___VS___PAYMENT_TAPE

#### Gateways
- ADDI: `BANCOLOMBIA_CORRESPONDENT`, `DRUO`, `NEQUI`, `BANCOLOMBIA_COLLECT`, `PSE`.
- ADDI_BNPN: `PSE`.

#### Lógica (payment_vs_bank)
Usa `core/conciliation/payment_vs_bank/payment/conciliator.py` con implementaciones por gateway:
- `BancolombiaCorrespondent` — no tiene disbursement, sólo se concilia contra funds_transfers directamente.
- `Wompi` (NEQUI / BANCOLOMBIA_COLLECT / PSE) — match por `disbursement_reference_code` dentro de un payout en una ventana de ±30 días.
- `DRUO`, `PayU` — implementaciones específicas.

#### Match contra FT
```python
# Por defecto:
abs(payment.amount - fund_transfer.amount) <= Decimal('1')   # mismo día (delta 0)

# CREDIORBE override:
_match_amount_and_reference: amount Y (reference vacía OR reference iguala)
```

#### Lógica (payment_vs_borrowers_core)
- ADDI tiene su propio borrower_db con la tabla de pagos del lado del cliente.
- Cruza `payments_db.payments` contra el sistema interno → `PAYMENTS___VS___BORROWER_DB`.
- Persiste como `Type.PAYMENTS___VS___DISBURSEMENTS` (alias histórico).

#### addi_month_payments
Variante mensual en `entrypoints/conciliation/payment_vs_borrowers_core/addi_month_payments/` — corre conciliación de un mes entero.

---

### 5.10 WELLI

**Ruta**: `python_apps/entrypoints/conciliation/payment_vs_payment_tape/main_welli.py`
**País**: Colombia | **Borrower ID**: 33

Welli es un caso especial en `PaymentVsPaymentTapeConciliator.conciliate()`:

```python
if self.borrower == Borrower.WELLI:
    self._conciliate_wompi_payments(...)
    self._conciliate_correspondent_payments(...)
else:
    # Default: SQL stored procedure
    self.conciliations_storage.conciliate_payment_vs_payment_tape(...)
```

#### Lógica Wompi (Welli)
Para cada gateway en `WOMPI.get_supported_gateways()`:
- Carga payments (filtra por `gateway`, `status=APPROVED`).
- Carga PT (mismo gateway, no conciliados).
- Match con predicate:
  - **Welli + PSE**: `payment.provider_id == pt.gateway_payment_id` AND mismo gateway.
  - **Resto**: `payment.order_id == pt.gateway_payment_id` AND mismo gateway.
- Una `payment` puede aplicar a múltiples PT items (un cobro a varias cuotas).

#### Lógica BANCOLOMBIA_CORRESPONDENT (Welli)
Match con predicate:
```python
amount == total_payment AND approved_date.date() == payment_date.date() AND gateway == gateway
```
Una sola correspondencia 1-a-1 (rompe en el primer match).

#### Gateways
`BANCOLOMBIA_CORRESPONDENT`, `PSE`, `BANCOLOMBIA_TRANSFER`, `DAVIPLATA`, `NEQUI`.

---

### 5.11 SOMOS

**Ruta**: `python_apps/entrypoints/conciliation/{payment_vs_bank,payment_vs_payment_tape}/main_somos.py`
**País**: Colombia | **Borrower ID**: 32
**Mensaje de éxito**: `"Payments conciliation vs Invoice Report was made successfully."` (sí, "Invoice Report" no "Payment Tape")

#### Gateways
`PAYU`, `BANCOLOMBIA_COLLECT`, `BANCOLOMBIA_TRANSFER`, `NEQUI`, `PSE`, `CARD`, `DAVIPLATA`, `BANCOLOMBIA_QR`.

Cuando `gateway == WOMPI`, se expande a: NEQUI, PSE, BANCOLOMBIA_COLLECT, BANCOLOMBIA_TRANSFER, CARD, DAVIPLATA, BANCOLOMBIA_QR.

#### Lógica
- Usa la conciliación genérica del SP (no la lógica especial de Welli).
- `payment_vs_bank` con disbursements para WOMPI y PAYU.

---

### 5.12 PAYJOY

**Ruta**: `python_apps/entrypoints/conciliation/{payment_vs_bank,payment_vs_payment_tape}/main_payjoy.py`
**País**: Colombia | **Borrower ID**: 5

#### Gateways
`BANCOLOMBIA_CORRESPONDENT`, `EFECTY`, `NEQUI`, `PSE`, `BANCOLOMBIA_COLLECT`, `BANCOLOMBIA_TRANSFER`, `DAVIPLATA`, `REFACIL`, `MOVII`, `WOMPI`.

Cuando `gateway == WOMPI`: NEQUI, PSE, BANCOLOMBIA_COLLECT, BANCOLOMBIA_TRANSFER, DAVIPLATA.

#### Lógica
- Genérica (SP) para PT.
- `payment_vs_bank` para EFECTY, WOMPI, REFACIL, MOVII (todos con disbursements).

---

### 5.13 SISTECREDITO

**Ruta**: `python_apps/entrypoints/conciliation/{payment_vs_bank,payment_vs_payment_tape}/main_sistecredito.py`
**País**: Colombia | **Borrower ID**: 86

#### Gateways
`EFECTY`, `GANA`. Ambos tienen disbursements.

#### Lógica
Genérica, sin overrides especiales.

---

### 5.14 CREDIORBE

**Ruta**: `python_apps/entrypoints/conciliation/payment_vs_bank/main_crediorbe.py`
**País**: Colombia | **Borrower ID**: 31

#### Gateways
`BANCOLOMBIA`, `DAVIVIENDA`, `BANCO_BOGOTA`, `PSE` (PSE con disbursements).

#### Lógica especial
- En `payment_vs_bank`: usa `_match_amount_and_reference` (no solo amount). Match si amount cuadra AND (reference vacía OR iguala).
- En `payment_vs_payment_tape`: usa `_last_three_months` (no `_last_month`) para el `from_date`.

---

### 5.15 DELTACREDIT

**Ruta**: `python_apps/entrypoints/conciliation/payment_vs_bank/main_deltacredit.py`
**País**: Colombia | **Borrower ID**: 71

#### Gateways
`BANCOLOMBIA`, `BANCOLOMBIA_CORRESPONDENT`, `NEQUI`, `PSE`, `BANCOLOMBIA_COLLECT`, `BANCOLOMBIA_TRANSFER_2`, `DAVIPLATA`, `WOMPI`.

Cuando `gateway == WOMPI`: NEQUI, PSE, BANCOLOMBIA_COLLECT, BANCOLOMBIA_TRANSFER_2, DAVIPLATA.

#### Lógica
Genérica. WOMPI con disbursements.

---

### 5.16 YUPPI

**Ruta**: `python_apps/entrypoints/conciliation/payment_vs_bank/main_yuppi.py`
**País**: (Colombia/Argentina según contexto, no especificado en model.py)

#### Gateways
`DRUO`, `BANCOLOMBIA_COLLECT`, `NEQUI`.

#### Lógica
Genérica. Sólo tiene `payment_vs_bank`.

---

### 5.17 Clientes sin conciliación activa

Los siguientes borrowers existen en el enum `Borrower` pero **no tienen código de conciliación** en el repositorio actual:

| Cliente | Estado | Notas |
|---------|--------|-------|
| BIA | Solo distribution | No tiene módulo de conciliación |
| CESIONBANK | Solo distribution | No tiene módulo de conciliación |
| FINKARGO_COLOMBIA | Solo distribution | Borrower ID 232. No tiene módulo de conciliación (sólo distribución) |
| HAYCASH | Solo distribution | — |
| LIQUITECH | Stub | Existe `liquitech/conciliation/pre_conciliation/task.py` pero solo es placeholder (`# Do things!`) — no implementado |
| PRESTAVALE | Vacío | Sólo tiene `__pycache__` |
| JTP | Sólo en enum | Gateway: EFECTY |
| WIMO | Sólo en enum | — |
| SOLVENTO | Igual que SOLVE | Misma lógica |
| BORROWER_COL_DEMO | Demo | — |

> Cuando el usuario pregunte por estos clientes, responder: "No existe lógica de conciliación implementada actualmente para este cliente; sólo distribución/scraping."

---

## 6. Catálogo de errores comunes — diagnóstico transversal

Cuando el usuario pregunte *"¿por qué no concilió el pago X?"*, recorrer este catálogo en orden.

### 6.1. No existe el `Payment` en `payments_db.payments`

**Síntoma**: El usuario consulta un PT que no tiene `payment_id` y no hay payment con el `provider_id` esperado.

**Causa**:
- Webhook del gateway perdido / no procesado.
- Pago bancario directo sin gateway (caso normal en Niko BBVA/ACTINVER — no es error).
- `borrower_code` mal asignado en el payment.

**Detectar**:
```sql
SELECT * FROM payment_tape WHERE id = '<pt_id>';
SELECT * FROM payments WHERE provider_id = '<gateway_payment_id_del_pt>';
```

**Solución**: investigar el gateway. Si el pago existe, re-disparar el webhook o ingestar manualmente.

---

### 6.2. Existe el `Payment` pero no la fila en `payment_tape`

**Síntoma**: `payments.payment_tape_conciliation_id IS NULL` y no hay PT con el `gateway_payment_id`.

**Causa**: el banco/borrower no envió el archivo, o `file_parsing` falló.

**Detectar**:
```sql
SELECT * FROM payment_tape WHERE gateway_payment_id = '<payment.provider_id>';
```

**Solución**:
- **INKLUSIVA**: hay un `PtByVaasTask` (barrido) que sintetiza una PT a partir del payment si tiene >3 meses sin conciliar. Sólo aplica a `BANCOLOMBIA_CORRESPONDENT` y `EFECTY`.
- Otros clientes: cargar manualmente el PT.

---

### 6.3. Llave malformada (no hay match en merge)

**Síntoma**: ambos existen pero el `merge` deja la fila sin pareja (NaN del lado del payment).

**Causas frecuentes por cliente**:

| Cliente | Causa típica |
|---------|--------------|
| EXITUS | Sufijos `-N` no removidos del `provider_id` (la task ya los limpia con `rsplit('-', n=1)`) |
| EQUITY_LINK | Prefijo `sitb2` no removido (la task lo hace) |
| INKLUSIVA / COOGRANCOLOMBIANA / Bancolombia | Llave compuesta mal construida: `YYYY-MM-DDT05:00:00+00:00-amount-payer_id-iN` debe ser uppercase, el sufijo `-iN` debe coincidir; en Inklusiva la `amount_str` preserva decimales (`466434.56`), en Coograncolombiana se redondea a entero |
| INKLUSIVA / EFECTY | `transfer_date` mal parseado: debe ser YYYY-MM-DD en UTC |
| VEMO / HILCO | `borrower_payment_id` (Número de recibo) no coincide con `payment.provider_extra_information.reference` |
| NIKO / STRIPE | PT usa `provider_id` (`pi_...`) y no `txn_...` |

**Detectar**:
```sql
SELECT pt.id, pt.gateway_payment_id, p.provider_id, p.id AS payment_id
FROM payment_tape pt
LEFT JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.id = '<pt_id>';
```

Buscar diferencias char-by-char (espacios, mayúsculas/minúsculas, sufijos numéricos).

---

### 6.4. Monto no cuadra (`reconciled = False` por amount)

**Síntoma**: hay match en la llave pero la suma del PT ≠ payment.amount.

**Causas típicas**:
- **Stripe (Niko)**: olvidaron dividir `amount/100`. Stripe entrega en centavos.
- **Comisiones**: PT trae bruto y payment trae neto (o viceversa).
- **Pagos parciales**: un PaymentIntent cubre N cuotas → N filas de PT. Si solo se cargó M < N → la suma no llega. La task usa `groupby(...).transform('sum')` para evitarlo, pero si las llaves no son las mismas no agrupa.
- **Conversión de moneda**: PT en MXN, payment en USD sin conversión.
- **Inklusiva — `application_check`**: la **suma** está bien (`reconciled = True`) pero el desglose interno no (`capital + interes + mora + cargos ≠ total_aplicado` con tolerancia 1.1). El item queda como REJECTED.

**Tolerancias**:
| Cliente | Tolerancia amount |
|---------|-------------------|
| INKLUSIVA, COOGRANCOLOMBIANA | < 0.1 |
| EXITUS, VEMO, EQUITY_LINK, HILCO_ARRENDAMIENTOPRODUCTIVO, NIKO | < 1 |
| SOLVE | < 0.1 |
| Genérica (ADDI, etc.) | <= 1 (Decimal) |

**Detectar**:
```sql
SELECT pt.gateway_payment_id, SUM(pt.total_payment), p.amount
FROM payment_tape pt
JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.gateway_payment_id = '<X>'
GROUP BY pt.gateway_payment_id, p.amount;
```

---

### 6.5. Ownership mismatch (`check_ownership = False`)

Aplica a: **EXITUS, VEMO, HILCO_ARRENDAMIENTOPRODUCTIVO**.

**Síntoma**: el PT existe, los montos cuadran, pero `owner_api` (lo que dice la Ownership API) ≠ `PT.owner` (lo que dice el archivo del borrower).

**Detectar**:
```python
ownership = ownership_client.get_atom_owners(contract_ids=[<contract>], company_id=<id>)
# Comparar contra PT.owner
```

**Lógica esperada**:
| Cliente | Dueño default | Si está cedido |
|---------|---------------|----------------|
| EXITUS | `Exitus` | `LENDER_EXITUSMAESTRO_HILCO` (`187`) |
| VEMO | `Vemo` | `5902/1401/5926`_HILCO (`189/190/191`) |
| HILCO_ARRENDAMIENTOPRODUCTIVO | `Hilco_ArrendamientoProductivo` | `LENDER_ARRENDAMIENTOPROD11957_HILCO` (`234`), `LENDER_ARRENDAMIENTOPROD6156_HILCO` (`235`) |

**Solución**:
- Si la API está correcta y el PT trae el dueño viejo → corregir el archivo de PT.
- Si la API no se actualizó → forzar refresh de la cesión.

---

### 6.6. `check_funds_transfers = False` (no hay extracto que coincida)

Aplica a: **VEMO, NIKO**. (En EXITUS/EQUITY_LINK/HILCO está forzado a `True`.)

**Síntomas y causas**:
- **VEMO**: la llave `YYYY-MM-DD-aux_var_string_1` no encuentra match en `funds_transfers`. Posibles: regex de limpieza falló, formato de fecha distinto, `aux_var_string_1` con caracteres no esperados.
- **NIKO / Stripe**: no hay FT para el `(account_id derivado del gateway, report_date)`. Posible: la cuenta `BANK_ACCOUNT_IDS` mal mapeada, Stripe pagó en otra fecha (timezone).
- **NIKO / Banco**: no hay FT para `(account_id, date_str == payment_date, currency)` con `amount ≈ transfer_amount` (tolerancia 1).

**Detectar**:
```sql
-- Vemo
SELECT * FROM funds_transfers
WHERE date = '<payment_date>'
  AND provider_extra_data->>'aux_var_string_1' LIKE '%<borrower_payment_id>%';

-- Niko (banco directo)
SELECT * FROM funds_transfers
WHERE account_id = '<bbva_mxn|actinver_mxn|...>'
  AND date = '<pay_date>'
  AND currency = '<MXN|USD>'
  AND ABS(amount - <transfer_amount>) < 1;
```

---

### 6.7. Ambigüedad (varios FT en el mismo día/cuenta)

**Síntoma**: el `drop_duplicates(keep='first')` después de `sort_values('amount_diff')` puede haber elegido el FT incorrecto.

**Aplicación**: NIKO usa esto para resolver duplicados en Stripe (disbursement → FT) y en BBVA/ACTINVER (PT group → FT).

**Detectar**:
```sql
SELECT COUNT(*) FROM funds_transfers
WHERE date = '<X>' AND account_id = '<Y>';
-- > 1 = ambigüedad
```

**Solución**: añadir más criterios a la llave o limpiar duplicados en FT.

---

### 6.8. Stripe `amount` no se dividió por 100

Aplica a: **NIKO / STRIPE** únicamente.

**Síntoma**: `payments_amount_check` siempre falla con diferencias de 2 órdenes de magnitud (~99x).

**Diagnóstico**:
```python
abs(payment.amount / 100 - PT.total_borrower_payment_id_amount)
# Si la diferencia ≈ amount * 0.99 → falta /100
```

---

### 6.9. Disbursement de Stripe no encuentra FT (Niko)

**Síntoma**: todos los Stripe payments del mismo `disbursement_id` fallan `check_funds_transfers`.

**Causas**:
- Cuenta bancaria mal mapeada en `BANK_ACCOUNT_IDS`.
- Stripe pagó en una fecha distinta a `report_date` (timezone).
- El FT fue marcado `conciliated=True` por otro proceso → quedó fuera del filtro `filter_conciliated=False`.

**Detectar**:
```sql
SELECT d.id, d.report_date, d.total_gross_amount, d.payment_gateway_code, d.currency
FROM disbursements d WHERE d.id = '<disbursement_uuid>';

SELECT * FROM funds_transfers
WHERE account_id = '<expected>'
  AND date BETWEEN '<report_date>' - 1 AND '<report_date>' + 1
  AND currency = '<X>';
```

---

### 6.10. HALT por tolerancia 0% (Exitus / Vemo / Hilco)

**Síntoma**: la task corre, manda Roam, no hay nuevo registro en `conciliations` para ese día.

**Causa**: estos clientes tienen tolerancia **0%**. Un solo item que falle → HALT total.

**Mensaje Roam con el desglose**:
```
EXITUS conciliation: 3 unreconciled item(s) out of 152. Manual review required.
  - Amount mismatch (PT vs payments): 1 item(s), total MXN 1,200.00
  - Ownership mismatch: 2 item(s), total MXN 4,500.00
```

**Diagnóstico**: localizar el subset por el conteo y total, y cruzar con catálogos 6.3 / 6.4 / 6.5.

---

### 6.11. Niko sobrepasó el 10% de tolerancia (HALT)

**Síntoma**: NIKO halt-ea con mensaje `FAILING — exceeds 10% tolerance`.

**Diagnóstico**: revisar el desglose por reason en Roam:
- `STRIPE — Amount mismatch (PT vs payments)`
- `STRIPE — Amount mismatch (PT vs disbursements)`
- `STRIPE — Funds transfer not matched`
- `Bank transfer not matched`

---

### 6.12. Niko entre 0-10% — conciliación parcial

**Síntoma**: NIKO corre y persiste algunos; otros quedan como `REJECTED` en `payment_tape`.

**Detectar**:
```sql
SELECT id, gateway_payment_id, gateway_code, status, total_payment
FROM payment_tape
WHERE company_id = 151 AND status = 'REJECTED' AND payment_id IS NULL;
```

---

### 6.13. Inklusiva entre 0-10% — conciliación parcial

Misma lógica que Niko, pero por **count** (no por monto). Roam con desglose.

---

### 6.14. `application_check` falla (Inklusiva)

**Síntoma**: el item se concilia (suma correcta) pero queda REJECTED por desglose interno.

**Validación**:
```python
((current_principal + current_interest + moratory_interest + current_guarantee) - total_payment) < 1.1
```

**Causa**: el banco mandó componentes (capital/interés/mora/garantía) que no suman al total recaudado.

**Marca**: `payment_tape.status = REJECTED` (a veces con razón `PAGO_MAL_APLICADO`).

---

### 6.15. Llave especial `account_sweep` (Inklusiva)

Para `borrower_contract_id == 'account_sweep'`, Inklusiva hace match tolerante: quita el sufijo `-iN` y empareja por `cumcount` en lugar de exact match.

**Síntoma**: si el formato del `provider_id` correspondiente del payment no tiene `-iN`, o tiene un formato inconsistente, el match falla.

---

### 6.16. Conciliación interrumpida (`status = INTERRUPTED`)

**Síntoma**: la última conciliación en `conciliations` quedó como `INTERRUPTED` o `ERROR`.

**Causa**: la task se cortó (timeout, OOM, crash). El `finally` del conciliator marca `INTERRUPTED` si no terminó.

**Detectar**:
```sql
SELECT id, company_code, type, status, creation_date
FROM conciliations
WHERE company_code = :borrower AND status IN ('INTERRUPTED', 'ERROR')
ORDER BY creation_date DESC LIMIT 5;
```

**Solución**: re-correr la conciliación. La task crea una nueva `Conciliation` y marca la anterior como interrumpida.

---

### 6.17. `from_date` incorrecto

Aplica al conciliator genérico (`PaymentVsPaymentTapeConciliator._get_from_date`).

**Síntoma**: la conciliación arranca con `from_date > until_date`, levanta:
```
from_date filter is newer than until date_filter. just in case, check last conciliation date.
```

**Causa**: la configuración `start_conciliation_date` para el borrower es más reciente que `now - 1 day`.

**Solución**: revisar `config.start_conciliation_date[borrower_key]` o `start_conciliation_date["default"]`.

---

### 6.18. Bugs detectados en código actual (informe)

Si el chatbot detecta corridas fallidas en estos clientes, considerar como causa probable:

| Cliente | Bug |
|---------|-----|
| INKLUSIVA | `conciliation_process` se usa antes de definirse (línea 300 de `task.py`) — puede romper en runtime. |
| COOGRANCOLOMBIANA | `unreconciled_payments` se referencia pero nunca se carga — la task no compila ni corre. |
| WELLI | Hardcoded en el conciliador genérico, no escala. |

---

## 7. Árbol de decisión: ¿por qué no concilió el pago X?

```
Usuario pregunta: ¿Por qué el payment <X> no concilió?
│
├─ Detectar cliente (borrower_code)
│
├─ ¿El cliente tiene conciliación implementada?  (sección 5)
│   ├─ NO → "No hay lógica de conciliación implementada para este cliente."
│   └─ SI → seguir
│
├─ ¿Existe el Payment en payments_db.payments?
│   ├─ NO → 6.1 (gateway no notificó)
│   └─ SI → seguir
│
├─ ¿Es un cliente con conciliación contra extracto (no PT)?  [ADDI, SOMOS, PAYJOY, ...]
│   ├─ SI → ver 6.6 / 5.10-5.16 / Wompi gateway logic
│   └─ NO → seguir con PT
│
├─ ¿Existe la fila en payment_tape correspondiente?
│   ├─ NO → 6.2 (PT no ingestado)
│   └─ SI → seguir
│
├─ ¿Hizo match en el merge (llave correcta)?
│   ├─ NO → 6.3 (llave malformada — usar la tabla del cliente correspondiente)
│   └─ SI → seguir
│
├─ ¿El monto cuadra (tolerancia del cliente)?
│   ├─ NO → 6.4
│   └─ SI → seguir
│
├─ ¿El cliente hace ownership check?  [EXITUS, VEMO, HILCO_ARRENDAMIENTOPRODUCTIVO]
│   └─ SI:
│       ├─ ¿owner_api == PT.owner? → seguir
│       └─ NO → 6.5
│
├─ ¿El cliente hace funds_transfers check?  [VEMO, NIKO]
│   └─ SI:
│       ├─ ¿check_funds_transfers? → seguir
│       └─ NO → 6.6 / 6.7 / 6.9
│
├─ ¿El cliente hace application_check?  [INKLUSIVA]
│   └─ SI:
│       ├─ ¿((principal + interes + mora + garantia) - total) < 1.1? → reconciled ✓
│       └─ NO → 6.14
│
└─ ¿La task halt-eó (0% o 10% tolerance)?  [EXITUS, VEMO, HILCO=0%; NIKO, INKLUSIVA=10%]
    └─ SI → 6.10 / 6.11 / 6.13 — revisar Roam exacto
```

---

## 8. Queries útiles de diagnóstico

### 8.1. Estado global de un payment
```sql
SELECT id, borrower_code, provider_id, payment_gateway_code, status, amount,
       approved_date, payment_tape_conciliation_id, fund_transfer_conciliation_id,
       disbursement_conciliation_id, borrower_db_conciliation_id
FROM payments_db.payments
WHERE id = :payment_id;
```

### 8.2. PT asociado a un payment
```sql
SELECT pt.id AS pt_id, pt.gateway_payment_id, pt.gateway_code, pt.total_payment,
       pt.payment_date, pt.owner, pt.status, pt.payment_id, pt.borrower_payment_id,
       pt.borrower_contract_id
FROM payments_db.payment_tape pt
WHERE pt.gateway_payment_id = (
    SELECT provider_id FROM payments_db.payments WHERE id = :payment_id
);
```

### 8.3. Payments aprobados sin conciliar
```sql
SELECT id, provider_id, amount, approved_date, payment_gateway_code
FROM payments_db.payments
WHERE borrower_code = :borrower
  AND status = 'APPROVED'
  AND payment_tape_conciliation_id IS NULL
ORDER BY approved_date DESC;
```

### 8.4. PT rechazados con info de diagnóstico
```sql
SELECT pt.id, pt.gateway_payment_id, pt.gateway_code, pt.total_payment,
       pt.payment_date, pt.owner, p.id AS payment_exists, p.amount AS payment_amount,
       ABS(pt.total_payment - p.amount) AS amount_diff, pt.status
FROM payment_tape pt
LEFT JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.status = 'REJECTED'
  AND pt.company_id = :company_id;
```

### 8.5. Funds transfers candidatos (Niko banco)
```sql
SELECT * FROM funds_transfers
WHERE account_id = :expected_account_id
  AND DATE(date) = :payment_date
  AND currency = :currency
  AND ABS(amount - :transfer_amount) < 1;
```

### 8.6. Disbursements y sus FT (Niko Stripe)
```sql
SELECT d.id, d.provider_id AS payout_id, d.report_date, d.total_gross_amount,
       d.payment_gateway_code, d.currency,
       ft.id AS ft_id, ft.amount AS ft_amount,
       ABS(d.total_gross_amount - ft.amount) AS amount_diff
FROM disbursements d
LEFT JOIN funds_transfers ft
  ON ft.date = d.report_date AND ft.account_id = :expected_account_id
WHERE d.id = :disbursement_id;
```

### 8.7. Última corrida para un borrower
```sql
SELECT id, company_code, type, from_date, until_date, status, creation_date
FROM conciliations
WHERE company_code = :borrower
ORDER BY creation_date DESC LIMIT 10;
```

### 8.8. Conteo de reconciled vs unreconciled hoy
```sql
SELECT pt.status, COUNT(*) AS cnt, SUM(pt.total_payment) AS total
FROM payment_tape pt
WHERE pt.company_id = :company_id
  AND DATE(pt.last_update_date) = CURRENT_DATE
GROUP BY pt.status;
```

### 8.9. Llave de Bancolombia Correspondent (Inklusiva)
Para reproducir el match:
```python
# Format from PT side
formatted_date = pd.to_datetime(transfer_date).strftime('%Y-%m-%dT05:00:00+00:00')
amount_str = str(int(net_amount)) if net_amount == int(net_amount) else str(net_amount)
llave_base = f"{formatted_date}-{amount_str}-{payer_legal_id}"
# Add -iN suffix according to cumcount
llave = (llave_base + f"-i{N}").upper()
```

### 8.10. Ownership API (NO es SQL)
```python
ownership_client.get_atom_owners(contract_ids=[<contract_id>], company_id=<borrower_id>)
# Retorna pandas DataFrame con columnas: originator_contract_id, owner_company_id
```

---

## 9. Tabla resumen comparativa de todos los clientes

| Cliente | Arquitectura | País | Llave primaria | Tolerancia amt | Unreconciled HALT | Concilia vs Banco | Ownership Check | application_check | Special | `borrowers-core` (MTS) | `payment-tape` (MTS) | `bank` (MTS) |
|---------|--------------|------|----------------|----------------|-------------------|-------------------|-----------------|-------------------|---------|------------------------|----------------------|--------------|
| INKLUSIVA | Scrappy | CO | Por gateway (Bcol composite, Efecty composite, PSE/Wompi simple) | < 0.1 | 10% por count | NO | NO | SI (< 1.1) | account_sweep | ✅ | ✅ | ❌ |
| COOGRANCOLOMBIANA | Scrappy | CO | Idem Inklusiva (subset) | < 0.1 | No HALT (email CSV) | NO | NO | NO | Insert como INKLUSIVA | ✅ | ✅ | ❌ |
| EQUITY_LINK | Scrappy | MX | `gateway_payment_id` (sin prefijo `sitb2`) | < 1 | No HALT (XLSX email) | NO | NO (fiso) | NO | try/except Roam | ✅ | ✅ | ❌ |
| EXITUS | Scrappy | MX | `gateway_payment_id` (sin sufijo `-N`) | < 1 | 0% (HALT) | NO (forzado True) | SI | NO | — | ✅ | ✅ | ❌ |
| HILCO_ARRENDAMIENTOPRODUCTIVO | Scrappy | MX | `borrower_payment_id` ↔ `payment.provider_extra_information.reference` | < 1 | 0% (HALT) | NO | SI | NO | Blacklist S3 diaria | ✅ | ✅ | ❌ |
| NIKO | Scrappy | MX | Stripe: `pi_...`; Banco: `(account, date, transfer_amount)` | < 1 MXN | 10% por **monto** | SI (Stripe vía disb; banco directo) | NO | NO | Stripe en centavos, 3-layer match | ✅ | ✅ | ✅ |
| VEMO | Scrappy | MX | `borrower_payment_id` ↔ `payment.provider_extra_information.reference` | < 1 | 0% (HALT) | SI (date + aux_var_string_1) | SI (3 maestros) | NO | — | ✅ | ✅ | ✅ |
| SOLVE | Scrappy (CSV) | — | `transfer_id` ↔ `payment_reference` | < 0.1 | No HALT (log) | — | NO | NO | Ad-hoc CSV | ✅ | ✅ | ❌ |
| ADDI | Entrypoint | CO | Por gateway (Bcol Corr, Wompi, DRUO, PSE) | <= 1 | — | SI | — | — | borrower_db extra | ✅ enabled | ✅ enabled | ❌ disabled |
| ADDI_BNPN | Entrypoint | CO | Solo PSE | <= 1 | — | SI | — | — | — | ✅ | ✅ | ❌ |
| WELLI | Entrypoint (special) | CO | Wompi: `order_id` (PSE: `provider_id`); Bcol Corr: `amount+date+gateway` | exact eq | — | SI | — | — | Lógica custom inline | ✅ | ✅ | ✅ |
| SOMOS | Entrypoint | CO | Genérico (SP) | <= 1 | — | SI | — | — | WOMPI expansion | ✅ | ✅ | ✅ |
| PAYJOY | Entrypoint | CO | Genérico (SP) | <= 1 | — | SI | — | — | WOMPI expansion | ✅ | ✅ | ✅ |
| SISTECREDITO | Entrypoint | CO | Genérico (SP) | <= 1 | — | SI | — | — | EFECTY + GANA | ✅ | ✅ | ✅ |
| CREDIORBE | Entrypoint | CO | Genérico (SP) + match amount+reference en bank | <= 1 | — | SI | — | — | `_last_three_months` window | ✅ | ✅ | ✅ |
| DELTACREDIT | Entrypoint | CO | Genérico (SP) | <= 1 | — | SI | — | — | WOMPI expansion | ✅ | ✅ | ✅ |
| YUPPI | Entrypoint | — | Genérico | <= 1 | — | SI | — | — | DRUO/Bcol_collect/NEQUI | ✅ | ✅ | ✅ (desde 2025-01-01) |

---

## 10. Tips de implementación para el chatbot

1. **Identificar el cliente primero**. Cada cliente tiene una lógica distinta. Mapea cualquier alias del usuario al `Borrower.value` (mayúscula, sin espacios).

2. **Detectar la arquitectura del cliente**:
   - **Scrappy** → revisar mensajes de Roam de su `ROAM_GROUP_ID`.
   - **Entrypoint (script)** → revisar Slack channel (`NOTIFIER___SLACK___<BORROWER>___CHANNEL`).

3. **Cuando el usuario pregunte "¿por qué no concilió X?"**:
   - Paso 1: identificar el `Payment.id` y el `PaymentTapeItem.id` (si existe).
   - Paso 2: usar el [árbol de decisión](#7-árbol-de-decisión-por-qué-no-concilió-el-pago-x).
   - Paso 3: responder con (a) qué check falló, (b) valor esperado vs observado, (c) query que lo demuestra.

4. **Cuando el usuario pregunte "¿qué pasó en la última corrida?"**:
   - Query la última `Conciliation` por `(borrower, creation_date DESC)`.
   - Buscar mensajes de Roam/Slack recientes del cliente (cada cliente Scrappy tiene su Roam group; los Entrypoints tienen Slack channels).
   - Resumir: status, cantidad reconciled / unreconciled, principales razones.

5. **Diferencia importante entre arquitecturas**:
   - **Scrappy clients** (Inklusiva, Niko, Vemo, etc.) mandan resúmenes detallados a Roam con desglose por reason.
   - **Entrypoint clients** (ADDI, SOMOS, etc.) usan `result_checker` y mandan al Slack channel.

6. **Banderas de alarma por cliente**:
   - **EXITUS / VEMO / HILCO**: 0% tolerance → cualquier fallo destruye toda la corrida.
   - **INKLUSIVA**: 10% por count + `application_check` con tolerancia < 1.1.
   - **NIKO**: 10% por **monto** (no por count) + Stripe needs `/100`.
   - **EQUITY_LINK**: NUNCA halt-ea; manda XLSX, conviene mirar el reporte.
   - **COOGRANCOLOMBIANA**: bug actual — la task no carga `unreconciled_payments`, podría no estar corriendo.

7. **Para responder rápido**:
   - Cliente + razón → catálogo 6.X.
   - Monto exacto → 6.4 + tabla de tolerancias.
   - Llave → 6.3 + tabla de llaves por cliente en sección 5.

8. **Cuando un cliente "no tiene conciliación"** (sección 5.17): explicar que solo tiene scraping/distribution. No hay errores que diagnosticar.

9. **Glosario rápido**:
   - **PT** = `payment_tape` (archivo del banco/borrower).
   - **FT** = `funds_transfers` (extracto bancario).
   - **Provider ID** = ID del gateway en `payments.provider_id`.
   - **Cesión** = el contrato fue vendido a un inversionista (Hilco, Accial, etc.); cambia el ownership.
   - **Barrido** = proceso de Inklusiva que sintetiza PT para pagos viejos no conciliados.
   - **Disbursement** = payout agregado de Stripe.
   - **Punto de no retorno** = en el código de Scrappy, marca donde empieza la persistencia (después de validaciones).

---

## 11. Configuración de conciliación por borrower — `master-trust-servicer-api`

> **Fuente**: `master-trust-servicer-api/src/main/resources/business.yml` + `business-stg.yml`
> Esta sección documenta los modos de conciliación activos por borrower **según el Payments Hub** (master-trust-servicer-api). La lógica de ejecución está en `master-servicer-apps` (sección 5), pero las **condiciones de "conciliado"** y los **índices MySQL** que usa Payments Hub para mostrar métricas vienen de aquí.

### 11.1 Modos habilitados por borrower (PROD)

| Borrower | `borrowers-core` | `payment-tape` | `bank` | `bank.start-date` | Observaciones |
|----------|-----------------|----------------|--------|-------------------|---------------|
| **YUPPI** | ✅ enabled | ✅ enabled | ✅ enabled | 2025-01-01T00:00:00-05:00 | Demo user. Gateways: NEQUI, DRUO, BANCOLOMBIA_COLLECT |
| **ADDI** | ✅ enabled | ✅ enabled | ❌ disabled | — | borrowers-core = concilia vs sistema ADDI. bank_conciliation_required: false en distribución |
| **WELLI** | ✅ enabled | ✅ enabled | ✅ enabled | — | Gateways: BANCOLOMBIA_CORRESPONDENT, PSE, BANCOLOMBIA_TRANSFER, DAVIPLATA, NEQUI |
| **CREDIORBE** | ✅ enabled | ✅ enabled | ✅ enabled | — | Gateways: BANCOLOMBIA, DAVIVIENDA, BANCO_BOGOTA, PSE |
| **DELTACREDIT** | ✅ enabled | ✅ enabled | ✅ enabled | — | Gateways: BANCOLOMBIA, BANCOLOMBIA_CORRESPONDENT, NEQUI, PSE, WOMPI |
| **SISTECREDITO** | ✅ enabled | ✅ enabled | ✅ enabled | — | Gateways: EFECTY, GANA |
| **SOLVENTO** | ✅ enabled | ✅ enabled | — | — | — |
| Otros (WIMO, BIA, FINKARGO, etc.) | Según config | Según config | Según config | — | Ver business.yml |

### 11.2 Diferencias STG vs PROD

> **Fuente**: `business-stg.yml` sobrescribe `business.yml`

| Modo | PROD | STG |
|------|------|-----|
| `borrowers-core` | ✅ enabled | ✅ enabled |
| `payment-tape` | ✅ enabled | ❌ **disabled** |
| `bank` | ✅ enabled (desde 2025-01-01) | No configurado / diferente |

**Implicación**: En STG, `Payments Hub` solo muestra métricas de conciliación `borrowers-core`. Los payments que en PROD figurarían como conciliados via `payment-tape` o `bank` aparecerán como **no conciliados** en STG.

### 11.3 Estructura de `GatewayConfig` (por borrower + gateway en business.yml)

```yaml
borrower:
  YUPPI:
    gateways:
      NEQUI:
        enabled: true
        has-disbursements: false          # → concilia via p.fund_transfer_id directamente
        bank-concepts:
          - NEQUI_CONCEPT_CODE
      DRUO:
        enabled: true
        has-disbursements: false
      BANCOLOMBIA_COLLECT:
        enabled: true
        has-disbursements: false
        deprecated-date: null             # null = activo
```

**Campos clave de `GatewayConfig`**:

| Campo | Tipo | Efecto en conciliación |
|-------|------|------------------------|
| `enabled` | Boolean (default: true) | Si false, el gateway se ignora en las queries de métricas |
| `has-disbursements` | Boolean (default: true) | Si true: conciliado = `d.fund_transfer_id IS NOT NULL` (vía disbursement). Si false: conciliado = `p.fund_transfer_id IS NOT NULL` (directo) |
| `deprecated-date` | OffsetDateTime? | Si NOT NULL y fecha < referenceDate: gateway se excluye de los activos |
| `bank-concepts` | Set<BankConcept> | Conceptos bancarios que mapean a este gateway en el extracto |

### 11.4 Condiciones exactas de "conciliado" por tipo (código fuente)

> **Fuente**: `ConciliationRepositoryHelper.kt`

```kotlin
// PAYMENTS_VS_BORROWERS_CORE
reconciled:   "p.borrower_db_payment_id IS NOT NULL"
unreconciled: "p.borrower_db_payment_id IS NULL"

// BORROWERS_CORE_VS_PAYMENTS
reconciled:   "bp.payments_conciliation_id IS NOT NULL"
unreconciled: "bp.payments_conciliation_id IS NULL"

// PAYMENTS_VS_PAYMENT_TAPE
reconciled:   "p.payment_tape_conciliation_id IS NOT NULL"
unreconciled: "p.payment_tape_conciliation_id IS NULL"

// PAYMENT_TAPE_VS_PAYMENTS
reconciled:   "pt.payment_id IS NOT NULL"
unreconciled: "pt.payment_id IS NULL"

// DISBURSEMENTS_VS_PAYMENTS (todos los disbursements_payments conciliados)
reconciled:   "NOT EXISTS (SELECT 1 FROM disbursements_payments dp WHERE dp.disbursement_id = d.id AND dp.conciliation_id IS NULL)"
unreconciled: "EXISTS (SELECT 1 FROM disbursements_payments dp WHERE dp.disbursement_id = d.id AND dp.conciliation_id IS NULL)"

// DISBURSEMENTS_VS_FUNDS_TRANSFERS
reconciled:   "NOT EXISTS (SELECT 1 FROM disbursements d WHERE d.fund_transfer_id = ft.id)"  [cuando !reconciled]
unreconciled: opuesto

// PAYMENTS_VS_BANK (gateway sin disbursements, hasDisbursements=false)
reconciled:   "p.fund_transfer_id IS NOT NULL"
unreconciled: "p.fund_transfer_id IS NULL"

// PAYMENTS_VS_BANK (gateway con disbursements, hasDisbursements=true)
reconciled:   "d.fund_transfer_id IS NOT NULL"
unreconciled: "d.fund_transfer_id IS NULL"

// PAYMENTS_VS_BANK (mezcla — CASE WHEN dinámico)
reconciled:
  CASE
    WHEN p.payment_gateway_code IN (<gateways_sin_disbursements>)
    THEN p.fund_transfer_id IS NOT NULL
    ELSE d.fund_transfer_id IS NOT NULL
  END
```

### 11.5 Queries de diagnóstico adicionales (Payments Hub)

#### Ver todos los tipos de conciliación para un borrower
```sql
SELECT type, status, from_date, until_date, creation_date
FROM payments_db.conciliations
WHERE type IN ('PAYMENTS___VS___BORROWER_DB', 'PAYMENTS___VS___PAYMENT_TAPE', 'PAYMENTS___VS___BANK')
ORDER BY creation_date DESC
LIMIT 20;
```

#### Estado de conciliación de un payment (todas las dimensiones)
```sql
SELECT
  p.id,
  p.borrower_code,
  p.payment_gateway_code,
  p.status,
  -- BORROWERS_CORE
  CASE WHEN p.borrower_db_payment_id IS NOT NULL THEN 'CONCILIADO' ELSE 'NO' END AS vs_borrower_core,
  -- PAYMENT_TAPE
  CASE WHEN p.payment_tape_conciliation_id IS NOT NULL THEN 'CONCILIADO' ELSE 'NO' END AS vs_payment_tape,
  -- BANK directo (hasDisbursements=false)
  CASE WHEN p.fund_transfer_id IS NOT NULL THEN 'CONCILIADO' ELSE 'NO' END AS vs_bank_directo,
  -- BANK vía disbursement (hasDisbursements=true)
  CASE WHEN p.disbursement_id IS NOT NULL AND d.fund_transfer_id IS NOT NULL THEN 'CONCILIADO' ELSE 'NO' END AS vs_bank_disbursement
FROM payments_db.payments p
LEFT JOIN payments_db.disbursements d ON d.id = p.disbursement_id
WHERE p.id = ':payment_id';
```

#### Payments conciliados en borrowers-core pero NO en payment-tape
```sql
SELECT p.id, p.borrower_code, p.amount, p.approved_date, p.borrower_db_payment_id
FROM payments_db.payments p
WHERE p.borrower_code = ':borrower'
  AND p.borrower_db_payment_id IS NOT NULL
  AND p.payment_tape_conciliation_id IS NULL
  AND p.status = 'APPROVED'
ORDER BY p.approved_date DESC;
```
