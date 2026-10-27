"use client";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Alert } from "@/types";
import { StatusBadge } from "@/components/cards/Card";
import { formatRelativeTime } from "@/lib/utils";
import { MODEL_LABELS } from "@/lib/mock/data";

const SEVERITY_ICONS = {
  critical: { Icon: AlertCircle, color: "var(--error)" },
  warning: { Icon: AlertTriangle, color: "var(--warning)" },
  info: { Icon: Info, color: "var(--info)" },
};

interface ActiveAlertsPanelProps {
  alerts: Alert[];
}

export function ActiveAlertsPanel({ alerts }: ActiveAlertsPanelProps) {
  const active = alerts.filter((a) => !a.acknowledged);

  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 280 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
            Active Alerts
          </h3>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: 99,
              background: "var(--error-bg)",
              color: "var(--error)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            {active.length}
          </span>
        </div>
        <Link
          href="/alerts"
          style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}
        >
          View all →
        </Link>
      </div>

      {/* Alert items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {active.map((alert, idx) => {
          const { Icon, color } = SEVERITY_ICONS[alert.severity] || SEVERITY_ICONS.info;
          return (
            <div
              key={alert.id}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border-subtle)",
                borderLeft: `3px solid ${color}`,
                animation: `fadeInUp 0.3s ease ${idx * 80}ms both`,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface-2)";
              }}
            >
              <Icon
                size={15}
                style={{ color, flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {alert.title}
                  </span>
                  <span
                    className={alert.severity === "critical" ? "badge-critical" : "badge-warning"}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 99,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                    }}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-secondary)",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {alert.description}
                </p>
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <span>{formatRelativeTime(alert.timestamp)}</span>
                  {alert.model && (
                    <>
                      <span>·</span>
                      <span>{MODEL_LABELS[alert.model]}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
