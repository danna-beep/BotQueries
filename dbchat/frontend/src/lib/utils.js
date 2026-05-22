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
