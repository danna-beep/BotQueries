"""Dashboard storage: persists dashboards and their chart tiles to a JSON file.

Tiles store only the SQL + chart config. When the dashboard is rendered, the
frontend re-runs each tile's query to get fresh data.
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
_STORE_PATH = _STORE_DIR / "dashboards.json"


def _now_ms() -> int:
    return int(time.time() * 1000)


def _new_id() -> str:
    return uuid.uuid4().hex[:12]


def _ensure_store() -> None:
    _STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not _STORE_PATH.exists():
        _STORE_PATH.write_text(json.dumps({"dashboards": []}, indent=2))
        try:
            os.chmod(_STORE_PATH, 0o600)
        except OSError:
            pass


def _read() -> dict[str, Any]:
    _ensure_store()
    try:
        return json.loads(_STORE_PATH.read_text())
    except Exception as e:
        log.warning("dashboards.json unreadable, starting fresh: %s", e)
        return {"dashboards": []}


def _write(data: dict[str, Any]) -> None:
    _ensure_store()
    tmp = _STORE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, default=str))
    tmp.replace(_STORE_PATH)


def _find_dashboard(data: dict[str, Any], dashboard_id: str) -> dict[str, Any] | None:
    for d in data["dashboards"]:
        if d["id"] == dashboard_id:
            return d
    return None


def _find_tile(dashboard: dict[str, Any], tile_id: str) -> dict[str, Any] | None:
    for t in dashboard.get("tiles", []):
        if t["id"] == tile_id:
            return t
    return None


def list_dashboards() -> list[dict[str, Any]]:
    data = _read()
    # Summaries only — no tiles.
    return [
        {
            "id": d["id"],
            "name": d["name"],
            "tile_count": len(d.get("tiles", [])),
            "created_at": d.get("created_at"),
            "updated_at": d.get("updated_at"),
        }
        for d in data["dashboards"]
    ]


def get_dashboard(dashboard_id: str) -> dict[str, Any] | None:
    data = _read()
    return _find_dashboard(data, dashboard_id)


def create_dashboard(name: str) -> dict[str, Any]:
    data = _read()
    dashboard = {
        "id": _new_id(),
        "name": name.strip() or "Untitled",
        "created_at": _now_ms(),
        "updated_at": _now_ms(),
        "tiles": [],
    }
    data["dashboards"].append(dashboard)
    _write(data)
    return dashboard


def rename_dashboard(dashboard_id: str, name: str) -> dict[str, Any] | None:
    data = _read()
    d = _find_dashboard(data, dashboard_id)
    if not d:
        return None
    d["name"] = name.strip() or "Untitled"
    d["updated_at"] = _now_ms()
    _write(data)
    return d


def delete_dashboard(dashboard_id: str) -> bool:
    data = _read()
    before = len(data["dashboards"])
    data["dashboards"] = [d for d in data["dashboards"] if d["id"] != dashboard_id]
    if len(data["dashboards"]) == before:
        return False
    _write(data)
    return True


# Place new tile at the bottom of the layout grid (12-col).
def _next_tile_position(tiles: list[dict[str, Any]]) -> dict[str, int]:
    max_bottom = 0
    for t in tiles:
        layout = t.get("layout") or {}
        bottom = (layout.get("y", 0)) + (layout.get("h", 4))
        if bottom > max_bottom:
            max_bottom = bottom
    return {"x": 0, "y": max_bottom, "w": 6, "h": 5}


def add_tile(dashboard_id: str, tile_data: dict[str, Any]) -> dict[str, Any] | None:
    data = _read()
    d = _find_dashboard(data, dashboard_id)
    if not d:
        return None
    tile = {
        "id": _new_id(),
        "title": (tile_data.get("title") or "Untitled chart").strip(),
        "sql": tile_data["sql"],
        "chart_kind": tile_data.get("chart_kind") or "bar",
        "top_n": tile_data.get("top_n", 20),
        "x_key": tile_data.get("x_key"),
        "y_series": tile_data.get("y_series"),
        "kpi_label": tile_data.get("kpi_label"),
        "layout": tile_data.get("layout") or _next_tile_position(d.get("tiles", [])),
        "created_at": _now_ms(),
    }
    d.setdefault("tiles", []).append(tile)
    d["updated_at"] = _now_ms()
    _write(data)
    return tile


def update_tile(
    dashboard_id: str, tile_id: str, patch: dict[str, Any]
) -> dict[str, Any] | None:
    data = _read()
    d = _find_dashboard(data, dashboard_id)
    if not d:
        return None
    tile = _find_tile(d, tile_id)
    if not tile:
        return None
    for key in (
        "title",
        "sql",
        "chart_kind",
        "top_n",
        "x_key",
        "y_series",
        "kpi_label",
        "layout",
    ):
        if key in patch:
            tile[key] = patch[key]
    d["updated_at"] = _now_ms()
    _write(data)
    return tile


def update_layout(dashboard_id: str, layouts: list[dict[str, Any]]) -> bool:
    """Bulk-update layout for many tiles in one go (after drag/resize)."""
    data = _read()
    d = _find_dashboard(data, dashboard_id)
    if not d:
        return False
    layout_by_id = {ly["i"]: ly for ly in layouts if "i" in ly}
    for tile in d.get("tiles", []):
        ly = layout_by_id.get(tile["id"])
        if ly:
            tile["layout"] = {
                "x": int(ly.get("x", 0)),
                "y": int(ly.get("y", 0)),
                "w": int(ly.get("w", 6)),
                "h": int(ly.get("h", 5)),
            }
    d["updated_at"] = _now_ms()
    _write(data)
    return True


def delete_tile(dashboard_id: str, tile_id: str) -> bool:
    data = _read()
    d = _find_dashboard(data, dashboard_id)
    if not d:
        return False
    before = len(d.get("tiles", []))
    d["tiles"] = [t for t in d.get("tiles", []) if t["id"] != tile_id]
    if len(d["tiles"]) == before:
        return False
    d["updated_at"] = _now_ms()
    _write(data)
    return True
