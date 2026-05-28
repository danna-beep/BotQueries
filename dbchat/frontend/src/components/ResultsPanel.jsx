import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BookmarkPlus,
  Check,
  Code2,
  Copy,
  FileDown,
  Play,
  Table2,
  X,
} from "lucide-react";
import {
  exportQuery,
  downloadUrl,
  runQuery,
} from "../lib/api.js";
import { cn, formatNumber, suggestFilename } from "../lib/utils.js";
import {
  Chart,
  classifyColumns,
  defaultChartKind,
  detectAxes,
} from "./Chart.jsx";
import SaveToDashboardModal from "./SaveToDashboardModal.jsx";

function Cell({ value }) {
  if (value === null || value === undefined) {
    return <span className="italic text-muted">NULL</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-accent2">{String(value)}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-accent tabular-nums">{value}</span>;
  }
  if (typeof value === "object") {
    const s = JSON.stringify(value);
    return (
      <span className="text-fg/80" title={s}>
        {s.length > 80 ? s.slice(0, 79) + "…" : s}
      </span>
    );
  }
  const s = String(value);
  return (
    <span className="text-fg/90" title={s}>
      {s.length > 80 ? s.slice(0, 79) + "…" : s}
    </span>
  );
}

function TableView({ result }) {
  if (!result || !result.columns || result.columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="font-display italic text-[36px] leading-tight text-fg/80">
          Tu próxima <span className="text-accent terminal-glow">consulta</span>
        </p>
        <p className="mt-3 text-[12.5px] text-muted max-w-xs">
          Hazle una pregunta al chat a la derecha, o escribe tu propio SQL en la
          pestaña <strong className="text-fg/80">SQL</strong>.
        </p>
      </div>
    );
  }

  if (result.row_count === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="font-display italic text-3xl text-fg/70">
          0 resultados
        </p>
        <p className="mt-2 text-[12.5px] text-muted">
          La query corrió bien, pero no hay filas que cumplan los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="min-w-full font-mono text-[12px]">
        <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border">
          <tr>
            <th className="text-left px-3 py-2.5 text-muted/80 text-[10.5px] tracking-tight font-medium w-10">
              #
            </th>
            {result.columns.map((c) => (
              <th
                key={c}
                className="text-left px-3 py-2.5 text-muted/80 text-[10.5px] tracking-tight font-medium whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/40 hover:bg-accent/[0.03] transition-colors duration-100"
            >
              <td className="px-3 py-1.5 text-muted/70 text-[10.5px] tabular-nums">
                {i + 1}
              </td>
              {result.columns.map((c) => (
                <td key={c} className="px-3 py-1.5 max-w-[420px] truncate">
                  <Cell value={row[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartView({ result }) {
  const detected = useMemo(() => detectAxes(result), [result]);
  const cols = useMemo(() => classifyColumns(result), [result]);
  const defaultKind = useMemo(
    () =>
      defaultChartKind({
        rowCount: result?.row_count || 0,
        ySeries: detected.ySeries,
        xIsDate: detected.xIsDate,
      }),
    [result?.row_count, detected.ySeries, detected.xIsDate]
  );

  const [kind, setKind] = useState(defaultKind);
  const [topN, setTopN] = useState(20);
  const [xKey, setXKey] = useState(detected.xKey || "");
  const [selectedY, setSelectedY] = useState(detected.ySeries);
  const [kpiLabel, setKpiLabel] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);

  // When the result changes (new query), reset all chart config to defaults.
  useEffect(() => {
    setKind(defaultKind);
    setXKey(detected.xKey || "");
    setSelectedY(detected.ySeries);
    setKpiLabel("");
  }, [
    defaultKind,
    detected.xKey,
    // Stringify so React only resets when the actual list changes
    detected.ySeries.join(","),
  ]);

  if (!result || result.row_count === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <p className="font-display italic text-2xl text-fg/70">
          Sin datos para graficar
        </p>
      </div>
    );
  }
  if (cols.numeric.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="font-display italic text-2xl text-fg/70">
          No hay columnas numéricas
        </p>
        <p className="mt-2 text-[12.5px] text-muted">
          Agrega un SUM / COUNT / AVG a tu query para graficar.
        </p>
      </div>
    );
  }

  const isSingle = result.row_count === 1;
  const isCard = kind === "kpi" || kind === "ring";

  const Btn = ({ id, label }) => (
    <button
      onClick={() => setKind(id)}
      className={cn("btn", kind === id && "btn-primary")}
    >
      {label}
    </button>
  );

  const toggleSeries = (col) => {
    setSelectedY((prev) => {
      const has = prev.includes(col);
      if (has && prev.length === 1) return prev; // keep at least one
      return has ? prev.filter((c) => c !== col) : [...prev, col];
    });
  };

  const availableYCols = cols.numeric.filter((c) => c !== xKey);

  const defaultTitle = (() => {
    const ms = result?.sql?.match(/from\s+([\w.]+)/i);
    const table = ms ? ms[1] : "query";
    return `${kind} · ${table}`;
  })();

  return (
    <div className="flex-1 flex flex-col p-4 min-h-0">
      {/* Row 1 — chart kind + top N + save */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {isSingle ? (
          <>
            <Btn id="ring" label="Anillo" />
            <Btn id="kpi" label="KPI" />
          </>
        ) : (
          <>
            <Btn id="bar" label="Barras" />
            <Btn id="line" label="Línea" />
            <Btn id="area" label="Área" />
            <Btn id="pie" label="Pastel" />
          </>
        )}
        {!isCard && (
          <div className="ml-2 flex items-center gap-1">
            <span className="text-[11px] text-muted">Top</span>
            {[5, 10, 20, 50, "all"].map((n) => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className={cn("btn", topN === n && "btn-primary")}
              >
                {n === "all" ? "Todos" : n}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setSaveOpen(true)}
          className="btn-primary ml-auto"
          title="Guardar esta gráfica en un dashboard"
        >
          <BookmarkPlus size={12} strokeWidth={2} />
          Guardar
        </button>
      </div>

      {/* Row 2 — column selectors */}
      <div className="flex items-start gap-3 flex-wrap mb-3 pb-3 border-b border-border/60">
        {isCard ? (
          <>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted whitespace-nowrap">
                Métrica:
              </label>
              <select
                value={selectedY[0] || ""}
                onChange={(e) => setSelectedY([e.target.value])}
                className="px-2 py-1 rounded-md bg-bg border border-border text-[12px] focus:border-accent/50 outline-none cursor-pointer"
              >
                {cols.numeric.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted whitespace-nowrap">
                Etiqueta:
              </label>
              <input
                value={kpiLabel}
                onChange={(e) => setKpiLabel(e.target.value)}
                placeholder={selectedY[0] || "Métrica"}
                className="px-2 py-1 rounded-md bg-bg border border-border text-[12px] focus:border-accent/50 outline-none w-44"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted whitespace-nowrap">
                Etiqueta (eje X):
              </label>
              <select
                value={xKey}
                onChange={(e) => setXKey(e.target.value)}
                className="px-2 py-1 rounded-md bg-bg border border-border text-[12px] focus:border-accent/50 outline-none cursor-pointer max-w-[180px]"
              >
                {cols.all.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="text-[11px] text-muted whitespace-nowrap">
                Métricas:
              </label>
              {availableYCols.length === 0 ? (
                <span className="text-[11px] text-muted/70 italic">
                  cambia la etiqueta para ver opciones
                </span>
              ) : (
                availableYCols.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleSeries(c)}
                    className={cn(
                      "btn !py-0.5 !px-2 !text-[11px]",
                      selectedY.includes(c) && "btn-primary"
                    )}
                  >
                    {c}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <Chart
          result={result}
          kind={kind}
          topN={topN}
          xKey={xKey || undefined}
          ySeries={selectedY}
          kpiLabel={kpiLabel || undefined}
        />
      </div>

      <div className="mt-2 text-[11px] text-muted">
        {!isCard
          ? `${result.row_count} filas en total${selectedY.length > 1 ? ` · ${selectedY.length} métricas` : ""}`
          : kpiLabel
          ? `Etiqueta personalizada: "${kpiLabel}"`
          : "1 de 1 fila"}
      </div>

      <SaveToDashboardModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        sql={result.sql}
        chartKind={kind}
        topN={topN}
        xKey={xKey || undefined}
        ySeries={selectedY}
        kpiLabel={kpiLabel || undefined}
        defaultTitle={defaultTitle}
      />
    </div>
  );
}


function SqlEditor({ result, onResult, onError }) {
  const [sql, setSql] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const taRef = useRef(null);

  const loadLast = () => {
    if (result?.sql) setSql(result.sql);
  };

  const execute = async () => {
    if (!sql.trim()) return;
    setRunning(true);
    setError(null);
    try {
      const r = await runQuery(sql, 1000);
      onResult && onResult({ ...r, sql });
    } catch (e) {
      setError(e.message);
      onError && onError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      execute();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <button onClick={loadLast} className="btn" disabled={!result?.sql}>
          ← Cargar última query
        </button>
        <span className="text-[10.5px] text-muted/80">
          <span className="kbd">⌘/Ctrl</span> + <span className="kbd">Enter</span> para ejecutar
        </span>
        <button
          onClick={execute}
          disabled={running || !sql.trim()}
          className="btn-primary ml-auto"
        >
          <Play size={11} strokeWidth={2.2} />
          {running ? "Ejecutando…" : "Ejecutar"}
        </button>
      </div>
      <textarea
        ref={taRef}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="SELECT ..."
        spellCheck={false}
        className="flex-1 w-full p-4 bg-bg/60 text-fg font-mono text-[13px]
                   leading-relaxed resize-none placeholder:text-muted/50 outline-none"
      />
      {error && (
        <div className="px-3 py-2 border-t border-danger/40 bg-danger/10 text-danger text-xs font-mono">
          {error}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ result, onResult }) {
  const [tab, setTab] = useState("table");
  const [exporting, setExporting] = useState(null);
  const [exportInfo, setExportInfo] = useState(null);
  const [exportErr, setExportErr] = useState(null);
  const [copied, setCopied] = useState(false);
  // Pending export: { fmt } while the user edits the filename before downloading.
  const [pendingFmt, setPendingFmt] = useState(null);
  const [exportName, setExportName] = useState("");

  useEffect(() => {
    setExportInfo(null);
    setExportErr(null);
    setPendingFmt(null);
  }, [result?.sql]);

  const openExport = (fmt) => {
    setExportInfo(null);
    setExportErr(null);
    setExportName(suggestFilename(result?.sql));
    setPendingFmt(fmt);
  };

  const handleExport = async () => {
    if (!result?.sql || !pendingFmt) return;
    const fmt = pendingFmt;
    const name = (exportName || "consulta").trim() || "consulta";
    setExporting(fmt);
    setExportErr(null);
    try {
      const r = await exportQuery(result.sql, fmt, name);
      setExportInfo(r);
      setPendingFmt(null);
    } catch (e) {
      setExportErr(e.message);
    } finally {
      setExporting(null);
    }
  };

  const copySql = async () => {
    if (!result?.sql) return;
    try {
      await navigator.clipboard.writeText(result.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const Tab = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] font-medium tracking-tight transition-all duration-150",
        tab === id
          ? "bg-surface2 text-fg border border-border/80"
          : "text-muted hover:text-fg border border-transparent"
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
      {label}
    </button>
  );

  return (
    <section className="panel flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <Tab id="table" icon={Table2} label="Tabla" />
        <Tab id="chart" icon={BarChart3} label="Gráfica" />
        <Tab id="sql" icon={Code2} label="SQL" />

        {result && tab !== "sql" && (
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <span className="chip">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span className="tabular-nums">{formatNumber(result.row_count)}</span>
              <span className="text-muted/70">filas</span>
            </span>
            <span className="chip tabular-nums">{result.elapsed_ms} ms</span>
            {result.truncated && (
              <span className="chip border-accent2/40 text-accent2">
                truncado
              </span>
            )}
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => openExport("csv")}
              disabled={!!exporting}
              className={cn("btn", pendingFmt === "csv" && "btn-primary")}
              title="Descargar CSV (sin límite de filas)"
            >
              <FileDown size={11} />
              csv
            </button>
            <button
              onClick={() => openExport("xlsx")}
              disabled={!!exporting}
              className={cn("btn", pendingFmt === "xlsx" && "btn-primary")}
              title="Descargar Excel"
            >
              <FileDown size={11} />
              xlsx
            </button>
            <button
              onClick={() => openExport("json")}
              disabled={!!exporting}
              className={cn("btn", pendingFmt === "json" && "btn-primary")}
              title="Descargar JSON"
            >
              <FileDown size={11} />
              json
            </button>
            <button
              onClick={copySql}
              className="btn h-7 w-7 justify-center !p-0"
              title="Copiar SQL"
            >
              {copied ? (
                <Check size={11} className="text-accent" />
              ) : (
                <Copy size={11} />
              )}
            </button>
          </div>
        )}
      </div>

      {pendingFmt && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface2/60 animate-slide-up">
          <FileDown size={13} className="text-accent" />
          <span className="text-[11px] text-muted whitespace-nowrap">
            Nombre del archivo:
          </span>
          <input
            autoFocus
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleExport();
              else if (e.key === "Escape") setPendingFmt(null);
            }}
            className="flex-1 min-w-0 px-2.5 py-1 rounded-md bg-bg border border-accent/40 text-[12.5px] focus:border-accent/70 outline-none"
          />
          <span className="text-[12px] font-mono text-muted">.{pendingFmt}</span>
          <button
            onClick={handleExport}
            disabled={!!exporting}
            className="btn-primary"
          >
            {exporting ? (
              <>
                <span className="animate-pulse">descargando…</span>
              </>
            ) : (
              <>
                <FileDown size={11} strokeWidth={2} /> descargar
              </>
            )}
          </button>
          <button
            onClick={() => setPendingFmt(null)}
            disabled={!!exporting}
            className="btn h-7 w-7 justify-center !p-0"
            title="Cancelar"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {exportInfo && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-accent/10 text-accent animate-slide-up">
          <Check size={13} />
          <span className="text-xs font-mono">
            {formatNumber(exportInfo.row_count)} filas ·{" "}
            {exportInfo.filename}
          </span>
          <a
            href={downloadUrl(exportInfo.filename)}
            className="btn-primary ml-auto"
            download
          >
            <FileDown size={11} />
            descargar
          </a>
          <button
            onClick={() => setExportInfo(null)}
            className="text-accent/70 hover:text-accent"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {exportErr && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-danger/40 bg-danger/10 text-danger animate-slide-up">
          <span className="text-xs font-mono flex-1">{exportErr}</span>
          <button
            onClick={() => setExportErr(null)}
            className="text-danger/70 hover:text-danger"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {tab === "table" && <TableView result={result} />}
      {tab === "chart" && <ChartView result={result} />}
      {tab === "sql" && (
        <SqlEditor result={result} onResult={onResult} onError={() => {}} />
      )}
    </section>
  );
}
