// ============================================================
// MOCK DATA — Deterministic, seeded, internally consistent
// 30 days of timeseries, 4 models, 200+ traces
// ============================================================
import type {
  OverviewMetrics,
  ModelTimeseriesPoint,
  TokenTimeseriesPoint,
  ModelBreakdown,
  BudgetInfo,
  Trace,
  Alert,
  AlertRule,
  ModelId,
  Status,
  TraceStep,
  TeamMember,
  ApiKey,
} from "@/types";

// Per-model pricing (USD per 1K tokens)
export const MODEL_PRICES: Record<ModelId, { input: number; output: number }> = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "claude-3-5": { input: 0.003, output: 0.015 },
  "gemini-pro": { input: 0.00125, output: 0.005 },
  "llama-3.1": { input: 0.0002, output: 0.0006 },
};

export const MODEL_LABELS: Record<ModelId, string> = {
  "gpt-4o": "GPT-4o",
  "claude-3-5": "Claude 3.5",
  "gemini-pro": "Gemini Pro",
  "llama-3.1": "Llama 3.1",
};

export const MODEL_COLORS: Record<ModelId, string> = {
  "gpt-4o": "#6366F1",
  "claude-3-5": "#22D3EE",
  "gemini-pro": "#10B981",
  "llama-3.1": "#F59E0B",
};

// Simple seeded RNG
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ─── Timeseries (30 days) ─────────────────────────────────────
const NOW = new Date("2026-10-27T00:00:00Z");

function pastDate(daysAgo: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const COST_TIMESERIES: ModelTimeseriesPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const dayIdx = 29 - i;
    const base = seededRand(dayIdx * 10);
    const trend = (dayIdx / 29) * 0.4 + 0.6;
    return {
      date: pastDate(dayIdx),
      "gpt-4o": Math.round(lerp(60, 180, base * trend + seededRand(dayIdx * 3) * 0.3) * 100) / 100,
      "claude-3-5": Math.round(lerp(30, 110, seededRand(dayIdx * 7) * trend) * 100) / 100,
      "gemini-pro": Math.round(lerp(15, 70, seededRand(dayIdx * 11) * trend) * 100) / 100,
      "llama-3.1": Math.round(lerp(5, 30, seededRand(dayIdx * 13) * trend) * 100) / 100,
    };
  }
);

export const TOKEN_TIMESERIES: TokenTimeseriesPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const dayIdx = 29 - i;
    const base = seededRand(dayIdx * 17);
    const trend = (dayIdx / 29) * 0.5 + 0.5;
    return {
      date: pastDate(dayIdx),
      input: Math.round(lerp(4_000_000, 12_000_000, base * trend)),
      output: Math.round(lerp(1_500_000, 5_000_000, seededRand(dayIdx * 19) * trend)),
    };
  }
);

// ─── Computed totals from timeseries ─────────────────────────
const last7Days = COST_TIMESERIES.slice(-7);
const prev7Days = COST_TIMESERIES.slice(-14, -7);

function sumModel(rows: ModelTimeseriesPoint[], m: ModelId) {
  return rows.reduce((s, r) => s + r[m], 0);
}

const models: ModelId[] = ["gpt-4o", "claude-3-5", "gemini-pro", "llama-3.1"];
const totalCostCurrent = models.reduce((s, m) => s + sumModel(last7Days, m), 0);
const totalCostPrev = models.reduce((s, m) => s + sumModel(prev7Days, m), 0);

// ─── Overview Metrics ─────────────────────────────────────────
export const OVERVIEW_METRICS: OverviewMetrics = {
  totalRequests: 1_284_920,
  totalRequestsChange: 12.4,
  totalCost: 1842.6,
  totalCostChange: 8.1,
  avgLatency: 842,
  avgLatencyChange: -5.3,
  errorRate: 1.9,
  errorRateChange: 0.4,
  tokensUsed: 412_000_000,
  tokensUsedChange: 14.2,
};

// ─── Sparklines (7-day mini arrays) ──────────────────────────
export function generateSparkline(
  seed: number,
  length = 7,
  min = 0,
  max = 100
): number[] {
  return Array.from({ length }, (_, i) =>
    Math.round(lerp(min, max, seededRand(seed + i * 3)))
  );
}

// ─── Model Breakdown ──────────────────────────────────────────
const totalCost30 = models.reduce((s, m) => s + sumModel(COST_TIMESERIES, m), 0);

export const MODEL_BREAKDOWN: ModelBreakdown[] = [
  {
    model: "gpt-4o",
    label: "GPT-4o",
    cost: Math.round(sumModel(COST_TIMESERIES, "gpt-4o") * 100) / 100,
    percentage: Math.round((sumModel(COST_TIMESERIES, "gpt-4o") / totalCost30) * 1000) / 10,
    color: "#6366F1",
    avgLatencyP50: 420,
    avgLatencyP95: 1840,
    avgLatencyP99: 2650,
    tokensInput: 180_000_000,
    tokensOutput: 62_000_000,
    requests: 542_300,
    errorRate: 1.4,
    costPer1kTokens: 0.0082,
  },
  {
    model: "claude-3-5",
    label: "Claude 3.5",
    cost: Math.round(sumModel(COST_TIMESERIES, "claude-3-5") * 100) / 100,
    percentage: Math.round((sumModel(COST_TIMESERIES, "claude-3-5") / totalCost30) * 1000) / 10,
    color: "#22D3EE",
    avgLatencyP50: 580,
    avgLatencyP95: 2100,
    avgLatencyP99: 3200,
    tokensInput: 130_000_000,
    tokensOutput: 48_000_000,
    requests: 389_400,
    errorRate: 0.8,
    costPer1kTokens: 0.0062,
  },
  {
    model: "gemini-pro",
    label: "Gemini Pro",
    cost: Math.round(sumModel(COST_TIMESERIES, "gemini-pro") * 100) / 100,
    percentage: Math.round((sumModel(COST_TIMESERIES, "gemini-pro") / totalCost30) * 1000) / 10,
    color: "#10B981",
    avgLatencyP50: 340,
    avgLatencyP95: 1560,
    avgLatencyP99: 2890,
    tokensInput: 75_000_000,
    tokensOutput: 28_000_000,
    requests: 247_800,
    errorRate: 3.2,
    costPer1kTokens: 0.0019,
  },
  {
    model: "llama-3.1",
    label: "Llama 3.1",
    cost: Math.round(sumModel(COST_TIMESERIES, "llama-3.1") * 100) / 100,
    percentage: Math.round((sumModel(COST_TIMESERIES, "llama-3.1") / totalCost30) * 1000) / 10,
    color: "#F59E0B",
    avgLatencyP50: 290,
    avgLatencyP95: 980,
    avgLatencyP99: 1540,
    tokensInput: 60_000_000,
    tokensOutput: 24_000_000,
    requests: 105_420,
    errorRate: 2.1,
    costPer1kTokens: 0.0004,
  },
];

// Normalize percentages to 100%
const totalPct = MODEL_BREAKDOWN.reduce((s, m) => s + m.percentage, 0);
MODEL_BREAKDOWN.forEach((m) => {
  m.percentage = Math.round((m.percentage / totalPct) * 1000) / 10;
});

// ─── Budget ───────────────────────────────────────────────────
export const BUDGET_INFO: BudgetInfo = {
  used: 1842.6,
  limit: 2500,
  percentageUsed: 73.7,
  projectedMonthEnd: 2843.2,
  willOverspend: true,
  projectedOverspend: 343.2,
};

// ─── Traces (200+) ────────────────────────────────────────────
const PROMPTS: Record<string, string[]> = {
  "gpt-4o": [
    "Summarize the quarterly earnings report and highlight key growth drivers and risk factors for investors.",
    "What are the key differences between transformer and state-space model architectures for long-context tasks?",
    "Generate a detailed product roadmap for a B2B SaaS platform targeting enterprise healthcare clients.",
    "Analyze the following financial statement and identify any anomalies or areas of concern.",
    "Write a comprehensive technical specification for a distributed message queue system.",
    "Explain quantum entanglement and its potential applications in cryptography at an expert level.",
    "Create a marketing strategy for launching an AI-powered legal document review tool.",
  ],
  "claude-3-5": [
    "Generate a Python function that parses nested JSON payloads and validates against a Pydantic schema with custom validators.",
    "Analyze sentiment in the following customer support transcripts and categorize by urgency and emotional tone.",
    "Write a comprehensive code review checklist for a TypeScript microservices architecture.",
    "Refactor the following React component to use proper memoization and reduce unnecessary re-renders.",
    "Design a database schema for a multi-tenant SaaS application with row-level security.",
    "Create unit tests for the following async event processing pipeline using Jest and TypeScript.",
  ],
  "gemini-pro": [
    "Translate the following legal document from English to Spanish, maintaining all technical terminology.",
    "Summarize the attached research paper on retrieval-augmented generation and extract actionable insights.",
    "Compare the performance characteristics of PostgreSQL, MySQL, and MongoDB for high-write workloads.",
    "Generate a comprehensive SEO content strategy for a fintech startup targeting small business owners.",
    "Explain the regulatory implications of the EU AI Act for companies deploying large language models.",
  ],
  "llama-3.1": [
    "Create a marketing email campaign for our new enterprise analytics product targeting CTOs and VPs of Engineering.",
    "Write a blog post about the importance of observability in production AI systems.",
    "Generate five variations of a landing page headline for our developer tools startup.",
    "Summarize the key points from the attached meeting transcript and create action items.",
    "Create a product description for our API monitoring service targeting DevOps teams.",
  ],
};

const RESPONSES: Record<string, string[]> = {
  "gpt-4o": [
    "The quarterly earnings demonstrate robust revenue growth of 23% YoY, driven primarily by enterprise subscription expansion and strong NRR of 118%. Key risk factors include increasing competition in the mid-market segment and macro headwinds affecting SMB churn rates...",
    "Transformer architectures excel at parallel processing and attention-based long-range dependencies, but quadratic complexity makes them expensive for very long contexts. State-space models (SSMs) like Mamba offer linear-time complexity through selective state spaces...",
  ],
  "claude-3-5": [
    "Here's a Python function with full Pydantic v2 validation: ```python\nfrom pydantic import BaseModel, field_validator, model_validator\nfrom typing import Any\n\nclass NestedPayload(BaseModel):\n    id: str\n    data: dict[str, Any]...",
    "After analyzing 847 support transcripts, I've identified the following sentiment distribution: Frustrated (32%), Confused (28%), Satisfied (24%), Urgent (16%). High-urgency tickets predominantly relate to billing issues and API downtime...",
  ],
  "gemini-pro": [
    "Traducción completada. El documento legal ha sido traducido manteniendo todos los términos técnicos en su equivalente jurídico español. Se han preservado las referencias a artículos específicos y la numeración original...",
    "The paper presents RAG-Fusion, a novel approach that combines multiple retrieval strategies with reciprocal rank fusion. Key findings: 34% improvement in answer accuracy on open-domain QA benchmarks, with particular gains on multi-hop reasoning tasks...",
  ],
  "llama-3.1": [
    "Subject: Unlock Deeper Insights with TraceLens Enterprise Analytics\n\nDear [Name],\n\nIn today's data-driven landscape, your engineering teams are making critical decisions based on LLM performance data...",
    "# Why Observability Matters for Production AI Systems\n\nAs AI systems move from experimentation to production, the gap between 'it works in my notebook' and 'it works reliably at scale' becomes painfully apparent...",
  ],
};

const PROJECTS = ["api-gateway", "chat-assistant", "doc-processor", "code-review", "data-pipeline"];

function generateTraceSteps(model: ModelId, totalMs: number, status: Status): TraceStep[] {
  const steps: TraceStep[] = [];
  let elapsed = 0;

  // Retrieval step
  const retrievalMs = Math.round(totalMs * 0.12);
  steps.push({
    id: `step-retrieval`,
    name: "Vector Retrieval",
    type: "retrieval",
    startMs: elapsed,
    durationMs: retrievalMs,
    status: "success",
    metadata: { "chunks_retrieved": 5, "similarity_threshold": 0.78, "index": "pinecone-prod" },
  });
  elapsed += retrievalMs;

  // Embedding step
  const embeddingMs = Math.round(totalMs * 0.08);
  steps.push({
    id: `step-embedding`,
    name: "Query Embedding",
    type: "embedding",
    startMs: elapsed,
    durationMs: embeddingMs,
    tokensInput: 128,
    status: "success",
    metadata: { "model": "text-embedding-3-small", "dimensions": 1536 },
  });
  elapsed += embeddingMs;

  // LLM call
  const llmMs = totalMs - elapsed - 20;
  steps.push({
    id: `step-llm`,
    name: `${MODEL_LABELS[model]} Inference`,
    type: "llm_call",
    startMs: elapsed,
    durationMs: llmMs,
    tokensInput: 2100,
    tokensOutput: 680,
    status: status === "timeout" ? "timeout" : status,
    metadata: { "temperature": 0.7, "max_tokens": 1024, "stream": true },
  });
  elapsed += llmMs;

  // Tool call (sometimes)
  if (status === "success" && Math.random() > 0.6) {
    steps.push({
      id: `step-tool`,
      name: "Function Call: search_database",
      type: "tool_call",
      startMs: elapsed,
      durationMs: 20,
      status: "success",
      metadata: { "function": "search_database", "args_count": 3 },
    });
  }

  return steps;
}

function generateTrace(index: number): Trace {
  const seed = index * 37;
  const modelIdx = Math.floor(seededRand(seed) * 4);
  const model = models[modelIdx];
  const statusRand = seededRand(seed + 1);
  const status: Status =
    statusRand > 0.97 ? "timeout" : statusRand > 0.93 ? "error" : "success";

  const promptList = PROMPTS[model];
  const promptIdx = Math.floor(seededRand(seed + 2) * promptList.length);
  const promptFull = promptList[promptIdx];

  const tokensInput = Math.round(lerp(800, 5000, seededRand(seed + 3)));
  const tokensOutput = Math.round(lerp(200, 2000, seededRand(seed + 4)));
  const cost =
    (tokensInput / 1000) * MODEL_PRICES[model].input +
    (tokensOutput / 1000) * MODEL_PRICES[model].output;

  const latencyMs = Math.round(lerp(280, 4200, seededRand(seed + 5)));

  const minutesAgo = Math.floor(seededRand(seed + 6) * 10080); // up to 7 days
  const ts = new Date(NOW.getTime() - minutesAgo * 60 * 1000);

  const project = PROJECTS[Math.floor(seededRand(seed + 7) * PROJECTS.length)];

  return {
    id: `trc-${(0xffffff - index * 0x1a3b).toString(16).padStart(6, "0")}`,
    timestamp: ts.toISOString(),
    model,
    modelLabel: MODEL_LABELS[model],
    prompt: promptFull,
    promptFull,
    response: (RESPONSES[model] || ["Response generated successfully."])[
      Math.floor(seededRand(seed + 8) * (RESPONSES[model]?.length || 1))
    ],
    tokensInput,
    tokensOutput,
    tokensTotal: tokensInput + tokensOutput,
    latencyMs,
    cost: Math.round(cost * 10000) / 10000,
    status,
    project,
    environment: "production",
    steps: generateTraceSteps(model, latencyMs, status),
  };
}

export const TRACES: Trace[] = Array.from({ length: 220 }, (_, i) => generateTrace(i)).sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);

// ─── Alerts ───────────────────────────────────────────────────
export const ALERTS: Alert[] = [
  {
    id: "alert-001",
    title: "Cost spike detected",
    description: "+38% increase in last 1h — gpt-4o spend has accelerated beyond normal patterns.",
    severity: "critical",
    timestamp: new Date(NOW.getTime() - 2 * 60 * 1000).toISOString(),
    model: "gpt-4o",
    acknowledged: false,
    rule: "cost-spike-threshold",
  },
  {
    id: "alert-002",
    title: "p95 Latency > 2s on GPT-4o",
    description: "p95 latency is 2,840ms, exceeding the 2,000ms threshold. Degraded performance detected.",
    severity: "warning",
    timestamp: new Date(NOW.getTime() - 14 * 60 * 1000).toISOString(),
    model: "gpt-4o",
    acknowledged: false,
    rule: "latency-p95-threshold",
  },
  {
    id: "alert-003",
    title: "Error rate above 3% on Gemini Pro",
    description: "Error rate at 3.2% over last 30 minutes, above the 3% warning threshold.",
    severity: "warning",
    timestamp: new Date(NOW.getTime() - 31 * 60 * 1000).toISOString(),
    model: "gemini-pro",
    acknowledged: false,
    rule: "error-rate-threshold",
  },
  {
    id: "alert-004",
    title: "Monthly budget at 73%",
    description: "At current burn rate you will exceed the $2,500 monthly budget by approximately $343.",
    severity: "warning",
    timestamp: new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    rule: "budget-usage-threshold",
  },
  {
    id: "alert-005",
    title: "Llama 3.1 error spike",
    description: "5 consecutive errors on llama-3.1 in the doc-processor project.",
    severity: "critical",
    timestamp: new Date(NOW.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    model: "llama-3.1",
    acknowledged: true,
    rule: "consecutive-errors",
  },
];

// ─── Alert Rules ──────────────────────────────────────────────
export const ALERT_RULES: AlertRule[] = [
  { id: "rule-1", name: "Cost Spike", metric: "cost_per_hour", condition: "increases_by_percent", threshold: 30, severity: "critical", enabled: true },
  { id: "rule-2", name: "High p95 Latency", metric: "latency_p95", condition: "greater_than_ms", threshold: 2000, severity: "warning", enabled: true },
  { id: "rule-3", name: "Error Rate Warning", metric: "error_rate_percent", condition: "greater_than", threshold: 3, severity: "warning", enabled: true },
  { id: "rule-4", name: "Budget Usage", metric: "monthly_budget_percent", condition: "greater_than", threshold: 70, severity: "warning", enabled: true },
  { id: "rule-5", name: "Zero Responses", metric: "success_rate_percent", condition: "less_than", threshold: 90, severity: "critical", enabled: false },
];

// ─── Settings ─────────────────────────────────────────────────
export const API_KEYS: ApiKey[] = [
  { id: "key-1", name: "Production API Key", key: "tl_prod_••••••••••••••3f8a", createdAt: "2026-09-01", lastUsed: "2026-10-27" },
  { id: "key-2", name: "Staging API Key", key: "tl_stg_••••••••••••••7c2d", createdAt: "2026-09-15", lastUsed: "2026-10-25" },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u-1", name: "Atharva", email: "atharva@tracelens.io", role: "admin", avatarInitials: "AT" },
  { id: "u-2", name: "Priya Sharma", email: "priya@tracelens.io", role: "editor", avatarInitials: "PS" },
  { id: "u-3", name: "Marco Rossi", email: "marco@tracelens.io", role: "viewer", avatarInitials: "MR" },
];
