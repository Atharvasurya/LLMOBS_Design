"use client";
import { Bell, Search, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useFiltersStore, DATE_RANGE_PRESETS } from "@/lib/store/filters";
import { ALERTS } from "@/lib/mock/data";
import type { Environment } from "@/types";

const ENVIRONMENTS: Environment[] = ["production", "staging", "development"];
const ENV_COLORS: Record<Environment, string> = {
  production: "#10B981",
  staging: "#F59E0B",
  development: "#6366F1",
};

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { dateRange, environment, setDateRange, setEnvironment } = useFiltersStore();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEnvPicker, setShowEnvPicker] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const unreadAlerts = ALERTS.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg-surface-2)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Page title */}
      <h1
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          flexShrink: 0,
          marginRight: 8,
        }}
      >
        {title}
      </h1>

      {/* Demo badge */}
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 99,
          background: "rgba(99, 102, 241, 0.15)",
          color: "#818cf8",
          border: "1px solid rgba(99,102,241,0.3)",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        DEMO — MOCK DATA
      </span>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, position: "relative" }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-tertiary)",
          }}
        />
        <input
          type="text"
          placeholder="Search traces, models, prompts..."
          style={{
            width: "100%",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "7px 12px 7px 30px",
            fontSize: 13,
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent-indigo)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {/* Date range picker */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowDatePicker(!showDatePicker); setShowEnvPicker(false); setShowAlerts(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
          >
            <span>📅</span>
            <span>{dateRange.label}</span>
            <ChevronDown size={12} />
          </button>
          {showDatePicker && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "6px",
                zIndex: 100,
                minWidth: 180,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {DATE_RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setDateRange(preset); setShowDatePicker(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "7px 12px",
                    textAlign: "left",
                    borderRadius: "var(--radius-sm)",
                    background: dateRange.label === preset.label ? "var(--accent-indigo-glow)" : "transparent",
                    color: dateRange.label === preset.label ? "#818cf8" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Environment dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowEnvPicker(!showEnvPicker); setShowDatePicker(false); setShowAlerts(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: ENV_COLORS[environment],
                display: "inline-block",
                boxShadow: `0 0 6px ${ENV_COLORS[environment]}`,
              }}
            />
            <span style={{ textTransform: "capitalize" }}>{environment}</span>
            <ChevronDown size={12} />
          </button>
          {showEnvPicker && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "6px",
                zIndex: 100,
                minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env}
                  onClick={() => { setEnvironment(env); setShowEnvPicker(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "7px 12px",
                    textAlign: "left",
                    borderRadius: "var(--radius-sm)",
                    background: environment === env ? "var(--accent-indigo-glow)" : "transparent",
                    color: environment === env ? "#818cf8" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: ENV_COLORS[env], display: "inline-block" }} />
                  {env}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Toggle theme"
          aria-label="Toggle light/dark theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowAlerts(!showAlerts); setShowDatePicker(false); setShowEnvPicker(false); }}
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadAlerts > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--error)",
                  border: "1.5px solid var(--bg-surface-2)",
                  animation: "pulse-dot 2s ease infinite",
                }}
              />
            )}
          </button>

          {showAlerts && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "12px",
                zIndex: 100,
                width: 320,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
                Active Alerts ({unreadAlerts})
              </div>
              {ALERTS.filter((a) => !a.acknowledged).slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface-2)",
                    marginBottom: 6,
                    borderLeft: `2px solid ${alert.severity === "critical" ? "var(--error)" : "var(--warning)"}`,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{alert.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>{alert.description.slice(0, 70)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
