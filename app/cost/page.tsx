"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SkeletonCard } from "@/components/cards/Card";
import { BudgetUsageCard } from "@/components/cards/BudgetUsageCard";
import { CostOverTimeChart } from "@/components/charts/CostOverTimeChart";
import { CostByModelDonut } from "@/components/charts/CostByModelDonut";
import { getCostTimeseries, getModelBreakdown, getBudgetInfo } from "@/lib/api";
import type { ModelTimeseriesPoint, ModelBreakdown, BudgetInfo } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, addDays } from "date-fns";

export default function CostPage() {
  const [costTs, setCostTs] = useState<ModelTimeseriesPoint[]>([]);
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [budget, setBudget] = useState<BudgetInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCostTimeseries(30), getModelBreakdown(), getBudgetInfo()]).then(([c, m, b]) => {
      setCostTs(c); setModels(m); setBudget(b); setLoading(false);
    });
  }, []);

  // Generate forecast data (project from day 27 → day 31)
  const dailyAvg = budget ? budget.used / 27 : 70;
  const forecastData = loading ? [] : [
    ...costTs.slice(-5).map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      actual: Object.values(d).filter((v): v is number => typeof v === "number").reduce((s, v) => s + v, 0) - 0,
      forecast: null as number | null,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      date: format(addDays(new Date(), i + 1), "MMM d"),
      actual: null as number | null,
      forecast: dailyAvg * (i + 1) + (budget?.used ?? 0),
    })),
  ];

  const totalCost = models.reduce((s, m) => s + m.cost, 0);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Month-to-Date Spend", value: formatCurrency(budget?.used ?? 0), sub: "27 of 31 days" },
            { label: "Projected Month End", value: formatCurrency(budget?.projectedMonthEnd ?? 0), sub: "at current rate", warn: budget?.willOverspend },
            { label: "30-Day Total", value: formatCurrency(totalCost), sub: "all models combined" },
          ].map(({ label, value, sub, warn }) => (
            <Card key={label}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: warn ? "var(--warning)" : "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{sub}</div>
            </Card>
          ))}
        </div>

        {/* Cost over time + donut */}
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? <SkeletonCard height={280} /> : <CostOverTimeChart data={costTs} />}
          </div>
          {!loading && <CostByModelDonut data={models} total={totalCost} />}
        </div>

        {/* Forecast chart */}
        <Card>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Cost Forecast</h3>
          <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 16 }}>Projected month-end spend based on current daily average</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={forecastData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              {budget && <ReferenceLine y={budget.limit} stroke="var(--error)" strokeDasharray="4 4" label={{ value: "Budget Limit", position: "insideTopRight", fill: "var(--error)", fontSize: 11 }} />}
              <Line type="monotone" dataKey="actual" stroke="#6366F1" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Projected" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[{ color: "#6366F1", label: "Actual spend" }, { color: "#F59E0B", label: "Projected spend", dashed: true }, { color: "var(--error)", label: "Budget limit", dashed: true }].map(({ color, label, dashed }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <span style={{ width: 18, height: 2.5, background: color, borderRadius: 2, display: "inline-block", opacity: dashed ? 0.8 : 1, borderTop: dashed ? "2px dashed " + color : "none" }} />
                <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Budget card */}
        {budget && <BudgetUsageCard data={budget} />}
      </div>
    </DashboardLayout>
  );
}
