import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...args) {
  return twMerge(clsx(args));
}

export function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat().format(n);
}

export function truncate(s, n = 40) {
  if (!s) return s;
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function relativeTime(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function isNumeric(v) {
  if (v === null || v === undefined || v === "") return false;
  if (typeof v === "boolean") return false;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") {
    if (v.trim() === "") return false;
    const n = Number(v);
    return Number.isFinite(n);
  }
  return false;
}

// Formats a number compactly: 1234 → "1.2K", 1500000 → "1.5M", 2.3e9 → "2.3B".
export function formatCompact(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return "—";
  const num = Number(n);
  const abs = Math.abs(num);
  if (abs >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (abs >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (abs >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2);
}

// ISO date / datetime patterns. Anchored loosely so we accept "2025-05-25",
// "2025-05-25T10:30:00", "2025-05-25 10:30:00.000".
const DATE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/;
const DATE_NAME_RE = /(date|fecha|day|month|dia|mes|year|año|ano|timestamp|created|updated)/i;

export function looksLikeDateValue(v) {
  if (v instanceof Date) return true;
  if (typeof v !== "string") return false;
  return DATE_RE.test(v.trim());
}

export function looksLikeDateColumn(colName, sampleValue) {
  return DATE_NAME_RE.test(colName) || looksLikeDateValue(sampleValue);
}

export function formatDateLabel(v) {
  if (!v) return "";
  const s = String(v);
  // YYYY-MM-DD or YYYY-MM-DD HH:MM:SS → keep just the date part for axis labels
  if (DATE_RE.test(s.trim())) return s.trim().slice(0, 10);
  return s;
}

// Suggests a short, filesystem-friendly filename from a SQL query: the table
// name plus the kind of operation (count/sum/avg/summary). The backend still
// appends a timestamp + extension.
export function suggestFilename(sql) {
  if (!sql) return "consulta";
  const lower = sql.toLowerCase();
  const m = lower.match(/from\s+`?([a-z0-9_.]+)`?/);
  let table = m ? m[1] : "";
  if (table.includes(".")) table = table.split(".").pop();

  let verb = "";
  if (/\bcount\s*\(/.test(lower)) verb = "conteo";
  else if (/\bsum\s*\(/.test(lower)) verb = "suma";
  else if (/\bavg\s*\(/.test(lower)) verb = "promedio";
  else if (/\bgroup\s+by\b/.test(lower)) verb = "resumen";

  const base = [table, verb].filter(Boolean).join("_") || "consulta";
  return base.replace(/[^a-z0-9_-]+/g, "_").slice(0, 50);
}
