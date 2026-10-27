// ============================================================
// API Abstraction Layer
// Replace mock imports with real fetch() calls to FastAPI later
// ============================================================
import { sleep } from "@/lib/utils";
import {
  OVERVIEW_METRICS,
  COST_TIMESERIES,
  TOKEN_TIMESERIES,
  MODEL_BREAKDOWN,
  BUDGET_INFO,
  TRACES,
  ALERTS,
  ALERT_RULES,
  API_KEYS,
  TEAM_MEMBERS,
} from "@/lib/mock/data";
import type {
  OverviewMetrics,
  ModelTimeseriesPoint,
  TokenTimeseriesPoint,
  ModelBreakdown,
  BudgetInfo,
  Trace,
  Alert,
  AlertRule,
  TraceFilters,
  PaginatedResponse,
  ApiKey,
  TeamMember,
  ModelId,
  Status,
} from "@/types";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Overview ─────────────────────────────────────────────────
export async function getOverviewMetrics(_filters?: {
  days?: number;
  environment?: string;
}): Promise<OverviewMetrics> {
  await sleep(rand(300, 600));
  return { ...OVERVIEW_METRICS };
}

// ─── Cost Timeseries ─────────────────────────────────────────
export async function getCostTimeseries(days = 30): Promise<ModelTimeseriesPoint[]> {
  await sleep(rand(400, 700));
  return COST_TIMESERIES.slice(-days);
}

// ─── Token Timeseries ─────────────────────────────────────────
export async function getTokenTimeseries(days = 30): Promise<TokenTimeseriesPoint[]> {
  await sleep(rand(300, 600));
  return TOKEN_TIMESERIES.slice(-days);
}

// ─── Model Breakdown ─────────────────────────────────────────
export async function getModelBreakdown(): Promise<ModelBreakdown[]> {
  await sleep(rand(300, 500));
  return MODEL_BREAKDOWN;
}

// ─── Budget ───────────────────────────────────────────────────
export async function getBudgetInfo(): Promise<BudgetInfo> {
  await sleep(rand(200, 400));
  return { ...BUDGET_INFO };
}

// ─── Traces ───────────────────────────────────────────────────
export async function getTraces(
  filters: TraceFilters
): Promise<PaginatedResponse<Trace>> {
  await sleep(rand(400, 700));

  let data = [...TRACES];

  if (filters.model && filters.model !== "all") {
    data = data.filter((t) => t.model === (filters.model as ModelId));
  }
  if (filters.status && filters.status !== "all") {
    data = data.filter((t) => t.status === (filters.status as Status));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.prompt.toLowerCase().includes(q) ||
        t.modelLabel.toLowerCase().includes(q)
    );
  }
  if (filters.minLatency !== undefined) {
    data = data.filter((t) => t.latencyMs >= filters.minLatency!);
  }
  if (filters.maxLatency !== undefined) {
    data = data.filter((t) => t.latencyMs <= filters.maxLatency!);
  }

  const total = data.length;
  const totalPages = Math.ceil(total / filters.pageSize);
  const start = (filters.page - 1) * filters.pageSize;
  const slice = data.slice(start, start + filters.pageSize);

  return { data: slice, total, page: filters.page, pageSize: filters.pageSize, totalPages };
}

export async function getTraceById(id: string): Promise<Trace | null> {
  await sleep(rand(300, 500));
  return TRACES.find((t) => t.id === id) ?? null;
}

// ─── Alerts ───────────────────────────────────────────────────
export async function getAlerts(): Promise<Alert[]> {
  await sleep(rand(200, 400));
  return [...ALERTS];
}

export async function getAlertRules(): Promise<AlertRule[]> {
  await sleep(rand(200, 400));
  return [...ALERT_RULES];
}

// ─── Settings ─────────────────────────────────────────────────
export async function getApiKeys(): Promise<ApiKey[]> {
  await sleep(rand(200, 400));
  return [...API_KEYS];
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  await sleep(rand(200, 400));
  return [...TEAM_MEMBERS];
}
