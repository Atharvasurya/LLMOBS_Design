"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "@/components/cards/Card";
import type { ModelBreakdown } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ModelBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, display: "inline-block" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>Cost</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(item.cost)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 3 }}>
          <span>Share</span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: ModelBreakdown[];
  total: number;
}

export function CostByModelDonut({ data, total }: DonutChartProps) {
  return (
    <Card style={{ minWidth: 260 }}>
      <CardHeader title="Cost by Model" subtitle="30-day distribution" />
      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="cost"
              animationBegin={200}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.model}
                  fill={entry.color}
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            ${Math.round(total)}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600 }}>TOTAL</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        {data.map((item) => (
          <div
            key={item.model}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: item.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.label}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{item.percentage}%</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {formatCurrency(item.cost)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
