#!/usr/bin/env bash
# Levanta el backend (uvicorn :8000) y el frontend (Vite :5173) juntos para
# desarrollo. Vite proxya /api → 127.0.0.1:8000 (ver vite.config.ts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -x backend/.venv/bin/uvicorn ]; then
  echo "[dev] Falta el venv del backend. Configuralo con:"
  echo "      python3 -m venv backend/.venv"
  echo "      backend/.venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

# Backend en segundo plano; se mata al salir.
( cd backend && exec .venv/bin/uvicorn app.main:app --port 8000 ) &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null || true' EXIT INT TERM

# Frontend en primer plano.
npm run dev
