#!/usr/bin/env python3
"""DBChat launcher: builds frontend (first run only), starts server, opens browser.

Usage:
    python launch.py            # default port 8000
    DBCHAT_PORT=9000 python launch.py
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import venv
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"
BACKEND = ROOT / "backend"
DIST = FRONTEND / "dist"
VENV = BACKEND / ".venv"

DEFAULT_PORT = int(os.getenv("DBCHAT_PORT", "8000"))


# ---------------------------------------------------------------- tiny helpers
def _print(msg: str) -> None:
    print(f"[dbchat] {msg}", flush=True)


def _which(cmd: str) -> str | None:
    return shutil.which(cmd)


def _venv_python() -> Path:
    if os.name == "nt":
        return VENV / "Scripts" / "python.exe"
    return VENV / "bin" / "python"


def _free_port(starting: int) -> int:
    port = starting
    for _ in range(50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                port += 1
    raise RuntimeError(f"No free port near {starting}")


# ---------------------------------------------------------- backend dependencies
def _ensure_venv() -> Path:
    py = _venv_python()
    if py.is_file():
        return py
    _print("Creating Python virtualenv at backend/.venv …")
    venv.EnvBuilder(with_pip=True, clear=False).create(VENV)
    return _venv_python()


def _ensure_backend_deps(py: Path) -> None:
    try:
        subprocess.run(
            [str(py), "-c", "import fastapi, anthropic, pymysql, sqlparse, openpyxl, uvicorn"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return
    except subprocess.CalledProcessError:
        pass
    _print("Installing backend dependencies (one-time)…")
    subprocess.run(
        [str(py), "-m", "pip", "install", "--quiet", "--upgrade", "pip"],
        check=True,
    )
    subprocess.run(
        [str(py), "-m", "pip", "install", "--quiet", "-r", str(BACKEND / "requirements.txt")],
        check=True,
    )


# ---------------------------------------------------------- frontend build
def _ensure_frontend_built() -> None:
    if DIST.is_dir() and (DIST / "index.html").is_file():
        return
    npm = _which("npm")
    if not npm:
        _print(
            "ERROR: npm is not on your PATH. Install Node 18+ from https://nodejs.org, then re-run."
        )
        sys.exit(1)

    if not (FRONTEND / "node_modules").is_dir():
        _print("Installing frontend dependencies (one-time, ~30s)…")
        subprocess.run([npm, "install"], cwd=FRONTEND, check=True)

    _print("Building frontend bundle…")
    subprocess.run([npm, "run", "build"], cwd=FRONTEND, check=True)


# ---------------------------------------------------------- entry
def _open_browser_when_ready(port: int) -> None:
    time.sleep(1.2)
    url = f"http://localhost:{port}"
    _print(f"Opening {url}")
    try:
        webbrowser.open(url, new=2)
    except Exception as e:
        _print(f"Could not open browser automatically: {e}")
        _print(f"Open this URL manually: {url}")


def _load_dotenv() -> None:
    """Best-effort load of backend/.env so ANTHROPIC_API_KEY etc. are available."""
    env_path = BACKEND / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip())


def main() -> int:
    _print(f"Project root: {ROOT}")
    py = _ensure_venv()
    _ensure_backend_deps(py)
    _ensure_frontend_built()
    _load_dotenv()

    port = _free_port(DEFAULT_PORT)
    if port != DEFAULT_PORT:
        _print(f"Port {DEFAULT_PORT} busy — using {port} instead.")

    threading.Thread(target=_open_browser_when_ready, args=(port,), daemon=True).start()

    _print(f"Starting backend on http://localhost:{port} (Ctrl+C to stop)")
    cmd = [
        str(py),
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        str(port),
        "--log-level",
        "info",
    ]
    try:
        return subprocess.call(cmd, cwd=BACKEND)
    except KeyboardInterrupt:
        _print("Shutting down.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
