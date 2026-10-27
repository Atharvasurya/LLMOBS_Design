# TraceLens — LLM Observability & Cost Monitoring Platform

TraceLens is a modern, production-quality observability dashboard for developers and AI engineering teams monitoring LLM applications, token economics, latency percentiles, and SLA compliance.

Built as **Phase 1 (Frontend & Design Architecture)** for a final-year engineering project.

---

## Key Highlights & Features

- **Dark Theme by Default**: Deep navy/near-black theme (`#0B0F19`), card surfaces (`#111827`), 1px borders (`#1F2937`), with full Dark/Light mode toggle.
- **5 KPI Sparkline Cards**: Total Requests, Total Cost, Avg Latency, Error Rate, and Tokens Used with animated trend badges.
- **Deep Analytics & Charts**:
  - **Cost Over Time**: Multi-model area chart (GPT-4o, Claude 3.5, Gemini Pro, Llama 3.1) with custom hover tooltips.
  - **Cost by Model**: Center-labeled donut chart with percentage breakdown.
  - **Latency Percentiles**: Grouped bar charts visualizing P50, P95, and P99 latency.
  - **Token Timeseries**: Input vs Output volume in millions.
  - **Budget Tracker**: Monthly spend progress bar, projected month-end burn rate, and overspend warning.
- **Trace Explorer**:
  - Filter by model, status (`success`, `error`, `timeout`), latency range, and search.
  - Clickable Trace ID leading to `/traces/[id]` featuring a **multi-step waterfall execution timeline** (Vector Retrieval, Embedding, LLM Call), token breakdown, and prompt/response inspector.
- **Model Comparison (`/models`)**:
  - Per-model metric cards, cost per 1K tokens comparison, and SLA compliance matrix.
- **Cost Analytics (`/cost`)**:
  - 30-day burn rate, model distribution, and forecast line against monthly budget ceilings.
- **Latency SLAs (`/latency`)**:
  - Percentile histograms, SLA breach counts, and model latency distributions.
- **Prompt Management (`/prompts`)**:
  - Template repository, versioning (`v2.4`, `v3.1`), variable interpolation, and interactive playground test simulator.
- **Alerts & SLA Policies (`/alerts`)**:
  - Real-time alert feed with severity filters (Critical, Warning, Info), acknowledgment toggles, and an interactive Alert Rules threshold manager.
- **Workspace Settings (`/settings`)**:
  - API key generation and management, team access control (Admin, Editor, Viewer), budget safeguard cutoffs, and Webhook integrations.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS & CSS Variables Design Token System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for global filter state (Date range & Environment switcher)
- **Data Layer**: Typed API abstraction layer (`/lib/api`) with deterministic seeded mock data (`/lib/mock`) simulating real API latency (300–700ms).

---

## Project Structure

```
tracelens/
├── app/
│   ├── layout.tsx             # Root layout with Inter font and CSS variables
│   ├── globals.css            # Design tokens, color schemes, animations
│   ├── page.tsx               # Root redirect to /overview
│   ├── overview/page.tsx      # Main dashboard with all KPIs, charts & alerts
│   ├── traces/
│   │   ├── page.tsx           # Paginated, filterable traces table
│   │   └── [id]/page.tsx      # Trace detail with waterfall timeline & inspectors
│   ├── models/page.tsx        # Per-model comparison matrix & token pricing
│   ├── cost/page.tsx          # Cost analytics & budget projections
│   ├── latency/page.tsx       # Latency percentiles & SLA compliance
│   ├── prompts/page.tsx       # Prompt template registry & playground
│   ├── alerts/page.tsx        # Active alerts & threshold rules manager
│   └── settings/page.tsx      # API keys, team roles, budget limits & webhooks
├── components/
│   ├── layout/                # Sidebar, TopBar, DashboardLayout
│   ├── cards/                 # Card, CardHeader, KpiCard, BudgetUsageCard
│   ├── charts/                # CostOverTime, CostByModel, LatencyPercentiles, TokenUsage
│   ├── tables/                # RecentTracesTable
│   └── alerts/                # ActiveAlertsPanel
├── lib/
│   ├── api/index.ts           # Typed API abstraction layer (ready for FastAPI)
│   ├── mock/data.ts           # 30-day timeseries, 220+ traces, deterministic data
│   ├── store/filters.ts       # Global Zustand store for date range & environment
│   └── utils.ts               # Formatting helpers (currency, latency, numbers, time)
└── types/
    └── index.ts               # Central TypeScript interface contracts
```

---

## Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```

3. **Open the browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Connecting the FastAPI + PostgreSQL Backend (Phase 2)

TraceLens was engineered with strict separation between UI components and data fetching. All components query data through the typed API abstraction functions in [`/lib/api/index.ts`](file:///e:/design/tracelens/lib/api/index.ts).

To connect the frontend to your FastAPI backend:

1. **Configure Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

2. **Replace Mock Functions in `/lib/api/index.ts`**:
   Replace the simulated mock functions with native `fetch()` calls:
   ```ts
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

   export async function getOverviewMetrics(filters?: { days?: number; environment?: string }): Promise<OverviewMetrics> {
     const res = await fetch(`${API_BASE}/metrics/overview?days=${filters?.days || 7}&env=${filters?.environment || 'production'}`);
     if (!res.ok) throw new Error("Failed to fetch overview metrics");
     return res.json();
   }

   export async function getTraces(filters: TraceFilters): Promise<PaginatedResponse<Trace>> {
     const params = new URLSearchParams({
       page: filters.page.toString(),
       pageSize: filters.pageSize.toString(),
       ...(filters.model && filters.model !== "all" ? { model: filters.model } : {}),
       ...(filters.status && filters.status !== "all" ? { status: filters.status } : {}),
       ...(filters.search ? { search: filters.search } : {}),
     });
     const res = await fetch(`${API_BASE}/traces?${params.toString()}`);
     return res.json();
   }
   ```
3. Because all data types are strictly codified in [`/types/index.ts`](file:///e:/design/tracelens/types/index.ts), any FastAPI backend adhering to these Pydantic models will integrate without modifying any component code.
