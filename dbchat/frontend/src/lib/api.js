const BASE = "/api";

async function jsonOrThrow(res) {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.detail) {
        detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function getStatus() {
  const res = await fetch(`${BASE}/status`);
  return jsonOrThrow(res);
}

export async function getConnection() {
  const res = await fetch(`${BASE}/connection`);
  return jsonOrThrow(res);
}

export async function testConnection(config) {
  const res = await fetch(`${BASE}/connect/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return jsonOrThrow(res);
}

export async function connect(config) {
  const res = await fetch(`${BASE}/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return jsonOrThrow(res);
}

export async function disconnect() {
  const res = await fetch(`${BASE}/disconnect`, { method: "DELETE" });
  return jsonOrThrow(res);
}

export async function listDatabasesForConfig(config) {
  const res = await fetch(`${BASE}/connect/databases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return jsonOrThrow(res);
}

export async function listDatabasesStored() {
  const res = await fetch(`${BASE}/databases`);
  return jsonOrThrow(res);
}

export async function getContextSummary() {
  const res = await fetch(`${BASE}/context`);
  return jsonOrThrow(res);
}

export async function refreshContext() {
  const res = await fetch(`${BASE}/context/refresh`, { method: "POST" });
  return jsonOrThrow(res);
}

export async function getGlossary() {
  const res = await fetch(`${BASE}/glossary`);
  return jsonOrThrow(res);
}

export async function uploadGlossary(csvText) {
  const res = await fetch(`${BASE}/glossary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv_text: csvText }),
  });
  return jsonOrThrow(res);
}

export async function clearGlossary() {
  const res = await fetch(`${BASE}/glossary`, { method: "DELETE" });
  return jsonOrThrow(res);
}

export async function listMemory() {
  const res = await fetch(`${BASE}/memory`);
  return jsonOrThrow(res);
}

export async function addMemory(text) {
  const res = await fetch(`${BASE}/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return jsonOrThrow(res);
}

export async function deleteMemory(id) {
  const res = await fetch(`${BASE}/memory/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return jsonOrThrow(res);
}

export async function clearMemory() {
  const res = await fetch(`${BASE}/memory`, { method: "DELETE" });
  return jsonOrThrow(res);
}

export async function getSchema() {
  const res = await fetch(`${BASE}/schema`);
  return jsonOrThrow(res);
}

export async function runQuery(sql, maxRows = 1000) {
  const res = await fetch(`${BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, max_rows: maxRows }),
  });
  return jsonOrThrow(res);
}

export async function exportQuery(sql, format, filename = "query_result") {
  const res = await fetch(`${BASE}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql, format, filename }),
  });
  return jsonOrThrow(res);
}

export function downloadUrl(filename) {
  return `${BASE}/download/${encodeURIComponent(filename)}`;
}

// ---- Dashboards ----

export async function listDashboards() {
  const res = await fetch(`${BASE}/dashboards`);
  return jsonOrThrow(res);
}

export async function createDashboard(name) {
  const res = await fetch(`${BASE}/dashboards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return jsonOrThrow(res);
}

export async function getDashboard(id) {
  const res = await fetch(`${BASE}/dashboards/${id}`);
  return jsonOrThrow(res);
}

export async function renameDashboard(id, name) {
  const res = await fetch(`${BASE}/dashboards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return jsonOrThrow(res);
}

export async function deleteDashboard(id) {
  const res = await fetch(`${BASE}/dashboards/${id}`, { method: "DELETE" });
  return jsonOrThrow(res);
}

export async function addTile(dashboardId, tile) {
  const res = await fetch(`${BASE}/dashboards/${dashboardId}/tiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tile),
  });
  return jsonOrThrow(res);
}

export async function updateTile(dashboardId, tileId, patch) {
  const res = await fetch(
    `${BASE}/dashboards/${dashboardId}/tiles/${tileId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  return jsonOrThrow(res);
}

export async function deleteTile(dashboardId, tileId) {
  const res = await fetch(
    `${BASE}/dashboards/${dashboardId}/tiles/${tileId}`,
    { method: "DELETE" }
  );
  return jsonOrThrow(res);
}

export async function updateDashboardLayout(dashboardId, layouts) {
  const res = await fetch(`${BASE}/dashboards/${dashboardId}/layout`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layouts }),
  });
  return jsonOrThrow(res);
}

// ---- Warnings ----

export async function listWarnings() {
  const res = await fetch(`${BASE}/warnings`);
  return jsonOrThrow(res);
}

export async function createWarning(payload) {
  const res = await fetch(`${BASE}/warnings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return jsonOrThrow(res);
}

export async function deleteWarning(id) {
  const res = await fetch(`${BASE}/warnings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return jsonOrThrow(res);
}

export async function clearWarnings() {
  const res = await fetch(`${BASE}/warnings`, { method: "DELETE" });
  return jsonOrThrow(res);
}

export async function streamChat({ message, history, apiKey, mode, onEvent, signal }) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history || [],
      api_key: apiKey || null,
      mode: mode || "preview",
    }),
    signal,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j && j.detail) {
        detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of chunk.split("\n")) {
        const trimmed = line.trimStart();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        try {
          const evt = JSON.parse(payload);
          onEvent && onEvent(evt);
        } catch (e) {
          // skip malformed line
        }
      }
    }
  }
}
