"""Business glossary storage and prompt formatting.

The user uploads a CSV with rows like:

    Variable name | Definition                       | Data type | Allowed values
    --------------+----------------------------------+-----------+----------------
    Days Past Due | Cantidad de días de retraso ...  | BIG_DECIMAL | Sin restricciones
    Account Debtor| Código de identificación ...     | STRING    | Sin restricciones
    ...

We persist it to ~/.dbchat/glossary.json and feed matching entries into the
chat prompt so Claude maps natural-language terms ("morosidad", "deudor") to
the right columns.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import os
import re
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

GLOSSARY_DIR = Path.home() / ".dbchat"
GLOSSARY_FILE = GLOSSARY_DIR / "glossary.json"

# Drop entries whose name is shorter than 2 chars or matches "[object Object]".
_PLACEHOLDER = "[object Object]"


def _normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def parse_csv(text: str) -> list[dict[str, Any]]:
    """Parse a glossary CSV. Tolerates BOMs, CRLF, and column-name variants."""
    if not text or not text.strip():
        return []
    # Strip a leading UTF-8 BOM if present (Excel exports add one).
    if text.startswith("﻿"):
        text = text[1:]
    reader = csv.DictReader(io.StringIO(text))
    out: list[dict[str, Any]] = []
    for row in reader:
        key_map = {
            (k.lstrip("﻿").strip().lower() if k else ""): k
            for k in row.keys()
            if k is not None
        }

        def pick(*candidates: str) -> str:
            for c in candidates:
                if c.lower() in key_map:
                    v = row[key_map[c.lower()]]
                    if v is not None:
                        return str(v).strip()
            return ""

        name = pick("variable name", "variable_name", "name", "column", "field")
        if not name or len(name) < 2:
            continue
        definition = pick("definition", "description", "meaning")
        dtype = pick("data type", "data_type", "type")
        allowed = pick("allowed values", "allowed_values", "values", "options")
        # Strip out the [object Object] placeholders that contaminate exports.
        if _PLACEHOLDER in allowed:
            allowed = ""
        if _PLACEHOLDER in definition:
            definition = ""
        out.append(
            {
                "name": name,
                "definition": definition,
                "type": dtype,
                "allowed_values": allowed,
            }
        )
    return out


def save_glossary(entries: list[dict[str, Any]]) -> int:
    GLOSSARY_DIR.mkdir(parents=True, exist_ok=True)
    GLOSSARY_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
    try:
        os.chmod(GLOSSARY_FILE, 0o600)
    except OSError:
        pass
    return len(entries)


def load_glossary() -> list[dict[str, Any]]:
    if not GLOSSARY_FILE.is_file():
        return []
    try:
        return json.loads(GLOSSARY_FILE.read_text())
    except Exception as e:
        log.warning("Could not parse glossary: %s", e)
        return []


def clear_glossary() -> None:
    if GLOSSARY_FILE.is_file():
        GLOSSARY_FILE.unlink()


def match_to_schema(
    glossary: list[dict[str, Any]], schema: dict[str, Any]
) -> list[dict[str, Any]]:
    """Return glossary entries whose name fuzzy-matches a table or column name."""
    schema_norms: set[str] = set()
    for table in schema.get("tables", []):
        schema_norms.add(_normalize(table["name"]))
        for col in table.get("columns", []):
            schema_norms.add(_normalize(col["name"]))

    matched: list[dict[str, Any]] = []
    seen: set[str] = set()
    for entry in glossary:
        norm = _normalize(entry["name"])
        if not norm or norm in seen:
            continue
        is_match = norm in schema_norms
        if not is_match and len(norm) >= 6:
            # Containment match for descriptive variable names.
            for sc in schema_norms:
                if norm in sc or (len(sc) >= 6 and sc in norm):
                    is_match = True
                    break
        if is_match:
            seen.add(norm)
            matched.append(entry)
    return matched


def format_for_prompt(entries: list[dict[str, Any]], limit: int = 120) -> str:
    if not entries:
        return ""
    lines = [
        "<business_glossary>",
        "(domain terms that match columns in this database — use these definitions to interpret user questions)",
    ]
    for e in entries[:limit]:
        parts = [e["name"]]
        if e.get("type"):
            parts.append(f"[{e['type']}]")
        if e.get("definition"):
            parts.append(f"— {e['definition']}")
        if e.get("allowed_values"):
            parts.append(f"(values: {e['allowed_values']})")
        lines.append(" ".join(parts))
    if len(entries) > limit:
        lines.append(f"... and {len(entries) - limit} more entries omitted")
    lines.append("</business_glossary>")
    return "\n".join(lines)
