"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader } from "@/components/cards/Card";
import { MODEL_COLORS, MODEL_LABELS } from "@/lib/mock/data";
import type { ModelTimeseriesPoint, ModelId } from "@/types";
import { format } from "date-fns";

const MODELS: ModelId[] = ["gpt-4o", "claude-3-5", "gemini-pro", "llama-3.1"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 600 }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            fontSize: 12.5,
            marginBottom: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            <span style={{ color: "var(--text-secondary)" }}>
              {MODEL_LABELS[p.name as ModelId] || p.name}
            </span>
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            ${p.value?.toFixed(2)}
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          marginTop: 6,
          paddingTop: 6,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

interface CostChartProps {
  data: ModelTimeseriesPoint[];
}

export function CostOverTimeChart({ data }: CostChartProps) {
  const formattedData = data.map((d) => ({
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
    <Card style={{ flex: 1 }}>
      <CardHeader
        title="Cost Over Time"
        subtitle="Daily spend by model"
        action={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {MODELS.map((m) => (
              <div
                key={m}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 3,
                    borderRadius: 2,
                    background: MODEL_COLORS[m],
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>{MODEL_LABELS[m]}</span>
              </div>
            ))}
          </div>
        }
      />
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            {MODELS.map((m) => (
              <linearGradient key={m} id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={MODEL_COLORS[m]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={MODEL_COLORS[m]} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
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
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {MODELS.map((m) => (
            <Area
              key={m}
              type="monotone"
              dataKey={m}
              stroke={MODEL_COLORS[m]}
              strokeWidth={2}
              fill={`url(#grad-${m})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
