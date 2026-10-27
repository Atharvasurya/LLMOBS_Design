"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader } from "@/components/cards/Card";
import type { TokenTimeseriesPoint } from "@/types";
import { format } from "date-fns";

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
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            <span style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 12 }}>
              {p.name} Tokens
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {(p.value / 1_000_000).toFixed(1)}M
          </span>
        </div>
      ))}
    </div>
  );
}

interface TokenUsageChartProps {
  data: TokenTimeseriesPoint[];
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: (() => {
      try {
        return format(new Date(d.date), "MMM d");
      } catch {
        return d.date;
      }
    })(),
  }));

  return (
    <Card>
      <CardHeader
        title="Token Usage"
        subtitle="Input vs output tokens"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { key: "input", label: "Input", color: "#22D3EE" },
              { key: "output", label: "Output", color: "#6366F1" },
            ].map((item) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: item.color, display: "inline-block" }} />
                <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        }
      />
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={formatted} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="input"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="output"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
