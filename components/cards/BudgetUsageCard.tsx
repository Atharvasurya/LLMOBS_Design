"use client";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/cards/Card";
import type { BudgetInfo } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetCardProps {
  data: BudgetInfo;
}

export function BudgetUsageCard({ data }: BudgetCardProps) {
  const pct = data.percentageUsed;
  const color =
    pct >= 90 ? "var(--error)" : pct >= 70 ? "var(--warning)" : "var(--success)";

  return (
    <Card>
      <CardHeader title="Budget Usage" subtitle={`Monthly · $${data.limit.toLocaleString()} limit`} />

      {/* Big percentage */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 800,
            color,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct.toFixed(1)}%
        </span>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>used</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 10,
          borderRadius: 99,
          background: "var(--border)",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      {/* Used / Remaining */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <span style={{ color: "var(--text-tertiary)" }}>Used </span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {formatCurrency(data.used)}
          </span>
        </div>
        <div>
          <span style={{ color: "var(--text-tertiary)" }}>Remaining </span>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {formatCurrency(data.limit - data.used)}
          </span>
        </div>
      </div>

      {/* Warning badge */}
      {data.willOverspend && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            background: "var(--warning-bg)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
          }}
        >
          <AlertTriangle size={14} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warning)" }}>
              Projected overspend
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
              At current rate, month-end spend will reach{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {formatCurrency(data.projectedMonthEnd)}
              </strong>{" "}
              — {formatCurrency(data.projectedOverspend)} over budget.
            </div>
          </div>
        </div>
      )}

      {/* Projected value */}
      <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-tertiary)" }}>
        Projected month-end:{" "}
        <span style={{ fontWeight: 600, color: data.willOverspend ? "var(--warning)" : "var(--success)" }}>
          {formatCurrency(data.projectedMonthEnd)}
        </span>
      </div>
    </Card>
  );
}
