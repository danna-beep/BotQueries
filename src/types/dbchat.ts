/**
 * Types for the DBChat backend API (FastAPI, mounted under `/api/*`).
 * Shapes mirror the Pydantic responses in the external DBChat service.
 * These are leaf types — they do not import from other layers.
 */

// --- Auth / status -----------------------------------------------------------

export interface IAnthropicAuth {
  sources: string[]
  env_api_key: boolean
  claude_cli: boolean
  claude_code_session: boolean
}

export interface IConnectionInfo {
  version?: string
  current_database?: string | null
  current_user_name?: string
  server_host?: string
  configured_host: string
  configured_database: string | null
}

export interface IApiStatus {
  db_ok: boolean
  configured: boolean
  details: IConnectionInfo | string | null
  anthropic_key_present: boolean
  anthropic_auth: IAnthropicAuth
}

// --- Connection --------------------------------------------------------------

/** Persisted connection config returned by `/connection` (password redacted). */
export interface ISafeDbConfig {
  host: string
  port: number
  user: string
  database: string | null
  charset: string
  ssl_disabled: boolean
  connect_timeout: number
  read_timeout: number
  has_password: boolean
}

export interface IConnectionResponse {
  configured: boolean
  config: ISafeDbConfig | null
}

/** Payload for `/connect`, `/connect/test` and `/connect/databases`. */
export interface IConnectRequest {
  host: string
  port: number
  user: string
  password: string
  database?: string | null
  charset: string
  ssl_disabled: boolean
  connect_timeout: number
  read_timeout: number
  use_saved_password: boolean
}

export interface IConnectTestResponse {
  ok: boolean
  details: IConnectionInfo
}

export interface IConnectResponse {
  ok: boolean
  details: IConnectionInfo
  context: IContextSummary | null
}

export interface IDatabasesResponse {
  databases: string[]
}

export interface IContextSummary {
  available: boolean
  tables?: number
  distinct_columns?: number
  distinct_values?: number
  memory_entries?: number
  error?: string
}

// --- Schema ------------------------------------------------------------------

export interface ISchemaColumn {
  name: string
  type: string
  nullable: boolean
  key: string | null
  distinct_values?: string[]
}

export interface ISchemaTable {
  name: string
  comment: string | null
  row_estimate: number | null
  columns: ISchemaColumn[]
}

export interface IDatabaseSchema {
  database: string
  tables: ISchemaTable[]
}

// --- Query / export ----------------------------------------------------------

export type QueryRow = Record<string, unknown>

export interface IQueryResult {
  columns: string[]
  rows: QueryRow[]
  row_count: number
  elapsed_ms: number
  truncated: boolean
}

export type ExportFormat = 'csv' | 'xlsx' | 'json'

export interface IExportRequest {
  sql: string
  format: ExportFormat
  filename?: string
  max_rows?: number
}

export interface IExportResponse {
  filename: string
  format: ExportFormat
  row_count: number
  elapsed_ms: number
  download_url: string
}

// --- Dashboards --------------------------------------------------------------

export type ChartKind = 'bar' | 'line' | 'area' | 'pie' | 'kpi' | 'ring'

export interface ITileLayout {
  x: number
  y: number
  w: number
  h: number
}

export interface ITile {
  id: string
  title: string
  sql: string
  chart_kind: ChartKind
  top_n: number | string
  x_key: string | null
  y_series: string[] | null
  kpi_label: string | null
  layout: ITileLayout
  created_at: number
}

export interface ITileCreatePayload {
  title?: string
  sql: string
  chart_kind?: ChartKind
  top_n?: number | string
  x_key?: string | null
  y_series?: string[] | null
  kpi_label?: string | null
  layout?: ITileLayout
}

export type ITilePatchPayload = Partial<ITileCreatePayload>

export interface IDashboardSummary {
  id: string
  name: string
  tile_count: number
  created_at: number
  updated_at: number
}

export interface IDashboard {
  id: string
  name: string
  created_at: number
  updated_at: number
  tiles: ITile[]
}

export interface IDashboardsResponse {
  dashboards: IDashboardSummary[]
}

/** Grid layout item sent back to `/dashboards/:id/layout` after drag/resize. */
export interface ILayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

// --- Warnings ----------------------------------------------------------------

export type WarningSeverity = 'ok' | 'low' | 'medium' | 'high'

export interface IWarning {
  id: string
  client: string
  title: string
  severity: WarningSeverity
  tables_reviewed: string[]
  possible_fix: string | null
  details: string | null
  sql_run: string[]
  user_question: string | null
  created_at: number
}

export interface IWarningCreatePayload {
  client: string
  title: string
  severity?: WarningSeverity
  tables_reviewed?: string[]
  possible_fix?: string | null
  details?: string | null
  sql_run?: string[]
  user_question?: string | null
}

export interface IWarningsResponse {
  warnings: IWarning[]
  count: number
}

// --- Glossary ----------------------------------------------------------------

export interface IGlossaryEntry {
  name: string
  definition: string
  type: string
  allowed_values: string
}

export interface IGlossarySummary {
  loaded: number
  matched: number
  sample: IGlossaryEntry[]
}

export interface IGlossaryUploadResponse {
  ok: boolean
  loaded: number
  matched: number
}

// --- Memory ------------------------------------------------------------------

export interface IMemoryEntry {
  id: string
  text: string
  added_at: string
}

export interface IMemoryListResponse {
  entries: IMemoryEntry[]
  count: number
}

// --- Chat (SSE) --------------------------------------------------------------

export type ChatMode = 'preview' | 'execute' | 'nocode'

export interface IChatMessage {
  role: string
  content: unknown
}

export interface IChatRequest {
  message: string
  history?: IChatMessage[]
  api_key?: string | null
  mode?: ChatMode
}

/** UI payload attached to a `tool_result` SSE event, discriminated by `kind`. */
export interface IQueryResultPayload {
  kind: 'query_result'
  sql: string
  columns: string[]
  rows: QueryRow[]
  row_count: number
  elapsed_ms: number
  truncated: boolean
}

export interface IExportReadyPayload {
  kind: 'export_ready'
  filename: string
  format?: ExportFormat
  row_count?: number
  download_url?: string
}

export interface IToolErrorPayload {
  kind: 'error'
  error: string
}

export type IToolResultPayload =
  | IQueryResultPayload
  | IExportReadyPayload
  | IToolErrorPayload

export type ChatEvent =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; payload: IToolResultPayload }
  // Backend uses `progress`; the original UI listened for `tool_progress` — accept both.
  | { type: 'progress'; elapsed_seconds: number }
  | { type: 'tool_progress'; elapsed_seconds: number }
  | { type: 'done'; messages: IChatMessage[] }
  | { type: 'error'; error: string }
  | {
      type: 'usage'
      model?: string
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }

/** Cumulative token usage persisted across sessions, plus the model last seen. */
export interface ITokenUsageTotals {
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  /** Number of chat turns counted. */
  turns: number
  /** Model of the most recent usage event (drives cost pricing). */
  model?: string
}

// --- Generic -----------------------------------------------------------------

export interface IOkResponse {
  ok: boolean
}
