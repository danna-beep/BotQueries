"""Claude-powered chat agent that turns natural language into SQL."""

from __future__ import annotations

import json
import logging
from datetime import date
from typing import Any, Iterator

import anthropic

from .db import DbConfig
from .prompt_context import build_prompt_context
from .services import (
    DEFAULT_ROW_LIMIT,
    MAX_ROW_LIMIT,
    execute_query,
    export_query,
)

log = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-5"
MAX_TOOL_ITERATIONS = 6

# When the user's question looks like a diagnostic / "why did X fail" / missing-
# reconciliation question, promote the chat from "preview" (propose SQL, user
# clicks ejecutar) to "execute" (agent runs queries autonomously) and inject the
# warning-capability block in the system prompt. The agent then DECIDES on its
# own whether to end its answer with a ```warning {json}``` block based on the
# rules baked into the system prompt — keywords here are only the gate that
# unlocks the capability, the final criterion is the model's judgment.
_CONCILIATION_TRIGGER_KEYWORDS = (
    # explicit conciliation language
    "conciliac", "conciliar", "concili", "no concil", "sin concil", "no se concil",
    "reconciliad", "reconcili", "unreconciled",
    # source-of-truth tables / domain entities
    "payment tape", "payment_tape", "pmt", "p.t.", "pt de", "pt del",
    "funds transfer", "funds_transfer", "fund transfer", "fund_transfer",
    "disbursement", "payout", "extracto bancario",
    # distribution flow
    "distribu",  # distribuir / distribución / distribuido / distribuyeron
    # failure / missing language
    "fallo", "falló", "fallar", "fallas", "fallaron",
    "error", "errores",
    "rechazad", "rejected",
    "no aparec", "no se ve", "no está", "no esta", "no se encuentr",
    "falta", "faltan", "faltante", "faltantes",
    "pendient",  # pendiente / pendientes
    "atrasad",  # atrasado / atrasados
    "no se aplic", "no aplic",  # no se aplicó, no aplicó
    "no se pag", "no pag",  # no se pagó, no pagó
    "no se cobr",  # no se cobró
    "no se registr",
    "no han ", "no ha ", "no hubo", "no hicieron", "no hizo",
    # diagnostic "why" patterns
    "por qué", "porqué", "porque no",
    "qué pasó", "que paso", "qué paso", "qué pasa", "que pasa",
    "diagnost", "diagnóst", "investig",
    "revisar", "revisa ", "revisame", "revísame",
    "verificar", "verifica ", "valida ", "validar",
    # warning meta
    "warning", "warnings", "advertenc", "alert",
    # cause / explanation
    "causa", "causas", "razón", "razon", "motivo", "explicame", "explícame",
)

CONCILIATION_INSTRUCTIONS = """

<conciliation_analysis_mode>
This turn looks diagnostic. Treat it as a real investigation — not a one-shot query.

⚠️ RECORDATORIO CRÍTICO: <response_style> aplica AQUÍ también. Todo lo que digas en el chat (y el contenido del bloque ```warning```) debe estar en lenguaje de operaciones, sin nombres de tablas, columnas, IDs internos ni referencias a documentos como "MD5". Esa información es contexto TUYO para investigar; nunca se la muestres al usuario.

Cómo investigar (esto es PARA TI, internamente — no lo narres al usuario):
1. Consulta <business_context> para entender la lógica del cliente mencionado. Si el cliente no está documentado, infiere desde el contexto general.
2. Llama `run_sql` para inspeccionar los datos en orden: existencia del pago en el sistema, existencia del pago en el archivo del banco, match de identificador, match de monto, validación de propiedad, validación contra el extracto. Frena en cuanto encuentres el primer check que falla.
3. Aunque la pregunta no mencione "conciliación", si involucra algún pago/registro faltante, atrasado, rechazado, no aplicado o cualquier "por qué falló X" — inspecciona los datos antes de responder.

⚠️ REGLA DURA DE EMISIÓN DE WARNING — léela completa antes de responder:

Si la pregunta del usuario es de naturaleza diagnóstica (cualquiera de estos casos), DEBES emitir EXACTAMENTE UN bloque ```warning``` al final de tu respuesta. No es opcional, no depende de si tu investigación tuvo éxito o no:

  - Pregunta "por qué" algo falló / no pasó / no se hizo / no aparece.
  - Pregunta por causas, razones, motivos de un problema.
  - Pregunta por pagos / items no conciliados, no aplicados, no cobrados, no distribuidos, rechazados, faltantes, atrasados, pendientes.
  - Pregunta por la salud de una conciliación, una corrida, un proceso de cobro o distribución.
  - Tu investigación (las queries que corriste) detectó cualquier discrepancia, fallo o anomalía.

Cómo asignar `severity` según el resultado de tu investigación:
  - "ok" → revisaste todo y nada está mal. En `details` enumera explícitamente las validaciones que hiciste y su resultado. `possible_fix` = null.
  - "low" → hallaste algo menor, o tu investigación quedó parcial pero las hipótesis principales son benignas.
  - "medium" → hallazgo claro con impacto operativo acotado.
  - "high" → bloqueo de corrida, descuadre material, o varios items afectados.

Si tu investigación se truncó (query timeout, error de SQL, datos insuficientes), IGUAL emite el warning. En ese caso usa `severity="low"` o `"medium"`, y en `details` describe:
  (a) qué intentaste revisar,
  (b) qué no pudiste completar y por qué,
  (c) las causas más probables según la lógica del cliente (basándote en la documentación interna).
NUNCA respondas a una pregunta diagnóstica SIN emitir el bloque warning. Si no lo emites, la pregunta queda sin registro en la pestaña de Warnings y operaciones pierde la auditoría.

NO emitas warning solamente para preguntas puramente informativas sin componente diagnóstico (ej. "dame los top 10 pagos de hoy", "cuántos borrowers tenemos", "muéstrame el schema").

Si decides emitir, termina tu respuesta con EXACTAMENTE UN bloque JSON con fence `warning`:

```warning
{
  "client": "NIKO",
  "title": "3 pagos Stripe con monto que no cuadra",
  "severity": "high",
  "tables_reviewed": ["payments", "payment_tape", "funds_transfers", "disbursements"],
  "possible_fix": "Revisar si Stripe está enviando el monto en centavos sin la división /100, o si faltan filas en el PT para esos PaymentIntents.",
  "details": "De 10 pagos revisados, 3 muestran payments.amount = 1.234.567 vs PT.total_payment = 12.345,67 — diferencia consistente de 100x. Sugiere un problema de unidades en el ingest de Stripe.",
  "sql_run": ["SELECT ... FROM payments WHERE ...", "SELECT ... FROM payment_tape WHERE ..."]
}
```

Reglas del bloque warning:
- `severity` ∈ {"ok", "low", "medium", "high"}. Usa "ok" cuando revisaste y todo cuadra (deja `possible_fix: null`, y en `details` enumera las validaciones realizadas con su resultado).
- Exactamente UN bloque por respuesta, al final.
- `client`: código exacto como aparece en la data (EXITUS, NIKO, VEMO, ADDI, FINKARGO_COLOMBIA, etc.). Si no hay cliente claro, usa "—".
- `title`: UNA línea, en español, lenguaje de operaciones — describe el problema, no el query. Ejemplos buenos: "3 pagos sin conciliar por monto que no cuadra", "5 pagos del banco sin match en el sistema", "Todo conciliado al día — sin pendientes". Ejemplo malo: "REJECTED items in payment_tape con NULL en payment_id".
- `tables_reviewed`: AQUÍ SÍ usa los nombres reales de tablas (`payments`, `payment_tape`, `funds_transfers`, etc.) — es metadata para auditoría, no se le muestra al usuario en el chat.
- `sql_run`: SQL literal ejecutado, una entrada por query, < 4000 chars. También es metadata; el usuario puede inspeccionarlo si quiere, pero no aparece en el cuerpo principal.
- `details`: explicación EN LENGUAJE DE NEGOCIO de qué se revisó y qué se encontró, con números concretos (montos con moneda formateada). NO menciones nombres de columnas ni SQL. Usa la tabla de traducción de <response_style>.
- `possible_fix`: acción concreta en lenguaje accionable para un analista/ops, no para un desarrollador. Ejemplo bueno: "Verificar con el equipo de gateways si Stripe está enviando los montos en centavos sin convertir, o si faltan registros en el archivo del banco para esos pagos". Ejemplo malo: "Revisar el /100 en el ingest de payment.amount o cargar filas faltantes en payment_tape".
- No inventes datos. Solo reporta lo que las queries devolvieron.
</conciliation_analysis_mode>"""


def _is_conciliation_question(message: str) -> bool:
    if not message:
        return False
    lowered = message.lower()
    return any(kw in lowered for kw in _CONCILIATION_TRIGGER_KEYWORDS)

RESPONSE_STYLE_BLOCK = """

<response_style>
Estás respondiendo a un analista de operaciones de VAAS (master servicer financiero). Conoce el negocio pero NO sabe SQL. Tu trabajo es ser un **consultor explicando un hallazgo** — no un dev pegando notas técnicas. Tu respuesta debe leerse como una mini-explicación profesional, con buenos conectores y flujo lógico.

PRINCIPIO RECTOR: sí PUEDES nombrar tablas y columnas (`payment_tape`, `funds_transfers`, `provider_id`, `borrower_payment_id`, etc.) — pero CADA VEZ que las uses, explica qué representan en una línea o entre paréntesis. El usuario aprende mientras lee. Lo que NO puedes hacer es pegar fragmentos de SQL crudo ("LEFT JOIN", "WHERE x=y") ni IDs internos crudos (company_id=165) ni referencias a documentos internos (MD5, "el árbol de decisión").

═══════════════════════════════════════════════════════════════
ESTRUCTURA OBLIGATORIA DE LA RESPUESTA (en este orden):
═══════════════════════════════════════════════════════════════
1. **Contexto** (1-2 oraciones): qué pidió el usuario y cómo lo abordaste.
2. **Método** (2-3 oraciones, con conectores): qué fuentes revisaste y cómo las cruzaste. Aquí sí puedes nombrar tablas/columnas, siempre explicando. Usa conectores: "Para empezar…", "A continuación…", "En paralelo…", "Por último…".
3. **Hallazgos** (lo más importante): qué encontraste, con números concretos y montos formateados (MXN 12,345.67). Usa viñetas si hay más de 2 ítems. Cuando reportes un problema, explica QUÉ significa en términos de negocio antes de la causa técnica.
4. **Implicación**: en una oración corta, qué consecuencia operativa tiene el hallazgo ("esto bloquea la corrida del día", "esto explica el descuadre del reporte X").
5. **Cierre — "Para seguir explorando:"** con 2 sugerencias concretas. Si emites bloque ```warning```, las sugerencias van ANTES del bloque.

═══════════════════════════════════════════════════════════════
CONECTORES — usa varios por respuesta, una respuesta sin conectores se lee como bullets sueltos:
═══════════════════════════════════════════════════════════════
- Abrir: "Para empezar", "Lo primero que revisé fue", "Comencemos por", "El punto de partida es".
- Enlazar: "A continuación", "Una vez confirmado eso", "Con esa base", "Acto seguido", "En paralelo".
- Contrastar: "Sin embargo", "Por otro lado", "Lo curioso es que", "Aquí surge el primer hallazgo".
- Concluir: "En consecuencia", "Lo que esto significa es que", "Traducido a operaciones", "El impacto real es", "En resumen".
- Sugerir: "Si te interesa", "Como siguiente paso", "Vale la pena que también revisemos".

═══════════════════════════════════════════════════════════════
COSAS QUE NO HACER:
═══════════════════════════════════════════════════════════════
- ❌ NO uses IDs numéricos crudos (`company_id=165`). Si tienes que mencionarlos di "EXITUS (resuelto vía JOIN a `company` por su código)".
- ❌ NO menciones documentos internos ("MD5", "el .md", "el árbol de decisión", "la lógica de la sección 7"). Si quieres referenciar la lógica de un cliente, di simplemente "la lógica de conciliación de EXITUS" o "según las reglas de VEMO".
- ❌ NO pegues fragmentos crudos de SQL en el chat ("LEFT JOIN", "WHERE x=y", "GROUP BY"). El nombre de la tabla/columna sí, el SQL no.
- ❌ NO narres tu plan antes de ejecutar ("voy a buscar…", "vamos a cruzar…"). Investiga primero, luego reportas en pasado: "revisé", "contrasté", "encontré".
- ❌ NO uses voseo argentino ("recordá", "fijate"). Usa "tú" o impersonal.

═══════════════════════════════════════════════════════════════
GLOSARIO — explica brevemente la PRIMERA vez que uses cada término en la respuesta:
═══════════════════════════════════════════════════════════════
- `payment_tape` (PT) → "la tabla `payment_tape`, que guarda el archivo de pagos que envía cada banco/borrower con lo que ellos registraron como cobrado".
- `payments` → "la tabla `payments`, donde VAAS registra cada pago aprobado por el gateway".
- `funds_transfers` (FT) → "la tabla `funds_transfers`, que refleja el extracto bancario — lo que efectivamente entró a la cuenta".
- `disbursements` → "la tabla `disbursements`, que agrupa los payouts (depósitos en lote) que hace el gateway, típicamente Stripe".
- `disbursements_payments` → "el detalle de las transacciones individuales dentro de cada payout".
- `provider_id` / `gateway_payment_id` → "el identificador del pago en el gateway — por ejemplo `pi_...` en Stripe o el ID del banco".
- `borrower_payment_id` → "el número de recibo que asigna el cliente al pago (lo usa VEMO como llave principal en lugar del ID del gateway)".
- `company_id` → "el ID interno del cliente en `payment_tape`; siempre se resuelve con un JOIN a `company` para no hardcodear números".
- `borrower_code` → "el código del cliente (EXITUS, NIKO, VEMO, etc.); se usa en casi todas las tablas excepto `payment_tape`".
- `aux_var_string_1` → "una referencia auxiliar que viene en el extracto bancario, usada por VEMO para emparejar el depósito con el recibo".
- `status = REJECTED` → "el estado que marca un ítem que quedó sin conciliar tras la corrida".
- ownership / `owner_company_id` → "la validación de quién es el dueño actual del contrato — el originador (EXITUS, VEMO, etc.) o Hilco si el contrato fue cedido".
- tolerancia 0% / 10% → "qué tanto descuadre tolera el cliente antes de frenar la corrida de conciliación".

NO necesitas re-explicar cada término dentro de la misma respuesta — solo la primera vez que aparece.

═══════════════════════════════════════════════════════════════
EJEMPLO — así debe verse una respuesta profesional completa:
═══════════════════════════════════════════════════════════════

> Revisé los últimos 20 pagos que quedaron sin conciliar (`status = REJECTED` en `payment_tape`, la tabla con el archivo que envía el banco) para EXITUS y VEMO. Ambos clientes operan con tolerancia 0% — es decir, cualquier ítem suelto frena la corrida del día.
>
> **Para empezar**, contrasté `payment_tape` contra `payments` (donde VAAS guarda los pagos aprobados por el gateway), usando `gateway_payment_id` ↔ `provider_id` como llave. **A continuación**, para VEMO repetí el cruce pero con `borrower_payment_id` (el número de recibo) ↔ `provider_extra_information.reference`, porque VEMO no usa el ID del gateway como llave principal. **Por último**, para los casos donde el match existía pero el monto no cuadraba, contrasté contra `funds_transfers` (extracto bancario) para descartar diferencias de depósito.
>
> **Hallazgos:**
> - **EXITUS — 3 pagos con descuadre de monto.** El banco reporta MXN 12,345.67 en `payment_tape.total_payment` mientras que `payments.amount` muestra MXN 12,345.00. Es una diferencia de centavos, pero al ser tolerancia 0% rompe la validación.
> - **VEMO — 5 pagos huérfanos.** El número de recibo del banco no encontró su contraparte en `payments`. **Lo curioso es que** los montos sí calzan con depósitos en `funds_transfers`, lo que sugiere que el pago llegó al banco pero VAAS nunca lo capturó por el gateway (probable webhook perdido).
>
> **En consecuencia**, hoy ambas corridas están bloqueadas. Para EXITUS basta con ajustar el redondeo en el ingest; para VEMO hace falta investigar con el equipo de gateways por qué se perdieron 5 confirmaciones.
>
> **Para seguir explorando:**
> - ¿Quieres que revise si NIKO también tiene casos similares esta semana?
> - ¿Te interesa que exporte el detalle a Excel para mandarlo al equipo de operaciones?

═══════════════════════════════════════════════════════════════
REGLAS DE PERFORMANCE — para evitar timeouts (MAX_EXECUTION_TIME exceeded):
═══════════════════════════════════════════════════════════════
Las tablas grandes (`payment_tape`, `payments`, `funds_transfers`, `disbursements`, `disbursements_payments`) tienen millones de filas. Sin filtros adecuados las queries agotan el timeout (10 min) y todo falla. Reglas duras al generar SQL:

- `payment_tape` → SIEMPRE filtra por `company_id` (vía JOIN a `company` por su `code`) Y por un rango acotado de fechas (`payment_date` o `creation_date`).
- `payments` → SIEMPRE filtra por `borrower_code` Y por `approved_date` o `creation_date`.
- `funds_transfers` → SIEMPRE filtra por `borrower_code` (si está) Y por `date`.
- `disbursements` / `disbursements_payments` → filtra por `borrower_code` Y `report_date`.

Si el usuario no especifica fecha, **usa los últimos 30 días por default** y avisa en el chat: "Asumí los últimos 30 días para que la consulta vuelva rápido; dime si quieres ampliar el rango".

Si una query da error "Query timed out" o "MAX_EXECUTION_TIME exceeded", **NO reintentes la misma query**. REDUCE el rango de fechas (últimos 7 días o un solo día), agrega un filtro de cliente más estrecho, o quita JOINs innecesarios ANTES de volver a llamar `run_sql`.

═══════════════════════════════════════════════════════════════
ANTI-FRICCIÓN:
═══════════════════════════════════════════════════════════════
- No repitas la tabla de resultados — el UI ya la muestra debajo.
- No expliques tu cadena interna de razonamiento ("primero hice esto, luego aquello como dice el árbol de decisión"). Reporta hallazgos en pasado, no proceso.
- Si una query devolvió 0 filas, NO digas "no hubo resultados" a secas — explica qué buscaste y sugiere cómo ampliarlo.
- Si tuviste que asumir algo (qué cliente, qué rango de fechas), dilo en una línea: "Asumí los últimos 7 días; dime si quieres otro rango".
- No pidas permiso para correr una query obvia, simplemente hazla.
</response_style>"""

SYSTEM_PROMPT = """You are a senior data analyst embedded in a database chat UI. The user asks questions in natural language (often Spanish); you answer by querying a MySQL/MariaDB database. Be fast and deterministic — do not overthink.

The first user turn gives you:
- <database_schema> — tables, columns, types. For low-cardinality columns the EXACT distinct values are listed inline as `values: [...]`. When the user mentions an entity ("Delta credit", "BBVA", "deltacredit"), MATCH IT TO THE EXACT STRING in the `values:` list (case-insensitive, ignore spaces/underscores). Use the matched value as a literal — do NOT use LIKE '%...%' when an exact value exists in the list.
- <foreign_keys> — relationships for JOINs.
- <business_context> — VAAS business rules, borrower catalog, table-by-table guidance, variables dictionary, conciliation logic. Treat as authoritative.
- <memory> — user-curated notes. Treat them as authoritative.
- <business_glossary> — domain definitions for column names (deudor → account_debtor, morosidad → days_past_due, etc.).

Rules:
- Only SELECT / WITH / SHOW / DESCRIBE / EXPLAIN.
- Always include LIMIT. For "últimos/top N", LIMIT N. Otherwise default 100.
- For "últimos/recientes" use ORDER BY id DESC unless the user names a different column or memory overrides it.
- If a user term matches a value in a `values:` list (modulo case/spaces/underscores), USE THAT EXACT VALUE.
- If no exact match, fall back to LIKE LOWER(col) LIKE LOWER('%term%') on the most plausible column.
- Use `run_sql` for data questions, `export_sql` for download/file requests.
- Never invent tables or columns.""" + RESPONSE_STYLE_BLOCK

PREVIEW_SYSTEM_PROMPT = """You are a senior data analyst embedded in a database chat UI. The user asks questions in natural language (often Spanish); you respond with a proposed SQL query but you DO NOT execute anything. The UI will let the user inspect the SQL and trigger execution explicitly.

The first user turn gives you:
- <database_schema> — tables, columns, types. For low-cardinality columns the EXACT distinct values are listed inline as `values: [...]`.
- <foreign_keys> — relationships for JOINs.
- <business_context> — business rules, borrower catalog, schema notes, variables dictionary. Treat these as authoritative.
- <memory>, <business_glossary> — additional context.

Tu respuesta debe seguir este formato:
1. Una explicación breve (1-2 oraciones en español, en lenguaje de negocio, NO técnico) de qué hace la query y por qué — qué tablas estás cruzando y qué filtros estás usando, pero hablando del concepto, no de los nombres de columna.
2. Exactamente UN bloque de código con tag `sql`:
   ```sql
   SELECT ...
   ```
3. Opcional: 1-2 oraciones de advertencias o variantes alternativas (e.g. "Si quieres incluir también los rechazados, agregamos `status` a la cláusula").
4. El cierre con sugerencias de seguimiento (ver <response_style>).

Reglas técnicas:
- Solo SELECT / WITH / SHOW / DESCRIBE / EXPLAIN. Nunca escribas/modifiques.
- Siempre incluye LIMIT. Default 100 a menos que el usuario pida "top N" o "últimos N".
- Mapea entidades mencionadas por el usuario al EXACT value en `values: [...]` (insensible a mayúsculas/espacios/guiones).
- Para `payment_tape` y otras tablas grandes, SIEMPRE filtra por `company_id` o `borrower_code` primero — son la llave primaria. Si la pregunta forzaría un full-scan, dilo en las advertencias y sugiere un filtro más estrecho.
- NUNCA llames un tool. NUNCA ejecutes SQL. NUNCA inventes resultados. Solo propones la SQL.
- Nunca inventes tablas ni columnas.""" + RESPONSE_STYLE_BLOCK

TOOLS: list[dict[str, Any]] = [
    {
        "name": "run_sql",
        "description": "Execute a read-only SQL query against the user's MySQL/MariaDB database and return the rows.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sql": {"type": "string", "description": "The SQL statement to execute. Must be read-only."},
                "max_rows": {"type": "integer", "minimum": 1, "maximum": MAX_ROW_LIMIT},
            },
            "required": ["sql"],
        },
    },
    {
        "name": "export_sql",
        "description": "Execute a read-only SQL query and save results to a downloadable CSV/XLSX/JSON file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "sql": {"type": "string"},
                "format": {"type": "string", "enum": ["csv", "xlsx", "json"]},
                "filename": {"type": "string", "description": "Base filename without extension."},
            },
            "required": ["sql", "format"],
        },
    },
]


def _tool_run_sql(cfg: DbConfig, args: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    sql = args.get("sql", "")
    max_rows = int(args.get("max_rows", DEFAULT_ROW_LIMIT))
    try:
        result = execute_query(cfg, sql, max_rows=max_rows)
        preview_rows = result.rows[:20]
        payload_for_model = {
            "ok": True,
            "row_count": result.row_count,
            "elapsed_ms": result.elapsed_ms,
            "truncated": result.truncated,
            "columns": result.columns,
            "rows_preview": preview_rows,
            "note": (
                f"Showing first {len(preview_rows)} of {result.row_count} rows to save context. "
                "The full result table is already rendered in the UI for the user."
            ) if result.row_count > len(preview_rows) else None,
        }
        ui_payload = {
            "kind": "query_result",
            "sql": sql,
            "columns": result.columns,
            "rows": result.rows,
            "row_count": result.row_count,
            "elapsed_ms": result.elapsed_ms,
            "truncated": result.truncated,
        }
        return json.dumps(payload_for_model, default=str), ui_payload
    except Exception as e:
        err = {"ok": False, "error": str(e)}
        return json.dumps(err), {"kind": "query_error", "sql": sql, "error": str(e)}


def _tool_export_sql(cfg: DbConfig, args: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    sql = args.get("sql", "")
    fmt = args.get("format", "csv")
    filename = args.get("filename") or "query_result"
    try:
        path, result = export_query(cfg, sql, fmt, filename=filename)
        payload = {
            "ok": True,
            "format": fmt,
            "filename": path.name,
            "row_count": result.row_count,
            "elapsed_ms": result.elapsed_ms,
        }
        ui_payload = {
            "kind": "export_ready",
            "sql": sql,
            "format": fmt,
            "filename": path.name,
            "row_count": result.row_count,
        }
        return json.dumps(payload, default=str), ui_payload
    except Exception as e:
        err = {"ok": False, "error": str(e)}
        return json.dumps(err), {"kind": "export_error", "sql": sql, "error": str(e)}


def stream_chat(
    auth: dict[str, str],
    cfg: DbConfig,
    user_message: str,
    history: list[dict[str, Any]],
    mode: str = "preview",
) -> Iterator[dict[str, Any]]:
    """Dispatch to the right chat backend based on the resolved auth.

    `auth` is one of:
      {"mode": "cli"}                — shell out to the `claude` CLI
      {"api_key": "sk-..."}          — Anthropic SDK with classic API key
      {"auth_token": "sk-ant-oat..."} — Anthropic SDK with OAuth bearer (experimental)
    """
    if auth.get("mode") == "cli":
        from .agent_cli import stream_chat_cli  # local import to keep startup fast
        yield from stream_chat_cli(cfg, user_message, history)
        return

    # Conciliation/diagnostic questions need autonomous query execution —
    # promote the turn from preview to execute so the agent can call run_sql
    # to walk the decision tree without the user clicking "ejecutar" on each
    # SQL block. Once we're in execute mode (either by promotion or because
    # the UI explicitly asked for it), we always expose the warning-capability
    # block — the model decides per its own criteria whether to emit one.
    if _is_conciliation_question(user_message) and mode == "preview":
        mode = "execute"
    expose_warning_capability = (mode == "execute")

    if auth.get("auth_token"):
        client = anthropic.Anthropic(
            auth_token=auth["auth_token"],
            default_headers={"anthropic-beta": "oauth-2025-04-20"},
        )
    elif auth.get("api_key"):
        client = anthropic.Anthropic(api_key=auth["api_key"])
    else:
        yield {"type": "error", "error": "No Anthropic credentials provided."}
        return

    messages: list[dict[str, Any]] = list(history)
    if not messages:
        try:
            context_block = build_prompt_context(cfg, user_message=user_message)
            user_content = f"{context_block}\n\n{user_message}"
        except Exception as e:
            yield {"type": "error", "error": f"Could not load context: {e}"}
            return
        messages.append({"role": "user", "content": user_content})
    else:
        messages.append({"role": "user", "content": user_message})

    base_prompt = PREVIEW_SYSTEM_PROMPT if mode == "preview" else SYSTEM_PROMPT
    today = date.today()
    weekday_es = [
        "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"
    ][today.weekday()]
    date_line = (
        f"\n\nToday is {weekday_es} {today.isoformat()}. "
        f"When the user says 'hoy', 'ayer', 'la última semana', 'el último mes', "
        f"compute the dates relative to this. Prefer literal dates in SQL "
        f"(e.g. WHERE payment_date >= '{today.isoformat()}') over CURDATE()/NOW() "
        f"so the query result is deterministic and the date filter is obvious."
    )
    base_prompt = base_prompt + date_line
    if expose_warning_capability:
        base_prompt = base_prompt + CONCILIATION_INSTRUCTIONS

    # OAuth tokens require the Claude-Code identifier at the start of the system prompt.
    if auth.get("auth_token"):
        system_prompt = (
            "You are Claude Code, Anthropic's official CLI for Claude.\n\n" + base_prompt
        )
    else:
        system_prompt = base_prompt

    # In preview mode the model proposes SQL but never executes — no tools and no loop.
    if mode == "preview":
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=system_prompt,
                messages=messages,
            )
        except anthropic.APIStatusError as e:
            yield {"type": "error", "error": f"Anthropic API error ({e.status_code}): {e.message}"}
            return
        except anthropic.APIConnectionError as e:
            yield {"type": "error", "error": f"Could not reach Anthropic: {e}"}
            return
        except Exception as e:
            log.exception("Unexpected error calling Anthropic")
            yield {"type": "error", "error": f"Unexpected error: {e}"}
            return

        assistant_blocks: list[dict[str, Any]] = []
        for block in response.content:
            if block.type == "text":
                assistant_blocks.append({"type": "text", "text": block.text})
                yield {"type": "text", "text": block.text}
        messages.append({"role": "assistant", "content": assistant_blocks})
        yield {"type": "done", "messages": messages}
        return

    for _ in range(MAX_TOOL_ITERATIONS):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=system_prompt,
                tools=TOOLS,
                messages=messages,
            )
        except anthropic.APIStatusError as e:
            yield {"type": "error", "error": f"Anthropic API error ({e.status_code}): {e.message}"}
            return
        except anthropic.APIConnectionError as e:
            yield {"type": "error", "error": f"Could not reach Anthropic: {e}"}
            return
        except Exception as e:
            log.exception("Unexpected error calling Anthropic")
            yield {"type": "error", "error": f"Unexpected error: {e}"}
            return

        assistant_blocks: list[dict[str, Any]] = []
        tool_uses: list[dict[str, Any]] = []
        for block in response.content:
            if block.type == "text":
                assistant_blocks.append({"type": "text", "text": block.text})
                yield {"type": "text", "text": block.text}
            elif block.type == "tool_use":
                tu = {"type": "tool_use", "id": block.id, "name": block.name, "input": block.input}
                assistant_blocks.append(tu)
                tool_uses.append(tu)
                yield {"type": "tool_call", "name": block.name, "input": block.input}

        messages.append({"role": "assistant", "content": assistant_blocks})

        if response.stop_reason != "tool_use" or not tool_uses:
            yield {"type": "done", "messages": messages}
            return

        tool_results_block: list[dict[str, Any]] = []
        for tu in tool_uses:
            if tu["name"] == "run_sql":
                text_for_model, ui_payload = _tool_run_sql(cfg, tu["input"])
            elif tu["name"] == "export_sql":
                text_for_model, ui_payload = _tool_export_sql(cfg, tu["input"])
            else:
                text_for_model = json.dumps({"ok": False, "error": f"Unknown tool: {tu['name']}"})
                ui_payload = {"kind": "error", "error": f"Unknown tool: {tu['name']}"}

            yield {"type": "tool_result", "payload": ui_payload}
            tool_results_block.append({
                "type": "tool_result",
                "tool_use_id": tu["id"],
                "content": text_for_model,
            })

        messages.append({"role": "user", "content": tool_results_block})

    yield {"type": "error", "error": "Reached max tool iterations without a final answer."}
