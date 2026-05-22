"""Detect ways to call Claude without the user pasting an API key.

We try (in order):
1. The `claude` CLI on PATH — uses whatever auth Claude Code is using.
2. Local OAuth credentials at ~/.claude/.credentials.json or macOS Keychain
   (kept here only as informational metadata; tokens from these locations
   cannot be used directly against api.anthropic.com).
"""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
import sys
from pathlib import Path

log = logging.getLogger(__name__)

_KEYCHAIN_SERVICE = "Claude Code-credentials"


def detect_claude_cli() -> str | None:
    """Return the absolute path to the `claude` CLI, or None if not installed."""
    return shutil.which("claude")


def _from_file() -> str | None:
    creds_file = Path.home() / ".claude" / ".credentials.json"
    if not creds_file.is_file():
        return None
    try:
        data = json.loads(creds_file.read_text())
        tok = (data.get("claudeAiOauth") or {}).get("accessToken")
        return tok or None
    except Exception as e:
        log.debug("Could not parse %s: %s", creds_file, e)
        return None


def _from_macos_keychain() -> str | None:
    if sys.platform != "darwin":
        return None
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-s", _KEYCHAIN_SERVICE, "-w"],
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        log.debug("Keychain lookup failed: %s", e)
        return None

    if result.returncode != 0:
        return None
    payload = result.stdout.strip()
    if not payload:
        return None

    try:
        data = json.loads(payload)
        tok = (data.get("claudeAiOauth") or {}).get("accessToken")
        if tok:
            return tok
    except json.JSONDecodeError:
        if payload.startswith("sk-ant-"):
            return payload
    return None


def detect_claude_code_token() -> str | None:
    """Return any locally-stored Claude Code OAuth access token, or None."""
    return _from_macos_keychain() or _from_file()
