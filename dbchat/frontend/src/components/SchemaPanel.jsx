import { useMemo, useState } from "react";
import {
  ChevronRight,
  Database,
  Hash,
  Key,
  RefreshCw,
  Search,
  Table as TableIcon,
} from "lucide-react";
import { cn, formatNumber } from "../lib/utils.js";

export default function SchemaPanel({ schema, onRefresh, onTableClick }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState({});

  const filtered = useMemo(() => {
    if (!schema?.tables) return [];
    const q = query.trim().toLowerCase();
    if (!q) return schema.tables;
    return schema.tables.filter((t) => {
      if (t.name.toLowerCase().includes(q)) return true;
      return (t.columns || []).some((c) => c.name.toLowerCase().includes(q));
    });
  }, [schema, query]);

  return (
    <aside className="panel flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-muted">
          <Database size={13} />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            schema
          </span>
          {schema?.database && (
            <span className="font-mono text-[11px] text-accent/80 ml-1">
              · {schema.database}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="text-muted hover:text-fg transition-colors"
          title="Refresh schema"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter tables, columns…"
            className="w-full pl-7 pr-2 py-1.5 rounded-md bg-surface2 border border-border
                       text-xs font-mono placeholder:text-muted/70 focus:border-accent/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin py-1">
        {!schema && (
          <div className="px-3 py-6 text-center text-xs text-muted font-mono">
            loading schema…
          </div>
        )}
        {schema && filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted font-mono">
            no matches
          </div>
        )}
        {filtered.map((t) => {
          const isOpen = !!open[t.name];
          return (
            <div key={t.name} className="px-1">
              <button
                onClick={() => setOpen((s) => ({ ...s, [t.name]: !isOpen }))}
                onDoubleClick={() => onTableClick && onTableClick(t.name)}
                className="w-full group flex items-center gap-1.5 px-2 py-1.5
                           rounded-md hover:bg-surface2 text-left"
                title="Click to expand · Double-click to load SELECT *"
              >
                <ChevronRight
                  size={12}
                  className={cn(
                    "text-muted transition-transform shrink-0",
                    isOpen && "rotate-90"
                  )}
                />
                <TableIcon
                  size={12}
                  className="text-muted group-hover:text-accent transition-colors shrink-0"
                />
                <span className="font-mono text-[12px] text-fg truncate">
                  {t.name}
                </span>
                {t.row_estimate !== null && t.row_estimate !== undefined && (
                  <span className="ml-auto font-mono text-[10px] text-muted">
                    {formatNumber(t.row_estimate)}
                  </span>
                )}
              </button>

              {isOpen && (
                <ul className="ml-4 pl-2 my-1 border-l border-border animate-slide-up">
                  {(t.columns || []).map((c) => (
                    <li
                      key={c.name}
                      className="flex items-center gap-1.5 py-0.5 pl-2 pr-1"
                    >
                      {c.key === "PRI" ? (
                        <Key size={10} className="text-accent2 shrink-0" />
                      ) : c.key ? (
                        <Hash size={10} className="text-muted shrink-0" />
                      ) : (
                        <span className="w-2.5" />
                      )}
                      <span className="font-mono text-[11px] text-fg truncate">
                        {c.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted truncate">
                        {c.type}
                      </span>
                      {!c.nullable && (
                        <span
                          className="font-mono text-[10px] text-danger ml-auto"
                          title="NOT NULL"
                        >
                          !
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
