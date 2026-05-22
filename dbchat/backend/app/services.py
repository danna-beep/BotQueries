"""High-level services used by both the HTTP API and the Claude agent."""

from __future__ import annotations

import concurrent.futures
import logging
import re
import time
from pathlib import Path
from typing import Any, Iterator

from .db import DbConfig, QueryResult, escape_literal, friendly_error, run_select
from .exporters import ExportFormat, export_results
from .sql_safety import apply_default_limit, validate_read_only_sql


DEFAULT_ROW_LIMIT = 1000
MAX_ROW_LIMIT = 100_000

log = logging.getLogger(__name__)

# Identifier whitelist for safe table-name interpolation.
_IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,127}$")


_SYSTEM_SCHEMAS = frozenset(
    {"information_schema", "performance_schema", "mysql", "sys"}
)


def list_databases(cfg: DbConfig, include_system: bool = False) -> list[str]:
    """Return database names the connected user can see."""
    result = run_select(cfg, "SHOW DATABASES", max_rows=1000)
    out: list[str] = []
    for row in result.rows:
        # SHOW DATABASES returns a single column whose name varies by server casing.
        name = next(iter(row.values()), None)
        if not name:
            continue
        if not include_system and str(name).lower() in _SYSTEM_SCHEMAS:
            continue
        out.append(str(name))
    return out


def list_tables(cfg: DbConfig, database: str | None = None) -> list[dict[str, Any]]:
    db = database or cfg.database
    if not db:
        raise ValueError("No database selected. Set MYSQL_DATABASE or pass `database` explicitly.")
    sql = (
        "SELECT TABLE_NAME AS table_name, "
        "TABLE_TYPE AS table_type, "
        "TABLE_ROWS AS row_estimate, "
        "TABLE_COMMENT AS comment "
        "FROM information_schema.TABLES "
        f"WHERE TABLE_SCHEMA = '{escape_literal(db)}' "
        "ORDER BY TABLE_NAME"
    )
    return run_select(cfg, sql, max_rows=10000).rows


def describe_table(cfg: DbConfig, table: str, database: str | None = None) -> list[dict[str, Any]]:
    db = database or cfg.database
    if not db:
        raise ValueError("No database selected.")
    sql = (
        "SELECT COLUMN_NAME AS column_name, "
        "COLUMN_TYPE AS column_type, "
        "IS_NULLABLE AS is_nullable, "
        "COLUMN_KEY AS column_key, "
        "COLUMN_DEFAULT AS column_default, "
        "EXTRA AS extra, "
        "COLUMN_COMMENT AS comment "
        "FROM information_schema.COLUMNS "
        f"WHERE TABLE_SCHEMA = '{escape_literal(db)}' "
        f"AND TABLE_NAME = '{escape_literal(table)}' "
        "ORDER BY ORDINAL_POSITION"
    )
    rows = run_select(cfg, sql, max_rows=2000).rows
    if not rows:
        raise ValueError(f"Table '{table}' not found in database '{db}'.")
    return rows


def get_full_schema(cfg: DbConfig, database: str | None = None) -> dict[str, Any]:
    db = database or cfg.database
    if not db:
        raise ValueError("No database selected.")

    tables_sql = (
        "SELECT TABLE_NAME AS table_name, "
        "TABLE_COMMENT AS comment, "
        "TABLE_ROWS AS row_estimate "
        "FROM information_schema.TABLES "
        f"WHERE TABLE_SCHEMA = '{escape_literal(db)}' "
        "ORDER BY TABLE_NAME"
    )
    tables = run_select(cfg, tables_sql, max_rows=10000).rows

    cols_sql = (
        "SELECT TABLE_NAME AS table_name, "
        "COLUMN_NAME AS column_name, "
        "COLUMN_TYPE AS column_type, "
        "IS_NULLABLE AS is_nullable, "
        "COLUMN_KEY AS column_key "
        "FROM information_schema.COLUMNS "
        f"WHERE TABLE_SCHEMA = '{escape_literal(db)}' "
        "ORDER BY TABLE_NAME, ORDINAL_POSITION"
    )
    all_cols = run_select(cfg, cols_sql, max_rows=50000).rows

    cols_by_table: dict[str, list[dict[str, Any]]] = {}
    for c in all_cols:
        cols_by_table.setdefault(c["table_name"], []).append({
            "name": c["column_name"],
            "type": c["column_type"],
            "nullable": c["is_nullable"] == "YES",
            "key": c["column_key"] or None,
        })

    return {
        "database": db,
        "tables": [
            {
                "name": t["table_name"],
                "comment": t["comment"] or None,
                "row_estimate": t["row_estimate"],
                "columns": cols_by_table.get(t["table_name"], []),
            }
            for t in tables
        ],
    }


def execute_query(cfg: DbConfig, sql: str, max_rows: int = DEFAULT_ROW_LIMIT) -> QueryResult:
    validation = validate_read_only_sql(sql)
    if not validation.ok:
        raise ValueError(f"SQL rejected: {validation.reason}")
    safe_sql = apply_default_limit(validation.normalized_sql, max_rows)
    return run_select(cfg, safe_sql, max_rows=max_rows)


def execute_query_streamed(
    cfg: DbConfig,
    sql: str,
    max_rows: int = DEFAULT_ROW_LIMIT,
    progress_interval: float = 2.0,
) -> Iterator[dict[str, Any]]:
    """Run a query in a background thread, yielding progress events while it runs.

    Yields in order:
      {"type": "progress", "elapsed_seconds": int}   # zero or more
      then exactly one terminal event:
      {"type": "result",  "result": QueryResult}
      {"type": "error",   "error":  str}
    """
    validation = validate_read_only_sql(sql)
    if not validation.ok:
        yield {"type": "error", "error": f"SQL rejected: {validation.reason}"}
        return
    safe_sql = apply_default_limit(validation.normalized_sql, max_rows)

    with concurrent.futures.ThreadPoolExecutor(
        max_workers=1, thread_name_prefix="dbchat-sql"
    ) as ex:
        future = ex.submit(run_select, cfg, safe_sql, max_rows)
        start = time.monotonic()
        while True:
            try:
                result = future.result(timeout=progress_interval)
            except concurrent.futures.TimeoutError:
                yield {
                    "type": "progress",
                    "elapsed_seconds": int(time.monotonic() - start),
                }
                continue
            except Exception as e:
                yield {"type": "error", "error": str(e)}
                return
            yield {"type": "result", "result": result}
            return


def export_query(
    cfg: DbConfig,
    sql: str,
    fmt: ExportFormat,
    filename: str = "query_result",
    max_rows: int = MAX_ROW_LIMIT,
) -> tuple[Path, QueryResult]:
    validation = validate_read_only_sql(sql)
    if not validation.ok:
        raise ValueError(f"SQL rejected: {validation.reason}")
    safe_sql = apply_default_limit(validation.normalized_sql, max_rows)
    result = run_select(cfg, safe_sql, max_rows=max_rows)
    path = export_results(result.columns, result.rows, fmt, filename)
    return path, result


def get_table_samples(cfg: DbConfig, table: str, n: int = 2) -> list[dict[str, Any]]:
    """Return a handful of sample rows from a table — used to teach the LLM data shape."""
    if not _IDENT_RE.match(table):
        raise ValueError(f"Invalid table identifier: {table!r}")
    n = max(1, min(int(n), 10))
    result = run_select(cfg, f"SELECT * FROM `{table}` LIMIT {n}", max_rows=n)
    return result.rows


def get_foreign_keys(
    cfg: DbConfig, database: str | None = None
) -> list[dict[str, Any]]:
    """Return foreign-key relationships in this database."""
    db = database or cfg.database
    if not db:
        return []
    sql = (
        "SELECT TABLE_NAME AS src_table, COLUMN_NAME AS src_col, "
        "REFERENCED_TABLE_NAME AS ref_table, REFERENCED_COLUMN_NAME AS ref_col "
        "FROM information_schema.KEY_COLUMN_USAGE "
        f"WHERE TABLE_SCHEMA = '{escape_literal(db)}' "
        "AND REFERENCED_TABLE_NAME IS NOT NULL "
        "ORDER BY TABLE_NAME, ORDINAL_POSITION"
    )
    return run_select(cfg, sql, max_rows=2000).rows


# Columns whose name suggests they hold a low-cardinality entity, enum, or
# label. We aggressively cache their distinct values so Claude can map fuzzy
# user input ("Delta credit") to the real value ("DELTACREDIT") deterministically.
_ENTITY_COLUMN_HINTS = (
    "name", "status", "type", "kind", "category", "owner", "supplier",
    "merchant", "client", "borrower", "lender", "funder", "currency",
    "country", "state", "code", "label", "tag", "industry", "segment",
    "channel", "product", "method", "source", "mode",
)

_DISTINCT_VALUE_LIMIT = 80
_DISTINCT_PARALLEL_WORKERS = 4


def _looks_like_entity_column(col_name: str, col_type: str) -> bool:
    cn = (col_name or "").lower()
    ct = (col_type or "").lower()
    # Limit to string-ish columns; skip giant text payloads.
    if not any(x in ct for x in ("char", "varchar", "enum", "set")):
        is_short_text = "text" in ct and "longtext" not in ct and "mediumtext" not in ct
        if not is_short_text:
            return False
    return any(hint in cn for hint in _ENTITY_COLUMN_HINTS)


def get_distinct_values(
    cfg: DbConfig,
    table: str,
    column: str,
    limit: int = _DISTINCT_VALUE_LIMIT,
) -> list[str] | None:
    """Return distinct non-null values for a column if cardinality <= `limit`.

    Returns None if cardinality is too high or the query fails. Safe-quoted
    identifiers; rejects anything that isn't an SQL-safe identifier.
    """
    if not _IDENT_RE.match(table) or not _IDENT_RE.match(column):
        return None
    sql = (
        f"SELECT DISTINCT `{column}` AS v FROM `{table}` "
        f"WHERE `{column}` IS NOT NULL LIMIT {limit + 1}"
    )
    try:
        result = run_select(cfg, sql, max_rows=limit + 1)
    except Exception as e:
        log.debug("get_distinct_values(%s.%s) failed: %s", table, column, e)
        return None
    if len(result.rows) > limit:
        return None
    out: list[str] = []
    for r in result.rows:
        v = r.get("v")
        if v is None:
            continue
        out.append(str(v))
    return out


def enrich_with_distinct_values(cfg: DbConfig, ctx: dict[str, Any]) -> int:
    """Mutate ctx in place, adding 'distinct_values' to entity-like columns.

    Returns the number of columns enriched. Queries run in parallel so the cost
    is bounded by the slowest column, not the sum of all columns.
    """
    targets: list[tuple[int, int, str, str]] = []
    for ti, t in enumerate(ctx["tables"]):
        for ci, c in enumerate(t["columns"]):
            if _looks_like_entity_column(c["name"], c.get("type", "")):
                targets.append((ti, ci, t["name"], c["name"]))

    if not targets:
        return 0

    enriched = 0
    with concurrent.futures.ThreadPoolExecutor(
        max_workers=_DISTINCT_PARALLEL_WORKERS,
        thread_name_prefix="dbchat-distinct",
    ) as ex:
        futures = {
            ex.submit(get_distinct_values, cfg, table, col): (ti, ci, table, col)
            for ti, ci, table, col in targets
        }
        for fut in concurrent.futures.as_completed(futures):
            ti, ci, table, col = futures[fut]
            try:
                values = fut.result()
            except Exception as e:
                log.debug("distinct future for %s.%s raised: %s", table, col, e)
                continue
            if values:
                ctx["tables"][ti]["columns"][ci]["distinct_values"] = values
                enriched += 1
    return enriched


def build_enriched_context(
    cfg: DbConfig,
    schema: dict[str, Any] | None = None,
    samples_per_table: int = 2,
    with_distinct_values: bool = True,
) -> dict[str, Any]:
    """Schema + sample rows + foreign keys + distinct values for entity columns."""
    s = schema or get_full_schema(cfg)
    enriched_tables: list[dict[str, Any]] = []
    for t in s["tables"]:
        samples: list[dict[str, Any]] = []
        if samples_per_table > 0:
            try:
                samples = get_table_samples(cfg, t["name"], n=samples_per_table)
            except Exception as e:
                log.debug("Sample fetch failed for %s: %s", t["name"], e)
        enriched_tables.append({**t, "samples": samples})
    try:
        fks = get_foreign_keys(cfg)
    except Exception as e:
        log.debug("FK fetch failed: %s", e)
        fks = []
    ctx = {
        "database": s["database"],
        "tables": enriched_tables,
        "foreign_keys": fks,
    }
    if with_distinct_values:
        try:
            n = enrich_with_distinct_values(cfg, ctx)
            log.info("Enriched %d columns with distinct values", n)
        except Exception as e:
            log.debug("Distinct-value enrichment failed: %s", e)
    return ctx


# Module-level cache so chats don't re-introspect on every turn.
_ENRICHED_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
_ENRICHED_TTL = 600  # 10 minutes


def _cache_key(cfg: DbConfig) -> str:
    return f"{cfg.host}|{cfg.port}|{cfg.user}|{cfg.database}"


def get_enriched_context_cached(
    cfg: DbConfig, force_refresh: bool = False
) -> dict[str, Any]:
    key = _cache_key(cfg)
    now = time.time()
    if not force_refresh:
        cached = _ENRICHED_CACHE.get(key)
        if cached and now - cached[0] < _ENRICHED_TTL:
            return cached[1]
    context = build_enriched_context(cfg)
    _ENRICHED_CACHE[key] = (now, context)
    return context


def invalidate_enriched_cache(cfg: DbConfig | None = None) -> None:
    if cfg is None:
        _ENRICHED_CACHE.clear()
    else:
        _ENRICHED_CACHE.pop(_cache_key(cfg), None)


def connection_info(cfg: DbConfig) -> dict[str, Any]:
    result = run_select(
        cfg,
        "SELECT VERSION() AS version, DATABASE() AS current_database, "
        "CURRENT_USER() AS current_user_name, @@hostname AS server_host",
        max_rows=1,
    )
    info = result.rows[0] if result.rows else {}
    info["configured_host"] = f"{cfg.host}:{cfg.port}"
    info["configured_database"] = cfg.database
    return info
