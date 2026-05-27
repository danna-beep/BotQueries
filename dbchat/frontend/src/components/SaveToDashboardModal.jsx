import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  addTile,
  createDashboard,
  listDashboards,
} from "../lib/api.js";

export default function SaveToDashboardModal({
  open,
  onClose,
  sql,
  chartKind,
  topN,
  xKey,
  ySeries,
  kpiLabel,
  defaultTitle,
}) {
  const [dashboards, setDashboards] = useState([]);
  const [targetId, setTargetId] = useState("");
  const [newName, setNewName] = useState("");
  const [title, setTitle] = useState(defaultTitle || "Untitled chart");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedTo, setSavedTo] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSavedTo(null);
    setTitle(defaultTitle || "Untitled chart");
    setNewName("");
    listDashboards()
      .then((r) => {
        setDashboards(r.dashboards || []);
        if (r.dashboards?.length) setTargetId(r.dashboards[0].id);
        else setTargetId("__new__");
      })
      .catch((e) => setError(e.message));
  }, [open, defaultTitle]);

  if (!open) return null;

  const submit = async () => {
    if (!sql) return;
    setSaving(true);
    setError(null);
    try {
      let dashboardId = targetId;
      let dashboardName = "";
      if (targetId === "__new__") {
        const name = newName.trim() || "Untitled dashboard";
        const d = await createDashboard(name);
        dashboardId = d.id;
        dashboardName = d.name;
      } else {
        dashboardName =
          dashboards.find((d) => d.id === dashboardId)?.name || "dashboard";
      }
      await addTile(dashboardId, {
        title: title.trim() || "Untitled chart",
        sql,
        chart_kind: chartKind,
        top_n: topN,
        x_key: xKey || null,
        y_series: ySeries || null,
        kpi_label: kpiLabel || null,
      });
      setSavedTo(dashboardName);
      // Auto-close after a beat so user sees confirmation.
      setTimeout(() => onClose && onClose(), 900);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose && onClose();
      }}
    >
      <div className="panel w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="text-[13px] font-medium tracking-tight">
            Guardar en dashboard
          </span>
          <button
            onClick={() => !saving && onClose && onClose()}
            disabled={saving}
            className="ml-auto text-muted hover:text-fg"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="label-mono">Título de la gráfica</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-md bg-bg border border-border text-sm focus:border-accent/50 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="label-mono">Dashboard</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-md bg-bg border border-border text-sm focus:border-accent/50 outline-none cursor-pointer"
            >
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
              <option value="__new__">+ Crear nuevo dashboard…</option>
            </select>
          </div>
          {targetId === "__new__" && (
            <div className="animate-slide-up">
              <label className="label-mono">Nombre del nuevo dashboard</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Reconciliación diaria"
                className="mt-1.5 w-full px-3 py-2 rounded-md bg-bg border border-border text-sm focus:border-accent/50 outline-none"
              />
            </div>
          )}
          <div className="pt-2 text-[11px] font-mono text-muted">
            tipo: <span className="text-fg/80">{chartKind}</span>
            {topN ? (
              <>
                {" "}· top: <span className="text-fg/80">{topN}</span>
              </>
            ) : null}
          </div>
          {savedTo ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent/10 border border-accent/30 text-accent text-sm">
              <Check size={14} strokeWidth={2.5} />
              Guardado en <strong>{savedTo}</strong>
            </div>
          ) : error ? (
            <div className="px-3 py-2 rounded-md bg-danger/10 border border-danger/30 text-danger text-xs font-mono">
              {error}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-bg/30">
          <button
            onClick={() => !saving && onClose && onClose()}
            disabled={saving}
            className="btn"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={saving || !sql || !!savedTo}
            className="btn-primary ml-auto"
          >
            {saving ? (
              <>
                <Loader2 size={11} className="animate-spin" /> Guardando…
              </>
            ) : (
              "Guardar gráfica"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
