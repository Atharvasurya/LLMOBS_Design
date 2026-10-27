"use client";
import Link from "next/link";
import { StatusBadge, ModelBadge } from "@/components/cards/Card";
import { MODEL_COLORS } from "@/lib/mock/data";
import type { Trace } from "@/types";
import { formatDateTime, formatCurrency, formatLatency, formatTokens } from "@/lib/utils";

interface RecentTracesTableProps {
  traces: Trace[];
}

export function RecentTracesTable({ traces }: RecentTracesTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="tl-table">
        <thead>
          <tr>
            <th>Trace ID</th>
            <th>Timestamp</th>
            <th>Model</th>
            <th>Prompt</th>
            <th style={{ textAlign: "right" }}>Tokens</th>
            <th style={{ textAlign: "right" }}>Latency</th>
            <th style={{ textAlign: "right" }}>Cost</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr key={trace.id}>
              <td>
                <Link
                  href={`/traces/${trace.id}`}
                  style={{
                    color: "#818cf8",
                    fontFamily: "monospace",
                    fontSize: 12,
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  {trace.id}
                </Link>
              </td>
              <td style={{ color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>
                {formatDateTime(trace.timestamp)}
              </td>
              <td>
                <ModelBadge
                  model={trace.model}
                  label={trace.modelLabel}
                  color={MODEL_COLORS[trace.model]}
                />
              </td>
              <td
                style={{
                  maxWidth: 240,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--text-secondary)",
                  fontSize: 12.5,
                }}
                title={trace.prompt}
              >
                {trace.prompt}
              </td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12.5 }}>
                {formatTokens(trace.tokensTotal)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 12.5,
                  color:
                    trace.latencyMs > 2000
                      ? "var(--error)"
                      : trace.latencyMs > 1000
                      ? "var(--warning)"
                      : "var(--text-primary)",
                }}
              >
                {formatLatency(trace.latencyMs)}
              </td>
              <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12.5 }}>
                {formatCurrency(trace.cost)}
              </td>
              <td>
                <StatusBadge status={trace.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
