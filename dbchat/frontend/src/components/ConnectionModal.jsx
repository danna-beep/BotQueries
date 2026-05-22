import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  BookOpen,
  Check,
  Database,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plug,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  addMemory,
  clearGlossary,
  connect,
  deleteMemory,
  disconnect,
  getGlossary,
  listDatabasesForConfig,
  listDatabasesStored,
  listMemory,
  testConnection,
  uploadGlossary,
} from "../lib/api.js";
import { cn } from "../lib/utils.js";

const EMPTY = {
  host: "127.0.0.1",
  port: 3306,
  user: "",
  password: "",
  database: "",
  charset: "utf8mb4",
  ssl_disabled: false,
};

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[10px] text-muted/70">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-2.5 py-2 rounded-md bg-bg border border-border text-sm font-mono " +
  "placeholder:text-muted/60 focus:border-accent/50 disabled:opacity-50";

export default function ConnectionModal({
  open,
  initial,
  hasStoredPassword,
  canClose,
  onClose,
  onConnected,
  onDisconnected,
}) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [showPw, setShowPw] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [pwTouched, setPwTouched] = useState(false);
  const [availableDbs, setAvailableDbs] = useState(null);
  const [loadingDbs, setLoadingDbs] = useState(false);
  const [glossary, setGlossary] = useState(null);
  const [glossaryBusy, setGlossaryBusy] = useState(false);
  const [glossaryErr, setGlossaryErr] = useState(null);
  const [memory, setMemory] = useState([]);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [memoryBusy, setMemoryBusy] = useState(false);
  const [memoryErr, setMemoryErr] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm({ ...EMPTY, ...(initial || {}) });
    setTestResult(null);
    setError(null);
    setPwTouched(false);
    setAvailableDbs(null);
  }, [initial, open]);

  // Pull current glossary + memory state whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const g = await getGlossary();
        if (!cancelled) setGlossary(g);
      } catch {
        if (!cancelled) setGlossary({ loaded: 0, matched: 0, sample: [] });
      }
      try {
        const m = await listMemory();
        if (!cancelled) setMemory(m.entries || []);
      } catch {
        if (!cancelled) setMemory([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleAddMemory = async () => {
    const text = memoryDraft.trim();
    if (!text) return;
    setMemoryBusy(true);
    setMemoryErr(null);
    try {
      const r = await addMemory(text);
      setMemory((prev) => [r.entry, ...prev]);
      setMemoryDraft("");
    } catch (e) {
      setMemoryErr(e.message);
    } finally {
      setMemoryBusy(false);
    }
  };

  const handleDeleteMemory = async (id) => {
    setMemoryErr(null);
    try {
      await deleteMemory(id);
      setMemory((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setMemoryErr(e.message);
    }
  };

  const handleGlossaryFile = async (file) => {
    if (!file) return;
    setGlossaryErr(null);
    setGlossaryBusy(true);
    try {
      const text = await file.text();
      const r = await uploadGlossary(text);
      setGlossary({ loaded: r.loaded, matched: r.matched, sample: [] });
    } catch (e) {
      setGlossaryErr(e.message);
    } finally {
      setGlossaryBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGlossaryClear = async () => {
    setGlossaryBusy(true);
    setGlossaryErr(null);
    try {
      await clearGlossary();
      setGlossary({ loaded: 0, matched: 0, sample: [] });
    } catch (e) {
      setGlossaryErr(e.message);
    } finally {
      setGlossaryBusy(false);
    }
  };

  // If the user already saved credentials, fetch the database list immediately
  // when the modal opens — no need to click "test" again.
  useEffect(() => {
    if (!open || !hasStoredPassword || availableDbs !== null) return;
    let cancelled = false;
    (async () => {
      setLoadingDbs(true);
      try {
        const r = await listDatabasesStored();
        if (!cancelled) setAvailableDbs(r.databases || []);
      } catch {
        if (!cancelled) setAvailableDbs(null);
      } finally {
        if (!cancelled) setLoadingDbs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, hasStoredPassword, availableDbs]);

  if (!open) return null;

  const update = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setTestResult(null);
    setError(null);
    // host/port/user/password change invalidates the database list
    if (["host", "port", "user", "password", "ssl_disabled"].includes(k)) {
      setAvailableDbs(null);
    }
  };

  const buildPayload = () => {
    const out = { ...form };
    out.port = Number(out.port) || 3306;
    out.database = out.database?.trim() || null;
    // If the user didn't retype the password and we know one is saved server-side,
    // tell the backend to load it from ~/.dbchat/config.json.
    if (!pwTouched && hasStoredPassword && !out.password) {
      out.use_saved_password = true;
      out.password = "";
    }
    return out;
  };

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);
    setAvailableDbs(null);
    const payload = buildPayload();
    try {
      const r = await testConnection(payload);
      setTestResult(r);
      // Best-effort: also fetch visible databases for the picker.
      setLoadingDbs(true);
      try {
        const dbResult = await listDatabasesForConfig(payload);
        setAvailableDbs(dbResult.databases || []);
      } catch {
        setAvailableDbs([]);
      } finally {
        setLoadingDbs(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setTesting(false);
    }
  };

  const pickDatabase = (name) => {
    update("database", name);
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const r = await connect(buildPayload());
      onConnected && onConnected(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      await disconnect();
      onDisconnected && onDisconnected();
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const canSubmit = form.user && form.host;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={canClose ? onClose : undefined}
      />

      <div className="relative panel w-full max-w-xl max-h-[90vh] overflow-auto shadow-2xl animate-slide-up">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Database size={16} className="text-accent" />
          <div className="flex-1">
            <h2 className="font-display italic text-2xl leading-none text-fg">
              Connect to your{" "}
              <span className="text-accent terminal-glow">database</span>
            </h2>
            <p className="mt-1 text-[11px] font-mono text-muted">
              credentials are stored locally in ~/.dbchat/config.json
            </p>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="text-muted hover:text-fg"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="host" hint="hostname or IP">
                <input
                  className={inputCls}
                  value={form.host}
                  onChange={(e) => update("host", e.target.value)}
                  placeholder="127.0.0.1"
                />
              </Field>
            </div>
            <Field label="port">
              <input
                type="number"
                className={inputCls}
                value={form.port}
                onChange={(e) => update("port", e.target.value)}
              />
            </Field>
          </div>

          <Field label="user">
            <input
              className={inputCls}
              value={form.user}
              onChange={(e) => update("user", e.target.value)}
              placeholder="dbchat_reader"
              autoComplete="username"
            />
          </Field>

          <Field
            label="password"
            hint={hasStoredPassword && !pwTouched ? "saved — type to change" : ""}
          >
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className={cn(inputCls, "pr-9")}
                value={form.password}
                onChange={(e) => {
                  update("password", e.target.value);
                  setPwTouched(true);
                }}
                placeholder={
                  hasStoredPassword && !pwTouched ? "•••••••• (saved)" : ""
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </Field>

          <Field
            label="database"
            hint={
              availableDbs && availableDbs.length > 0
                ? `${availableDbs.length} found — click to pick`
                : "required — pick one"
            }
          >
            <input
              className={inputCls}
              value={form.database || ""}
              onChange={(e) => update("database", e.target.value)}
              placeholder="my_database"
              list="dbchat-db-list"
            />
            {availableDbs && availableDbs.length > 0 && (
              <>
                <datalist id="dbchat-db-list">
                  {availableDbs.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1.5 mt-2 animate-slide-up">
                  {availableDbs.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => pickDatabase(d)}
                      className={cn(
                        "chip cursor-pointer hover:border-accent/60 hover:text-accent transition-colors",
                        form.database === d &&
                          "border-accent/60 bg-accent/15 text-accent"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
            {availableDbs && availableDbs.length === 0 && !loadingDbs && (
              <p className="mt-1 text-[10px] font-mono text-muted">
                no databases visible to this user
              </p>
            )}
            {loadingDbs && (
              <p className="mt-1 text-[10px] font-mono text-muted flex items-center gap-1.5">
                <Loader2 size={10} className="animate-spin" />
                loading database list…
              </p>
            )}
          </Field>

          <div className="panel-inset p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={12} className="text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                business glossary
              </span>
              {glossary && glossary.loaded > 0 ? (
                <span className="chip ml-auto border-accent/40 text-accent">
                  {glossary.loaded} terms · {glossary.matched} matched
                </span>
              ) : (
                <span className="chip ml-auto">none loaded</span>
              )}
            </div>
            <p className="text-[11px] text-muted leading-relaxed mb-2">
              upload a CSV with columns like{" "}
              <span className="font-mono text-fg/80">Variable name</span>,{" "}
              <span className="font-mono text-fg/80">Definition</span>,{" "}
              <span className="font-mono text-fg/80">Data type</span>. Claude
              uses it to map domain terms to your columns.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(e) => handleGlossaryFile(e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={glossaryBusy}
                className="btn"
              >
                {glossaryBusy ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Upload size={11} />
                )}
                upload csv
              </button>
              {glossary && glossary.loaded > 0 && (
                <button
                  type="button"
                  onClick={handleGlossaryClear}
                  disabled={glossaryBusy}
                  className="btn text-muted hover:text-danger hover:border-danger/40"
                >
                  <Trash2 size={11} />
                  clear
                </button>
              )}
              {glossary && glossary.sample && glossary.sample.length > 0 && (
                <span className="text-[10px] font-mono text-muted ml-auto flex items-center gap-1">
                  <FileText size={10} />
                  e.g. {glossary.sample[0].name}
                </span>
              )}
            </div>
            {glossaryErr && (
              <p className="mt-2 text-[11px] font-mono text-danger">
                {glossaryErr}
              </p>
            )}
          </div>

          <div className="panel-inset p-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={12} className="text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                memory · agent brain
              </span>
              <span className="chip ml-auto">
                {memory.length} {memory.length === 1 ? "note" : "notes"}
              </span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed mb-2">
              free-form notes injected into every chat prompt. teach the agent
              your conventions:{" "}
              <span className="font-mono text-fg/80">
                "Delta credit = DELTACREDIT in payment_tape.owner_name"
              </span>{" "}
              or{" "}
              <span className="font-mono text-fg/80">
                "para últimos registros usar ORDER BY id DESC"
              </span>
              .
            </p>
            <div className="flex items-stretch gap-2 mb-2">
              <textarea
                value={memoryDraft}
                onChange={(e) => setMemoryDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    (e.metaKey || e.ctrlKey) &&
                    e.key === "Enter" &&
                    memoryDraft.trim() &&
                    !memoryBusy
                  ) {
                    e.preventDefault();
                    handleAddMemory();
                  }
                }}
                rows={2}
                placeholder="add a note…  (⌘/Ctrl + Enter to save)"
                className="flex-1 px-2 py-1.5 rounded-md bg-bg border border-border text-[12px] font-mono placeholder:text-muted/60 focus:border-accent/40 resize-none"
              />
              <button
                type="button"
                onClick={handleAddMemory}
                disabled={memoryBusy || !memoryDraft.trim()}
                className="btn-primary self-stretch"
              >
                {memoryBusy ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Plus size={11} />
                )}
                add
              </button>
            </div>
            {memory.length > 0 && (
              <ul className="max-h-44 overflow-auto scrollbar-thin space-y-1 pr-1">
                {memory.map((m) => (
                  <li
                    key={m.id}
                    className="group flex items-start gap-2 px-2 py-1.5 rounded border border-border bg-bg/40"
                  >
                    <span className="flex-1 text-[11.5px] font-mono leading-snug text-fg/90 whitespace-pre-wrap break-words">
                      {m.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(m.id)}
                      className="text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-opacity shrink-0"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {memoryErr && (
              <p className="mt-2 text-[11px] font-mono text-danger">
                {memoryErr}
              </p>
            )}
          </div>

          <details className="text-[11px]">
            <summary className="cursor-pointer font-mono uppercase tracking-wide text-muted hover:text-fg">
              advanced
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="charset">
                <input
                  className={inputCls}
                  value={form.charset}
                  onChange={(e) => update("charset", e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-2 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ssl_disabled}
                  onChange={(e) => update("ssl_disabled", e.target.checked)}
                  className="accent-accent"
                />
                <span className="font-mono text-[11px] text-fg/80">
                  disable SSL (local servers only)
                </span>
              </label>
            </div>
          </details>

          {testResult && (
            <div className="panel-inset border-accent/40 bg-accent/10 text-accent p-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-1">
                <Check size={13} />
                <span className="font-mono text-[11px] uppercase tracking-wide">
                  connection ok
                </span>
              </div>
              {testResult.details && typeof testResult.details === "object" && (
                <pre className="text-[10.5px] font-mono leading-relaxed text-accent/90 whitespace-pre-wrap break-all">
                  {Object.entries(testResult.details)
                    .map(([k, v]) => `${k}: ${v ?? "—"}`)
                    .join("\n")}
                </pre>
              )}
            </div>
          )}

          {error && (
            <div className="panel-inset border-danger/40 bg-danger/10 text-danger p-3 flex items-start gap-2 animate-slide-up">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span className="text-[11.5px] font-mono break-all">{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-surface2/30">
          <div className="text-[10px] font-mono text-muted flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-accent" />
            tip: use a <span className="text-accent">GRANT SELECT</span>-only user
          </div>
          <div className="flex-1" />
          {hasStoredPassword && (
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="btn text-danger border-danger/40 hover:bg-danger/10"
            >
              disconnect
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={testing || connecting || !canSubmit}
            className="btn"
          >
            {testing ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Plug size={11} />
            )}
            test
          </button>
          <button
            onClick={handleConnect}
            disabled={connecting || testing || !canSubmit}
            className="btn-primary"
          >
            {connecting ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Check size={11} />
            )}
            save &amp; connect
          </button>
        </div>
      </div>
    </div>
  );
}
