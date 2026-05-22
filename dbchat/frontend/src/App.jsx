import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import TopBar from "./components/TopBar.jsx";
import SchemaPanel from "./components/SchemaPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ConnectionModal from "./components/ConnectionModal.jsx";
import {
  getConnection,
  getContextSummary,
  getSchema,
  getStatus,
} from "./lib/api.js";

const KEY_STORAGE = "dbchat_key";
const THEME_STORAGE = "dbchat_theme";

export default function App() {
  const [status, setStatus] = useState(null);
  const [connection, setConnection] = useState(null);
  const [schema, setSchema] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [schemaErr, setSchemaErr] = useState(null);
  const [connModalOpen, setConnModalOpen] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(KEY_STORAGE) || ""
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_STORAGE) || "dark"
  );

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem(THEME_STORAGE, theme);
  }, [theme]);

  const loadStatus = async () => {
    try {
      const s = await getStatus();
      setStatus(s);
      return s;
    } catch (e) {
      setStatus({ db_ok: false, configured: false, details: e.message });
      return null;
    }
  };

  const loadConnection = async () => {
    try {
      const c = await getConnection();
      setConnection(c);
      return c;
    } catch (e) {
      setConnection({ configured: false, config: null });
      return null;
    }
  };

  const loadSchema = async () => {
    try {
      const s = await getSchema();
      setSchema(s);
      setSchemaErr(null);
    } catch (e) {
      setSchemaErr(e.message);
      setSchema(null);
    }
  };

  const loadContext = async () => {
    try {
      const c = await getContextSummary();
      setCtx(c);
    } catch {
      setCtx(null);
    }
  };

  // Initial boot: figure out if we need to show the modal.
  useEffect(() => {
    (async () => {
      const [s, c] = await Promise.all([loadStatus(), loadConnection()]);
      const noDbPicked = !!(s?.db_ok && !c?.config?.database);
      if (s?.db_ok && !noDbPicked) {
        await Promise.all([loadSchema(), loadContext()]);
      }
      if (!c?.configured || !s?.db_ok || noDbPicked) {
        setConnModalOpen(true);
      }
      setBootDone(true);
    })();
  }, []);

  const handleApiKey = (k) => {
    setApiKey(k);
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  };

  const recordResult = (r) => {
    setResult(r);
    if (r && r.sql) {
      setHistory((h) =>
        [
          {
            sql: r.sql,
            row_count: r.row_count,
            elapsed_ms: r.elapsed_ms,
            timestamp: new Date().toISOString(),
            columns: r.columns,
            rows: r.rows,
            truncated: r.truncated,
          },
          ...h,
        ].slice(0, 50)
      );
    }
  };

  const reloadFromHistory = (h) => {
    setResult({
      sql: h.sql,
      columns: h.columns,
      rows: h.rows,
      row_count: h.row_count,
      elapsed_ms: h.elapsed_ms,
      truncated: h.truncated,
    });
  };

  const onTableClick = (tableName) => {
    const sql = `SELECT * FROM ${tableName} LIMIT 10`;
    setResult({
      sql,
      columns: [],
      rows: [],
      row_count: 0,
      elapsed_ms: 0,
      truncated: false,
    });
  };

  const onConnected = async () => {
    setConnModalOpen(false);
    await Promise.all([loadStatus(), loadConnection()]);
    await Promise.all([loadSchema(), loadContext()]);
  };

  const onDisconnected = async () => {
    setSchema(null);
    setResult(null);
    setHistory([]);
    await Promise.all([loadStatus(), loadConnection()]);
  };

  const dbOk = !!status?.db_ok;

  return (
    <div className="h-full flex flex-col">
      <TopBar
        status={status}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onOpenConnection={() => setConnModalOpen(true)}
      />

      {bootDone && status && !status.configured && (
        <div className="px-5 py-2 border-b border-accent2/40 bg-accent2/10 text-accent2 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={13} />
          <span>no database connection configured</span>
          <button
            onClick={() => setConnModalOpen(true)}
            className="ml-auto underline hover:text-fg"
          >
            configure now →
          </button>
        </div>
      )}

      {bootDone && status?.configured && !dbOk && (
        <div className="px-5 py-2 border-b border-danger/40 bg-danger/10 text-danger text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={13} />
          <span>
            connection failed
            {typeof status.details === "string" ? ` — ${status.details}` : ""}
          </span>
          <button
            onClick={() => setConnModalOpen(true)}
            className="ml-auto underline hover:text-fg"
          >
            edit connection
          </button>
        </div>
      )}

      {schemaErr && dbOk && (
        <div className="px-5 py-2 border-b border-danger/40 bg-danger/10 text-danger text-xs font-mono">
          schema load failed: {schemaErr}
        </div>
      )}

      {dbOk && ctx?.available && (
        <div className="px-5 py-1.5 border-b border-border bg-surface/40 text-[10px] font-mono text-muted flex items-center gap-3 flex-wrap">
          <span className="text-accent/80">CONTEXT</span>
          <span>{ctx.tables} tables</span>
          <span>·</span>
          <span>{ctx.sample_rows} sample rows</span>
          <span>·</span>
          <span>{ctx.foreign_keys} FKs</span>
          {ctx.distinct_columns > 0 && (
            <>
              <span>·</span>
              <span className="text-accent">
                {ctx.distinct_columns} entity cols · {ctx.distinct_values}{" "}
                values
              </span>
            </>
          )}
          <span>·</span>
          <span>
            glossary{" "}
            {ctx.glossary_terms_total > 0 ? (
              <span className="text-accent">
                {ctx.glossary_terms_matched}/{ctx.glossary_terms_total} matched
              </span>
            ) : (
              <span className="text-muted">none</span>
            )}
          </span>
          <span>·</span>
          <span>
            memory{" "}
            {ctx.memory_entries > 0 ? (
              <span className="text-accent">{ctx.memory_entries}</span>
            ) : (
              <span className="text-muted">empty</span>
            )}
          </span>
          <button
            onClick={() => setConnModalOpen(true)}
            className="ml-auto underline hover:text-fg"
          >
            edit context →
          </button>
        </div>
      )}

      <main
        className="flex-1 min-h-0 grid gap-3 p-3"
        style={{
          gridTemplateColumns: "260px minmax(0, 1fr) 380px",
          gridTemplateRows: "minmax(0, 1fr) auto",
        }}
      >
        <div className="row-span-2 min-h-0">
          <SchemaPanel
            schema={schema}
            onRefresh={loadSchema}
            onTableClick={onTableClick}
          />
        </div>

        <div className="min-h-0">
          <ResultsPanel result={result} onResult={recordResult} />
        </div>

        <div className="row-span-2 min-h-0">
          <ChatPanel
            apiKey={apiKey}
            onApiKey={handleApiKey}
            onResult={recordResult}
            dbOk={dbOk}
            authStatus={status?.anthropic_auth}
          />
        </div>

        <div className="min-h-0 max-h-[30vh]">
          <HistoryPanel history={history} onSelect={reloadFromHistory} />
        </div>
      </main>

      <ConnectionModal
        open={connModalOpen}
        canClose={!!connection?.configured && dbOk}
        initial={connection?.config || {}}
        hasStoredPassword={!!connection?.config?.has_password}
        onClose={() => setConnModalOpen(false)}
        onConnected={onConnected}
        onDisconnected={onDisconnected}
      />
    </div>
  );
}
