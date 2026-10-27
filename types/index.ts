// ============================================================
// TraceLens — Shared TypeScript Types
// Swap the API layer in /lib/api/ to connect to FastAPI later
// ============================================================

export type ModelId = "gpt-4o" | "claude-3-5" | "gemini-pro" | "llama-3.1";
export type Status = "success" | "error" | "timeout";
export type Severity = "critical" | "warning" | "info";
export type Environment = "production" | "staging" | "development";

// ─── KPI Metrics ─────────────────────────────────────────────
export interface OverviewMetrics {
  totalRequests: number;
  totalRequestsChange: number;
  totalCost: number;
  totalCostChange: number;
  avgLatency: number;
  avgLatencyChange: number;
  errorRate: number;
  errorRateChange: number;
  tokensUsed: number;
  tokensUsedChange: number;
}

// ─── Timeseries ───────────────────────────────────────────────
export interface TimeseriesPoint {
  date: string; // ISO date string "YYYY-MM-DD"
  value: number;
}

export interface ModelTimeseriesPoint {
  date: string;
  "gpt-4o": number;
  "claude-3-5": number;
  "gemini-pro": number;
  "llama-3.1": number;
}

export interface TokenTimeseriesPoint {
  date: string;
  input: number;
  output: number;
}

// ─── Model Breakdown ──────────────────────────────────────────
export interface ModelBreakdown {
  model: ModelId;
  label: string;
  cost: number;
  percentage: number;
  color: string;
  avgLatencyP50: number;
  avgLatencyP95: number;
  avgLatencyP99: number;
  tokensInput: number;
  tokensOutput: number;
  requests: number;
  errorRate: number;
  costPer1kTokens: number;
}

// ─── Budget ───────────────────────────────────────────────────
export interface BudgetInfo {
  used: number;
  limit: number;
  percentageUsed: number;
  projectedMonthEnd: number;
  willOverspend: boolean;
  projectedOverspend: number;
}

// ─── Traces ───────────────────────────────────────────────────
export interface Trace {
  id: string;
  timestamp: string; // ISO datetime
  model: ModelId;
  modelLabel: string;
  prompt: string;
  promptFull: string;
  response: string;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
  latencyMs: number;
  cost: number;
  status: Status;
  project: string;
  environment: Environment;
  steps: TraceStep[];
}

export interface TraceStep {
  id: string;
  name: string;
  type: "retrieval" | "llm_call" | "tool_call" | "embedding";
  startMs: number;
  durationMs: number;
  tokensInput?: number;
  tokensOutput?: number;
  cost?: number;
  status: Status;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Alerts ───────────────────────────────────────────────────
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: string; // ISO datetime
  model?: ModelId;
  acknowledged: boolean;
  rule: string;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: Severity;
  enabled: boolean;
}

// ─── Filters ──────────────────────────────────────────────────
export interface GlobalFilters {
  dateRange: DateRange;
  environment: Environment;
}

export interface DateRange {
  label: string;
  from: Date;
  to: Date;
}

export interface TraceFilters {
  model?: ModelId | "all";
  status?: Status | "all";
  search?: string;
  minLatency?: number;
  maxLatency?: number;
  page: number;
  pageSize: number;
}

// ─── Paginated response ───────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Settings ─────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatarInitials: string;
}
