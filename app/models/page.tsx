"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SkeletonCard } from "@/components/cards/Card";
import { getModelBreakdown } from "@/lib/api";
import type { ModelBreakdown } from "@/types";
import { formatCurrency, formatLatency, formatPercent, formatNumber } from "@/lib/utils";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

export default function ModelsPage() {
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelBreakdown().then((m) => { setModels(m); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height={220} />)}
        </div>
      </DashboardLayout>
    );
  }

  const comparisonData = models.map((m) => ({
    name: m.label,
    "Cost/1K Tokens": m.costPer1kTokens * 1000,
    "Avg p50 (s)": m.avgLatencyP50 / 1000,
    "Error Rate %": m.errorRate,
    "Usage Share %": m.percentage,
  }));

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Model cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {models.map((m) => (
            <Card key={m.model} style={{ borderLeft: `3px solid ${m.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: `${m.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{m.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{m.percentage}% usage share</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { label: "30d Cost", value: formatCurrency(m.cost) },
                  { label: "Cost/1K tkn", value: `$${(m.costPer1kTokens * 1000).toFixed(4)}` },
                  { label: "Requests", value: formatNumber(m.requests) },
                  { label: "p50 Latency", value: formatLatency(m.avgLatencyP50) },
                  { label: "p95 Latency", value: formatLatency(m.avgLatencyP95) },
                  { label: "Error Rate", value: formatPercent(m.errorRate), danger: m.errorRate > 2 },
                ].map(({ label, value, danger }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: danger ? "var(--error)" : "var(--text-primary)" }}>{value}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Model Comparison
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th style={{ textAlign: "right" }}>30d Cost</th>
                  <th style={{ textAlign: "right" }}>Cost / 1K Tokens</th>
                  <th style={{ textAlign: "right" }}>Requests</th>
                  <th style={{ textAlign: "right" }}>p50 Latency</th>
                  <th style={{ textAlign: "right" }}>p95 Latency</th>
                  <th style={{ textAlign: "right" }}>Error Rate</th>
                  <th style={{ textAlign: "right" }}>Usage Share</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: m.color, display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{m.label}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(m.cost)}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>${(m.costPer1kTokens * 1000).toFixed(4)}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatNumber(m.requests)}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatLatency(m.avgLatencyP50)}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: m.avgLatencyP95 > 2000 ? "var(--warning)" : "var(--text-primary)" }}>
                      {formatLatency(m.avgLatencyP95)}
                    </td>
                    <td style={{ textAlign: "right", color: m.errorRate > 2 ? "var(--error)" : "var(--success)", fontWeight: 600 }}>
                      {formatPercent(m.errorRate)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${m.percentage}%`, background: m.color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{m.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cost comparison bar chart */}
        <Card>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Cost per 1K Tokens (USD)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={models} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(3)}`} />
              <Tooltip
                contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(v: any) => [`$${(Number(v || 0) * 1000).toFixed(4)}`, "Cost/1K tokens"]}
              />
              <Bar dataKey="costPer1kTokens" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {models.map((m) => (
                  <Cell key={m.model} fill={m.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
