"""Fallback chat agent that shells out to the `claude` CLI.

Used when the user has no Anthropic API key but does have Claude Code logged in.
The CLI handles auth — we just feed it a tightly-scoped prompt that asks for SQL,
parse the result, execute the SQL, and emit the same event shapes the frontend
already renders (tool_call, tool_result, text, done).

Tradeoff vs. the SDK agent: only one SQL per turn (no multi-step tool use).
"""

from __future__ import annotations

import json
import logging
import re
import shutil
import subprocess
from typing import Any, Iterator

from .db import DbConfig
from .prompt_context import build_prompt_context
from .services import (
    DEFAULT_ROW_LIMIT,
    execute_query_streamed,
    export_query,
)

log = logging.getLogger(__name__)

_CLAUDE_TIMEOUT_SECONDS = 300

_SYSTEM_PROMPT = """You are a senior data analyst for a MySQL/MariaDB chat app. The user asks questions in natural language (often Spanish); you answer with ONE precise SQL query. Be fast and deterministic — do not overthink.

The prompt gives you (in this order):
- <database_schema> — tables, columns, types. For low-cardinality columns the EXACT distinct values are listed inline as `values: [...]`. WHEN A USER MENTIONS AN ENTITY (e.g. "Delta credit", "BBVA", "deltacredit"), MATCH IT TO THE EXACT STRING IN THE values: LIST. Case-insensitive, ignore spaces/underscores. Pick the matching value and use it as a literal in the WHERE clause — do NOT use LIKE '%...%' when an exact value exists in the list.
- <foreign_keys> — relationships for JOINs.
- <memory> — user-curated notes. Treat them as authoritative business rules.
- <business_glossary> — domain definitions for column names (deudor → account_debtor, morosidad → days_past_due, etc.).

Hard rules:
- ONE SQL statement per response. SELECT / WITH / SHOW / DESCRIBE / EXPLAIN only.
- Always include LIMIT (default 100 unless the user says otherwise; for "últimos N" or "top N" use N).
- For "últimos/recientes" use ORDER BY id DESC unless the user names a different column or memory overrides it.
- If a user term matches a value in a `values: [...]` list (modulo case/spaces/underscores), USE THAT EXACT VALUE. Don't use LIKE.
- If the user term doesn't match any listed value, use a CASE-INSENSITIVE LIKE on the most plausible column (LIKE LOWER(...)).
- Never invent tables or columns.
- For file exports replace the fence language with `sql-export-csv`, `sql-export-xlsx`, or `sql-export-json`.

Output format — code block first, then a 2-3 sentence explanation:

```sql
SELECT ...
```

Brief explanation here (which table, which filter, which order, why)."""


_BLOCK_RE = re.compile(
    r"```(?P<lang>sql(?:-export-(?:csv|xlsx|json))?)\s*\n(?P<body>.*?)```",
    re.DOTALL | re.IGNORECASE,
)


def _extract_sql_block(text: str) -> tuple[str | None, str | None, str]:
    """Return (sql, export_format, explanation_text)."""
    m = _BLOCK_RE.search(text)
    if not m:
        return None, None, text.strip()
    sql = m.group("body").strip()
    lang = m.group("lang").lower()
    export_fmt = None
    if lang.startswith("sql-export-"):
        export_fmt = lang.split("-")[-1]
    # Strip the code block from the explanation
    explanation = (text[: m.start()] + text[m.end() :]).strip()
    return sql, export_fmt, explanation


def _run_claude(prompt: str) -> str:
    cli = shutil.which("claude")
    if not cli:
        raise RuntimeError("`claude` CLI not found on PATH.")
    proc = subprocess.run(
        [cli, "-p", prompt, "--output-format", "text"],
        capture_output=True,
        text=True,
        timeout=_CLAUDE_TIMEOUT_SECONDS,
    )
    if proc.returncode != 0:
        stderr = (proc.stderr or "").strip()
        raise RuntimeError(
            f"claude CLI exited {proc.returncode}: {stderr or 'no stderr'}"
        )
    return proc.stdout or ""


def _build_user_prompt(
    context_block: str,
    history: list[dict[str, Any]],
    user_message: str,
) -> str:
    parts = [_SYSTEM_PROMPT, "", context_block]
    if history:
        parts.append("")
        parts.append("Previous conversation:")
        for turn in history[-10:]:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if isinstance(content, list):
                # Multi-part SDK-style; flatten the text parts.
                content = " ".join(
                    str(p.get("text", "")) for p in content if isinstance(p, dict)
                )
            parts.append(f"{role.upper()}: {content}")
    parts.append("")
    parts.append(f"USER QUESTION: {user_message}")
    return "\n".join(parts)


def stream_chat_cli(
    cfg: DbConfig,
    user_message: str,
    history: list[dict[str, Any]],
) -> Iterator[dict[str, Any]]:
    """Single-shot chat through the `claude` CLI."""
    try:
        context_block = build_prompt_context(cfg)
    except Exception as e:
        yield {"type": "error", "error": f"Could not load schema: {e}"}
        return

    prompt = _build_user_prompt(context_block, history, user_message)

    try:
        raw = _run_claude(prompt)
    except subprocess.TimeoutExpired:
        yield {"type": "error", "error": "Claude CLI timed out after 3 minutes."}
        return
    except Exception as e:
        yield {"type": "error", "error": str(e)}
        return

    sql, export_fmt, explanation = _extract_sql_block(raw)

    if not sql:
        # No code block — Claude just answered in prose. Surface it as text.
        if explanation:
            yield {"type": "text", "text": explanation}
        else:
            yield {"type": "text", "text": raw.strip() or "(empty response)"}
        new_history = history + [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": raw.strip()},
        ]
        yield {"type": "done", "messages": new_history}
        return

    if export_fmt:
        yield {
            "type": "tool_call",
            "name": "export_sql",
            "input": {"sql": sql, "format": export_fmt},
        }
        try:
            path, result = export_query(cfg, sql, export_fmt, filename="query_result")
            yield {
                "type": "tool_result",
                "payload": {
                    "kind": "export_ready",
                    "sql": sql,
                    "format": export_fmt,
                    "filename": path.name,
                    "row_count": result.row_count,
                },
            }
        except Exception as e:
            yield {
                "type": "tool_result",
                "payload": {"kind": "export_error", "sql": sql, "error": str(e)},
            }
    else:
        yield {"type": "tool_call", "name": "run_sql", "input": {"sql": sql}}
        for evt in execute_query_streamed(cfg, sql, max_rows=DEFAULT_ROW_LIMIT):
            if evt["type"] == "progress":
                yield {
                    "type": "tool_progress",
                    "sql": sql,
                    "elapsed_seconds": evt["elapsed_seconds"],
                }
            elif evt["type"] == "result":
                result = evt["result"]
                yield {
                    "type": "tool_result",
                    "payload": {
                        "kind": "query_result",
                        "sql": sql,
                        "columns": result.columns,
                        "rows": result.rows,
                        "row_count": result.row_count,
                        "elapsed_ms": result.elapsed_ms,
                        "truncated": result.truncated,
                    },
                }
            elif evt["type"] == "error":
                yield {
                    "type": "tool_result",
                    "payload": {
                        "kind": "query_error",
                        "sql": sql,
                        "error": evt["error"],
                    },
                }

    if explanation:
        yield {"type": "text", "text": explanation}

    # Build a minimal history record for future turns.
    new_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": raw.strip()},
    ]
    yield {"type": "done", "messages": new_history}
