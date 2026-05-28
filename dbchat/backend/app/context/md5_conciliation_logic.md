# Lógica de Conciliación — Exitus, Niko y Vemo

> **Nota sobre selección**: Inicialmente seleccioné Liquitech, Exitus y Niko al azar, pero el módulo de Liquitech solo contiene un stub vacío (`pre_conciliation` placeholder). Lo reemplacé por **Vemo**, que tiene lógica de conciliación completa y comparable. Los 3 clientes documentados aquí son **Exitus**, **Niko** y **Vemo**.

---

## Tabla de contenido

1. [Contexto general del proceso de conciliación](#1-contexto-general-del-proceso-de-conciliación)
2. [Tablas y entidades principales](#2-tablas-y-entidades-principales)
3. [Cliente: EXITUS](#3-cliente-exitus)
4. [Cliente: NIKO](#4-cliente-niko)
5. [Cliente: VEMO](#5-cliente-vemo)
6. [Catálogo de errores comunes y cómo diagnosticarlos](#6-catálogo-de-errores-comunes-y-cómo-diagnosticarlos)
7. [Árbol de decisión para diagnosticar un pago no conciliado](#7-árbol-de-decisión-para-diagnosticar-un-pago-no-conciliado)
8. [Queries útiles para diagnóstico](#8-queries-útiles-para-diagnóstico)

---

## 1. Contexto general del proceso de conciliación

La **conciliación** es el proceso que cruza dos (o más) fuentes de datos de pagos para determinar qué pagos hacen *match* (reconciled) y cuáles no (unreconciled / REJECTED). El resultado se persiste en `payments_db`.

### Tipos de conciliación (enum `Type`)

| Tipo | Qué cruza | Cuándo aplica |
|------|-----------|---------------|
| `PAYMENTS___VS___PAYMENT_TAPE` | `payments` ↔ `payment_tape` | Gateway-mediated (Stripe, Efecty, PSE, Wompi, etc.) |
| `PAYMENTS___VS___FUNDS_TRANSFERS` | `payments` ↔ `funds_transfers` | Validación contra el extracto bancario |
| `DISBURSEMENTS___VS___FUNDS_TRANSFERS` | `disbursements` ↔ `funds_transfers` | Stripe (porque los payouts se hacen en batch) |
| `PAYMENT_TAPE___VS___BANK` | `payment_tape` ↔ `funds_transfers` | Pagos sin gateway (transferencia bancaria directa) |

### Flujo general de una `ConciliationCalculationTask`

```
1. _payment_storage.get_payments_between_approved_dates(conciliated=False, ...)
2. _payment_tape_storage.get_unreconciled(company_id=...)
3. _fund_transfer_storage.get_between_dates(...)            # opcional
4. _disbursement_storage.get_disbursements_between_reports_dates(...)  # opcional (Stripe)
5. Construir llave de conciliación (merge keys)             # ← AQUÍ FALLA LO MÁS FRECUENTE
6. pd.merge(...) entre las fuentes
7. Calcular flags: pt_vs_dbst_conci, check_funds_transfers, check_ownership, etc.
8. reconciled = AND de todos los flags
9. Si hay unreconciled → enviar Roam + raise Exception (HALT)
10. Persistir Conciliation, link payment_tape.payment_id, marcar REJECTED
```

### Estado de un Payment / Payment Tape Item

| Estado | Columna `payment_tape_conciliation_id` | Significado |
|--------|----------------------------------------|-------------|
| Sin conciliar | `NULL` | Aún no se cruza con PT |
| Conciliado | `<uuid>` | Tiene PT asociado |
| REJECTED | `status = REJECTED` en `payment_tape` | PT que no encontró match |

---

## 2. Tablas y entidades principales

### `payments_db.payments`
Pagos registrados por VAAS vía el gateway. Columnas relevantes:

| Columna | Uso en conciliación |
|---------|---------------------|
| `id` | UUID interno — se renombra a `payments_uuid` en el código |
| `provider_id` | ID del gateway (Stripe `pi_...`, Bancolombia, Efecty, etc.) — **llave primaria de match** |
| `disbursement_reference_code` | Stripe `txn_...` (solo Stripe) |
| `amount` | Monto **en centavos para Stripe**, en moneda real para otros |
| `borrower_code` | Identificador del cliente (EXITUS, NIKO, VEMO, ...) |
| `payment_gateway_code` | STRIPE, BBVA, ACTINVER, EFECTY, PSE, ... |
| `status` | APPROVED, PENDING, REJECTED |
| `approved_date` | Fecha de aprobación |
| `payment_tape_conciliation_id` | NULL = no conciliado |
| `fund_transfer_conciliation_id` | NULL = no conciliado contra banco |
| `disbursement_conciliation_id` | NULL = no conciliado contra payout (Stripe) |
| `contract_id` | Contrato del deudor |

### `payments_db.payment_tape`
Archivo enviado por el banco/borrower con lo que el sistema cobró. Columnas relevantes:

| Columna | Uso |
|---------|-----|
| `id` | UUID interno |
| `gateway_payment_id` | ID del gateway — se cruza contra `payments.provider_id` |
| `gateway_code` | Pasarela del PT (STRIPE, BBVA, ACTINVER, ...) |
| `borrower_payment_id` | Número de recibo (clave alterna usada por Vemo/Exitus/Hilco) |
| `borrower_contract_id` | Contrato — usado para ownership check |
| `total_payment` | Monto registrado |
| `payment_date` | Fecha de depósito |
| `owner` | Dueño actual del contrato según el PT |
| `payment_id` | Se setea al ID del payment cuando se concilia |
| `status` | RECONCILED / REJECTED / PENDING |
| `extra_data.other_columns` | JSON adicional (incluye `transfer_amount` para Niko) |

### `payments_db.funds_transfers`
Movimientos reales en el extracto bancario:

| Columna | Uso |
|---------|-----|
| `id` | UUID — renombrado a `ft_uuid` |
| `account_id` | Cuenta bancaria de destino (`bbva_mxn`, `actinver_mxn`, etc.) |
| `date` | Fecha del movimiento bancario |
| `amount` | Monto |
| `currency` | MXN, USD |
| `provider_extra_data.aux_var_string_1` | String auxiliar usado en llaves de Vemo |

### `payments_db.disbursements` (solo Stripe / Niko)
Payout batches de Stripe — cada payout agrupa varias transacciones individuales.

### `payments_db.disbursements_payments`
Transacciones individuales dentro de un payout. `provider_id` se cruza con `payments.disbursement_reference_code`.

### Ownership API
Se llama vía `self._ownership_client.get_atom_owners(contract_ids, company_id)` y retorna a quién pertenece cada contrato:

```
originator_contract_id → owner_company_id
```

`owner_company_id`:
- `187` = Hilco (cedido desde Exitus)
- `189`, `190`, `191` = Hilco (cedido desde Vemo, 3 maestros: 5902 / 1401 / 5926)

---

## 3. Cliente: EXITUS

**Ruta**: `python_apps/scrappy/exitus/conciliation/conciliation_calculation/task.py`
**Roam group ID**: `e38b3644-6c1a-4aa4-a76b-4a724dd24de4`
**Tolerancia de unreconciled**: `0%` (cualquier item no conciliado → HALT)

### Fuentes que carga

| Fuente | Filtro |
|--------|--------|
| `unreconciled_payments` | `status=APPROVED, conciliated=False, conciliation_against=payment_tape` |
| `PT` | `get_unreconciled(company_id=input.borrower_id)` |
| `funds_transfer` | **No se carga** (Exitus no concilia contra extracto bancario) |
| Ownership | `get_atom_owners(contract_ids, borrower_id)` |

### Llave de conciliación

```python
# PT.provider_id se construye eliminando el sufijo de duplicado (-N)
unreconciled_payments['provider_id'] = unreconciled_payments['provider_id'].str.rsplit('-', n=1).str[0]

# Cruce: PT.gateway_payment_id  ↔  payments.provider_id
PT_aug = pd.merge(left=PT, right=unreconciled_payments,
                  left_on='gateway_payment_id', right_on='provider_id', how='left')

# Suma de monto por gateway_payment_id (un payment puede partirse en N filas de PT)
PT['total_borrower_payment_id_amount'] = PT.groupby('gateway_payment_id')['total_payment'].transform('sum')
```

### Checks que deben pasar

```python
pt_vs_dbst_conci    = abs(total_borrower_payment_id_amount - payment.amount) < 1
check_funds_transfers = True   # forzado: Exitus no concilia contra banco
check_ownership     = (owner_api.lower() == PT.owner.lower())

reconciled = pt_vs_dbst_conci AND check_funds_transfers AND check_ownership
```

### Lógica de ownership

- Default: `owner_api = "Exitus"`
- Si el contrato fue cedido a Hilco (`owner_company_id == '187'` en la API): `owner_api = "LENDER_EXITUSMAESTRO_HILCO"`
- Match case-insensitive contra `PT.owner`.

### Manejo de unreconciled

Si hay **cualquier** item no conciliado:

```
EXITUS conciliation: N unreconciled item(s) out of TOTAL. Manual review required.
  - Amount mismatch (PT vs payments): X item(s), total MXN ...
  - Amount mismatch (payments vs funds transfers): X item(s), total MXN ...
  - Ownership mismatch: X item(s), total MXN ...
```

→ Mensaje a Roam + `raise Exception` (NO se persiste nada).

### Persistencia (cuando todo pasa)

```python
Conciliation(type=PAYMENTS___VS___PAYMENT_TAPE, status=SUCCESS)
update_payment_vs_payment_tape_conciliation_information_by_matches(company, conciliation_id, paired_list)
batch_update_status(ids=unreconciled_pt_uuids, status='REJECTED')
```

Nota: `payment_tape.payment_id` se setea para los reconciled y `payment_tape_conciliation_id` queda con el ID nuevo.

---

## 4. Cliente: NIKO

**Ruta**: `python_apps/scrappy/niko/conciliation/conciliation_calculation/task.py`
**Roam group ID**: `5caf710f-edd2-4d32-8650-af5b1ddf8e4d`
**Tolerancia de unreconciled**: `10%` por **monto** (no por count) — `UNRECONCILED_TOLERANCE = 0.10`

Niko es el cliente más complejo porque mezcla dos modelos:
- **Path A: Stripe** — pagos con gateway, pero Stripe paga en batches → capa intermedia de Disbursements.
- **Path B: Banco directo (BBVA / ACTINVER)** — no hay `Payment` registrado en VAAS porque el deudor transfiere directo al banco. Sólo existen filas en `payment_tape` y movimientos en `funds_transfers`.

### Mapa de cuentas bancarias

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

### Fuentes que carga

| Fuente | Para qué |
|--------|----------|
| `unreconciled_payments` | Solo aplica a Stripe |
| `PT` | Todas las pasarelas (STRIPE, BBVA, ACTINVER) |
| `funds_transfer` (`conciliation_against=disbursement`) | Para ambos paths |
| `disbursements_payments` | Mapa txn → disbursement (solo Stripe) |
| `disbursements` (gateway=STRIPE) | Payout batches |

### Path A — STRIPE

Cadena: `PT → Payment → DisbursementPayment → Disbursement → FundTransfer`

#### Llaves de cada join

```python
# 1. PT ↔ Payment
PT_stripe.merge(payments, left_on='gateway_payment_id', right_on='provider_id')

# 2. PT ↔ DisbursementPayment
PT_stripe.merge(disbursements_payments,
                left_on='disbursement_reference_code', right_on='provider_id')

# 3. Disbursement ↔ FundTransfer
# Por (account_id derivado del gateway, report_date)
disbursements['disb_account_id'] = BANK_ACCOUNT_IDS[(gateway_code, currency)]
disbursements.merge(funds_transfer,
                    left_on=['disb_account_id', 'report_date_str'],
                    right_on=['account_id', 'date_str'])
```

#### Tres checks de Stripe

| Check | Validación | Tolerancia |
|-------|------------|------------|
| `payments_amount_check` | `abs(payment.amount / 100 - PT.total_borrower_payment_id_amount) < 1` | < 1 MXN |
| `payments_disbursement_amount_check` | `abs(disbursement_payment.gross_amount - PT.total_borrower_payment_id_amount) < 1` | < 1 MXN |
| `check_funds_transfers` | `abs(disbursement.total_gross_amount - ft.amount) < 1` | < 1 MXN |

**Nota importante**: Stripe entrega `amount` en centavos, hay que dividir entre 100. `disbursements_payments.gross_amount` se recompone vía `gross + fee` antes del check.

```python
PT_stripe['reconciled'] = (
    payments_amount_check
    & payments_disbursement_amount_check
    & check_funds_transfers
)
```

#### Resolución de ambigüedad
Si dos disbursements caen el mismo día en la misma cuenta, se toma el FT con menor `amount_diff`:

```python
disb_ft = disb_ft.sort_values('amount_diff').drop_duplicates(
    subset=['disbursement_uuid'], keep='first'
)
```

### Path B — Banco directo (BBVA / ACTINVER)

No hay `Payment` ni `Disbursement`. Se cruza directamente PT contra el extracto.

#### Llave

```python
# Las PT vienen con extra_data.other_columns en JSON:
#   {"transfer_amount": 12345.67, ...}
# Se agrupan filas del PT por (gateway, currency, payment_date, transfer_amount)
# y se compara contra un FT del mismo (account_id, date, currency).

group_cols = ['gateway_code', 'currency', 'payment_date', 'transfer_amount']
for (gateway_code, currency, pay_date, transfer_amount), group_df in PT_bank.groupby(group_cols):

    # Sanity: las filas del PT deben sumar el transfer_amount
    if abs(group_df['total_payment'].sum() - transfer_amount) >= 1:
        continue

    account_id = BANK_ACCOUNT_IDS[(gateway_code, currency)]
    ft_candidates = funds_transfer[
        (account_id) & (currency) & (date_str == pay_date)
    ]
    best_match = ft_candidates.sort_values('amount_diff').iloc[0]

    if best_match['amount_diff'] < 1:
        # reconcile this group
```

### Tolerancia de unreconciled (por monto)

```python
unreconciled_ratio = total_unreconciled_amount / total_amount

if unreconciled_ratio >= 0.10:    # 10%
    msg = "NIKO conciliation: ... FAILING — exceeds 10% tolerance"
    send_roam_message(msg, ROAM_GROUP_ID)
    raise Exception(msg)
else:
    msg = "NIKO conciliation: ... Within 10% tolerance — proceeding."
    send_roam_message(msg, ROAM_GROUP_ID)
    # continúa
```

### Tipos de Conciliation persistidos

| Camino | Conciliation Type |
|--------|-------------------|
| Stripe matched | `DISBURSEMENTS___VS___FUNDS_TRANSFERS` + `PAYMENTS___VS___PAYMENT_TAPE` |
| Bank matched | `PAYMENT_TAPE___VS___BANK` |
| No matched | `payment_tape.status = REJECTED` |

---

## 5. Cliente: VEMO

**Ruta**: `python_apps/scrappy/vemo/conciliation/conciliation_calculation/task.py`
**Roam group ID**: `e38b3644-6c1a-4aa4-a76b-4a724dd24de4`
**Tolerancia de unreconciled**: `0%` (cualquier item no conciliado → HALT)

Vemo es similar a Exitus pero **sí concilia contra extracto bancario** (`funds_transfers`) y usa una llave distinta basada en `borrower_payment_id` (Número de Recibo).

### Fuentes que carga

| Fuente | Filtro |
|--------|--------|
| `unreconciled_payments` | `status=APPROVED, conciliated=False, conciliation_against=payment_tape` |
| `PT` | `get_unreconciled(company_id=input.borrower_id)` |
| `funds_transfer` | `filter_conciliated=False, conciliation_against=payment` |
| Ownership | `get_atom_owners(contract_ids, borrower_id)` |

### Llave de conciliación

#### 1) PT ↔ Payments

```python
PT['total_borrower_payment_id_amount'] = PT.groupby('borrower_payment_id')['total_payment'].transform('sum')

# Join: PT.borrower_payment_id ↔ payment.provider_extra_information.reference
PT_aug = pd.merge(PT, unreconciled_payments,
                  left_on='borrower_payment_id',
                  right_on='provider_extra_information.reference',
                  how='left')
```

#### 2) PT ↔ Funds Transfers (extracto)

```python
# Limpia prefijos de fecha en aux_var_string_1 del FT
funds_transfer['provider_extra_data.aux_var_string_1'] = (
    funds_transfer['provider_extra_data.aux_var_string_1']
        .str.replace(r'^\d{4}-\d{2}-\d{2}-', '', regex=True)
)

# Llave de FT: YYYY-MM-DD + "-" + aux_var_string_1
funds_transfer['merge_key'] = (
    pd.to_datetime(funds_transfer['date']).dt.strftime('%Y-%m-%d')
    + '-' + funds_transfer['provider_extra_data.aux_var_string_1']
)

# Cruce con PT por borrower_payment_id == merge_key
PT_aug = pd.merge(PT_aug, funds_transfer,
                  left_on='borrower_payment_id',
                  right_on='merge_key', how='left')
```

### Checks que deben pasar

```python
pt_vs_dbst_conci      = abs(total_borrower_payment_id_amount - payment.amount) < 1
check_funds_transfers = abs(PT.amount - FT.amount) < 1   # y FT.amount no nulo
check_ownership       = (owner_api == PT.owner)   # case-insensitive

reconciled = pt_vs_dbst_conci AND check_funds_transfers AND check_ownership
```

### Lógica de ownership (3 maestros distintos)

```python
owner_api = 'Vemo'  # default
# Si el contrato fue cedido a Hilco a través de uno de los 3 maestros:
# owner_company_id 189 → LENDER_VEMOMAESTRO5902_HILCO
# owner_company_id 190 → LENDER_VEMOMAESTRO1401_HILCO
# owner_company_id 191 → LENDER_VEMOMAESTRO5926_HILCO
```

### Persistencia

```python
Conciliation(type=PAYMENTS___VS___FUNDS_TRANSFERS, status=SUCCESS)
Conciliation(type=PAYMENTS___VS___PAYMENT_TAPE,    status=SUCCESS)
# Linkea: payment ↔ ft, y payment ↔ pt
batch_update_status(ids=unreconciled_pt_uuids, status='REJECTED')
```

---

## 6. Catálogo de errores comunes y cómo diagnosticarlos

Esta sección es la más útil para tu chatbot: cuando el usuario pregunte *"¿por qué no concilió el pago X?"*, hay que recorrer este catálogo en orden y devolver la primera causa probable.

### 6.1. No existe el `Payment` en `payments_db.payments`

**Síntoma**: El usuario pregunta por un PT que no tiene `payment_id`.

**Causa**: VAAS nunca registró el pago en el gateway. Posibles motivos:
- El gateway no notificó (webhook perdido).
- Pago hecho por transferencia bancaria directa (caso normal en Niko BBVA/ACTINVER — no aplica como error).
- `borrower_code` o `payment_gateway_code` mal asignados.

**Cómo detectarlo**:
```sql
SELECT * FROM payment_tape WHERE id = '<pt_id>' AND payment_id IS NULL;
SELECT * FROM payments WHERE provider_id = '<gateway_payment_id_del_pt>';
-- Si la 2da query no retorna nada → el payment no existe
```

**Solución**: Investigar el gateway (Stripe dashboard, Bancolombia portal, etc.). Si el pago existe pero VAAS no lo capturó, hay que ingestarlo manualmente o re-disparar el webhook.

---

### 6.2. Existe el `Payment` pero no la fila en `payment_tape`

**Síntoma**: El payment tiene `payment_tape_conciliation_id = NULL` y no hay PT que lo referencie.

**Causa**: El banco/borrower no envió el archivo o el `file_parsing` falló al insertarlo.

**Cómo detectarlo**:
```sql
SELECT * FROM payments WHERE id = '<payment_id>' AND payment_tape_conciliation_id IS NULL;
SELECT * FROM payment_tape WHERE gateway_payment_id = '<payment.provider_id>';
-- Si la 2da query no retorna nada → el PT no se ingestó
```

**Solución (Inklusiva)**: Hay un proceso de **barrido** (`PtByVaasTask`) que sintetiza una fila de PT a partir del payment para forzar la conciliación. Aplica si el payment es >3 meses viejo. No aplica directo a Exitus / Niko / Vemo — habría que cargar manualmente el PT.

---

### 6.3. Llave (`provider_id` / `gateway_payment_id`) no hace match

**Síntoma**: Existen ambos (Payment y PT) pero el `merge` deja la fila sin pareja (NaN del lado del Payment).

**Causa**:
- Sufijos de duplicado (`-1`, `-2`) no removidos. Exitus hace `str.rsplit('-', n=1).str[0]`; Niko no.
- Espacios en blanco, ceros a la izquierda perdidos por casting numérico.
- En Vemo la llave usa `borrower_payment_id` (no `gateway_payment_id`). Si el PT trae mal el Número de Recibo → no hay match.
- En Niko Stripe la llave es `provider_id` (PaymentIntent `pi_...`). Si el PT trae el `txn_...` por error → no hay match.

**Cómo detectarlo**:
```sql
SELECT pt.id, pt.gateway_payment_id, p.provider_id
FROM payment_tape pt
LEFT JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.id = '<pt_id>';
```

Buscar diferencias char-by-char (longitud, mayúsculas, sufijos numéricos).

**Solución**: Corregir el PT o el payment según corresponda. A veces requiere parche en la lógica de `file_parsing`.

---

### 6.4. Monto no cuadra (`pt_vs_dbst_conci = False`)

**Síntoma**: Match en llave pero `total_borrower_payment_id_amount` ≠ `payment.amount`.

**Causas frecuentes**:
- **Stripe**: olvidaron dividir `payment.amount / 100` (Stripe maneja centavos). En Niko esto está explícito; si se desactivara, fallaría todo Stripe.
- **Comisiones**: el PT trae el bruto, el payment el neto (o viceversa).
- **Pagos parciales**: un PaymentIntent cubre 3 cuotas → 3 filas de PT. Si solo se cargó 1 → el sum no llega al total. Por eso se usa `.groupby(...).transform('sum')`.
- **Conversión de moneda**: PT en MXN, payment en USD sin conversión.

**Cómo detectarlo**:
```sql
SELECT pt.gateway_payment_id, SUM(pt.total_payment) AS sum_pt, p.amount AS payment_amount
FROM payment_tape pt
JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.gateway_payment_id = '<X>'
GROUP BY pt.gateway_payment_id, p.amount;
```

Diferencia > tolerancia (Exitus/Vemo: 1; Niko: 1 MXN) → falla este check.

**Solución**: Cargar las filas faltantes del PT, corregir montos, o ajustar tolerancia si la diferencia es por redondeo.

---

### 6.5. Ownership mismatch (`check_ownership = False`)

**Síntoma**: PT existe, montos cuadran, pero `owner_api` (lo que dice la Ownership API) no coincide con `PT.owner` (lo que dice el archivo del borrower).

**Causa**:
- El contrato fue cedido a Hilco pero el archivo del borrower aún registra al originador como dueño.
- O al revés: el archivo dice "cedido" pero la API aún no fue actualizada.

**Lógica esperada por cliente**:

| Cliente | Dueño default | Si está cedido a Hilco |
|---------|---------------|------------------------|
| Exitus | `Exitus` | `LENDER_EXITUSMAESTRO_HILCO` (owner_company_id `187`) |
| Vemo | `Vemo` | `LENDER_VEMOMAESTRO5902_HILCO` (`189`), `..._1401_HILCO` (`190`), `..._5926_HILCO` (`191`) |
| Niko | N/A | Niko no hace check de ownership |

**Cómo detectarlo**:
```python
# A través de la API
ownership = self._ownership_client.get_atom_owners(contract_ids=[<contract>], company_id=...)
# vs. el campo PT.owner
```

**Solución**:
1. Verificar en la API quién es el dueño actual.
2. Si la API está correcta y el PT trae el dueño viejo → corregir el archivo de PT.
3. Si el archivo es correcto pero la API no se actualizó → forzar refresh de la cesión.

---

### 6.6. `check_funds_transfers = False` — no hay movimiento bancario que coincida

**Síntoma**: Match en PT y Payment, pero el extracto no muestra el ingreso.

**Por cliente**:
- **Exitus**: hard-coded a `True` (Exitus no concilia contra banco). **No puede fallar.**
- **Niko / Stripe**: falta el FT para el `report_date` y `account_id` del disbursement.
- **Niko / Banco**: falta el FT del `(account_id, date, currency, amount ≈ transfer_amount)`.
- **Vemo**: la llave compuesta `date + aux_var_string_1` no encontró match en el FT, o el monto difiere.

**Cómo detectarlo**:
```sql
-- Vemo
SELECT * FROM funds_transfers
WHERE date = '<payment_date>'
  AND provider_extra_data->>'aux_var_string_1' LIKE '%<borrower_payment_id>%';

-- Niko (banco)
SELECT * FROM funds_transfers
WHERE account_id = '<bbva_mxn|actinver_mxn|...>'
  AND date = '<pay_date>'
  AND currency = '<MXN|USD>'
  AND abs(amount - <transfer_amount>) < 1;
```

**Solución**:
- El banco aún no envió el extracto → esperar.
- El FT existe pero la llave está mal construida → debuggear la regex / formato de `aux_var_string_1`.
- Múltiples FT del mismo día y monto → el código elige el de menor `amount_diff`; revisar si eligió uno equivocado.

---

### 6.7. `check_funds_transfers = False` por ambigüedad (varios FT en el mismo día/cuenta)

**Síntoma**: Match aparente pero el `drop_duplicates(keep='first')` después de `sort_values('amount_diff')` eligió el FT equivocado.

**Cómo detectarlo**:
```sql
SELECT COUNT(*) FROM funds_transfers
WHERE date = '<X>' AND account_id = '<Y>';
-- > 1 = ambigüedad
```

**Solución**:
- Añadir más criterios a la llave (referencia bancaria, descriptor).
- Limpiar duplicados en el FT antes de la conciliación.

---

### 6.8. Falla la conciliación del payout completo (Niko / Stripe)

**Síntoma**: Todos los Stripe payments del mismo `disbursement_id` fallan `check_funds_transfers`.

**Causa**: El disbursement de Stripe (`po_...`) no encuentra su FT correspondiente. Posibles:
- Cuenta bancaria mal mapeada en `BANK_ACCOUNT_IDS`.
- Stripe pagó en una fecha distinta a `report_date` (timezones).
- El FT fue marcado como `conciliated=True` en otro proceso → no entró al filtro.

**Cómo detectarlo**:
```sql
SELECT d.id, d.report_date, d.total_gross_amount, d.payment_gateway_code, d.currency
FROM disbursements d
WHERE d.id = '<disbursement_uuid>';

SELECT * FROM funds_transfers
WHERE account_id = '<expected_account_id>'
  AND date BETWEEN '<report_date>' - 1 AND '<report_date>' + 1
  AND currency = '<X>';
```

---

### 6.9. La task levanta `Exception` y no persiste nada (Exitus / Vemo)

**Síntoma**: La task corre, manda mensaje a Roam, y no hay nuevo registro en `conciliations` para ese día.

**Causa**: Exitus y Vemo tienen tolerancia 0%. **Si hay UN solo PT que falle cualquier check** → HALT total.

**El mensaje de Roam dice exactamente qué falló**:

```
EXITUS conciliation: 3 unreconciled item(s) out of 152. Manual review required.
  - Amount mismatch (PT vs payments): 1 item(s), total MXN 1,200.00
  - Ownership mismatch: 2 item(s), total MXN 4,500.00
```

**Diagnóstico**: usar el conteo y el monto para localizar el subset; cruzar con los catálogos 6.3 / 6.4 / 6.5.

---

### 6.10. Niko entre el 10% — corre pero no concilia todo

**Síntoma**: Niko corre, persiste algunos, otros quedan en `REJECTED`. Conciliación parcial.

**Causa**: Niko permite hasta `unreconciled_ratio < 10%` por monto. Los items rechazados se marcan `status=REJECTED` en `payment_tape`.

**Cómo detectarlo**:
```sql
SELECT id, gateway_payment_id, status, total_payment
FROM payment_tape
WHERE company_id = <NIKO_id>
  AND status = 'REJECTED'
  AND payment_id IS NULL;
```

Mensaje en Roam:
```
NIKO conciliation: 4 unreconciled item(s) out of 50 (3.2% of total MXN 1,200,000.00). Within 10% tolerance — proceeding.
  - STRIPE — Amount mismatch (PT vs payments): 2 item(s), total MXN ...
  - Bank transfer not matched: 2 item(s), total MXN ...
```

**Solución**: revisar el detalle por reason en Roam, corregir manualmente los REJECTED y volver a cargar.

---

### 6.11. Stripe `amount` no se dividió por 100

**Solo aplica a Niko**. Específico de Stripe.

**Síntoma**: `payments_amount_check` siempre falla con diferencias de 2 órdenes de magnitud.

**Diagnóstico**:
```python
abs(payments.amount / 100 - PT.total_borrower_payment_id_amount)
# Si es muy grande (~99x el monto), el /100 está mal o falta
```

---

## 7. Árbol de decisión para diagnosticar un pago no conciliado

```
¿El usuario pregunta por qué un payment X no concilió?
│
├─ ¿Existe en payments_db.payments?
│   ├─ NO → 6.1 (gateway no notificó / VAAS no capturó)
│   └─ SI → seguir
│
├─ ¿Existe la fila en payment_tape con gateway_payment_id = provider_id?
│   ├─ NO → 6.2 (PT no ingestado)
│   └─ SI → seguir
│
├─ ¿Hizo match en el merge?
│   ├─ NO (PT.payments_uuid es NaN) → 6.3 (llave malformada)
│   └─ SI → seguir
│
├─ ¿pt_vs_dbst_conci = True?
│   ├─ NO → 6.4 (monto no cuadra)
│   └─ SI → seguir
│
├─ ¿Cliente hace check_ownership?
│   └─ SI (Exitus/Vemo):
│       ├─ ¿check_ownership = True?  → seguir
│       └─ NO → 6.5 (ownership mismatch)
│
├─ ¿Cliente hace check_funds_transfers? (Niko/Vemo)
│   └─ SI:
│       ├─ ¿check_funds_transfers = True? → reconciled = True ✓
│       └─ NO → 6.6 / 6.7 / 6.8 (problema con extracto bancario)
│
└─ ¿La task halt-eó (tolerancia 0% en Exitus/Vemo)?
    └─ SI → 6.9 (revisar mensaje Roam exacto)
```

---

## 8. Queries útiles para diagnóstico

### 8.1. Status global de un payment

```sql
SELECT
    id,
    borrower_code,
    provider_id,
    payment_gateway_code,
    status,
    amount,
    approved_date,
    payment_tape_conciliation_id,
    fund_transfer_conciliation_id,
    disbursement_conciliation_id
FROM payments_db.payments
WHERE id = :payment_id;
```

### 8.2. PT asociado a un payment

```sql
SELECT
    pt.id            AS pt_id,
    pt.gateway_payment_id,
    pt.gateway_code,
    pt.total_payment,
    pt.payment_date,
    pt.owner,
    pt.status,
    pt.payment_id    AS linked_payment_id,
    pt.borrower_payment_id,
    pt.borrower_contract_id
FROM payments_db.payment_tape pt
WHERE pt.gateway_payment_id = (
    SELECT provider_id FROM payments_db.payments WHERE id = :payment_id
);
```

### 8.3. Payments aprobados sin conciliar para un borrower

```sql
SELECT id, provider_id, amount, approved_date, payment_gateway_code
FROM payments_db.payments
WHERE borrower_code = :borrower
  AND status = 'APPROVED'
  AND payment_tape_conciliation_id IS NULL
ORDER BY approved_date DESC;
```

### 8.4. PT rechazados con su razón potencial

```sql
SELECT
    pt.id,
    pt.gateway_payment_id,
    pt.gateway_code,
    pt.total_payment,
    pt.payment_date,
    pt.owner,
    p.id AS payment_exists,
    p.amount AS payment_amount,
    abs(pt.total_payment - p.amount) AS amount_diff,
    pt.status
FROM payment_tape pt
LEFT JOIN payments p ON pt.gateway_payment_id = p.provider_id
WHERE pt.status = 'REJECTED';
```

### 8.5. Funds transfers candidatos para un PT (Niko banco)

```sql
SELECT *
FROM funds_transfers
WHERE account_id = :expected_account_id          -- ej. 'bbva_mxn'
  AND DATE(date) = :payment_date
  AND currency = :currency
  AND ABS(amount - :transfer_amount) < 1;
```

### 8.6. Disbursements y sus FT (Niko Stripe)

```sql
SELECT
    d.id,
    d.provider_id     AS payout_id,
    d.report_date,
    d.total_gross_amount,
    d.payment_gateway_code,
    d.currency,
    ft.id             AS ft_id,
    ft.amount         AS ft_amount,
    ABS(d.total_gross_amount - ft.amount) AS amount_diff
FROM disbursements d
LEFT JOIN funds_transfers ft
  ON ft.date = d.report_date
 AND ft.account_id = :expected_account_id
WHERE d.id = :disbursement_id;
```

### 8.7. Ownership esperado de un contrato

Esto no es SQL — sale de la Ownership API:

```python
ownership_client.get_atom_owners(contract_ids=[<contract_id>], company_id=<borrower_id>)
# Retorna: originator_contract_id → owner_company_id
# Lookup esperado:
#   Exitus → 187 = LENDER_EXITUSMAESTRO_HILCO
#   Vemo   → 189 = LENDER_VEMOMAESTRO5902_HILCO
#                  190 = LENDER_VEMOMAESTRO1401_HILCO
#                  191 = LENDER_VEMOMAESTRO5926_HILCO
```

### 8.8. Última conciliación corrida para un borrower

```sql
SELECT id, company_code, type, from_date, until_date, status, creation_date
FROM conciliations
WHERE company_code = :borrower
ORDER BY creation_date DESC
LIMIT 10;
```

---

## Resumen final por cliente

| Aspecto | EXITUS | NIKO | VEMO |
|---------|--------|------|------|
| Llave principal | `PT.gateway_payment_id` ↔ `payment.provider_id` | Stripe: `gateway_payment_id` ↔ `provider_id`<br>Banco: `(account, date, transfer_amount)` | `PT.borrower_payment_id` ↔ `payment.provider_extra_information.reference` |
| Suma agrupada por | `gateway_payment_id` | `gateway_payment_id` | `borrower_payment_id` |
| Concilia vs extracto bancario | NO (forzado a True) | SÍ (Stripe vía disbursement; banco directo) | SÍ |
| Check de ownership | SÍ (Exitus / LENDER_EXITUSMAESTRO_HILCO) | NO | SÍ (3 maestros de Hilco) |
| Conciliation types persistidos | `PAYMENTS___VS___PAYMENT_TAPE` | `DISBURSEMENTS___VS___FUNDS_TRANSFERS` + `PAYMENTS___VS___PAYMENT_TAPE` + `PAYMENT_TAPE___VS___BANK` | `PAYMENTS___VS___FUNDS_TRANSFERS` + `PAYMENTS___VS___PAYMENT_TAPE` |
| Tolerancia por monto | < 1 | < 1 MXN | < 1 |
| Tolerancia global de unreconciled | 0% (HALT cualquier fallo) | 10% por monto | 0% (HALT cualquier fallo) |
| Capa intermedia de disbursement | NO | SÍ (solo Stripe) | NO |
| Roam group | `e38b3644-6c1a-4aa4-a76b-4a724dd24de4` | `5caf710f-edd2-4d32-8650-af5b1ddf8e4d` | `e38b3644-6c1a-4aa4-a76b-4a724dd24de4` |
| Acción sobre unreconciled | `payment_tape.status = REJECTED` (si llega a persistir) | `payment_tape.status = REJECTED` | `payment_tape.status = REJECTED` (si llega a persistir) |

---

## Tips de implementación para el chatbot

1. **Cuando el usuario pregunte "¿por qué no concilió X?"**: empezar por el paso 1 del [árbol de decisión](#7-árbol-de-decisión-para-diagnosticar-un-pago-no-conciliado), correr las queries de la sección 8 en orden.
2. **Cuando el usuario pregunte "¿qué errores hubo en la última corrida?"**: buscar el mensaje más reciente de Roam para el group_id del cliente (o leer del log de la task). Cada mensaje incluye el desglose por razón.
3. **Si el usuario menciona un cliente específico**: ya sabes el roam_group, los conciliation types esperados, y la tolerancia. Eso te permite responder cosas como *"En Exitus la tolerancia es 0%, así que la corrida del 2025-05-26 falló por completo. La razón fue ownership mismatch en 2 contratos"*.
4. **Diferencia clave Niko vs los demás**: Niko sí persiste conciliaciones parciales si está bajo el 10%. Exitus y Vemo no — o todo o nada.
5. **Para reportar la causa raíz**: siempre devolver (a) qué check falló, (b) el valor esperado vs el observado, (c) la query SQL que lo demuestra.
