import { Database, Moon, Settings, Sun } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function TopBar({
  status,
  theme,
  onToggleTheme,
  onOpenConnection,
}) {
  const ok = status?.db_ok;
  const configured = status?.configured;
  const details = status?.details;
  const host =
    details && typeof details === "object"
      ? details.configured_host || details.server_host
      : null;
  const dbName =
    details && typeof details === "object"
      ? details.configured_database || details.current_database
      : null;

  const errText = !ok && typeof details === "string" ? details : null;

  let pillLabel;
  let pillState;
  if (!configured) {
    pillLabel = "not configured";
    pillState = "warn";
  } else if (ok) {
    pillLabel = dbName || "connected";
    pillState = "ok";
  } else {
    pillLabel = "disconnected";
    pillState = "err";
  }

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface/60 backdrop-blur-sm">
      <div className="flex items-baseline gap-4">
        <div className="flex items-baseline gap-2">
          <h1 className="font-display italic text-2xl leading-none text-fg terminal-glow">
            DBChat
          </h1>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            query mysql in plain english
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenConnection}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-mono",
            pillState === "ok" &&
              "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15",
            pillState === "err" &&
              "border-danger/40 bg-danger/10 text-danger hover:bg-danger/15",
            pillState === "warn" &&
              "border-accent2/40 bg-accent2/10 text-accent2 hover:bg-accent2/15"
          )}
          title={
            pillState === "ok"
              ? `${host || "?"}${dbName ? " · " + dbName : ""} — click to edit`
              : errText || "Click to configure the database connection"
          }
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              pillState === "ok" && "bg-accent animate-pulse-dot",
              pillState === "err" && "bg-danger",
              pillState === "warn" && "bg-accent2 animate-pulse-dot"
            )}
          />
          <Database size={11} />
          <span className="uppercase tracking-wide">{pillLabel}</span>
          <Settings size={10} className="opacity-70" />
        </button>

        <button
          onClick={onToggleTheme}
          className="btn h-7 w-7 justify-center !p-0"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </header>
  );
}
