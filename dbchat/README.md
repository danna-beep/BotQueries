# DBChat

Query a MySQL/MariaDB database in **plain English**. Local-only, dark-by-default, terminal-meets-editorial.

```
┌─────────────────────────────────────────────────┐
│  Frontend — React + Vite + Tailwind             │
│  (built and served by the backend)              │
└──────────────────┬──────────────────────────────┘
                   │ HTTP + SSE
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend — FastAPI + Anthropic SDK              │
│  http://localhost:8000                          │
│  - /api/connect, /api/disconnect, /api/status   │
│  - /api/schema, /api/tables, /api/query         │
│  - /api/export, /api/download                   │
│  - /api/chat (SSE, Claude tool-calling agent)   │
│  - SQL safety validator (read-only)             │
└──────────────────┬──────────────────────────────┘
                   ▼
              MySQL / MariaDB
```

## Run it

```bash
cd dbchat
python3 launch.py
```

That's it. The launcher:

1. Creates `backend/.venv` and installs Python deps (first run only)
2. Runs `npm install` + `npm run build` to bundle the frontend (first run only)
3. Starts the server on `http://localhost:8000`
4. Opens your default browser to the app

The first run takes ~30–60 s. After that, `python3 launch.py` boots in 1–2 s.

**Prerequisites:** Python 3.10+ and Node 18+ on your `PATH`. (`python3 --version`, `node --version`)

## First-time flow in the UI

1. The browser opens to a **Connection** modal.
2. Enter your MySQL/MariaDB credentials — host, port, user, password, database.
3. Click **test** to verify, then **save & connect**.
4. Credentials are saved to `~/.dbchat/config.json` (mode `0600`, never leaves your machine).
5. Schema loads in the left panel; ask Claude anything in the right panel.

To change connection, click the **DB pill** in the top-right of the header.

To enable chat, paste your `sk-ant-...` key via the **set api key** button in the chat panel (also stored in your browser's localStorage). Without a key, manual SQL still works.

## Security model

DBChat will reject anything that isn't `SELECT` / `WITH` / `SHOW` / `DESCRIBE` / `EXPLAIN`. Three defense layers run on every query:

1. **SQL validator** — strips comments, rejects multi-statement payloads, blocks `INTO OUTFILE/DUMPFILE` and every write keyword.
2. **Auto LIMIT** — `SELECT`/`WITH` queries with no `LIMIT` get one appended (default 1000, max 100000).
3. **Per-query timeout** — `SET SESSION MAX_EXECUTION_TIME` (silently skipped on MariaDB).

Even with all that, you should still point DBChat at a **`GRANT SELECT`-only user**:

```sql
CREATE USER 'dbchat_reader'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT ON my_database.* TO 'dbchat_reader'@'%';
FLUSH PRIVILEGES;
```

## Exports

Files land in `${DBCHAT_OUTPUT_DIR}` if set, otherwise `{OS_TEMP}/dbchat_exports`. They're served via `/api/download/{filename}` with path-traversal protection.

## Optional: dev mode

If you want hot-reload on the frontend while hacking, run the two servers separately:

```bash
# terminal 1
cd backend
source .venv/bin/activate
python run.py             # http://127.0.0.1:8000

# terminal 2
cd frontend
npm run dev               # http://localhost:5173 (proxies /api to :8000)
```

## Troubleshooting

| Error                              | Meaning                                                |
| ---------------------------------- | ------------------------------------------------------ |
| `Access denied (1045)`             | bad user or password                                   |
| `Cannot connect (2003)`            | server unreachable — check host/port                   |
| `Unknown database (1049)`          | the database name doesn't exist                        |
| `Query timed out (3024/1317)`      | refine the query or raise read timeout                 |
| `SQL rejected: ...`                | the safety validator blocked a write/unsafe statement  |
| `No Anthropic API key`             | paste your key in the chat panel                       |
| `Port 8000 busy`                   | launcher auto-finds next free port                     |
