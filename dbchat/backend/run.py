"""Run the backend with: python run.py"""

import os
from pathlib import Path

import uvicorn


def main() -> None:
    # Auto-load .env if present (no extra dependency).
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)


if __name__ == "__main__":
    main()
