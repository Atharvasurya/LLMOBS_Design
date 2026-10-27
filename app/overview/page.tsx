"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/cards/KpiCard";
import { CostOverTimeChart } from "@/components/charts/CostOverTimeChart";
import { CostByModelDonut } from "@/components/charts/CostByModelDonut";
import { LatencyPercentilesChart } from "@/components/charts/LatencyPercentilesChart";
import { TokenUsageChart } from "@/components/charts/TokenUsageChart";
import { BudgetUsageCard } from "@/components/cards/BudgetUsageCard";
import { RecentTracesTable } from "@/components/tables/RecentTracesTable";
import { ActiveAlertsPanel } from "@/components/alerts/ActiveAlertsPanel";
import { SkeletonCard } from "@/components/cards/Card";
import {
  getOverviewMetrics,
  getCostTimeseries,
  getTokenTimeseries,
  getModelBreakdown,
  getBudgetInfo,
  getTraces,
  getAlerts,
} from "@/lib/api";
import type {
  OverviewMetrics,
  ModelTimeseriesPoint,
  TokenTimeseriesPoint,
  ModelBreakdown,
  BudgetInfo,
  Trace,
  Alert,
} from "@/types";
import { formatNumber, formatCurrency, formatLatency, formatPercent, formatTokens } from "@/lib/utils";

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [costTs, setCostTs] = useState<ModelTimeseriesPoint[]>([]);
  const [tokenTs, setTokenTs] = useState<TokenTimeseriesPoint[]>([]);
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [budget, setBudget] = useState<BudgetInfo | null>(null);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverviewMetrics(),
      getCostTimeseries(7),
      getTokenTimeseries(7),
      getModelBreakdown(),
      getBudgetInfo(),
      getTraces({ page: 1, pageSize: 6 }),
      getAlerts(),
    ]).then(([m, c, t, mb, b, tr, al]) => {
      setMetrics(m);
      setCostTs(c);
      setTokenTs(t);
      setModels(mb);
      setBudget(b);
      setTraces(tr.data);
      setAlerts(al);
      setLoading(false);
    });
  }, []);

  const totalModelCost = models.reduce((s, m) => s + m.cost, 0);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1600 }}>

        {/* ── KPI Cards ─────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 14,
          }}
        >
          {loading || !metrics ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} height={130} />)
          ) : (
            <>
              <KpiCard
                label="Total Requests"
                value={formatNumber(metrics.totalRequests)}
                change={metrics.totalRequestsChange}
                sparklineSeed={1}
                sparklineColor="#6366F1"
                delay={0}
              />
              <KpiCard
                label="Total Cost"
                value={formatCurrency(metrics.totalCost)}
                change={metrics.totalCostChange}
                sparklineSeed={2}
                sparklineColor="#F59E0B"
                delay={60}
              />
              <KpiCard
                label="Avg Latency"
                value={formatLatency(metrics.avgLatency)}
                change={metrics.avgLatencyChange}
                sparklineSeed={3}
                sparklineColor="#22D3EE"
                invertTrend
                delay={120}
              />
              <KpiCard
                label="Error Rate"
                value={formatPercent(metrics.errorRate)}
                change={metrics.errorRateChange}
                sparklineSeed={4}
                sparklineColor="#EF4444"
                invertTrend
                delay={180}
              />
              <KpiCard
                label="Tokens Used"
                value={formatTokens(metrics.tokensUsed)}
                change={metrics.tokensUsedChange}
                sparklineSeed={5}
                sparklineColor="#10B981"
                delay={240}
              />
            </>
          )}
        </div>

        {/* ── Cost Charts Row ────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
          {loading || costTs.length === 0 ? (
            <>
              <SkeletonCard height={320} />
              <SkeletonCard height={320} />
            </>
          ) : (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <CostOverTimeChart data={costTs} />
              </div>
              <CostByModelDonut data={models} total={totalModelCost} />
            </>
          )}
        </div>

        {/* ── Charts Row 2 ──────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {loading || models.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} height={260} />)
          ) : (
            <>
              <LatencyPercentilesChart data={models} />
              <TokenUsageChart data={tokenTs} />
              {budget && <BudgetUsageCard data={budget} />}
            </>
          )}
        </div>

        {/* ── Bottom Row: Traces + Alerts ──────────────────────── */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div
            className="card"
            style={{ flex: 1, minWidth: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                Recent Traces
              </h3>
              <a
                href="/traces"
                style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
              >
                View all →
              </a>
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 36, borderRadius: 6 }} />
                ))}
              </div>
            ) : (
              <RecentTracesTable traces={traces} />
            )}
          </div>

          <div style={{ width: 340, flexShrink: 0 }}>
            {loading ? (
              <SkeletonCard height={360} />
            ) : (
              <ActiveAlertsPanel alerts={alerts} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
