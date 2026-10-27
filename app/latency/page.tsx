"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SkeletonCard } from "@/components/cards/Card";
import { LatencyPercentilesChart } from "@/components/charts/LatencyPercentilesChart";
import { getModelBreakdown } from "@/lib/api";
import type { ModelBreakdown } from "@/types";
import { formatLatency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function LatencyPage() {
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelBreakdown().then((m) => { setModels(m); setLoading(false); });
  }, []);

  const dist = [
    { bucket: "<200ms", count: 12400 }, { bucket: "200-500ms", count: 38200 },
    { bucket: "500-1s", count: 52100 }, { bucket: "1-2s", count: 31800 },
    { bucket: "2-5s", count: 8900 }, { bucket: ">5s", count: 1200 },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Overall p50", value: "490ms", color: "var(--success)" },
            { label: "Overall p95", value: "1,840ms", color: "var(--warning)" },
            { label: "Overall p99", value: "2,890ms", color: "var(--error)" },
            { label: "Timeout Rate", value: "0.8%", color: "var(--text-primary)" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.03em" }}>{value}</div>
            </Card>
          ))}
        </div>

        {loading ? (
          <SkeletonCard height={260} />
        ) : (
          <LatencyPercentilesChart data={models} />
        )}

        {/* Latency distribution */}
        <Card>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Latency Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dist} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Per model table */}
        <Card>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            Per-Model Latency Breakdown
          </h3>
          <table className="tl-table">
            <thead>
              <tr>
                <th>Model</th>
                <th style={{ textAlign: "right" }}>p50</th>
                <th style={{ textAlign: "right" }}>p95</th>
                <th style={{ textAlign: "right" }}>p99</th>
                <th style={{ textAlign: "right" }}>SLA Compliance</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.model}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, display: "inline-block" }} />
                      <span style={{ fontWeight: 600 }}>{m.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>{formatLatency(m.avgLatencyP50)}</td>
                  <td style={{ textAlign: "right", color: m.avgLatencyP95 > 2000 ? "var(--warning)" : "var(--text-primary)" }}>{formatLatency(m.avgLatencyP95)}</td>
                  <td style={{ textAlign: "right", color: m.avgLatencyP99 > 3000 ? "var(--error)" : "var(--text-primary)" }}>{formatLatency(m.avgLatencyP99)}</td>
                  <td style={{ textAlign: "right" }}>
                    {m.avgLatencyP95 < 2000 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "var(--success)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>In SLA</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: "rgba(245, 158, 11, 0.12)",
                          color: "var(--warning)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <AlertTriangle size={12} />
                        <span>At Risk</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
