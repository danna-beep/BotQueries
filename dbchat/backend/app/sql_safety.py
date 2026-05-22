"""SQL safety validation: ensures only read-only statements are executed."""

from __future__ import annotations

import re
from dataclasses import dataclass

import sqlparse
from sqlparse.sql import Statement
from sqlparse.tokens import DML, Keyword


FORBIDDEN_KEYWORDS: frozenset[str] = frozenset({
    "INSERT", "UPDATE", "DELETE", "REPLACE", "MERGE",
    "DROP", "TRUNCATE", "ALTER", "CREATE", "RENAME",
    "GRANT", "REVOKE",
    "LOCK", "UNLOCK",
    "CALL", "EXEC", "EXECUTE",
    "LOAD", "HANDLER",
    "SET",
})

ALLOWED_LEADING: frozenset[str] = frozenset({"SELECT", "WITH", "SHOW", "DESCRIBE", "DESC", "EXPLAIN"})


@dataclass
class SqlValidationResult:
    ok: bool
    reason: str = ""
    normalized_sql: str = ""


def _strip_comments(sql: str) -> str:
    sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.DOTALL)
    sql = re.sub(r"--[^\n]*", " ", sql)
    sql = re.sub(r"#[^\n]*", " ", sql)
    return sql


def validate_read_only_sql(sql: str) -> SqlValidationResult:
    if not sql or not sql.strip():
        return SqlValidationResult(ok=False, reason="Empty SQL.")

    cleaned = _strip_comments(sql).strip().rstrip(";").strip()
    if not cleaned:
        return SqlValidationResult(ok=False, reason="SQL is empty after stripping comments.")

    if ";" in cleaned:
        return SqlValidationResult(
            ok=False,
            reason="Multiple statements are not allowed. Submit one SELECT/WITH query.",
        )

    parsed: list[Statement] = sqlparse.parse(cleaned)
    if len(parsed) != 1:
        return SqlValidationResult(ok=False, reason="Exactly one statement is required.")

    stmt = parsed[0]
    leading_token = None
    for token in stmt.tokens:
        if token.is_whitespace:
            continue
        if token.ttype in (DML, Keyword):
            leading_token = token
            break
        break

    leading_word = ""
    if leading_token is not None and leading_token.value:
        leading_word = leading_token.value.strip().upper()
    if not leading_word:
        m = re.match(r"\s*([A-Za-z_]+)", cleaned)
        leading_word = m.group(1).upper() if m else ""

    if leading_word not in ALLOWED_LEADING:
        return SqlValidationResult(
            ok=False,
            reason=(
                f"Statement must begin with one of {sorted(ALLOWED_LEADING)}; "
                f"got '{leading_word or '?'}'. Only read-only queries are allowed."
            ),
        )

    upper_tokens = {
        t.value.strip().upper()
        for t in stmt.flatten()
        if t.ttype in (Keyword, DML) and t.value
    }
    blocked = upper_tokens & FORBIDDEN_KEYWORDS
    if blocked:
        return SqlValidationResult(
            ok=False,
            reason=(
                f"Forbidden keyword(s) detected: {sorted(blocked)}. "
                "Only read-only queries are allowed."
            ),
        )

    if re.search(r"\bINTO\s+(OUTFILE|DUMPFILE)\b", cleaned, re.IGNORECASE):
        return SqlValidationResult(
            ok=False,
            reason="INTO OUTFILE/DUMPFILE is not allowed (writes to filesystem).",
        )

    return SqlValidationResult(ok=True, normalized_sql=cleaned)


def apply_default_limit(sql: str, default_limit: int) -> str:
    cleaned = sql.strip().rstrip(";").strip()
    leading = re.match(r"\s*([A-Za-z_]+)", cleaned)
    if not leading:
        return cleaned
    verb = leading.group(1).upper()
    if verb not in {"SELECT", "WITH"}:
        return cleaned
    if re.search(r"\bLIMIT\s+\d+", cleaned, re.IGNORECASE):
        return cleaned
    return f"{cleaned} LIMIT {default_limit}"
