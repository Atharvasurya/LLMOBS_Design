"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatusBadge, ModelBadge, SkeletonCard, EmptyState } from "@/components/cards/Card";
import { getTraceById } from "@/lib/api";
import { MODEL_COLORS } from "@/lib/mock/data";
import type { Trace, TraceStep } from "@/types";
import { formatDateTime, formatCurrency, formatLatency, formatTokens } from "@/lib/utils";
import { ArrowLeft, Clock, Coins, Hash, Layers, Search } from "lucide-react";
import Link from "next/link";

const STEP_TYPE_COLORS: Record<string, string> = {
  retrieval: "#22D3EE",
  llm_call: "#6366F1",
  tool_call: "#F59E0B",
  embedding: "#10B981",
};

const STEP_TYPE_LABELS: Record<string, string> = {
  retrieval: "Retrieval",
  llm_call: "LLM Call",
  tool_call: "Tool Call",
  embedding: "Embedding",
};

function WaterfallStep({ step, totalMs }: { step: TraceStep; totalMs: number }) {
  const leftPct = (step.startMs / totalMs) * 100;
  const widthPct = Math.max((step.durationMs / totalMs) * 100, 2);
  const color = STEP_TYPE_COLORS[step.type] || "#6366F1";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 130, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
          {step.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          {STEP_TYPE_LABELS[step.type]}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", height: 28, background: "var(--bg-surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            opacity: 0.85,
            display: "flex",
            alignItems: "center",
            paddingLeft: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "white", fontWeight: 600, whiteSpace: "nowrap" }}>
            {formatLatency(step.durationMs)}
          </span>
        </div>
      </div>
      <div style={{ width: 80, flexShrink: 0, textAlign: "right" }}>
        <StatusBadge status={step.status} />
      </div>
    </div>
  );
}

function TraceDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trace, setTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTraceById(params.id).then((t) => {
      setTrace(t);
      setLoading(false);
    });
  }, [params.id]);

  if (!loading && !trace) {
    return (
      <DashboardLayout>
        <EmptyState title="Trace not found" description={`No trace found with ID: ${params.id}`} icon={<Search size={20} />} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1200 }}>
        {/* Back link */}
        <Link
          href="/traces"
          style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back to Traces
        </Link>

        {loading ? (
          <SkeletonCard height={400} />
        ) : trace ? (
          <>
            {/* Header */}
            <Card>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#818cf8" }}>{trace.id}</span>
                    <StatusBadge status={trace.status} />
                    <ModelBadge model={trace.model} label={trace.modelLabel} color={MODEL_COLORS[trace.model]} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {formatDateTime(trace.timestamp)} · {trace.project} · {trace.environment}
                  </div>
                </div>
              </div>
              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                {[
                  { icon: Clock, label: "Latency", value: formatLatency(trace.latencyMs), color: trace.latencyMs > 2000 ? "var(--error)" : "var(--text-primary)" },
                  { icon: Coins, label: "Cost", value: formatCurrency(trace.cost), color: "var(--text-primary)" },
                  { icon: Hash, label: "Tokens", value: formatTokens(trace.tokensTotal), color: "var(--text-primary)" },
                  { icon: Layers, label: "Steps", value: `${trace.steps.length}`, color: "var(--text-primary)" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: "var(--accent-indigo)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Waterfall */}
            <Card>
              <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                Execution Timeline
              </h3>
              {trace.steps.map((step) => (
                <WaterfallStep key={step.id} step={step} totalMs={trace.latencyMs} />
              ))}
            </Card>

            {/* Token breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                  Token Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Input Tokens", value: trace.tokensInput, pct: (trace.tokensInput / trace.tokensTotal) * 100, color: "#22D3EE" },
                    { label: "Output Tokens", value: trace.tokensOutput, pct: (trace.tokensOutput / trace.tokensTotal) * 100, color: "#6366F1" },
                  ].map(({ label, value, pct, color }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {formatTokens(value)} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                    Total: <strong style={{ color: "var(--text-primary)" }}>{formatTokens(trace.tokensTotal)}</strong>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
                  Cost Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Input cost</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency((trace.tokensInput / 1000) * 0.005)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Output cost</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency((trace.tokensOutput / 1000) * 0.015)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                    <span>Total</span>
                    <span style={{ color: "#818cf8" }}>{formatCurrency(trace.cost)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Prompt / Response */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Prompt", content: trace.promptFull },
                { label: "Response", content: trace.response },
              ].map(({ label, content }) => (
                <Card key={label}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>{label}</h3>
                  <div
                    style={{
                      background: "var(--bg-surface-2)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px",
                      fontSize: 12.5,
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                      maxHeight: 200,
                      overflowY: "auto",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {content}
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

export default function TraceDetailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: 20 }}>
          <SkeletonCard height={400} />
        </div>
      }
    >
      <TraceDetailContent />
    </Suspense>
  );
}
