# MD4 — Catálogo de Borrowers VAAS

> Referencia de todos los borrowers del sistema. Crítico para generar queries correctas: cada tabla usa un identificador diferente para el borrower.

---

## REGLA DE BÚSQUEDA POR TABLA

| Tabla | Campo a usar | Valor ejemplo |
|---|---|---|
| `payments` | `borrower_code` | `'ADDI'` |
| `payment_tape` | `company_id` | `267` |
| `borrower_db_payments` | `borrower_code` | `'ADDI'` |
| `funds_transfers` | `borrower_code` | `'ADDI'` |
| `disbursements` | `borrower_code` | `'ADDI'` |
| `disbursements_payments` | `borrower_code` | `'ADDI'` |
| `conciliations` | `company_code` | `'ADDI'` |
| `process_execution` | `borrower_code` | `'ADDI'` |

⚠️ **`payment_tape` es la única tabla que usa `company_id` (entero) en lugar de `borrower_code` (string).** Cuando hagas joins entre `payment_tape` y otras tablas, no uses `company_id = borrower_code` directamente — mapea usando esta tabla.

---

## CATÁLOGO COMPLETO

| ID | Name | Code | País | Timezone | Activo desde |
|---|---|---|---|---|---|
| 267 | WOM | WOM | COL | America/Bogota | Abr/2026 |
| 243 | Hilco_Fortaleza | HILCO_FORTALEZA | MEX | America/Mexico_City | Mar/2026 |
| 242 | Hilco_MasLeasing | HILCO_MASLEASING | MEX | America/Mexico_City | Mar/2026 |
| 236 | Hilco_JollyHaul | HILCO_JOLLYHAUL | MEX | America/Mexico_City | Mar/2026 |
| 233 | Hilco_ArrendamientoProductivo | HILCO_ARRENDAMIENTOPRODUCTIVO | MEX | America/Mexico_City | Mar/2026 |
| 232 | Finkargo Colombia | FINKARGO_COLOMBIA | COL | America/Bogota | Mar/2026 |
| 231 | Alese | ALESE | PER | America/Lima | Mar/2026 |
| 230 | Hilco_BAYPORT | HILCO_BAYPORT | MEX | America/Mexico_City | Mar/2026 |
| 227 | Hilco_Tip | HILCO_TIP | MEX | America/Mexico_City | Feb/2026 |
| 222 | Equity Link | EQUITY_LINK | MEX | America/Mexico_City | Feb/2026 |
| 217 | Mesa_de_control_engen | MESA_DE_CONTROL_ENGEN | MEX | America/Mexico_City | Ene/2026 |
| 215 | Engen_mesa_de_control | ENGEN_MESA_DE_CONTROL | — | America/Mexico_City | Ene/2026 |
| 214 | Engen | ENGEN | MEX | America/Mexico_City | Ene/2026 |
| 213 | Grupo Solve | GRUPO_SOLVE | MEX | America/Mexico_City | Ene/2026 |
| 212 | Presta Vale | PRESTA_VALE | MEX | America/Mexico_City | Ene/2026 |

---

## LOOKUP RÁPIDO: NAME → CODE → ID

Cuando el usuario mencione el nombre del borrower en lenguaje natural, traducir así:

| Si el usuario dice... | Usar code | Usar company_id |
|---|---|---|
| "WOM" | `WOM` | `267` |
| "Hilco Fortaleza" / "Fortaleza" | `HILCO_FORTALEZA` | `243` |
| "Hilco MasLeasing" / "MasLeasing" | `HILCO_MASLEASING` | `242` |
| "Hilco JollyHaul" / "JollyHaul" | `HILCO_JOLLYHAUL` | `236` |
| "Hilco Arrendamiento" / "Arrendamiento Productivo" | `HILCO_ARRENDAMIENTOPRODUCTIVO` | `233` |
| "Finkargo" / "Finkargo Colombia" | `FINKARGO_COLOMBIA` | `232` |
| "Alese" | `ALESE` | `231` |
| "Hilco Bayport" / "Bayport" | `HILCO_BAYPORT` | `230` |
| "Hilco Tip" / "Tip" | `HILCO_TIP` | `227` |
| "Equity Link" / "Equity" | `EQUITY_LINK` | `222` |
| "Mesa de control Engen" | `MESA_DE_CONTROL_ENGEN` | `217` |
| "Engen mesa de control" | `ENGEN_MESA_DE_CONTROL` | `215` |
| "Engen" | `ENGEN` | `214` |
| "Grupo Solve" / "Solve" | `GRUPO_SOLVE` | `213` |
| "Presta Vale" / "Presta" | `PRESTA_VALE` | `212` |

---

## EJEMPLO DE QUERY CON JOIN ENTRE TABLAS

Cuando necesites cruzar `payment_tape` con `payments` para un borrower específico:

```sql
-- Usuario pregunta por "Finkargo"
-- payment_tape usa company_id = 232
-- payments usa borrower_code = 'FINKARGO_COLOMBIA'

SELECT 
    pt.borrower_contract_id,
    pt.total_payment,
    p.approved_date,
    p.payment_gateway_code
FROM payment_tape pt
JOIN payments p ON pt.payment_id = p.id
WHERE pt.company_id = 232                        -- payment_tape usa ID
  AND p.borrower_code = 'FINKARGO_COLOMBIA'      -- payments usa code
  AND pt.payment_date BETWEEN '2026-01-01' AND '2026-03-31';
```

---

## NOTA SOBRE PAÍSES Y MONEDAS

| País | Moneda esperada | Borrowers |
|---|---|---|
| COL | COP | WOM, Finkargo Colombia |
| MEX | MXN | Todos los Hilco, Equity Link, Engen, Grupo Solve, Presta Vale |
| PER | PEN | Alese |

Cuando el usuario filtre por país, traducir a los `company_id` / `borrower_code` correspondientes.
