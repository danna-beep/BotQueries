import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  FileDown,
  Key,
  Loader2,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  createWarning,
  downloadUrl,
  runQuery,
  streamChat,
} from "../lib/api.js";
import { cn, formatNumber } from "../lib/utils.js";

// Markdown components — minimal and clean: bold, lists, light inline code.
// No boxy elements (blockquote / fenced code blocks render as plain prose).
const MD_COMPONENTS = {
  p: (props) => <p className="my-1.5 leading-relaxed" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-fg" {...props} />
  ),
  em: (props) => <em className="italic text-fg/90" {...props} />,
  ul: (props) => (
    <ul className="my-1.5 ml-5 list-disc space-y-1 marker:text-muted/70" {...props} />
  ),
  ol: (props) => (
    <ol className="my-1.5 ml-5 list-decimal space-y-1 marker:text-muted/70" {...props} />
  ),
  li: (props) => <li className="leading-relaxed pl-1" {...props} />,
  // Headings → just bold inline so we don't introduce visual boxes/dividers.
  h1: (props) => <p className="my-1.5 font-semibold text-fg" {...props} />,
  h2: (props) => <p className="my-1.5 font-semibold text-fg" {...props} />,
  h3: (props) => <p className="my-1.5 font-semibold text-fg" {...props} />,
  // Blockquote → plain paragraph (no border, no italic, no left padding).
  blockquote: ({ children, ...props }) => (
    <div className="my-1.5 leading-relaxed" {...props}>
      {children}
    </div>
  ),
  // Inline code → tiny tinted token (column/table names). NOT a box.
  // Block code → render as plain text to avoid the dark panel look the user
  // explicitly asked to drop. The bot is instructed not to emit triple-backtick
  // blocks in prose, but if it leaks through, we just inline it.
  code: ({ inline, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="font-mono text-[12px] text-accent"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-[12px] text-fg/90 whitespace-pre-wrap break-words" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <span className="block my-2" />,
  a: (props) => (
    <a
      className="text-accent underline-offset-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  // Tables left simple (rarely emitted now but if they show, no border boxes).
  table: (props) => (
    <div className="my-1.5 overflow-x-auto">
      <table className="min-w-full text-[12px]" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="text-left px-2 py-1 font-medium text-[11px] text-muted" {...props} />
  ),
  td: (props) => <td className="px-2 py-1 align-top" {...props} />,
};

function ProseMarkdown({ text }) {
  return (
    <div className="text-[13.5px] text-fg/90">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

// Parses an assistant text message and splits it into prose paragraphs and
// fenced ```sql / ```warning code blocks. SQL blocks render with an "ejecutar"
// button (preview mode); warning blocks are auto-persisted into the Warnings
// tab and rendered as a saved-card.
function splitTextWithBlocks(text) {
  const re = /```(sql|warning)\s*\n([\s\S]*?)```/gi;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      const prose = text.slice(last, m.index).trim();
      if (prose) parts.push({ kind: "prose", text: prose });
    }
    const tag = m[1].toLowerCase();
    const body = m[2].trim();
    if (tag === "sql") {
      parts.push({ kind: "sql", sql: body });
    } else if (tag === "warning") {
      let payload = null;
      try {
        payload = JSON.parse(body);
      } catch {
        // Bot emitted a malformed JSON — render the raw text so the user can see.
        parts.push({ kind: "prose", text: "```warning\n" + body + "\n```" });
        last = m.index + m[0].length;
        continue;
      }
      parts.push({ kind: "warning", warning: payload });
    }
    last = m.index + m[0].length;
  }
  const tail = text.slice(last).trim();
  if (tail) parts.push({ kind: "prose", text: tail });
  return parts;
}

function SqlProposalBlock({ sql, onResult }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const r = await runQuery(sql);
      setResult(r);
      onResult &&
        onResult({
          sql,
          columns: r.columns,
          rows: r.rows,
          row_count: r.row_count,
          elapsed_ms: r.elapsed_ms,
          truncated: r.truncated,
        });
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="panel-inset my-3 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/70 bg-bg/30">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
        <span className="text-[11.5px] font-medium tracking-tight text-fg/85">
          SQL propuesto
        </span>
        <button
          onClick={run}
          disabled={running}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-all",
            result
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/50",
            running && "opacity-60 cursor-wait"
          )}
          style={
            !result && !running
              ? { boxShadow: "0 0 0 1px rgb(var(--accent) / 0.05) inset" }
              : undefined
          }
        >
          {running ? (
            <>
              <Loader2 size={11} className="animate-spin" />
              ejecutando…
            </>
          ) : result ? (
            <>
              <Check size={11} strokeWidth={2.5} />
              listo
            </>
          ) : (
            <>
              <Play size={11} strokeWidth={2.2} />
              ejecutar
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 text-[12px] leading-[1.6] font-mono text-fg/90 overflow-x-auto whitespace-pre-wrap break-words">
        {sql}
      </pre>
      {result && !error && (
        <div className="px-3 py-2 border-t border-border/70 bg-bg/30 flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <span className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-accent tabular-nums">
            {formatNumber(result.row_count)} rows
          </span>
          <span className="text-muted/60">·</span>
          <span className="text-muted tabular-nums">{result.elapsed_ms}ms</span>
          {result.truncated && (
            <>
              <span className="text-muted/60">·</span>
              <span className="text-accent2">truncated</span>
            </>
          )}
        </div>
      )}
      {error && (
        <div className="px-3 py-2 border-t border-danger/40 bg-danger/10 text-danger text-[11px] font-mono">
          {error}
        </div>
      )}
    </div>
  );
}

const EXAMPLES = [
  "Cuántos pagos hizo ADDI ayer",
  "Top 10 borrowers por volumen de pagos este mes",
  "¿Por qué no se conciliaron los últimos 10 pagos de Niko?",
  "Revisa si hay errores de conciliación en Vemo esta semana",
];

const SEV_PILL = {
  ok: "border-accent/40 bg-accent/10 text-accent",
  low: "border-accent/40 bg-accent/10 text-accent",
  medium: "border-accent2/40 bg-accent2/10 text-accent2",
  high: "border-danger/40 bg-danger/10 text-danger",
};

function WarningSavedBlock({ warning, userQuestion }) {
  const [state, setState] = useState("posting");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sev = ["ok", "low", "medium", "high"].includes(
          (warning.severity || "").toLowerCase()
        )
          ? warning.severity.toLowerCase()
          : "medium";
        const payload = {
          client: String(warning.client || "—").slice(0, 120) || "—",
          title:
            String(
              warning.title || warning.warning || "Análisis de conciliación"
            ).slice(0, 240) || "Análisis de conciliación",
          severity: sev,
          tables_reviewed: Array.isArray(warning.tables_reviewed)
            ? warning.tables_reviewed.map(String).slice(0, 32)
            : [],
          possible_fix: warning.possible_fix
            ? String(warning.possible_fix).slice(0, 2000)
            : null,
          details: warning.details
            ? String(warning.details).slice(0, 8000)
            : null,
          sql_run: Array.isArray(warning.sql_run)
            ? warning.sql_run.map(String).slice(0, 16)
            : [],
          user_question: userQuestion
            ? String(userQuestion).slice(0, 1000)
            : null,
        };
        await createWarning(payload);
        if (cancelled) return;
        setState("done");
        window.dispatchEvent(new CustomEvent("warnings:changed"));
      } catch (e) {
        if (cancelled) return;
        setError(e.message || String(e));
        setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sev = (warning.severity || "medium").toLowerCase();
  const isOk = sev === "ok";
  const pill = SEV_PILL[sev] || SEV_PILL.medium;
  const Icon = isOk ? CheckCircle2 : AlertTriangle;

  return (
    <div className="panel-inset my-3 overflow-hidden border-l-2 border-l-accent2/70">
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-md border shrink-0",
            pill
          )}
        >
          <Icon size={12} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
              {warning.client || "—"}
            </span>
            <span className={cn("chip", pill)}>{sev}</span>
            {state === "posting" && (
              <span className="text-[10px] font-mono text-muted/70 flex items-center gap-1">
                <Loader2 size={9} className="animate-spin" />
                guardando…
              </span>
            )}
            {state === "done" && (
              <span className="text-[10px] font-mono text-accent flex items-center gap-1">
                <Check size={9} />
                guardado en Warnings
              </span>
            )}
            {state === "error" && (
              <span className="text-[10px] font-mono text-danger flex items-center gap-1">
                <X size={9} />
                no se pudo guardar
              </span>
            )}
          </div>
          <div className="mt-1 text-[12.5px] text-fg/90 font-medium leading-snug">
            {warning.title || "Análisis de conciliación"}
          </div>
          {warning.tables_reviewed?.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
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
          {warning.possible_fix && (
            <p className="mt-1.5 text-[11.5px] text-accent2/90 leading-relaxed">
              <span className="text-muted/70 mr-1">corrección:</span>
              {warning.possible_fix}
            </p>
          )}
          {error && (
            <p className="mt-1 text-[10.5px] font-mono text-danger">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolCallBlock({ part }) {
  const isExport = part.toolName === "export_sql";
  const payload = part.payload;
  const done = part.status === "done";
  const elapsed = part.elapsedSeconds ?? 0;
  // Cap the visible progress at 30s so it always feels like it's moving for big queries.
  const progressPct = done ? 100 : Math.min(95, (elapsed / 30) * 100);

  return (
    <div className="panel-inset my-2 overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1 border-b border-border bg-surface/40">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
          {isExport ? "tool: export_sql" : "tool: run_sql"}
        </span>
        <span
          className={cn(
            "ml-auto chip",
            done && !payload?.error && "border-accent/40 text-accent",
            payload?.error && "border-danger/40 text-danger"
          )}
        >
          {!done ? (
            <>
              <Loader2 size={9} className="animate-spin" />
              running{elapsed > 0 ? ` ${elapsed}s` : "…"}
            </>
          ) : payload?.error ? (
            <>
              <X size={9} />
              error
            </>
          ) : (
            <>
              <Check size={9} />
              done
            </>
          )}
        </span>
      </div>
      {!done && (
        <div className="h-0.5 bg-bg/60 overflow-hidden">
          <div
            className="h-full bg-accent/70 transition-[width] duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
      {!done && elapsed >= 10 && (
        <div className="px-3 py-1 text-[10px] font-mono text-accent2 bg-accent2/5 border-b border-border">
          heavy query · still running, hang tight…
        </div>
      )}
      {part.sql && (
        <pre className="px-3 py-2 text-[11.5px] font-mono text-fg/90 overflow-x-auto whitespace-pre-wrap break-words bg-bg/40">
          {part.sql}
        </pre>
      )}
      {done && payload && !payload.error && (
        <div className="px-2.5 py-1.5 border-t border-border bg-surface/40 flex items-center gap-2 flex-wrap text-[11px] font-mono">
          {payload.kind === "query_result" && (
            <>
              <span className="text-muted">→</span>
              <span className="text-accent">
                {formatNumber(payload.row_count)} rows
              </span>
              <span className="text-muted">·</span>
              <span className="text-muted">{payload.elapsed_ms}ms</span>
              {payload.truncated && (
                <span className="text-accent2">· truncated</span>
              )}
            </>
          )}
          {payload.kind === "export_ready" && (
            <a
              href={downloadUrl(payload.filename)}
              download
              className="btn-primary"
            >
              <FileDown size={11} />
              {payload.filename}
            </a>
          )}
        </div>
      )}
      {payload?.error && (
        <div className="px-3 py-2 border-t border-danger/40 bg-danger/10 text-danger text-[11px] font-mono">
          {payload.error}
        </div>
      )}
    </div>
  );
}

function AssistantMessage({ msg, onResult, userQuestion }) {
  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-accent/10 border border-accent/25">
          <Sparkles size={11} className="text-accent" strokeWidth={1.8} />
        </span>
        <span className="text-[11px] font-medium tracking-tight text-accent">
          Claude
        </span>
      </div>
      <div className="prose-chat">
        {msg.parts.map((p, i) => {
          if (p.type === "text") {
            const blocks = splitTextWithBlocks(p.text);
            return (
              <div key={i}>
                {blocks.map((b, j) => {
                  if (b.kind === "sql") {
                    return (
                      <SqlProposalBlock
                        key={j}
                        sql={b.sql}
                        onResult={onResult}
                      />
                    );
                  }
                  if (b.kind === "warning") {
                    return (
                      <WarningSavedBlock
                        key={j}
                        warning={b.warning}
                        userQuestion={userQuestion}
                      />
                    );
                  }
                  return <ProseMarkdown key={j} text={b.text} />;
                })}
              </div>
            );
          }
          if (p.type === "tool_call") {
            return <ToolCallBlock key={i} part={p} />;
          }
          return null;
        })}
        {msg.thinking && (
          <div className="flex items-center gap-1.5 text-muted text-xs mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono">thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div className="flex justify-end animate-slide-up">
      <div className="px-3.5 py-2 max-w-[85%] text-[13.5px] leading-relaxed rounded-2xl rounded-tr-md bg-accent/10 border border-accent/20 text-fg">
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatPanel({
  apiKey,
  onApiKey,
  onResult,
  dbOk,
  authStatus,
}) {
  const hasClaudeCode = !!authStatus?.claude_code_session;
  const hasEnvKey = !!authStatus?.env_api_key;
  // Anything that lets the chat work without the user pasting a key:
  const serverHasAuth = hasClaudeCode || hasEnvKey;
  const canChat = !!apiKey || serverHasAuth;
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState(apiKey || "");
  const scrollRef = useRef(null);
  // Track whether the user is "pinned" to the bottom of the chat. If they
  // scroll up manually (to read previous messages), we stop auto-scrolling
  // on new stream events; we only re-pin when they manually scroll back down.
  const stickToBottomRef = useRef(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  const onScrollChat = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < 60; // 60px tolerance
    stickToBottomRef.current = atBottom;
    setShowJumpToBottom(!atBottom);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    if (stickToBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // When the user sends a new message, always snap back to the bottom.
  useEffect(() => {
    if (!scrollRef.current) return;
    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      stickToBottomRef.current = true;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShowJumpToBottom(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    setKeyDraft(apiKey || "");
  }, [apiKey]);

  const handleEvent = (evt) => {
    if (evt.type === "text") {
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          last.parts = [...last.parts, { type: "text", text: evt.text }];
        }
        return next;
      });
    } else if (evt.type === "tool_call") {
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          last.parts = [
            ...last.parts,
            {
              type: "tool_call",
              toolName: evt.name,
              sql: evt.input?.sql || "",
              status: "running",
              payload: null,
            },
          ];
        }
        return next;
      });
    } else if (evt.type === "tool_progress") {
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          for (let i = last.parts.length - 1; i >= 0; i--) {
            const p = last.parts[i];
            if (p.type === "tool_call" && p.status === "running") {
              last.parts[i] = {
                ...p,
                elapsedSeconds: evt.elapsed_seconds,
              };
              break;
            }
          }
        }
        return next;
      });
    } else if (evt.type === "tool_result") {
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          for (let i = last.parts.length - 1; i >= 0; i--) {
            const p = last.parts[i];
            if (p.type === "tool_call" && p.status === "running") {
              last.parts[i] = { ...p, status: "done", payload: evt.payload };
              break;
            }
          }
        }
        return next;
      });
      if (evt.payload?.kind === "query_result") {
        onResult &&
          onResult({
            sql: evt.payload.sql,
            columns: evt.payload.columns,
            rows: evt.payload.rows,
            row_count: evt.payload.row_count,
            elapsed_ms: evt.payload.elapsed_ms,
            truncated: evt.payload.truncated,
          });
      }
    } else if (evt.type === "done") {
      setHistory(evt.messages || []);
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") last.thinking = false;
        return next;
      });
    } else if (evt.type === "error") {
      setError(evt.error);
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") last.thinking = false;
        return next;
      });
    }
  };

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || streaming) return;
    if (!canChat) {
      setShowKeyInput(true);
      return;
    }
    setError(null);
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text: trimmed },
      { role: "assistant", parts: [], thinking: true },
    ]);
    setStreaming(true);
    try {
      await streamChat({
        message: trimmed,
        history,
        apiKey,
        onEvent: handleEvent,
      });
    } catch (e) {
      setError(e.message);
      setMessages((msgs) => {
        const next = [...msgs];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") last.thinking = false;
        return next;
      });
    } finally {
      setStreaming(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const saveKey = () => {
    onApiKey(keyDraft.trim());
    setShowKeyInput(false);
  };

  return (
    <section className="panel flex flex-col h-full overflow-hidden animate-fade-in relative">
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border">
        <Sparkles size={14} className="text-accent" strokeWidth={1.8} />
        <span className="text-[12.5px] font-medium tracking-tight text-fg/90">
          Chat
        </span>
        {streaming && (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            thinking…
          </span>
        )}
        {hasClaudeCode && !apiKey ? (
          <span
            className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded-md border border-accent/40 bg-accent/10 text-accent"
            title="Using your Claude Code session credentials — no API key needed"
          >
            <ShieldCheck size={10} />
            claude code session
          </span>
        ) : (
          <button
            onClick={() => setShowKeyInput((s) => !s)}
            className={cn(
              "ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded-md border",
              canChat
                ? "border-border text-muted hover:text-fg"
                : "border-accent2/40 bg-accent2/10 text-accent2 animate-pulse"
            )}
          >
            <Key size={10} />
            {apiKey ? "api key set" : hasEnvKey ? "env key set" : "set api key"}
          </button>
        )}
      </div>

      {showKeyInput && (
        <div className="px-3 py-2 border-b border-border bg-surface2/40 animate-slide-up">
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 px-2 py-1.5 rounded-md bg-bg border border-border text-xs font-mono"
            />
            <button onClick={saveKey} className="btn-primary">
              save
            </button>
          </div>
          <p className="mt-1.5 text-[10px] font-mono text-muted">
            stored in your browser only — never sent anywhere except the local backend
          </p>
        </div>
      )}

      {!canChat && !showKeyInput && (
        <div className="px-3 py-2 border-b border-accent2/30 bg-accent2/10 text-accent2 text-[11px] font-mono">
          paste your API key to enable chat, or log into Claude Code. manual SQL still works.
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={onScrollChat}
        className="flex-1 overflow-auto scrollbar-thin px-3 py-4 space-y-4 relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="font-display italic text-[42px] leading-[1.05] text-fg/85">
              Habla con tu{" "}
              <span className="text-accent terminal-glow">base de datos</span>.
            </p>
            <p className="mt-3 text-[12px] text-muted tracking-tight max-w-sm">
              Pregunta en lenguaje natural. Claude propone el SQL; tú decides cuándo ejecutarlo.
            </p>
            <div className="mt-8 w-full grid gap-1.5">
              <span className="label-mono mb-1 text-left">Ejemplos</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  disabled={!dbOk || !canChat}
                  className="panel-inset text-left px-3.5 py-2.5 text-[12.5px] text-fg/80 hover:border-accent/40 hover:text-fg hover:bg-accent/[0.03] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <span className="text-muted/60 mr-2 group-hover:text-accent">→</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            if (m.role === "user") return <UserMessage key={i} msg={m} />;
            // Find the user message that triggered this assistant turn (walk back).
            let userQ = null;
            for (let k = i - 1; k >= 0; k--) {
              if (messages[k].role === "user") {
                userQ = messages[k].text;
                break;
              }
            }
            return (
              <AssistantMessage
                key={i}
                msg={m}
                onResult={onResult}
                userQuestion={userQ}
              />
            );
          })
        )}

        {error && (
          <div className="panel-inset border-danger/40 bg-danger/10 text-danger text-xs font-mono p-2 flex items-start gap-2">
            <X size={12} className="mt-0.5" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-danger/70 hover:text-danger"
            >
              <X size={11} />
            </button>
          </div>
        )}
      </div>

      {showJumpToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-[88px] left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-bg shadow-lg border border-accent/40 text-[11px] font-medium hover:brightness-110 transition-all animate-slide-up"
          title="Bajar al mensaje más reciente"
        >
          <ChevronDown size={12} strokeWidth={2.5} />
          Ir al final
        </button>
      )}

      <div className="border-t border-border p-2.5">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={streaming || !dbOk || !canChat}
            placeholder={
              !dbOk
                ? "Base de datos desconectada"
                : !canChat
                ? "Configura una API key de Anthropic para chatear"
                : "Pregúntale a tus datos…"
            }
            rows={2}
            className="w-full pr-10 px-3 py-2.5 rounded-lg bg-surface2 border border-border
                       text-[13.5px] placeholder:text-muted/70 resize-none focus:border-accent/40 transition-colors"
          />
          <button
            onClick={() => send()}
            disabled={streaming || !input.trim() || !dbOk || !canChat}
            className="absolute bottom-2 right-2 inline-flex items-center justify-center
                       w-7 h-7 rounded-md bg-accent/15 border border-accent/40 text-accent
                       hover:bg-accent/25 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send (Enter)"
          >
            {streaming ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-muted/80">
          <span className="kbd">Enter</span> enviar
          <span className="text-muted/40">·</span>
          <span className="kbd">Shift</span>+<span className="kbd">Enter</span> nueva línea
        </div>
      </div>
    </section>
  );
}
