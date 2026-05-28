import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  clearWarnings,
  deleteWarning,
  listWarnings,
} from "../lib/api.js";
import { cn } from "../lib/utils.js";

const SEV_STYLE = {
  ok: {
    label: "ok",
    icon: CheckCircle2,
    pill: "border-accent/40 bg-accent/10 text-accent",
    side: "border-l-accent/70",
  },
  low: {
    label: "low",
    icon: AlertTriangle,
    pill: "border-accent/40 bg-accent/10 text-accent",
    side: "border-l-accent/70",
  },
  medium: {
    label: "medium",
    icon: AlertTriangle,
    pill: "border-accent2/40 bg-accent2/10 text-accent2",
    side: "border-l-accent2/70",
  },
  high: {
    label: "high",
    icon: AlertTriangle,
    pill: "border-danger/40 bg-danger/10 text-danger",
    side: "border-l-danger/70",
  },
};

function formatTimestamp(ms) {
  if (!ms) return "";
  try {
    const d = new Date(ms);
    return d.toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function WarningCard({ warning, onDelete }) {
  const [open, setOpen] = useState(false);
  const sev = SEV_STYLE[warning.severity] || SEV_STYLE.medium;
  const Icon = sev.icon;

  return (
    <div
      className={cn(
        "panel-inset border-l-2 overflow-hidden animate-slide-up",
        sev.side
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-surface2/40 transition-colors"
      >
        <span
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-md border shrink-0",
            sev.pill
          )}
        >
          <Icon size={13} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              {warning.client}
            </span>
            <span className={cn("chip", sev.pill)}>{sev.label}</span>
            <span className="ml-auto text-[10px] font-mono text-muted/70">
              {formatTimestamp(warning.created_at)}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-fg/90 font-medium leading-snug">
            {warning.title}
          </div>
          {warning.tables_reviewed?.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-mono text-muted/70">
                tablas:
              </span>
              {warning.tables_reviewed.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg/40 text-fg/80"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-muted/60 mt-1 shrink-0">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-border/60 bg-bg/20">
          {warning.details && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted/70 mb-1">
                detalle
              </div>
              <p className="text-[12.5px] leading-relaxed text-fg/85 whitespace-pre-wrap">
                {warning.details}
              </p>
            </div>
          )}
          {warning.possible_fix && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted/70 mb-1">
                posible corrección
              </div>
              <p className="text-[12.5px] leading-relaxed text-accent2/90 whitespace-pre-wrap">
                {warning.possible_fix}
              </p>
            </div>
          )}
          {warning.user_question && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted/70 mb-1">
                pregunta original
              </div>
              <p className="text-[12px] italic text-muted/90 leading-relaxed">
                “{warning.user_question}”
              </p>
            </div>
          )}
          {warning.sql_run?.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wide text-muted/70 mb-1">
                queries ejecutadas
              </div>
              <div className="space-y-1">
                {warning.sql_run.map((sql, i) => (
                  <pre
                    key={i}
                    className="text-[11px] font-mono text-fg/80 px-2.5 py-1.5 rounded-md bg-bg/60 border border-border/60 overflow-x-auto whitespace-pre-wrap break-words"
                  >
                    {sql}
                  </pre>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(warning.id);
              }}
              className="inline-flex items-center gap-1 text-[10.5px] font-mono uppercase tracking-wide text-muted/70 hover:text-danger transition-colors"
              title="Eliminar este registro"
            >
              <Trash2 size={11} />
              eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WarningsView() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState("all"); // all | issues | ok

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await listWarnings();
      setWarnings(r.warnings || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("warnings:changed", onChange);
    return () => window.removeEventListener("warnings:changed", onChange);
  }, []);

  const onDelete = async (id) => {
    try {
      await deleteWarning(id);
      setWarnings((ws) => ws.filter((w) => w.id !== id));
    } catch (e) {
      setErr(e.message);
    }
  };

  const onClear = async () => {
    if (!warnings.length) return;
    if (!window.confirm("¿Borrar todo el historial de warnings?")) return;
    try {
      await clearWarnings();
      setWarnings([]);
    } catch (e) {
      setErr(e.message);
    }
  };

  const filtered = warnings.filter((w) => {
    if (filter === "issues") return w.severity !== "ok";
    if (filter === "ok") return w.severity === "ok";
    return true;
  });

  const counts = warnings.reduce(
    (acc, w) => {
      acc.all++;
      if (w.severity === "ok") acc.ok++;
      else acc.issues++;
      return acc;
    },
    { all: 0, ok: 0, issues: 0 }
  );

  const FilterBtn = ({ id, label, count }) => (
    <button
      onClick={() => setFilter(id)}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-tight transition-all",
        filter === id
          ? "bg-surface2 text-fg border border-border/80"
          : "text-muted hover:text-fg border border-transparent"
      )}
    >
      {label}
      <span className="font-mono text-[10px] text-muted/80 tabular-nums">
        {count}
      </span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-surface/40">
        <FilterBtn id="all" label="todos" count={counts.all} />
        <FilterBtn id="issues" label="problemas" count={counts.issues} />
        <FilterBtn id="ok" label="ok" count={counts.ok} />
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={load}
            className="btn h-7 w-7 justify-center !p-0"
            title="Recargar"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onClear}
            disabled={!warnings.length}
            className="btn h-7 w-7 justify-center !p-0 hover:text-danger disabled:opacity-40"
            title="Borrar todo"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {err && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-danger/40 bg-danger/10 text-danger text-[11.5px]">
          <X size={12} />
          <span className="flex-1 font-mono">{err}</span>
          <button onClick={() => setErr(null)}>
            <X size={11} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto px-3 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <AlertTriangle
              size={28}
              strokeWidth={1.4}
              className="text-muted/40 mb-3"
            />
            <p className="font-display italic text-[22px] text-fg/70">
              {warnings.length === 0
                ? "Sin warnings todavía"
                : "Nada en este filtro"}
            </p>
            <p className="mt-2 text-[11.5px] text-muted max-w-xs">
              {warnings.length === 0
                ? "Pregúntale al chat sobre conciliaciones, por ejemplo: \"¿por qué no se conciliaron los últimos 10 pagos de Niko?\". Los hallazgos aparecerán aquí."
                : "Cambia el filtro para ver otros registros."}
            </p>
          </div>
        ) : (
          filtered.map((w) => (
            <WarningCard key={w.id} warning={w} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
