"""Warnings storage: persists conciliation-analysis results to JSON.

A warning is generated when the chat agent answers a conciliation question.
Each entry captures the client, the diagnosis, the tables that were inspected,
and a possible fix. Entries with severity == "ok" record successful checks
(useful as an audit trail), the rest record detected problems.

Stored at ~/.dbchat/warnings.json (mode 0600), local-only.
"""

from __future__ import annotations

import json
import logging
import os
import time
import uuid
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

_STORE_DIR = Path(os.path.expanduser("~/.dbchat"))
_STORE_PATH = _STORE_DIR / "warnings.json"

VALID_SEVERITIES = {"ok", "low", "medium", "high"}


def _now_ms() -> int:
    return int(time.time() * 1000)


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


def _ensure_store() -> None:
    _STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not _STORE_PATH.exists():
        _STORE_PATH.write_text(json.dumps({"warnings": []}, indent=2))
        try:
            os.chmod(_STORE_PATH, 0o600)
        except OSError:
            pass


def _read() -> dict[str, Any]:
    _ensure_store()
    try:
        return json.loads(_STORE_PATH.read_text())
    except Exception as e:
        log.warning("warnings.json unreadable, starting fresh: %s", e)
        return {"warnings": []}


def _write(data: dict[str, Any]) -> None:
    _ensure_store()
    tmp = _STORE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, default=str))
    tmp.replace(_STORE_PATH)


def list_warnings() -> list[dict[str, Any]]:
    data = _read()
    warnings = data.get("warnings", [])
    return sorted(warnings, key=lambda w: w.get("created_at", 0), reverse=True)


def create_warning(payload: dict[str, Any]) -> dict[str, Any]:
    sev = (payload.get("severity") or "medium").lower()
    if sev not in VALID_SEVERITIES:
        sev = "medium"
    tables = payload.get("tables_reviewed") or []
    if not isinstance(tables, list):
        tables = [str(tables)]
    tables = [str(t)[:120] for t in tables][:32]
    sql_run = payload.get("sql_run") or []
    if not isinstance(sql_run, list):
        sql_run = [str(sql_run)]
    sql_run = [str(s)[:4000] for s in sql_run][:16]
    warning = {
        "id": _new_id(),
        "client": str(payload.get("client") or "").strip()[:120] or "—",
        "title": str(payload.get("title") or payload.get("warning") or "").strip()[:240]
        or "Sin título",
        "severity": sev,
        "tables_reviewed": tables,
        "possible_fix": str(payload.get("possible_fix") or "").strip()[:2000] or None,
        "details": str(payload.get("details") or "").strip()[:8000] or None,
        "sql_run": sql_run,
        "user_question": str(payload.get("user_question") or "").strip()[:1000] or None,
        "created_at": _now_ms(),
    }
    data = _read()
    data.setdefault("warnings", []).append(warning)
    _write(data)
    return warning


def delete_warning(warning_id: str) -> bool:
    data = _read()
    before = len(data.get("warnings", []))
    data["warnings"] = [w for w in data.get("warnings", []) if w.get("id") != warning_id]
    if len(data["warnings"]) == before:
        return False
    _write(data)
    return True


def clear_warnings() -> None:
    _write({"warnings": []})
