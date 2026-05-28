import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell as ReCell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompact,
  formatDateLabel,
  formatNumber,
  isNumeric,
  looksLikeDateColumn,
} from "../lib/utils.js";

// Vaas brand palette — violet-led, high contrast on both wine and white.
export const CHART_COLORS = [
  "#BF65FF", // primary violeta
  "#F49F0A", // warning ámbar
  "#2DD4BF", // teal
  "#60A5FA", // azul
  "#E94560", // error rosa
  "#CA7FFF", // secondary violeta claro
  "#22D3EE", // cyan
  "#FCD34D", // amarillo
];

// Detects which column is best for the X axis (categorical/date) and which
// are numeric series.
export function detectAxes(result) {
  if (!result || !result.columns || result.rows.length === 0) {
    return { xKey: null, ySeries: [], xIsDate: false };
  }
  const sample = result.rows[0];
  const numericCols = result.columns.filter((c) => isNumeric(sample[c]));
  const nonNumericCols = result.columns.filter((c) => !isNumeric(sample[c]));

  // Prefer a date column as X; otherwise the first non-numeric column.
  let x = null;
  let xIsDate = false;
  for (const c of result.columns) {
    if (looksLikeDateColumn(c, sample[c])) {
      x = c;
      xIsDate = true;
      break;
    }
  }
  if (!x && nonNumericCols.length) x = nonNumericCols[0];

  // All columns are numeric (no categorical/date label):
  if (!x) {
    // 0–1 numeric columns → keep it as the metric (single-value KPI / ring),
    // no real X axis. Avoids "stealing" the only column and leaving no metric.
    if (numericCols.length <= 1) {
      return { xKey: null, ySeries: numericCols, xIsDate: false };
    }
    // 2+ numeric columns → use the first as the X axis.
    x = numericCols[0];
  }

  const ySeries = numericCols.filter((c) => c !== x);
  return { xKey: x, ySeries, xIsDate };
}

export function defaultChartKind({ rowCount, ySeries, xIsDate }) {
  if (rowCount === 1 && ySeries.length === 1) return "ring";
  if (xIsDate) return ySeries.length > 1 ? "line" : "area";
  if (rowCount <= 8 && ySeries.length === 1) return "pie";
  return "bar";
}

// Returns all numeric columns + a complement of non-numeric ones, useful for
// the "pick a label / pick metrics" selectors in the UI.
export function classifyColumns(result) {
  if (!result?.columns?.length || !result?.rows?.length) {
    return { numeric: [], nonNumeric: [], all: [] };
  }
  const sample = result.rows[0];
  const numeric = result.columns.filter((c) => isNumeric(sample[c]));
  const nonNumeric = result.columns.filter((c) => !isNumeric(sample[c]));
  return { numeric, nonNumeric, all: result.columns };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "rgb(var(--surface) / 0.96)",
        border: "1px solid rgb(var(--border))",
        borderRadius: 10,
        padding: "8px 12px",
        fontFamily: "JetBrains Mono",
        fontSize: 11,
        boxShadow: "0 12px 24px -8px rgb(0 0 0 / 0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          color: "rgb(var(--muted))",
          marginBottom: 6,
          letterSpacing: "0.04em",
          fontSize: 10,
          textTransform: "uppercase",
        }}
      >
        {formatDateLabel(label)}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 2,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "rgb(var(--muted))", flex: 1 }}>{p.name}</span>
          <span
            style={{
              color: "rgb(var(--fg))",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 500,
            }}
          >
            {formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ row, ySeries, label, compact }) {
  const metric = ySeries[0];
  const value = row[metric];
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div
        className="kpi-tile px-8 py-6 min-w-[200px] flex flex-col items-center"
        style={compact ? { padding: "20px 28px", minWidth: 160 } : undefined}
      >
        <span className="label-mono">{label || metric}</span>
        <span
          className="mt-3 font-display leading-none text-accent terminal-glow tabular-nums"
          style={{ fontSize: compact ? 48 : 72 }}
        >
          {formatCompact(value)}
        </span>
        <span className="mt-3 font-mono text-[10.5px] text-muted tabular-nums">
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

// Ring/gauge for single-value results — 100% donut with the number centered.
function RingCard({ row, ySeries, label, compact }) {
  const metric = ySeries[0];
  const value = row[metric];
  // Single full-circle slice; recharts won't render a true 360° on one slice,
  // so we use start=90 / end=-269.99 to get a nearly-complete ring.
  const data = [{ name: metric, value: 1 }];
  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={1} />
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="62%"
            outerRadius="86%"
            startAngle={90}
            endAngle={-269.99}
            stroke="rgb(var(--surface))"
            strokeWidth={2}
            fill="url(#ring-grad)"
            isAnimationActive={false}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        <span className="label-mono">{label || metric}</span>
        <span
          className="mt-2 font-display leading-none text-accent terminal-glow tabular-nums"
          style={{ fontSize: compact ? 38 : 56 }}
        >
          {formatCompact(value)}
        </span>
        <span className="mt-1 font-mono text-[10.5px] text-muted tabular-nums">
          {formatNumber(value)}
        </span>
      </div>
    </div>
  );
}

/**
 * Render a chart from a query result. Honors the requested kind + topN.
 * Designed to be reused by both the ResultsPanel preview and the dashboard tiles.
 *
 * Optional overrides:
 * - xKey: which column to use as label / X axis (defaults to auto-detect)
 * - ySeries: which numeric columns to render as metrics (defaults to all numeric)
 * - kpiLabel: optional override for the KPI/Ring label text
 */
export function Chart({
  result,
  kind,
  topN = 20,
  compact = false,
  xKey: xKeyOverride,
  ySeries: ySeriesOverride,
  kpiLabel,
}) {
  const detected = useMemo(() => detectAxes(result), [result]);

  const xKey = xKeyOverride || detected.xKey;
  const xIsDate = xKeyOverride
    ? looksLikeDateColumn(xKeyOverride, result?.rows?.[0]?.[xKeyOverride])
    : detected.xIsDate;

  // Validate the y series override — only keep columns that are actually numeric
  // and that aren't the x key. Fall back to detected if override is empty.
  const ySeries = useMemo(() => {
    if (!ySeriesOverride?.length) return detected.ySeries;
    if (!result?.rows?.length) return [];
    const sample = result.rows[0];
    return ySeriesOverride.filter(
      (c) => c !== xKey && isNumeric(sample[c])
    );
  }, [ySeriesOverride, detected.ySeries, xKey, result]);

  const rows = useMemo(() => {
    if (!result?.rows?.length) return [];
    const base = result.rows.map((r) => {
      const out = { ...r };
      for (const c of ySeries) {
        const v = r[c];
        out[c] = typeof v === "number" ? v : Number(v);
      }
      return out;
    });
    if (xIsDate) return base.slice(0, topN === "all" ? base.length : topN);
    const primary = ySeries[0];
    if (primary) {
      base.sort((a, b) => (b[primary] || 0) - (a[primary] || 0));
    }
    return base.slice(0, topN === "all" ? base.length : topN);
  }, [result, ySeries, topN, xIsDate]);

  if (!result || result.row_count === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-xs font-mono">
        sin datos
      </div>
    );
  }
  if (ySeries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <p className="text-muted text-xs">
          No hay columnas numéricas para graficar.
        </p>
      </div>
    );
  }

  const tooltipProps = {
    content: <CustomTooltip />,
    cursor: { fill: "rgb(var(--accent) / 0.08)" },
  };
  const axisTick = {
    fontSize: compact ? 9 : 10,
    fontFamily: "JetBrains Mono",
    fill: "rgb(var(--muted))",
  };
  const xTickFormatter = xIsDate ? formatDateLabel : (v) => v;

  if (kind === "kpi") {
    return (
      <KpiCard
        row={rows[0]}
        ySeries={ySeries}
        label={kpiLabel}
        compact={compact}
      />
    );
  }

  if (kind === "ring") {
    return (
      <RingCard
        row={rows[0]}
        ySeries={ySeries}
        label={kpiLabel}
        compact={compact}
      />
    );
  }

  if (kind === "pie") {
    const metric = ySeries[0];
    const total = rows.reduce((sum, r) => sum + (r[metric] || 0), 0) || 1;
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={rows}
            dataKey={metric}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={1.5}
            stroke="rgb(var(--surface))"
            strokeWidth={2}
            label={
              compact
                ? false
                : ({ name, value }) =>
                    `${name} · ${((value / total) * 100).toFixed(1)}%`
            }
            labelLine={
              compact ? false : { stroke: "rgb(var(--muted) / 0.4)", strokeWidth: 1 }
            }
          >
            {rows.map((_, i) => (
              <ReCell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipProps} />
          {compact && (
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
              iconType="circle"
              iconSize={7}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const ChartComp =
    kind === "line" ? LineChart : kind === "area" ? AreaChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComp
        data={rows}
        margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
      >
        <defs>
          {ySeries.map((s, i) => {
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <linearGradient
                key={s}
                id={`fill-${kind}-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid
          stroke="rgb(var(--border) / 0.55)"
          strokeDasharray="3 4"
          vertical={false}
        />
        <XAxis
          dataKey={xKey}
          stroke="transparent"
          tick={axisTick}
          tickFormatter={xTickFormatter}
          tickLine={false}
          axisLine={{ stroke: "rgb(var(--border))" }}
          interval="preserveStartEnd"
          minTickGap={compact ? 18 : 24}
        />
        <YAxis
          stroke="transparent"
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCompact}
          width={compact ? 36 : 44}
        />
        <Tooltip {...tooltipProps} />
        {ySeries.length > 1 && (
          <Legend
            wrapperStyle={{
              fontSize: compact ? 10 : 11,
              fontFamily: "JetBrains Mono",
              color: "rgb(var(--muted))",
            }}
            iconType="circle"
            iconSize={7}
          />
        )}
        {ySeries.map((s, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length];
          if (kind === "bar") {
            return (
              <Bar
                key={s}
                dataKey={s}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            );
          }
          if (kind === "area") {
            return (
              <Area
                key={s}
                type="monotone"
                dataKey={s}
                stroke={color}
                fill={`url(#fill-${kind}-${i})`}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          }
          return (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          );
        })}
      </ChartComp>
    </ResponsiveContainer>
  );
}
