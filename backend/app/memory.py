"""User-curated memory: free-form notes that get injected into every chat prompt.

Designed to let the user teach the agent things it can't infer from the schema:
- domain-specific name mappings ("Delta credit" → "DELTACREDIT")
- conventions ("most-recent records use ORDER BY id DESC")
- gotchas, business rules, anything Claude should respect across turns

Persisted to ~/.dbchat/memory.json. Local-only, mode 0600.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

log = logging.getLogger(__name__)

MEMORY_FILE = Path.home() / ".dbchat" / "memory.json"
_MAX_ENTRIES_IN_PROMPT = 100
_MAX_TEXT_CHARS = 4000


def load_memory() -> list[dict[str, Any]]:
    if not MEMORY_FILE.is_file():
        return []
    try:
        data = json.loads(MEMORY_FILE.read_text())
        if isinstance(data, list):
            return data
    except Exception as e:
        log.warning("Could not parse memory file: %s", e)
    return []


def _save(entries: list[dict[str, Any]]) -> None:
    MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    MEMORY_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2))
    try:
        os.chmod(MEMORY_FILE, 0o600)
    except OSError:
        pass


def add_entry(text: str) -> dict[str, Any]:
    text = (text or "").strip()
    if not text:
        raise ValueError("Memory entry must not be empty.")
    if len(text) > _MAX_TEXT_CHARS:
        text = text[:_MAX_TEXT_CHARS]
    entries = load_memory()
    entry = {
        "id": uuid.uuid4().hex[:10],
        "text": text,
        "added_at": datetime.now().isoformat(timespec="seconds"),
    }
    entries.insert(0, entry)
    _save(entries)
    return entry


def delete_entry(entry_id: str) -> bool:
    entries = load_memory()
    new = [e for e in entries if e.get("id") != entry_id]
    if len(new) == len(entries):
        return False
    _save(new)
    return True


def clear_all() -> None:
    _save([])


def format_for_prompt(limit: int = _MAX_ENTRIES_IN_PROMPT) -> str:
    """Return the memory block as plain text to splice into the system prompt."""
    entries = load_memory()
    if not entries:
        return ""
    lines = [
        "<memory>",
        "(user-curated notes about this database — apply them when they're relevant to the question)",
    ]
    for e in entries[:limit]:
        lines.append(f"- {e['text']}")
    lines.append("</memory>")
    return "\n".join(lines)
