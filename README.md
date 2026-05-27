# BotQueries — Chat SQL sobre payments_db

Consulta tu base de datos MySQL/MariaDB en **lenguaje natural**. El asistente
(Claude) lee el contexto de negocio de VAAS, propone el SQL, y tú decides cuándo
ejecutarlo. Incluye gráficas configurables y dashboards arma-tu-propio-tablero.

```
┌──────────────────────────────────────────────┐
│  Frontend — React + Vite + Tailwind + Recharts │
└───────────────────────┬──────────────────────┘
                        │ HTTP + SSE
                        ▼
┌──────────────────────────────────────────────┐
│  Backend — FastAPI + Anthropic SDK            │
│  · Modo "preview": genera SQL sin ejecutarlo  │
│  · Validador read-only (solo SELECT/WITH/…)   │
│  · Contexto de negocio inyectado desde MDs    │
│  · API de dashboards (JSON en ~/.dbchat)      │
└───────────────────────┬──────────────────────┘
                        ▼
                  MySQL / MariaDB (payments_db)
```

## Cómo correr

```bash
cd dbchat
python3 launch.py
```

El launcher crea el virtualenv, instala dependencias, compila el frontend y
levanta el servidor en `http://localhost:8000` (o el siguiente puerto libre).

**Requisitos:** Python 3.10+ y Node 18+.

> **macOS — fix de libexpat:** si `launch.py` falla al crear el venv con un error
> `Symbol not found: _XML_SetAllocTrackerActivationThreshold`, instala y enlaza
> expat de Homebrew:
> ```bash
> brew install expat
> echo 'export DYLD_LIBRARY_PATH=/opt/homebrew/opt/expat/lib:$DYLD_LIBRARY_PATH' >> ~/.zshrc
> source ~/.zshrc
> ```

## Configuración (`.env`)

Copia la plantilla y rellena tus credenciales:

```bash
cp dbchat/backend/.env.example dbchat/backend/.env
```

```ini
MYSQL_HOST=tu-host
MYSQL_PORT=3306
MYSQL_USER=usuario_solo_lectura
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=payments_db

# Opcional: si se define, el chat funciona sin pegar la key en la UI
ANTHROPIC_API_KEY=sk-ant-...
```

El archivo `.env` está en `.gitignore` y **nunca se versiona**. No pongas
credenciales reales en ningún otro archivo.

## Modelo de seguridad

1. **Validador SQL** — rechaza todo lo que no sea `SELECT` / `WITH` / `SHOW` /
   `DESCRIBE` / `EXPLAIN`. Bloquea `INSERT`, `UPDATE`, `DELETE`, `DROP`,
   `TRUNCATE`, `ALTER`, `GRANT`, multi-statement, e `INTO OUTFILE/DUMPFILE`.
2. **Auto-LIMIT** — las queries sin `LIMIT` reciben uno por defecto.
3. **Timeout por query** — 5 min en chat/consulta interactiva (los exports usan
   un timeout más largo).
4. **Defensa en profundidad (haz esto):** apunta la app a un usuario MySQL con
   solo `SELECT`:
   ```sql
   CREATE USER 'botqueries_ro'@'%' IDENTIFIED BY 'password-fuerte';
   GRANT SELECT ON payments_db.* TO 'botqueries_ro'@'%';
   FLUSH PRIVILEGES;
   ```

## Contexto de negocio (los MDs)

El asistente no solo ve el esquema: también lee documentos de negocio en
[`dbchat/backend/app/context/`](dbchat/backend/app/context/):

| Archivo | Contenido | Se inyecta |
|---|---|---|
| `md3_logica_negocio_queries.md` | Reglas de negocio y patrones de query | Siempre |
| `md4_borrowers.md` | Catálogo de borrowers + regla `company_id` vs `borrower_code` | Siempre |
| `md2_esquema_tablas.md` | Estructura técnica de las 25 tablas, índices, relaciones | Siempre |
| `md1_diccionario_variables.md` | Diccionario de ~860 variables | Solo si la pregunta menciona términos del diccionario (carga perezosa) |

Para actualizar el contexto, edita estos archivos y reinicia el backend. El
diccionario (md1) es grande (~41K tokens), por eso solo se inyecta cuando la
pregunta lo amerita — así las consultas operacionales son rápidas y baratas.

## Flujo de uso

1. **Workspace** → escribe una pregunta en el chat (ej. *"pagos de ADDI ayer"*).
2. Claude responde con una explicación + un bloque SQL. **No ejecuta nada todavía.**
3. Revisa el SQL y pulsa **ejecutar** — ahí sí se consulta la base.
4. Ve a la pestaña **Gráfica**: elige tipo (barras, línea, área, pastel, KPI,
   anillo), la columna de etiqueta y las métricas a mostrar.
5. **Guardar** → guarda la gráfica en un **Dashboard**.
6. **Dashboard** → arrastra y redimensiona los tiles para armar tu tablero.

## Estructura

```
dbchat/
├── backend/
│   └── app/
│       ├── main.py            # endpoints FastAPI
│       ├── agent.py           # agente Claude (modos preview / execute)
│       ├── prompt_context.py  # arma el contexto (schema + MDs)
│       ├── sql_safety.py      # validador read-only
│       ├── dashboards.py      # storage de dashboards
│       ├── services.py        # capa de servicios sobre la DB
│       ├── db.py              # conexión MySQL + timeouts
│       └── context/           # los 4 MDs de negocio
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── ChatPanel.jsx
            ├── ResultsPanel.jsx
            ├── Chart.jsx              # render de gráficas (reutilizable)
            ├── DashboardView.jsx      # tablero con drag & drop
            └── SaveToDashboardModal.jsx
```

## Notas

- Los dashboards se guardan en `~/.dbchat/dashboards.json`.
- Las credenciales de conexión (si las guardas desde la UI) van a
  `~/.dbchat/config.json` con permisos `0600`, fuera del repo.
- Prioridad de credenciales del chat: key pegada en la UI → `ANTHROPIC_API_KEY`
  del `.env` → Claude CLI local.
