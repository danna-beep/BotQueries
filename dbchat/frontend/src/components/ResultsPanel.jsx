import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Check,
  Code2,
  Copy,
  FileDown,
  Play,
  Table2,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  exportQuery,
  downloadUrl,
  runQuery,
} from "../lib/api.js";
import { cn, formatNumber, isNumeric } from "../lib/utils.js";

const CHART_COLORS = [
  "rgb(125 255 155)",
  "rgb(255 217 102)",
  "rgb(125 211 252)",
  "rgb(251 113 133)",
  "rgb(196 181 253)",
  "rgb(253 186 116)",
];

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
        <p className="font-display italic text-3xl text-fg/70">no results yet</p>
        <p className="mt-2 text-xs text-muted font-mono">
          run a query, or ask the chat on the right
        </p>
      </div>
    );
  }

  if (result.row_count === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="font-display italic text-2xl text-fg/70">
          query returned 0 rows
        </p>
        <p className="mt-2 text-xs text-muted font-mono">
          your SQL ran successfully, but no rows matched
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="min-w-full font-mono text-[12px]">
        <thead className="sticky top-0 z-10 bg-surface border-b border-border">
          <tr>
            <th className="text-left px-3 py-2 text-muted text-[10px] uppercase tracking-wide font-medium w-10">
              #
            </th>
            {result.columns.map((c) => (
              <th
                key={c}
                className="text-left px-3 py-2 text-muted text-[10px] uppercase tracking-wide font-medium whitespace-nowrap"
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
              className="border-b border-border/50 hover:bg-surface2/40"
            >
              <td className="px-3 py-1.5 text-muted text-[10px] tabular-nums">
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
  const [kind, setKind] = useState("bar");

  const { xKey, ySeries, rows } = useMemo(() => {
    if (!result || !result.columns || result.rows.length === 0) {
      return { xKey: null, ySeries: [], rows: [] };
    }
    const sample = result.rows[0];
    let x = null;
    const numeric = [];
    for (const c of result.columns) {
      const v = sample[c];
      if (x === null && (typeof v === "string" || v === null)) {
        x = c;
      } else if (isNumeric(v)) {
        numeric.push(c);
      }
    }
    if (!x) {
      x = result.columns[0];
    }
    const yCols = numeric.filter((c) => c !== x);
    const limited = result.rows.slice(0, 50).map((r) => {
      const out = { ...r };
      for (const c of yCols) {
        const v = r[c];
        out[c] = typeof v === "number" ? v : Number(v);
      }
      return out;
    });
    return { xKey: x, ySeries: yCols, rows: limited };
  }, [result]);

  if (!result || result.row_count === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <p className="font-display italic text-2xl text-fg/70">
          no data to plot
        </p>
      </div>
    );
  }

  if (ySeries.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="font-display italic text-2xl text-fg/70">
          no numeric columns to plot
        </p>
        <p className="mt-2 text-xs text-muted font-mono">
          add a SUM/COUNT or numeric field to your query
        </p>
      </div>
    );
  }

  const Chart = kind === "bar" ? BarChart : LineChart;

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => setKind("bar")}
          className={cn("btn", kind === "bar" && "btn-primary")}
        >
          bar
        </button>
        <button
          onClick={() => setKind("line")}
          className={cn("btn", kind === "line" && "btn-primary")}
        >
          line
        </button>
        <span className="ml-auto text-[10px] font-mono text-muted">
          showing {rows.length} of {result.row_count} rows · x = {xKey}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="2 3" />
            <XAxis
              dataKey={xKey}
              stroke="rgb(var(--muted))"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              stroke="rgb(var(--muted))"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
            />
            <Tooltip
              contentStyle={{
                background: "rgb(var(--surface))",
                border: "1px solid rgb(var(--border))",
                borderRadius: 6,
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              labelStyle={{ color: "rgb(var(--muted))" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
            {ySeries.map((s, i) =>
              kind === "bar" ? (
                <Bar
                  key={s}
                  dataKey={s}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ) : (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              )
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
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
          ← load last query
        </button>
        <span className="text-[10px] font-mono text-muted">
          <span className="kbd">⌘/Ctrl</span> +{" "}
          <span className="kbd">Enter</span> to run
        </span>
        <button
          onClick={execute}
          disabled={running || !sql.trim()}
          className="btn-primary ml-auto"
        >
          <Play size={11} />
          {running ? "running…" : "execute"}
        </button>
      </div>
      <textarea
        ref={taRef}
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="SELECT ..."
        spellCheck={false}
        className="flex-1 w-full p-4 bg-bg text-fg font-mono text-[13px]
                   leading-relaxed resize-none placeholder:text-muted/60"
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

  useEffect(() => {
    setExportInfo(null);
    setExportErr(null);
  }, [result?.sql]);

  const handleExport = async (fmt) => {
    if (!result?.sql) return;
    setExporting(fmt);
    setExportErr(null);
    try {
      const r = await exportQuery(result.sql, fmt, "query_result");
      setExportInfo(r);
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
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wide",
        tab === id
          ? "bg-surface2 text-fg border border-border"
          : "text-muted hover:text-fg"
      )}
    >
      <Icon size={12} />
      {label}
    </button>
  );

  return (
    <section className="panel flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <Tab id="table" icon={Table2} label="table" />
        <Tab id="chart" icon={BarChart3} label="chart" />
        <Tab id="sql" icon={Code2} label="sql editor" />

        {result && tab !== "sql" && (
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <span className="chip">
              <span className="w-1 h-1 rounded-full bg-accent" />
              {formatNumber(result.row_count)} rows
            </span>
            <span className="chip">{result.elapsed_ms}ms</span>
            {result.truncated && (
              <span className="chip border-accent2/40 text-accent2">
                truncated
              </span>
            )}
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => handleExport("csv")}
              disabled={!!exporting}
              className="btn"
              title="Export CSV"
            >
              <FileDown size={11} />
              {exporting === "csv" ? "…" : "csv"}
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              disabled={!!exporting}
              className="btn"
              title="Export Excel"
            >
              <FileDown size={11} />
              {exporting === "xlsx" ? "…" : "xlsx"}
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={!!exporting}
              className="btn"
              title="Export JSON"
            >
              <FileDown size={11} />
              {exporting === "json" ? "…" : "json"}
            </button>
            <button
              onClick={copySql}
              className="btn h-7 w-7 justify-center !p-0"
              title="Copy SQL"
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

      {exportInfo && (
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-accent/10 text-accent animate-slide-up">
          <Check size={13} />
          <span className="text-xs font-mono">
            exported {formatNumber(exportInfo.row_count)} rows ·{" "}
            {exportInfo.filename}
          </span>
          <a
            href={downloadUrl(exportInfo.filename)}
            className="btn-primary ml-auto"
            download
          >
            <FileDown size={11} />
            download
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
