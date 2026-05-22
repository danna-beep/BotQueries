"""Build the rich database context that gets prepended to chat prompts.

Combines the structural schema, a few sample rows per table, foreign-key
relationships, and any business-glossary terms that match column names.
Used by both the SDK agent and the CLI agent.
"""

from __future__ import annotations

import json
from typing import Any

from . import glossary as glossary_store
from . import memory as memory_store
from .db import DbConfig
from .services import build_enriched_context, get_enriched_context_cached


_MAX_SAMPLE_CHARS = 140


def _format_value(v: Any) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (dict, list)):
        s = json.dumps(v, ensure_ascii=False, default=str)
    else:
        s = str(v)
    if len(s) > _MAX_SAMPLE_CHARS:
        s = s[: _MAX_SAMPLE_CHARS - 1] + "…"
    return s


def _format_sample_row(row: dict[str, Any]) -> str:
    return "{" + ", ".join(f"{k}: {_format_value(v)}" for k, v in row.items()) + "}"


def _format_distinct_values(values: list[Any], show: int = 40) -> str:
    quoted = [repr(str(v)) for v in values[:show]]
    text = ", ".join(quoted)
    if len(values) > show:
        text += f", … ({len(values)} distinct values total)"
    return text


def format_schema_block(ctx: dict[str, Any]) -> str:
    """Render the schema (with sample rows + distinct values) for the prompt."""
    lines: list[str] = [f"Database: {ctx['database']}", ""]
    for t in ctx["tables"]:
        comment = f"  -- {t['comment']}" if t.get("comment") else ""
        lines.append(f"TABLE {t['name']}{comment}")
        for c in t["columns"]:
            null = "" if c["nullable"] else " NOT NULL"
            key = f" [{c['key']}]" if c.get("key") else ""
            lines.append(f"  {c['name']} {c['type']}{null}{key}")
            distinct = c.get("distinct_values")
            if distinct:
                lines.append(
                    f"    values: [{_format_distinct_values(distinct)}]"
                )
        samples = t.get("samples") or []
        if samples:
            lines.append("  -- sample rows:")
            for row in samples:
                lines.append(f"  --   {_format_sample_row(row)}")
        lines.append("")
    return "\n".join(lines)


def format_foreign_keys_block(ctx: dict[str, Any]) -> str:
    fks = ctx.get("foreign_keys") or []
    if not fks:
        return ""
    lines = ["<foreign_keys>"]
    for fk in fks:
        lines.append(
            f"{fk['src_table']}.{fk['src_col']} -> "
            f"{fk['ref_table']}.{fk['ref_col']}"
        )
    lines.append("</foreign_keys>")
    return "\n".join(lines)


def build_prompt_context(cfg: DbConfig, use_cache: bool = True) -> str:
    """Return the full database/glossary context as text for inclusion in a prompt."""
    if use_cache:
        ctx = get_enriched_context_cached(cfg)
    else:
        ctx = build_enriched_context(cfg)

    parts = [f"<database_schema>\n{format_schema_block(ctx)}</database_schema>"]
    fk_block = format_foreign_keys_block(ctx)
    if fk_block:
        parts.append(fk_block)

    memory_text = memory_store.format_for_prompt()
    if memory_text:
        parts.append(memory_text)

    glossary_entries = glossary_store.load_glossary()
    if glossary_entries:
        matched = glossary_store.match_to_schema(glossary_entries, ctx)
        if matched:
            parts.append(glossary_store.format_for_prompt(matched))

    return "\n\n".join(parts)


def context_summary(cfg: DbConfig) -> dict[str, Any]:
    """Return a small JSON summary of what's in the context — for the UI to display."""
    ctx = get_enriched_context_cached(cfg)
    table_count = len(ctx["tables"])
    sample_count = sum(len(t.get("samples") or []) for t in ctx["tables"])
    fk_count = len(ctx.get("foreign_keys") or [])
    distinct_cols = sum(
        1 for t in ctx["tables"] for c in t["columns"] if c.get("distinct_values")
    )
    distinct_values = sum(
        len(c["distinct_values"])
        for t in ctx["tables"]
        for c in t["columns"]
        if c.get("distinct_values")
    )
    glossary_entries = glossary_store.load_glossary()
    matched = glossary_store.match_to_schema(glossary_entries, ctx) if glossary_entries else []
    memory_entries = memory_store.load_memory()
    return {
        "tables": table_count,
        "sample_rows": sample_count,
        "foreign_keys": fk_count,
        "distinct_columns": distinct_cols,
        "distinct_values": distinct_values,
        "glossary_terms_total": len(glossary_entries),
        "glossary_terms_matched": len(matched),
        "memory_entries": len(memory_entries),
    }
