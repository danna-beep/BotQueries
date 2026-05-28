"""FastAPI app exposing the database, query, export, chat and connection endpoints."""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from . import dashboards as dashboards_store
from . import glossary as glossary_store
from . import memory as memory_store
from . import warnings_store
from .agent import stream_chat
from .claude_auth import detect_claude_cli, detect_claude_code_token
from .config_store import clear_config, load_config, save_config
from .db import DbConfig, friendly_error
from .exporters import ExportFormat, default_output_dir
from .prompt_context import context_summary
from .services import (
    DEFAULT_ROW_LIMIT,
    MAX_ROW_LIMIT,
    connection_info,
    describe_table,
    execute_query,
    export_query,
    export_query_csv_unlimited,
    get_enriched_context_cached,
    get_full_schema,
    invalidate_enriched_cache,
    list_databases,
    list_tables,
)

logging.basicConfig(level=os.getenv("DBCHAT_LOG_LEVEL", "INFO"))
log = logging.getLogger("dbchat")

app = FastAPI(title="DBChat", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:8000", "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_MIN_TIMEOUT_SECONDS = 120  # auto-bump anything lower than this


def _stored_or_env_cfg() -> DbConfig | None:
    """Return the active DbConfig, preferring the persisted user config.

    Silently migrates older configs that were saved with a 30s read_timeout —
    that default was too low for production tables and was the root cause of
    "Lost connection during query" errors.
    """
    stored = load_config()
    if stored:
        try:
            current = int(stored.get("read_timeout") or 0)
        except (TypeError, ValueError):
            current = 0
        if current < _MIN_TIMEOUT_SECONDS:
            stored["read_timeout"] = 1800
            try:
                save_config(stored)
                log.info("Migrated stored read_timeout from %ss to 1800s", current)
            except Exception as e:
                log.warning("Could not persist read_timeout migration: %s", e)
        try:
            return DbConfig.from_dict(stored)
        except Exception as e:
            log.warning("Stored config is invalid: %s", e)
    try:
        return DbConfig.from_env()
    except RuntimeError:
        return None


def _cfg() -> DbConfig:
    cfg = _stored_or_env_cfg()
    if cfg is None:
        raise HTTPException(
            status_code=400,
            detail="No database connection configured. Open the UI and set credentials.",
        )
    return cfg


def _detect_auth_sources() -> dict[str, Any]:
    """Report which Anthropic auth options are available, without leaking secrets."""
    sources: list[str] = []
    if os.getenv("ANTHROPIC_API_KEY"):
        sources.append("env_api_key")
    cli_path = detect_claude_cli()
    if cli_path:
        sources.append("claude_cli")
    has_oauth = detect_claude_code_token() is not None
    if has_oauth:
        sources.append("claude_code_oauth")
    return {
        "sources": sources,
        "env_api_key": "env_api_key" in sources,
        "claude_cli": cli_path is not None,
        "claude_code_session": cli_path is not None,  # what the UI displays
    }


@app.get("/api/status")
def status() -> dict[str, Any]:
    auth = _detect_auth_sources()
    out: dict[str, Any] = {
        "db_ok": False,
        "configured": False,
        "details": None,
        "anthropic_key_present": bool(auth["sources"]),
        "anthropic_auth": auth,
    }
    cfg = _stored_or_env_cfg()
    if cfg is None:
        out["details"] = "No database connection configured."
        return out
    out["configured"] = True
    try:
        out["details"] = connection_info(cfg)
        out["db_ok"] = True
    except Exception as e:
        out["details"] = friendly_error(e)
    return out


class ConnectRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    host: str = Field(default="127.0.0.1", max_length=255)
    port: int = Field(default=3306, ge=1, le=65535)
    user: str = Field(..., min_length=1, max_length=128)
    password: str = Field(default="", max_length=512)
    database: str | None = Field(default=None, max_length=128)
    charset: str = Field(default="utf8mb4", max_length=32)
    ssl_disabled: bool = Field(default=False)
    connect_timeout: int = Field(default=10, ge=1, le=120)
    read_timeout: int = Field(default=30, ge=1, le=600)
    use_saved_password: bool = Field(default=False)


def _materialize_connect(req: ConnectRequest) -> dict[str, Any]:
    """Resolve password from the saved config when the client opts in."""
    data = req.model_dump(exclude={"use_saved_password"})
    if req.use_saved_password and not data.get("password"):
        stored = load_config() or {}
        data["password"] = stored.get("password", "")
    return data


@app.post("/api/connect/test")
def connect_test(req: ConnectRequest) -> dict[str, Any]:
    """Probe the connection without persisting it."""
    try:
        cfg = DbConfig.from_dict(_materialize_connect(req))
        info = connection_info(cfg)
        return {"ok": True, "details": info}
    except Exception as e:
        raise HTTPException(status_code=400, detail=friendly_error(e)) from e


@app.post("/api/connect")
def connect(req: ConnectRequest) -> dict[str, Any]:
    """Test the connection, persist it, then introspect for sample rows + FKs."""
    data = _materialize_connect(req)
    try:
        cfg = DbConfig.from_dict(data)
        info = connection_info(cfg)
    except Exception as e:
        raise HTTPException(status_code=400, detail=friendly_error(e)) from e
    save_config(data)
    invalidate_enriched_cache()
    # Best-effort: warm the introspection cache so the first chat is fast.
    introspect_summary: dict[str, Any] | None = None
    if data.get("database"):
        try:
            get_enriched_context_cached(cfg, force_refresh=True)
            introspect_summary = context_summary(cfg)
        except Exception as e:
            log.warning("Introspection on /api/connect failed: %s", e)
    return {"ok": True, "details": info, "context": introspect_summary}


@app.post("/api/connect/databases")
def connect_list_dbs(req: ConnectRequest) -> dict[str, Any]:
    """Return the list of databases visible to the supplied credentials."""
    try:
        cfg = DbConfig.from_dict(_materialize_connect(req))
        return {"databases": list_databases(cfg)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=friendly_error(e)) from e


@app.get("/api/databases")
def databases() -> dict[str, Any]:
    """List databases visible to the persisted connection."""
    try:
        return {"databases": list_databases(_cfg())}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


@app.delete("/api/disconnect")
def disconnect() -> dict[str, Any]:
    clear_config()
    invalidate_enriched_cache()
    return {"ok": True}


@app.get("/api/context")
def context() -> dict[str, Any]:
    """Return a small summary of the introspected context (tables/samples/FKs/glossary)."""
    cfg = _stored_or_env_cfg()
    if cfg is None or not cfg.database:
        return {"available": False}
    try:
        summary = context_summary(cfg)
        return {"available": True, **summary}
    except Exception as e:
        return {"available": False, "error": friendly_error(e)}


@app.post("/api/context/refresh")
def context_refresh() -> dict[str, Any]:
    cfg = _cfg()
    if not cfg.database:
        raise HTTPException(status_code=400, detail="Pick a database first.")
    try:
        get_enriched_context_cached(cfg, force_refresh=True)
        return {"ok": True, **context_summary(cfg)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


# --- Business glossary ---------------------------------------------------------


class GlossaryUploadRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    csv_text: str = Field(..., min_length=1, max_length=5_000_000)


@app.get("/api/glossary")
def glossary_get() -> dict[str, Any]:
    entries = glossary_store.load_glossary()
    summary: dict[str, Any] = {"loaded": len(entries), "matched": 0}
    cfg = _stored_or_env_cfg()
    if cfg and cfg.database:
        try:
            ctx = get_enriched_context_cached(cfg)
            summary["matched"] = len(glossary_store.match_to_schema(entries, ctx))
        except Exception:
            pass
    summary["sample"] = entries[:5]
    return summary


@app.post("/api/glossary")
def glossary_upload(req: GlossaryUploadRequest) -> dict[str, Any]:
    try:
        entries = glossary_store.parse_csv(req.csv_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}") from e
    if not entries:
        raise HTTPException(
            status_code=400,
            detail="No glossary entries found. Expected columns include 'Variable name' and 'Definition'.",
        )
    n = glossary_store.save_glossary(entries)
    matched = 0
    cfg = _stored_or_env_cfg()
    if cfg and cfg.database:
        try:
            ctx = get_enriched_context_cached(cfg)
            matched = len(glossary_store.match_to_schema(entries, ctx))
        except Exception:
            pass
    return {"ok": True, "loaded": n, "matched": matched}


@app.delete("/api/glossary")
def glossary_clear() -> dict[str, Any]:
    glossary_store.clear_glossary()
    return {"ok": True}


# --- Memory (user-curated notes that go into every prompt) -------------------


class MemoryAddRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(..., min_length=1, max_length=4000)


@app.get("/api/memory")
def memory_list() -> dict[str, Any]:
    entries = memory_store.load_memory()
    return {"entries": entries, "count": len(entries)}


@app.post("/api/memory")
def memory_add(req: MemoryAddRequest) -> dict[str, Any]:
    try:
        entry = memory_store.add_entry(req.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return {"ok": True, "entry": entry}


@app.delete("/api/memory/{entry_id}")
def memory_delete(entry_id: str) -> dict[str, Any]:
    deleted = memory_store.delete_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return {"ok": True}


@app.delete("/api/memory")
def memory_clear() -> dict[str, Any]:
    memory_store.clear_all()
    return {"ok": True}


@app.get("/api/connection")
def get_connection() -> dict[str, Any]:
    """Return the persisted connection (password redacted), or null."""
    stored = load_config()
    if not stored:
        return {"configured": False, "config": None}
    safe = {k: v for k, v in stored.items() if k != "password"}
    safe["has_password"] = bool(stored.get("password"))
    return {"configured": True, "config": safe}


@app.get("/api/schema")
def schema() -> dict[str, Any]:
    try:
        return get_full_schema(_cfg())
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


@app.get("/api/tables")
def tables() -> dict[str, Any]:
    try:
        return {"tables": list_tables(_cfg())}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


@app.get("/api/tables/{table}")
def describe(table: str) -> dict[str, Any]:
    try:
        return {"table": table, "columns": describe_table(_cfg(), table)}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


class QueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sql: str = Field(..., min_length=1, max_length=20000)
    max_rows: int = Field(default=DEFAULT_ROW_LIMIT, ge=1, le=MAX_ROW_LIMIT)


@app.post("/api/query")
def query(req: QueryRequest) -> dict[str, Any]:
    try:
        result = execute_query(_cfg(), req.sql, max_rows=req.max_rows)
        return {
            "columns": result.columns,
            "rows": result.rows,
            "row_count": result.row_count,
            "elapsed_ms": result.elapsed_ms,
            "truncated": result.truncated,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


class ExportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sql: str = Field(..., min_length=1, max_length=20000)
    format: ExportFormat = Field(...)
    filename: str = Field(default="query_result", max_length=80)
    max_rows: int = Field(default=MAX_ROW_LIMIT, ge=1, le=MAX_ROW_LIMIT)


@app.post("/api/export")
def export(req: ExportRequest) -> dict[str, Any]:
    try:
        cfg = _cfg()
        # CSV downloads stream with NO row cap. xlsx/json stay bounded because
        # they must hold the full dataset in memory to build the file.
        if req.format == "csv":
            import time as _time

            start = _time.perf_counter()
            path, count = export_query_csv_unlimited(cfg, req.sql, req.filename)
            return {
                "filename": path.name,
                "format": "csv",
                "row_count": count,
                "elapsed_ms": int((_time.perf_counter() - start) * 1000),
                "download_url": f"/api/download/{path.name}",
            }
        path, result = export_query(cfg, req.sql, req.format, req.filename, max_rows=req.max_rows)
        return {
            "filename": path.name,
            "format": req.format,
            "row_count": result.row_count,
            "elapsed_ms": result.elapsed_ms,
            "download_url": f"/api/download/{path.name}",
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=friendly_error(e)) from e


@app.get("/api/download/{filename}")
def download(filename: str) -> FileResponse:
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")
    path = default_output_dir() / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="File not found or already removed.")
    media_type = {
        ".csv": "text/csv",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".json": "application/json",
    }.get(path.suffix, "application/octet-stream")
    return FileResponse(path, filename=filename, media_type=media_type)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str = Field(..., min_length=1, max_length=10000)
    history: list[dict[str, Any]] = Field(default_factory=list)
    api_key: str | None = Field(default=None)
    mode: str = Field(default="preview", pattern="^(preview|execute)$")


def _sse_event(payload: dict[str, Any]) -> bytes:
    return f"data: {json.dumps(payload, default=str)}\n\n".encode("utf-8")


def _resolve_chat_auth(body_api_key: str | None) -> dict[str, str]:
    """Pick a chat backend. Priority: body key > env key > claude CLI.

    The .env key wins over CLI so the app uses the project-specific credentials
    when deployed, with the local Claude CLI as a fallback for dev convenience.
    """
    if body_api_key:
        return {"api_key": body_api_key}
    env_key = os.getenv("ANTHROPIC_API_KEY")
    if env_key:
        return {"api_key": env_key}
    if detect_claude_cli():
        return {"mode": "cli"}
    return {}


@app.post("/api/chat")
def chat(req: ChatRequest) -> StreamingResponse:
    auth = _resolve_chat_auth(req.api_key)
    if not auth:
        raise HTTPException(
            status_code=400,
            detail=(
                "No Anthropic credentials available. Paste an API key in the chat panel, "
                "set ANTHROPIC_API_KEY, or log into Claude Code."
            ),
        )
    cfg = _stored_or_env_cfg()
    if cfg is None:
        raise HTTPException(
            status_code=400,
            detail="No database connection configured. Open the UI and set credentials.",
        )

    def event_stream():
        try:
            for event in stream_chat(auth, cfg, req.message, req.history, mode=req.mode):
                yield _sse_event(event)
        except Exception as e:
            log.exception("Chat stream crashed")
            yield _sse_event({"type": "error", "error": str(e)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


class DashboardCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., min_length=1, max_length=120)


class DashboardRename(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(..., min_length=1, max_length=120)


class TileLayout(BaseModel):
    model_config = ConfigDict(extra="forbid")
    x: int = Field(default=0, ge=0)
    y: int = Field(default=0, ge=0)
    w: int = Field(default=6, ge=1, le=12)
    h: int = Field(default=5, ge=1, le=40)


class TileCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(default="Untitled chart", min_length=1, max_length=200)
    sql: str = Field(..., min_length=1, max_length=20000)
    chart_kind: str = Field(
        default="bar", pattern="^(bar|line|area|pie|kpi|ring)$"
    )
    top_n: int | str = Field(default=20)
    x_key: str | None = Field(default=None, max_length=128)
    y_series: list[str] | None = Field(default=None, max_length=32)
    kpi_label: str | None = Field(default=None, max_length=128)
    layout: TileLayout | None = None


class TilePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(default=None, min_length=1, max_length=200)
    sql: str | None = Field(default=None, min_length=1, max_length=20000)
    chart_kind: str | None = Field(
        default=None, pattern="^(bar|line|area|pie|kpi|ring)$"
    )
    top_n: int | str | None = None
    x_key: str | None = Field(default=None, max_length=128)
    y_series: list[str] | None = Field(default=None, max_length=32)
    kpi_label: str | None = Field(default=None, max_length=128)
    layout: TileLayout | None = None


class LayoutItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    i: str
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    w: int = Field(ge=1, le=12)
    h: int = Field(ge=1, le=40)


class LayoutsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    layouts: list[LayoutItem]


@app.get("/api/dashboards")
def list_dashboards_route():
    return {"dashboards": dashboards_store.list_dashboards()}


@app.post("/api/dashboards")
def create_dashboard_route(req: DashboardCreate):
    return dashboards_store.create_dashboard(req.name)


@app.get("/api/dashboards/{dashboard_id}")
def get_dashboard_route(dashboard_id: str):
    d = dashboards_store.get_dashboard(dashboard_id)
    if d is None:
        raise HTTPException(404, "Dashboard not found")
    return d


@app.put("/api/dashboards/{dashboard_id}")
def rename_dashboard_route(dashboard_id: str, req: DashboardRename):
    d = dashboards_store.rename_dashboard(dashboard_id, req.name)
    if d is None:
        raise HTTPException(404, "Dashboard not found")
    return d


@app.delete("/api/dashboards/{dashboard_id}")
def delete_dashboard_route(dashboard_id: str):
    if not dashboards_store.delete_dashboard(dashboard_id):
        raise HTTPException(404, "Dashboard not found")
    return {"ok": True}


@app.post("/api/dashboards/{dashboard_id}/tiles")
def add_tile_route(dashboard_id: str, req: TileCreate):
    payload = req.model_dump(exclude_none=True)
    if "layout" in payload and isinstance(payload["layout"], dict):
        pass  # already a dict
    tile = dashboards_store.add_tile(dashboard_id, payload)
    if tile is None:
        raise HTTPException(404, "Dashboard not found")
    return tile


@app.put("/api/dashboards/{dashboard_id}/tiles/{tile_id}")
def update_tile_route(dashboard_id: str, tile_id: str, req: TilePatch):
    patch = req.model_dump(exclude_none=True)
    tile = dashboards_store.update_tile(dashboard_id, tile_id, patch)
    if tile is None:
        raise HTTPException(404, "Tile or dashboard not found")
    return tile


@app.delete("/api/dashboards/{dashboard_id}/tiles/{tile_id}")
def delete_tile_route(dashboard_id: str, tile_id: str):
    if not dashboards_store.delete_tile(dashboard_id, tile_id):
        raise HTTPException(404, "Tile or dashboard not found")
    return {"ok": True}


@app.put("/api/dashboards/{dashboard_id}/layout")
def update_layout_route(dashboard_id: str, req: LayoutsUpdate):
    layouts = [ly.model_dump() for ly in req.layouts]
    if not dashboards_store.update_layout(dashboard_id, layouts):
        raise HTTPException(404, "Dashboard not found")
    return {"ok": True}


# --- Warnings (conciliation analysis history) --------------------------------


class WarningCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client: str = Field(..., min_length=1, max_length=120)
    title: str = Field(..., min_length=1, max_length=240)
    severity: str = Field(default="medium", pattern="^(ok|low|medium|high)$")
    tables_reviewed: list[str] = Field(default_factory=list, max_length=32)
    possible_fix: str | None = Field(default=None, max_length=2000)
    details: str | None = Field(default=None, max_length=8000)
    sql_run: list[str] = Field(default_factory=list, max_length=16)
    user_question: str | None = Field(default=None, max_length=1000)


@app.get("/api/warnings")
def list_warnings_route():
    items = warnings_store.list_warnings()
    return {"warnings": items, "count": len(items)}


@app.post("/api/warnings")
def create_warning_route(req: WarningCreate):
    return warnings_store.create_warning(req.model_dump())


@app.delete("/api/warnings/{warning_id}")
def delete_warning_route(warning_id: str):
    if not warnings_store.delete_warning(warning_id):
        raise HTTPException(404, "Warning not found")
    return {"ok": True}


@app.delete("/api/warnings")
def clear_warnings_route():
    warnings_store.clear_warnings()
    return {"ok": True}


# Mount the built frontend last so that /api/* routes still resolve first.
# The launcher (launch.py) is responsible for building this directory.
_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _DIST.is_dir() and (_DIST / "index.html").is_file():
    app.mount("/", StaticFiles(directory=str(_DIST), html=True), name="frontend")
    log.info("Serving frontend from %s", _DIST)
else:
    log.info("Frontend dist not found at %s — running in API-only mode", _DIST)
