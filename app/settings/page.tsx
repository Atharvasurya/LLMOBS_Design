"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, SkeletonCard } from "@/components/cards/Card";
import { getApiKeys, getTeamMembers, getBudgetInfo } from "@/lib/api";
import type { ApiKey, TeamMember, BudgetInfo } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Key,
  Users,
  DollarSign,
  BellRing,
  Copy,
  Check,
  Plus,
  Trash2,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [budget, setBudget] = useState<BudgetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(2500);
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [autoKillOnOverspend, setAutoKillOnOverspend] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/XXXXX");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getApiKeys(), getTeamMembers(), getBudgetInfo()]).then(
      ([keys, members, b]) => {
        setApiKeys(keys);
        setTeam(members);
        setBudget(b);
        if (b) {
          setMonthlyLimit(b.limit);
        }
        setLoading(false);
      }
    );
  }, []);

  const handleCopy = (id: string, keyVal: string) => {
    navigator.clipboard?.writeText(keyVal);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkeletonCard height={200} />
          <SkeletonCard height={220} />
          <SkeletonCard height={180} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100 }}>
        {/* Section 1: API Keys */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(99, 102, 241, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-primary)",
                }}
              >
                <Key size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  API Keys
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Authenticate requests from your SDK or FastAPI client
                </p>
              </div>
            </div>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary)",
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              <span>Generate Key</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {apiKeys.map((k) => (
              <div
                key={k.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {k.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginTop: 3,
                    }}
                  >
                    {k.key}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "right" }}>
                    <div>Created {k.createdAt}</div>
                    <div>Last used {k.lastUsed}</div>
                  </div>

                  <button
                    onClick={() => handleCopy(k.id, k.key)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: copiedKey === k.id ? "var(--success)" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                    }}
                    title="Copy API Key"
                  >
                    {copiedKey === k.id ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedKey === k.id ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    style={{
                      padding: "6px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "transparent",
                      color: "var(--error)",
                      cursor: "pointer",
                      opacity: 0.7,
                    }}
                    title="Revoke Key"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 2: Team Members */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(34, 211, 238, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-secondary)",
                }}
              >
                <Users size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  Team & Access Control
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Manage team members, roles and permissions
                </p>
              </div>
            </div>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary)",
                border: "none",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              <span>Invite Member</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {team.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {m.avatarInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                      {m.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      padding: "3px 8px",
                      borderRadius: "var(--radius-sm)",
                      background:
                        m.role === "admin"
                          ? "rgba(99, 102, 241, 0.15)"
                          : "rgba(255, 255, 255, 0.05)",
                      color:
                        m.role === "admin"
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Budget Limits & Safeguards */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(16, 185, 129, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--success)",
                }}
              >
                <DollarSign size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  Budget Limits & Overspend Safeguards
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Set maximum monthly ceiling and notification triggers
                </p>
              </div>
            </div>

            {savedSuccess && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--success)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} />
                <span>Saved successfully!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveBudget} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Monthly Spend Ceiling (USD)
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                  }}
                >
                  <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>$</span>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      width: "100%",
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Warning Alert Threshold (%)
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      width: "100%",
                      fontWeight: 600,
                    }}
                  />
                  <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>%</span>
                </div>
              </div>
            </div>

            {/* Checkbox toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  Auto-throttle non-critical traffic on 100% budget breach
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
                  Falls back to low-cost models (Llama 3.1) or returns cached responses
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAutoKillOnOverspend(!autoKillOnOverspend)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  background: autoKillOnOverspend ? "var(--accent-primary)" : "rgba(255,255,255,0.1)",
                  border: "none",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: autoKillOnOverspend ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-primary)",
                  border: "none",
                  color: "white",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Save size={14} />
                <span>Save Budget Settings</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Section 4: Webhook Integrations */}
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(245, 158, 11, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--warning)",
                }}
              >
                <BellRing size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  Notification Channels & Webhooks
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  Receive real-time alerts on Slack or PagerDuty
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              Slack Incoming Webhook URL
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
              }}
            >
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  color: "var(--text-primary)",
                  fontSize: 12.5,
                  fontFamily: "var(--font-mono, monospace)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                style={{
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Test Webhook
              </button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
