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
    <header className="flex items-center justify-between px-5 py-3 border-b border-border/80 bg-surface/40 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="font-display italic text-[26px] leading-none text-fg terminal-glow">
          DBChat
        </h1>
        <span className="hidden md:inline text-[11.5px] text-muted tracking-tight">
          Pregúntale a tu base de datos en lenguaje natural.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenConnection}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium tracking-tight transition-all duration-150",
            pillState === "ok" &&
              "border-accent/30 bg-accent/8 text-accent hover:bg-accent/15 hover:border-accent/50",
            pillState === "err" &&
              "border-danger/40 bg-danger/10 text-danger hover:bg-danger/15",
            pillState === "warn" &&
              "border-accent2/40 bg-accent2/10 text-accent2 hover:bg-accent2/15"
          )}
          title={
            pillState === "ok"
              ? `${host || "?"}${dbName ? " · " + dbName : ""} — click para editar`
              : errText || "Click para configurar la conexión"
          }
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              pillState === "ok" && "bg-accent animate-pulse-dot",
              pillState === "err" && "bg-danger",
              pillState === "warn" && "bg-accent2 animate-pulse-dot"
            )}
          />
          <Database size={12} strokeWidth={1.8} />
          <span className="max-w-[180px] truncate">{pillLabel}</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="btn h-8 w-8 justify-center !p-0 rounded-full"
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun size={14} strokeWidth={1.7} />
          ) : (
            <Moon size={14} strokeWidth={1.7} />
          )}
        </button>
      </div>
    </header>
  );
}
