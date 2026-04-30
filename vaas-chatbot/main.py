import os
import time
from pathlib import Path
from typing import List, Literal, Tuple

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError("ANTHROPIC_API_KEY no está definido. Configúralo en .env.")

HAIKU_MODEL = "claude-haiku-4-5-20251001"
SONNET_MODEL = "claude-sonnet-4-20250514"

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
FRONTEND_DIR = Path(__file__).parent / "frontend"
CACHE_TTL_SECONDS = 60

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

_knowledge_cache: dict = {"content": {}, "loaded_at": 0.0}


def load_knowledge_base() -> dict:
    """Carga los MDs separados por archivo para routing inteligente. Cache 60s."""
    now = time.time()
    if _knowledge_cache["content"] and (now - _knowledge_cache["loaded_at"]) < CACHE_TTL_SECONDS:
        return _knowledge_cache["content"]

    if not KNOWLEDGE_DIR.exists():
        KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

    mds = {}
    for md_file in sorted(KNOWLEDGE_DIR.glob("*.md")):
        mds[md_file.stem] = md_file.read_text(encoding="utf-8")

    _knowledge_cache["content"] = mds
    _knowledge_cache["loaded_at"] = now
    return mds


def get_relevant_context(pregunta: str, mds: dict) -> str:
    """OPTIMIZACIÓN 2: Routing inteligente — solo manda los MDs relevantes."""
    pregunta_lower = pregunta.lower()
    context_parts = []

    # MD3 (reglas de negocio) y MD4 (borrowers) — SIEMPRE se incluyen, son pequeños
    if "md3_logica_negocio_queries" in mds:
        context_parts.append("=== REGLAS DE NEGOCIO Y QUERIES ===\n" + mds["md3_logica_negocio_queries"])
    if "md4_borrowers" in mds:
        context_parts.append("=== CATÁLOGO DE BORROWERS ===\n" + mds["md4_borrowers"])

    # MD2 (esquema) — solo si la pregunta toca estructura/tablas
    keywords_md2 = [
        "tabla", "join", "columna", "payment_tape", "funds_transfer",
        "disbursement", "concili", "esquema", "índice", "pk", "fk",
        "recaudo", "pago", "distribu", "monto", "gateway",
    ]
    if any(w in pregunta_lower for w in keywords_md2):
        if "md2_esquema_tablas" in mds:
            context_parts.append("=== ESQUEMA DE TABLAS ===\n" + mds["md2_esquema_tablas"])

    # MD1 (diccionario de variables) — solo si pregunta por variables específicas de originadores
    keywords_md1 = [
        "variable", "campo", "equivale", "addi", "xepelin", "aplazo",
        "adelantos", "originador", "diccionario", "loan tape", "assignment",
    ]
    if any(w in pregunta_lower for w in keywords_md1):
        if "md1_diccionario_variables" in mds:
            context_parts.append("=== DICCIONARIO DE VARIABLES ===\n" + mds["md1_diccionario_variables"])

    if not context_parts:
        for key in ["md2_esquema_tablas", "md3_logica_negocio_queries", "md4_borrowers"]:
            if key in mds:
                context_parts.append(mds[key])

    return "\n\n".join(context_parts)


SYSTEM_PROMPT_BASE = """Eres un experto en SQL para el sistema VAAS, un master servicer financiero.
Tu única función es convertir preguntas en lenguaje natural a queries SQL válidas para MySQL 8.0.

REGLAS ESTRICTAS:
1. Genera SOLO SQL válido para MySQL 8.0. Sin explicaciones largas.
2. Antes del SQL escribe en máximo 2 líneas qué hace la query.
3. Nunca uses status = 'approved' — usa approved_date IS NOT NULL.
4. Para payment_tape usa company_id (entero). Para todas las demás tablas usa borrower_code (string).
5. Si el usuario menciona un borrower por nombre, tradúcelo usando el catálogo de borrowers.
6. Si la pregunta es ambigua (sin borrower o sin rango de fechas), pregunta antes de generar.
7. Si la pregunta no es sobre queries de VAAS, responde: Solo puedo ayudarte con queries del sistema VAAS.
8. Agrega siempre LIMIT 1000 salvo que el usuario pida agregados (SUM, COUNT, AVG).
9. En tablas grandes (payments 74M filas, payment_tape 61M filas) asegúrate de filtrar por columnas indexadas.
10. Genera el SQL dentro de un bloque ```sql ... ``` siempre.

FORMATO DE RESPUESTA:
📋 Qué hace: [máximo 2 líneas]

```sql
-- borrower: [CODE o ID usado] | período: [rango de fechas]
[SQL aquí]
```

CONTEXTO DEL SISTEMA:
{context}"""


def contains_valid_sql(response_text: str) -> bool:
    """Heurística simple: la respuesta contiene SELECT y (FROM o un fence ```sql)."""
    text_lower = response_text.lower()
    return "select" in text_lower and ("from" in text_lower or "```sql" in text_lower)


def _extract_text(response) -> str:
    blocks = [b.text for b in response.content if b.type == "text"]
    return "\n".join(blocks).strip()


def _call_model(model: str, system_prompt: str, messages: list):
    try:
        return client.messages.create(
            model=model,
            max_tokens=1000,
            system=[
                {
                    "type": "text",
                    "text": system_prompt,
                    "cache_control": {"type": "ephemeral"},  # OPTIMIZACIÓN 1: prompt caching 5 min
                }
            ],
            messages=messages,
        )
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=e.status_code, detail=f"Anthropic API ({model}): {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la API de Anthropic.")


async def call_anthropic(messages: list, system_prompt: str) -> Tuple[str, str]:
    """OPTIMIZACIÓN 3: Haiku primero, Sonnet como fallback si Haiku no genera SQL válido."""
    response_text = "(sin respuesta)"

    for model in [HAIKU_MODEL, SONNET_MODEL]:
        response = _call_model(model, system_prompt, messages)
        response_text = _extract_text(response) or "(sin respuesta)"

        if model == HAIKU_MODEL and not contains_valid_sql(response_text):
            continue  # fallback a Sonnet
        return response_text, model

    return response_text, SONNET_MODEL


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


class ChatResponse(BaseModel):
    response: str
    model_used: str


app = FastAPI(title="VAAS SQL Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    mds = load_knowledge_base()
    total_kb = sum(len(v.encode()) for v in mds.values()) / 1024
    return {
        "status": "ok",
        "mds_cargados": len(mds),
        "archivos": list(mds.keys()),
        "total_kb": round(total_kb, 1),
        "optimizaciones_activas": [
            "prompt_caching",
            "routing_inteligente_mds",
            "haiku_primero_sonnet_fallback",
        ],
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages no puede estar vacío")

    mds = load_knowledge_base()
    if not mds:
        return ChatResponse(
            response="⚠️ No hay archivos MD cargados. Sube los archivos a la carpeta knowledge/ y reinicia.",
            model_used="none",
        )

    last_user_message = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )
    context = get_relevant_context(last_user_message, mds)
    system_prompt = SYSTEM_PROMPT_BASE.format(context=context)

    api_messages = [{"role": m.role, "content": m.content} for m in request.messages]
    response_text, model_used = await call_anthropic(api_messages, system_prompt)

    return ChatResponse(response=response_text, model_used=model_used)


if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    async def index():
        index_path = FRONTEND_DIR / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="frontend/index.html no encontrado")
