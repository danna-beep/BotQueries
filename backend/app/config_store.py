"""Persistent storage for the user's database connection settings.

Stored at ~/.dbchat/config.json with 0600 permissions. This is a local-only app
so the password lives on disk — the user is the only one who reads it.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

CONFIG_DIR = Path.home() / ".dbchat"
CONFIG_FILE = CONFIG_DIR / "config.json"


def load_config() -> dict[str, Any] | None:
    if not CONFIG_FILE.is_file():
        return None
    try:
        return json.loads(CONFIG_FILE.read_text())
    except Exception:
        return None


def save_config(cfg: dict[str, Any]) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    tmp = CONFIG_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(cfg, indent=2))
    try:
        os.chmod(tmp, 0o600)
    except OSError:
        pass
    tmp.replace(CONFIG_FILE)


def clear_config() -> None:
    if CONFIG_FILE.is_file():
        CONFIG_FILE.unlink()
