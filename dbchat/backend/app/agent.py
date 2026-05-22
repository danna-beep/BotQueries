"""Claude-powered chat agent that turns natural language into SQL."""

from __future__ import annotations

import json
import logging
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

SYSTEM_PROMPT = """You are a senior data analyst embedded in a database chat UI. The user asks questions in natural language (often Spanish); you answer by querying a MySQL/MariaDB database. Be fast and deterministic — do not overthink.

The first user turn gives you:
- <database_schema> — tables, columns, types. For low-cardinality columns the EXACT distinct values are listed inline as `values: [...]`. When the user mentions an entity ("Delta credit", "BBVA", "deltacredit"), MATCH IT TO THE EXACT STRING in the `values:` list (case-insensitive, ignore spaces/underscores). Use the matched value as a literal — do NOT use LIKE '%...%' when an exact value exists in the list.
- <foreign_keys> — relationships for JOINs.
- <memory> — user-curated notes. Treat them as authoritative.
- <business_glossary> — domain definitions for column names (deudor → account_debtor, morosidad → days_past_due, etc.).

Rules:
- Only SELECT / WITH / SHOW / DESCRIBE / EXPLAIN.
- Always include LIMIT. For "últimos/top N", LIMIT N. Otherwise default 100.
- For "últimos/recientes" use ORDER BY id DESC unless the user names a different column or memory overrides it.
- If a user term matches a value in a `values:` list (modulo case/spaces/underscores), USE THAT EXACT VALUE.
- If no exact match, fall back to LIKE LOWER(col) LIKE LOWER('%term%') on the most plausible column.
- Use `run_sql` for data questions, `export_sql` for download/file requests.
- After results: 2-3 sentence summary. Don't repeat the table — the UI renders it.
- Never invent tables or columns."""

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
            context_block = build_prompt_context(cfg)
            user_content = f"{context_block}\n\n{user_message}"
        except Exception as e:
            yield {"type": "error", "error": f"Could not load context: {e}"}
            return
        messages.append({"role": "user", "content": user_content})
    else:
        messages.append({"role": "user", "content": user_message})

    # OAuth tokens require the Claude-Code identifier at the start of the system prompt.
    if auth.get("auth_token"):
        system_prompt = (
            "You are Claude Code, Anthropic's official CLI for Claude.\n\n" + SYSTEM_PROMPT
        )
    else:
        system_prompt = SYSTEM_PROMPT

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
