import { useEffect, useMemo, useState } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  AlertTriangle,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createDashboard,
  deleteDashboard,
  deleteTile,
  getDashboard,
  listDashboards,
  renameDashboard,
  runQuery,
  updateDashboardLayout,
} from "../lib/api.js";
import { Chart } from "./Chart.jsx";
import { cn } from "../lib/utils.js";

const ResponsiveGrid = WidthProvider(GridLayout);

function TileCard({ tile, dashboardId, onDelete }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await runQuery(tile.sql);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile.sql]);

  const remove = async () => {
    if (!confirm(`Eliminar "${tile.title}"?`)) return;
    try {
      await deleteTile(dashboardId, tile.id);
      onDelete && onDelete(tile.id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/70 bg-bg/30 cursor-move drag-handle">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
        <span className="text-[12.5px] font-medium tracking-tight text-fg/90 truncate flex-1">
          {tile.title}
        </span>
        <button
          onClick={run}
          disabled={loading}
          title="Refrescar"
          className="text-muted hover:text-fg transition-colors disabled:opacity-40 no-drag"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} strokeWidth={1.8} />
          )}
        </button>
        <button
          onClick={remove}
          title="Eliminar"
          className="text-muted hover:text-danger transition-colors no-drag"
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        {error ? (
          <div className="flex-1 flex items-start gap-2 p-3 text-[11px] font-mono text-danger overflow-auto">
            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        ) : !result || loading ? (
          <div className="flex-1 flex items-center justify-center text-muted">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : (
          <div className="flex-1 min-h-0 p-2">
            <Chart
              result={result}
              kind={tile.chart_kind}
              topN={tile.top_n ?? 20}
              xKey={tile.x_key || undefined}
              ySeries={tile.y_series || undefined}
              kpiLabel={tile.kpi_label || undefined}
              compact
            />
          </div>
        )}
        <div className="px-3 py-1 border-t border-border/70 bg-bg/20 flex items-center gap-2 text-[10px] font-mono text-muted/80">
          <span className="uppercase tracking-wide">{tile.chart_kind}</span>
          {result && (
            <>
              <span>·</span>
              <span className="tabular-nums">{result.row_count} rows</span>
              <span>·</span>
              <span className="tabular-nums">{result.elapsed_ms}ms</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSelector({
  dashboards,
  currentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) {
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const current = dashboards.find((d) => d.id === currentId);

  const cancelCreate = () => {
    setCreating(false);
    setDraftName("");
    setLocalErr(null);
  };

  const submitCreate = async () => {
    const name = draftName.trim();
    if (!name) {
      setLocalErr("Escribe un nombre");
      return;
    }
    setBusy(true);
    setLocalErr(null);
    try {
      await onCreate(name);
      setDraftName("");
      setCreating(false);
    } catch (e) {
      setLocalErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const startRename = () => {
    if (!current) return;
    setRenameDraft(current.name);
    setEditingName(true);
    setLocalErr(null);
  };

  const cancelRename = () => {
    setEditingName(false);
    setRenameDraft("");
    setLocalErr(null);
  };

  const submitRename = async () => {
    if (!current) return;
    const name = renameDraft.trim();
    if (!name) {
      setLocalErr("Escribe un nombre");
      return;
    }
    setBusy(true);
    setLocalErr(null);
    try {
      await onRename(current.id, name);
      setEditingName(false);
    } catch (e) {
      setLocalErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 px-4 py-3 border-b border-border bg-surface/40">
      <div className="flex items-center gap-2 flex-wrap">
        {editingName && current ? (
          <>
            <input
              autoFocus
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRename();
                else if (e.key === "Escape") cancelRename();
              }}
              className="px-2.5 py-1.5 rounded-md bg-bg border border-accent/40 text-sm font-medium tracking-tight w-64 focus:border-accent/70 outline-none"
            />
            <button
              onClick={submitRename}
              disabled={busy}
              className="btn-primary"
              title="Guardar nombre (Enter)"
            >
              {busy ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Check size={11} strokeWidth={2.4} />
              )}
              guardar
            </button>
            <button onClick={cancelRename} disabled={busy} className="btn">
              <X size={11} /> cancelar
            </button>
          </>
        ) : (
          <>
            <select
              value={currentId || ""}
              onChange={(e) => onSelect(e.target.value)}
              disabled={!dashboards.length}
              className="px-2.5 py-1.5 rounded-md bg-bg border border-border text-sm font-medium tracking-tight focus:border-accent/50 outline-none cursor-pointer disabled:opacity-50"
            >
              {dashboards.length === 0 && (
                <option value="">(sin dashboards)</option>
              )}
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.tile_count || 0} gráficas
                </option>
              ))}
            </select>
            {current && (
              <button
                onClick={startRename}
                title="Renombrar"
                className="btn"
              >
                <Pencil size={11} strokeWidth={1.8} />
              </button>
            )}
          </>
        )}

        {creating ? (
          <>
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitCreate();
                else if (e.key === "Escape") cancelCreate();
              }}
              placeholder="Nombre del dashboard…"
              className="px-2.5 py-1.5 rounded-md bg-bg border border-accent/40 text-sm w-64 focus:border-accent/70 outline-none"
            />
            <button
              onClick={submitCreate}
              disabled={busy || !draftName.trim()}
              className="btn-primary"
              title="Crear dashboard (Enter)"
            >
              {busy ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Check size={11} strokeWidth={2.4} />
              )}
              crear
            </button>
            <button onClick={cancelCreate} disabled={busy} className="btn">
              <X size={11} /> cancelar
            </button>
          </>
        ) : (
          !editingName && (
            <button onClick={() => setCreating(true)} className="btn">
              <Plus size={12} strokeWidth={2} /> nuevo
            </button>
          )
        )}

        {current && !creating && !editingName && (
          <button
            onClick={async () => {
              if (
                confirm(
                  `Eliminar dashboard "${current.name}" y todas sus gráficas?`
                )
              ) {
                await onDelete(current.id);
              }
            }}
            className="btn text-danger/80 hover:text-danger ml-auto"
          >
            <Trash2 size={12} strokeWidth={1.8} /> eliminar dashboard
          </button>
        )}
      </div>
      {localErr && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-danger">
          <AlertTriangle size={11} />
          {localErr}
        </div>
      )}
    </div>
  );
}

export default function DashboardView({ dbOk }) {
  const [dashboards, setDashboards] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loadErr, setLoadErr] = useState(null);

  const loadList = async () => {
    try {
      const r = await listDashboards();
      setDashboards(r.dashboards || []);
      if (r.dashboards?.length && !currentId) {
        setCurrentId(r.dashboards[0].id);
      } else if (!r.dashboards?.length) {
        setCurrentId(null);
        setDashboard(null);
      }
    } catch (e) {
      setLoadErr(e.message);
    }
  };

  const loadCurrent = async () => {
    if (!currentId) return;
    try {
      const d = await getDashboard(currentId);
      setDashboard(d);
    } catch (e) {
      setLoadErr(e.message);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  const handleCreate = async (name) => {
    try {
      const d = await createDashboard(name);
      await loadList();
      setCurrentId(d.id);
    } catch (e) {
      setLoadErr(e.message || String(e));
      throw e; // re-throw so the selector shows the inline error too
    }
  };

  const handleRename = async (id, name) => {
    try {
      await renameDashboard(id, name);
      await loadList();
      await loadCurrent();
    } catch (e) {
      setLoadErr(e.message || String(e));
      throw e;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDashboard(id);
      await loadList();
      setCurrentId(null);
      setDashboard(null);
    } catch (e) {
      setLoadErr(e.message || String(e));
    }
  };

  const handleTileDelete = (tileId) => {
    setDashboard((d) => ({
      ...d,
      tiles: d.tiles.filter((t) => t.id !== tileId),
    }));
  };

  const layout = useMemo(() => {
    if (!dashboard?.tiles) return [];
    return dashboard.tiles.map((t) => ({
      i: t.id,
      x: t.layout?.x ?? 0,
      y: t.layout?.y ?? 0,
      w: t.layout?.w ?? 6,
      h: t.layout?.h ?? 5,
      minW: 3,
      minH: 3,
    }));
  }, [dashboard]);

  const onLayoutChange = async (nextLayout) => {
    if (!dashboard) return;
    // Skip saving if it's the initial layout broadcast (same as current)
    const same =
      nextLayout.length === dashboard.tiles.length &&
      nextLayout.every((ly) => {
        const t = dashboard.tiles.find((x) => x.id === ly.i);
        if (!t) return false;
        const cur = t.layout || {};
        return (
          cur.x === ly.x && cur.y === ly.y && cur.w === ly.w && cur.h === ly.h
        );
      });
    if (same) return;
    setDashboard((d) => ({
      ...d,
      tiles: d.tiles.map((t) => {
        const ly = nextLayout.find((x) => x.i === t.id);
        return ly
          ? { ...t, layout: { x: ly.x, y: ly.y, w: ly.w, h: ly.h } }
          : t;
      }),
    }));
    try {
      await updateDashboardLayout(
        dashboard.id,
        nextLayout.map((ly) => ({
          i: ly.i,
          x: ly.x,
          y: ly.y,
          w: ly.w,
          h: ly.h,
        }))
      );
    } catch (e) {
      setLoadErr(`No se pudo guardar el layout: ${e.message}`);
    }
  };

  return (
    <section className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
      <DashboardSelector
        dashboards={dashboards}
        currentId={currentId}
        onSelect={setCurrentId}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {loadErr && (
        <div className="px-4 py-2 border-b border-danger/40 bg-danger/10 text-danger text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={12} />
          <span className="flex-1">{loadErr}</span>
          <button
            onClick={() => setLoadErr(null)}
            className="text-danger/70 hover:text-danger"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {!dashboards.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="font-display italic text-4xl text-fg/85">
            Tu primer <span className="text-accent terminal-glow">dashboard</span>
          </p>
          <p className="mt-3 text-sm text-muted max-w-md">
            Crea uno arriba para empezar. Luego ejecuta una query en el workspace
            y guárdala como gráfica.
          </p>
        </div>
      ) : !dashboard ? (
        <div className="flex-1 flex items-center justify-center text-muted">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : dashboard.tiles?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="font-display italic text-3xl text-fg/70">
            Dashboard vacío
          </p>
          <p className="mt-3 text-sm text-muted max-w-md">
            Ve al Workspace, ejecuta una query, abre la pestaña <strong>chart</strong>,
            y dale a <strong>guardar en dashboard</strong>.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 bg-bg/30">
          <ResponsiveGrid
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={56}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            draggableHandle=".drag-handle"
            draggableCancel=".no-drag"
            onLayoutChange={onLayoutChange}
            compactType="vertical"
          >
            {dashboard.tiles.map((tile) => (
              <div key={tile.id}>
                <TileCard
                  tile={tile}
                  dashboardId={dashboard.id}
                  onDelete={handleTileDelete}
                />
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </section>
  );
}
