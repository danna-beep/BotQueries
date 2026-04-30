# VAAS SQL Chatbot — Setup

El chatbot soporta dos proveedores de IA, intercambiables vía la variable de entorno `AI_PROVIDER`.

---

## Modo local (Ollama)

Ideal para desarrollo y trabajo sin conexión. No envía datos fuera de tu máquina.

1. Instala Ollama desde https://ollama.ai
2. Descarga el modelo:
   ```bash
   ollama pull codellama:13b
   ```
3. Verifica que el servidor de Ollama esté corriendo (por defecto en `http://localhost:11434`):
   ```bash
   curl http://localhost:11434
   ```
4. En `.env` configura:
   ```
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=codellama:13b
   ```
5. Arranca el backend:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
6. Abre http://127.0.0.1:8000 — el badge debe mostrar `🦙 Ollama local`.

> Puedes cambiar `OLLAMA_MODEL` por otro modelo que tengas instalado (`llama3.1:8b`, `qwen2.5-coder:7b`, etc.).

---

## Modo compartido (Anthropic)

Recomendado para producción y mejor calidad de SQL.

1. Obtén una API key en https://console.anthropic.com
2. En `.env` configura:
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-tu-key-real-aquí
   ```
3. Arranca el backend:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
4. Abre http://127.0.0.1:8000 — el badge debe mostrar `⚡ Anthropic API`.

### Despliegue en Vercel

1. Importa el proyecto en Vercel.
2. En **Settings → Environment Variables** agrega:
   - `AI_PROVIDER` = `anthropic`
   - `ANTHROPIC_API_KEY` = tu key
   - (opcional) `OLLAMA_BASE_URL` y `OLLAMA_MODEL` para poder cambiar a `ollama` por entorno sin redeploy
3. Redeploy.

> Vercel no puede correr Ollama (necesita un proceso local). Para Ollama usa una VM o tu máquina.

---

## Verificación rápida

```bash
curl http://127.0.0.1:8000/health
```

El campo `ai_provider.available` debe ser `true`. Si es `false`:
- **Ollama**: revisa que `ollama serve` esté corriendo y `OLLAMA_BASE_URL` apunte al puerto correcto.
- **Anthropic**: revisa que `ANTHROPIC_API_KEY` esté en `.env` y sea válida.
