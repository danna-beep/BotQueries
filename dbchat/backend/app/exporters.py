"""Export query results to CSV, Excel or JSON."""

from __future__ import annotations

import csv
import json
import os
import re
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, Literal

from openpyxl import Workbook

ExportFormat = Literal["csv", "xlsx", "json"]


def default_output_dir() -> Path:
    env_dir = os.getenv("DBCHAT_OUTPUT_DIR")
    if env_dir:
        p = Path(env_dir).expanduser()
    else:
        p = Path(tempfile.gettempdir()) / "dbchat_exports"
    p.mkdir(parents=True, exist_ok=True)
    return p


_FILENAME_SAFE = re.compile(r"[^A-Za-z0-9._-]+")


def safe_filename(base: str, fmt: ExportFormat) -> str:
    cleaned = _FILENAME_SAFE.sub("_", base).strip("_") or "query_result"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{cleaned}_{timestamp}.{fmt}"


def export_results(
    columns: list[str],
    rows: list[dict[str, Any]],
    fmt: ExportFormat,
    filename_hint: str = "query_result",
    output_dir: Path | None = None,
) -> Path:
    out_dir = output_dir or default_output_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / safe_filename(filename_hint, fmt)

    if fmt == "csv":
        _write_csv(path, columns, rows)
    elif fmt == "xlsx":
        _write_xlsx(path, columns, rows)
    elif fmt == "json":
        _write_json(path, columns, rows)
    else:
        raise ValueError(f"Unsupported export format: {fmt}")
    return path


def _write_csv(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({c: _csv_cell(row.get(c)) for c in columns})


def _csv_cell(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return value


def _write_xlsx(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    wb = Workbook(write_only=True)
    ws = wb.create_sheet(title="results")
    ws.append(columns)
    for row in rows:
        ws.append([_xlsx_cell(row.get(c)) for c in columns])
    wb.save(path)


def _xlsx_cell(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, (int, float, str, bool)):
        return value
    return str(value)


def _write_json(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    payload = {"columns": columns, "row_count": len(rows), "rows": rows}
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
