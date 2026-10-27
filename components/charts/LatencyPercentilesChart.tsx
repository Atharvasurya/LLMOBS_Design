"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader } from "@/components/cards/Card";
import type { ModelBreakdown } from "@/types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 8 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 12.5, marginBottom: 4 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block" }} />
            <span style={{ color: "var(--text-secondary)", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>
              {p.name}
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.value}ms</span>
        </div>
      ))}
    </div>
  );
}

interface LatencyChartProps {
  data: ModelBreakdown[];
}

const PERCENTILE_COLORS = {
  p50: "#6366F1",
  p95: "#22D3EE",
  p99: "#F59E0B",
};

export function LatencyPercentilesChart({ data }: LatencyChartProps) {
  const chartData = data.map((m) => ({
    name: m.label,
    p50: m.avgLatencyP50,
    p95: m.avgLatencyP95,
    p99: m.avgLatencyP99,
  }));

  return (
    <Card>
      <CardHeader
        title="Latency Percentiles"
        subtitle="p50 / p95 / p99 by model"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            {(["p50", "p95", "p99"] as const).map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: PERCENTILE_COLORS[p], display: "inline-block" }} />
                <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{p.toUpperCase()}</span>
              </div>
            ))}
          </div>
        }
      />
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="p50" fill={PERCENTILE_COLORS.p50} radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Bar dataKey="p95" fill={PERCENTILE_COLORS.p95} radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Bar dataKey="p99" fill={PERCENTILE_COLORS.p99} radius={[3, 3, 0, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
