import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, History } from "lucide-react";
import { cn, formatNumber, relativeTime, truncate } from "../lib/utils.js";

export default function HistoryPanel({ history, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);

  const items = (history || []).slice(0, 50);

  return (
    <section className="panel flex flex-col overflow-hidden animate-fade-in">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-3 py-2 border-b border-border w-full text-left hover:bg-surface2/40"
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-muted" />
        ) : (
          <ChevronDown size={12} className="text-muted" />
        )}
        <History size={12} className="text-muted" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          history
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted">
          {items.length}
        </span>
      </button>

      {!collapsed && (
        <div className="flex-1 overflow-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted font-mono">
              no queries yet
            </div>
          ) : (
            <ul>
              {items.map((h, i) => (
                <li
                  key={`${h.timestamp}-${i}`}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <button
                    onClick={() => onSelect && onSelect(h)}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-surface2/40",
                      "flex flex-col gap-1"
                    )}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                      <Clock size={10} />
                      <span>{relativeTime(h.timestamp)}</span>
                      <span className="ml-auto">
                        {formatNumber(h.row_count)} rows · {h.elapsed_ms}ms
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-fg/80 truncate">
                      {truncate(h.sql.replace(/\s+/g, " "), 80)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
