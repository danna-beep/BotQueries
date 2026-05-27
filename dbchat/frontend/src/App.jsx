import { useEffect, useState } from "react";
import { AlertTriangle, LayoutDashboard, Workflow } from "lucide-react";
import TopBar from "./components/TopBar.jsx";
import SchemaPanel from "./components/SchemaPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ConnectionModal from "./components/ConnectionModal.jsx";
import DashboardView from "./components/DashboardView.jsx";
import { cn } from "./lib/utils.js";
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
    () => localStorage.getItem(THEME_STORAGE) || "light"
  );
  const [view, setView] = useState("workspace");

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
        <div className="px-5 py-2.5 border-b border-accent2/40 bg-accent2/10 text-accent2 text-[12.5px] flex items-center gap-2">
          <AlertTriangle size={13} strokeWidth={1.8} />
          <span>No has configurado tu base de datos todavía.</span>
          <button
            onClick={() => setConnModalOpen(true)}
            className="ml-auto font-medium underline-offset-2 hover:underline"
          >
            Configurar ahora →
          </button>
        </div>
      )}

      {bootDone && status?.configured && !dbOk && (
        <div className="px-5 py-2.5 border-b border-danger/40 bg-danger/10 text-danger text-[12.5px] flex items-center gap-2">
          <AlertTriangle size={13} strokeWidth={1.8} />
          <span>
            No se pudo conectar a la base
            {typeof status.details === "string" ? ` — ${status.details}` : ""}
          </span>
          <button
            onClick={() => setConnModalOpen(true)}
            className="ml-auto font-medium underline-offset-2 hover:underline"
          >
            Editar conexión
          </button>
        </div>
      )}

      {schemaErr && dbOk && (
        <div className="px-5 py-2 border-b border-danger/40 bg-danger/10 text-danger text-[12.5px]">
          No se pudo cargar el schema: {schemaErr}
        </div>
      )}

      <nav className="flex items-center gap-1 px-4 pt-2 border-b border-border bg-surface/30">
        {[
          { id: "workspace", label: "Workspace", icon: Workflow },
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 -mb-px border-b-2 text-[13px] font-medium tracking-tight transition-all",
              view === id
                ? "border-accent text-fg"
                : "border-transparent text-muted hover:text-fg"
            )}
          >
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </button>
        ))}

        {dbOk && ctx?.available && (
          <div className="ml-auto flex items-center gap-2 text-[11px] text-muted">
            <span className="tabular-nums">{ctx.tables} tablas</span>
            {ctx.distinct_columns > 0 && (
              <>
                <span className="text-muted/40">·</span>
                <span className="text-accent/90 tabular-nums">
                  {ctx.distinct_values} valores cacheados
                </span>
              </>
            )}
            {ctx.memory_entries > 0 && (
              <>
                <span className="text-muted/40">·</span>
                <span className="tabular-nums">
                  {ctx.memory_entries} notas
                </span>
              </>
            )}
            <button
              onClick={() => setConnModalOpen(true)}
              className="ml-2 text-muted/70 hover:text-fg underline-offset-2 hover:underline"
            >
              ajustes
            </button>
          </div>
        )}
      </nav>

      {view === "workspace" ? (
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
      ) : (
        <DashboardView dbOk={dbOk} />
      )}

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
