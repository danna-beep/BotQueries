import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileDown,
  Key,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { downloadUrl, streamChat } from "../lib/api.js";
import { cn, formatNumber } from "../lib/utils.js";

const EXAMPLES = [
  "list the 10 most recent rows in the largest table",
  "which tables have the word 'user' in them?",
  "give me a count of rows per table",
  "export the top 100 results of the most interesting query",
];

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

function AssistantMessage({ msg }) {
  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={11} className="text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          claude
        </span>
      </div>
      <div className="prose-chat">
        {msg.parts.map((p, i) => {
          if (p.type === "text") {
            return (
              <p key={i} className="whitespace-pre-wrap">
                {p.text}
              </p>
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
      <div className="panel-inset px-3 py-2 max-w-[85%] text-sm">
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

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
    <section className="panel flex flex-col h-full overflow-hidden animate-fade-in">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Sparkles size={13} className="text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          chat
        </span>
        {streaming && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-accent">
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

      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin px-3 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <p className="font-display italic text-3xl leading-tight text-fg/80">
              Talk to your{" "}
              <span className="text-accent terminal-glow">database</span>.
            </p>
            <p className="mt-2 text-[11px] font-mono text-muted uppercase tracking-wide">
              natural language → safe SQL
            </p>
            <div className="mt-6 w-full grid gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  disabled={!dbOk || !canChat}
                  className="panel-inset text-left px-3 py-2 text-xs font-mono text-fg/80 hover:border-accent/40 hover:text-fg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  → {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <UserMessage key={i} msg={m} />
            ) : (
              <AssistantMessage key={i} msg={m} />
            )
          )
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

      <div className="border-t border-border p-2.5">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={streaming || !dbOk || !canChat}
            placeholder={
              !dbOk
                ? "database disconnected"
                : !canChat
                ? "no Anthropic credentials — set an API key or use Claude Code"
                : "ask anything about your data…"
            }
            rows={2}
            className="w-full pr-10 px-3 py-2 rounded-md bg-surface2 border border-border
                       text-sm placeholder:text-muted/70 resize-none focus:border-accent/40"
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
        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-muted">
          <span className="kbd">Enter</span> send
          <span className="kbd">Shift</span>+<span className="kbd">Enter</span>{" "}
          newline
        </div>
      </div>
    </section>
  );
}
