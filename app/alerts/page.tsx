"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, SkeletonCard, StatusBadge, ModelBadge } from "@/components/cards/Card";
import { getAlerts, getAlertRules } from "@/lib/api";
import type { Alert, AlertRule, Severity } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Bell,
  Sliders,
  Plus,
  Search,
  Check,
  ShieldAlert,
  Zap,
} from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([getAlerts(), getAlertRules()]).then(([a, r]) => {
      setAlerts(a);
      setRules(r);
      setLoading(false);
    });
  }, []);

  const toggleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} height={100} />
          ))}
        </div>
        <SkeletonCard height={400} />
      </DashboardLayout>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;
  const warningCount = alerts.filter((a) => a.severity === "warning" && !a.acknowledged).length;
  const acknowledgedCount = alerts.filter((a) => a.acknowledged).length;

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === "active" && a.acknowledged) return false;
    if (severityFilter === "acknowledged" && !a.acknowledged) return false;
    if (severityFilter === "critical" && a.severity !== "critical") return false;
    if (severityFilter === "warning" && a.severity !== "warning") return false;
    if (severityFilter === "info" && a.severity !== "info") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.model && a.model.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* KPI Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                  Active Critical
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--error)", marginTop: 4 }}>
                  {criticalCount}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--error)",
                }}
              >
                <AlertTriangle size={18} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                  Active Warnings
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--warning)", marginTop: 4 }}>
                  {warningCount}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(245, 158, 11, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--warning)",
                }}
              >
                <AlertCircle size={18} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                  Acknowledged
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-secondary)", marginTop: 4 }}>
                  {acknowledgedCount}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(100, 116, 139, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                  Active Rules
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent-primary)", marginTop: 4 }}>
                  {rules.filter((r) => r.enabled).length} / {rules.length}
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-primary)",
                }}
              >
                <Sliders size={18} />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid: Alert List + Alert Rules */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Alerts Feed */}
          <Card>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All Alerts" },
                  { id: "active", label: "Active" },
                  { id: "critical", label: "Critical" },
                  { id: "warning", label: "Warning" },
                  { id: "acknowledged", label: "Acknowledged" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSeverityFilter(tab.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor:
                        severityFilter === tab.id
                          ? "var(--accent-primary)"
                          : "var(--border)",
                      background:
                        severityFilter === tab.id
                          ? "rgba(99, 102, 241, 0.15)"
                          : "transparent",
                      color:
                        severityFilter === tab.id
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
              >
                <Search size={14} color="var(--text-tertiary)" />
                <input
                  type="text"
                  placeholder="Filter alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    width: 140,
                  }}
                />
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <ShieldAlert size={36} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
                  No alerts match your filter
                </div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  All systems operating within acceptable thresholds.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredAlerts.map((alert) => {
                  const isCrit = alert.severity === "critical";
                  const isWarn = alert.severity === "warning";
                  const borderColor = isCrit
                    ? "var(--error)"
                    : isWarn
                    ? "var(--warning)"
                    : "var(--accent-secondary)";

                  return (
                    <div
                      key={alert.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-lg)",
                        background: alert.acknowledged
                          ? "rgba(255, 255, 255, 0.02)"
                          : "var(--bg-surface-2)",
                        border: "1px solid var(--border)",
                        borderLeft: `4px solid ${borderColor}`,
                        opacity: alert.acknowledged ? 0.65 : 1,
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          {isCrit ? (
                            <AlertTriangle size={15} color="var(--error)" />
                          ) : isWarn ? (
                            <AlertCircle size={15} color="var(--warning)" />
                          ) : (
                            <Info size={15} color="var(--accent-secondary)" />
                          )}
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {alert.title}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: isCrit
                                ? "rgba(239, 68, 68, 0.15)"
                                : isWarn
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(34, 211, 238, 0.15)",
                              color: isCrit
                                ? "var(--error)"
                                : isWarn
                                ? "var(--warning)"
                                : "var(--accent-secondary)",
                            }}
                          >
                            {alert.severity}
                          </span>
                          {alert.model && <ModelBadge model={alert.model} />}
                        </div>
                        <p
                          style={{
                            fontSize: 12.5,
                            color: "var(--text-secondary)",
                            margin: "4px 0 8px 0",
                            lineHeight: 1.5,
                          }}
                        >
                          {alert.description}
                        </p>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-tertiary)",
                            display: "flex",
                            gap: 12,
                          }}
                        >
                          <span>{formatRelativeTime(alert.timestamp)}</span>
                          <span>•</span>
                          <span>Rule: <code>{alert.rule}</code></span>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => toggleAcknowledge(alert.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: "var(--radius-md)",
                          fontSize: 11.5,
                          fontWeight: 500,
                          cursor: "pointer",
                          border: "1px solid var(--border)",
                          background: alert.acknowledged
                            ? "transparent"
                            : "rgba(99, 102, 241, 0.12)",
                          color: alert.acknowledged
                            ? "var(--text-tertiary)"
                            : "var(--accent-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {alert.acknowledged ? (
                          <>
                            <Check size={13} />
                            <span>Acknowledged</span>
                          </>
                        ) : (
                          <span>Acknowledge</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Alert Rules Panel */}
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Alert Rules
                </h3>
                <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
                  Threshold triggers & SLA policies
                </p>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-primary)",
                  border: "none",
                  color: "white",
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={13} />
                <span>New</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: rule.enabled ? "var(--text-primary)" : "var(--text-tertiary)",
                        }}
                      >
                        {rule.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 5px",
                          borderRadius: 3,
                          background:
                            rule.severity === "critical"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                          color:
                            rule.severity === "critical"
                              ? "var(--error)"
                              : "var(--warning)",
                        }}
                      >
                        {rule.severity}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {rule.metric} &gt; {rule.threshold}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: rule.enabled ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      flexShrink: 0,
                    }}
                    title={rule.enabled ? "Disable rule" : "Enable rule"}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: rule.enabled ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 16,
                padding: "12px",
                borderRadius: "var(--radius-md)",
                background: "rgba(99, 102, 241, 0.05)",
                border: "1px dashed rgba(99, 102, 241, 0.25)",
                fontSize: 11.5,
                color: "var(--text-secondary)",
                display: "flex",
                gap: 8,
              }}
            >
              <Zap size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Webhook integrations</strong>: Alerts can stream to Slack, PagerDuty, or Discord via Webhooks configured in Settings.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
