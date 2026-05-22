"""MySQL/MariaDB connection and query execution."""

from __future__ import annotations

import logging
import os
import socket
import time
from dataclasses import dataclass
from typing import Any

import pymysql
from pymysql.cursors import DictCursor

log = logging.getLogger(__name__)

# Default query timeout: 30 minutes. Big production tables with un-indexed
# GROUP BYs can take minutes; the user explicitly chose "let it load over time-
# out." See backend/app/config_store.py for the auto-migration path.
DEFAULT_READ_TIMEOUT = 1800


@dataclass(frozen=True)
class DbConfig:
    host: str
    port: int
    user: str
    password: str
    database: str | None
    charset: str
    connect_timeout: int
    read_timeout: int
    ssl_disabled: bool

    @classmethod
    def from_env(cls) -> "DbConfig":
        user = os.getenv("MYSQL_USER")
        if not user:
            raise RuntimeError(
                "MYSQL_USER environment variable is required. "
                "Set it in backend/.env before starting the server."
            )
        return cls(
            host=os.getenv("MYSQL_HOST", "127.0.0.1"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=user,
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE") or None,
            charset=os.getenv("MYSQL_CHARSET", "utf8mb4"),
            connect_timeout=int(os.getenv("MYSQL_CONNECT_TIMEOUT", "10")),
            read_timeout=int(os.getenv("MYSQL_READ_TIMEOUT", str(DEFAULT_READ_TIMEOUT))),
            ssl_disabled=os.getenv("MYSQL_SSL_DISABLED", "false").lower() in {"1", "true", "yes"},
        )

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> "DbConfig":
        user = d.get("user")
        if not user:
            raise ValueError("`user` is required.")
        return cls(
            host=d.get("host") or "127.0.0.1",
            port=int(d.get("port") or 3306),
            user=user,
            password=d.get("password") or "",
            database=d.get("database") or None,
            charset=d.get("charset") or "utf8mb4",
            connect_timeout=int(d.get("connect_timeout") or 10),
            read_timeout=int(d.get("read_timeout") or DEFAULT_READ_TIMEOUT),
            ssl_disabled=bool(d.get("ssl_disabled", False)),
        )

    def to_safe_dict(self) -> dict[str, Any]:
        """Connection details without the password — safe to return to the UI."""
        return {
            "host": self.host,
            "port": self.port,
            "user": self.user,
            "database": self.database,
            "charset": self.charset,
            "ssl_disabled": self.ssl_disabled,
        }


@dataclass
class QueryResult:
    columns: list[str]
    rows: list[dict[str, Any]]
    row_count: int
    elapsed_ms: int
    truncated: bool


def _enable_tcp_keepalive(sock: socket.socket | None) -> None:
    """Send TCP keepalives so long-running queries survive NAT / LB idle drops.

    Sends a probe after 30s of inactivity, then every 15s; gives up after 3 lost.
    Platform-specific socket options are best-effort.
    """
    if sock is None:
        return
    try:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
    except OSError:
        return
    for name, val in (
        ("TCP_KEEPIDLE", 30),   # Linux
        ("TCP_KEEPALIVE", 30),  # macOS
        ("TCP_KEEPINTVL", 15),
        ("TCP_KEEPCNT", 3),
    ):
        opt = getattr(socket, name, None)
        if opt is None:
            continue
        try:
            sock.setsockopt(socket.IPPROTO_TCP, opt, val)
        except OSError:
            pass


def _open_connection(cfg: DbConfig) -> pymysql.connections.Connection:
    kwargs: dict[str, Any] = {
        "host": cfg.host,
        "port": cfg.port,
        "user": cfg.user,
        "password": cfg.password,
        "charset": cfg.charset,
        "connect_timeout": cfg.connect_timeout,
        "read_timeout": cfg.read_timeout,
        "write_timeout": cfg.read_timeout,
        "cursorclass": DictCursor,
        "autocommit": True,
    }
    if cfg.database:
        kwargs["database"] = cfg.database
    if not cfg.ssl_disabled:
        kwargs["ssl"] = {}
    conn = pymysql.connect(**kwargs)
    _enable_tcp_keepalive(getattr(conn, "_sock", None))
    return conn


def run_select(cfg: DbConfig, sql: str, max_rows: int) -> QueryResult:
    start = time.perf_counter()
    conn = _open_connection(cfg)
    try:
        with conn.cursor() as cur:
            # Per-query server-side limit. Stay below the connection-level
            # read_timeout so we get a clean error before the socket gives up.
            max_exec_ms = max(int(cfg.read_timeout * 1000 * 0.9), 30_000)
            try:
                cur.execute(f"SET SESSION MAX_EXECUTION_TIME = {max_exec_ms}")
            except pymysql.MySQLError:
                pass

            cur.execute(sql)
            description = cur.description or []
            columns = [d[0] for d in description]

            rows: list[dict[str, Any]] = []
            truncated = False
            for i, row in enumerate(cur):
                if i >= max_rows:
                    truncated = True
                    break
                rows.append(_sanitize_row(row))

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return QueryResult(
            columns=columns,
            rows=rows,
            row_count=len(rows),
            elapsed_ms=elapsed_ms,
            truncated=truncated,
        )
    finally:
        try:
            conn.close()
        except Exception:
            log.debug("Error closing MySQL connection", exc_info=True)


def _sanitize_row(row: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for k, v in row.items():
        if isinstance(v, (bytes, bytearray)):
            try:
                out[k] = v.decode("utf-8")
            except UnicodeDecodeError:
                out[k] = v.hex()
        elif hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out


def friendly_error(e: Exception) -> str:
    if isinstance(e, pymysql.err.OperationalError):
        code = e.args[0] if e.args else None
        if code == 1045:
            return "Access denied: bad MYSQL_USER or MYSQL_PASSWORD."
        if code == 2003:
            return f"Cannot connect to MySQL at {os.getenv('MYSQL_HOST', '127.0.0.1')}:{os.getenv('MYSQL_PORT', '3306')}."
        if code == 1049:
            return "Unknown database. Check MYSQL_DATABASE."
        if code in (3024, 1317):
            return "Query timed out. Refine the query or raise MYSQL_READ_TIMEOUT."
    if isinstance(e, pymysql.err.ProgrammingError):
        return f"SQL error: {e.args[1] if len(e.args) > 1 else e}"
    return f"{type(e).__name__}: {e}"


def escape_literal(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")
