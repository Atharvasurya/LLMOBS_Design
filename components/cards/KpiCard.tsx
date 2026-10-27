"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { generateSparkline } from "@/lib/mock/data";

interface KpiCardProps {
  label: string;
  value: string;
  change: number;
  sparklineSeed: number;
  sparklineColor?: string;
  prefix?: string;
  suffix?: string;
  invertTrend?: boolean; // if true, down is good (latency, error rate)
  delay?: number;
}

export function KpiCard({
  label,
  value,
  change,
  sparklineSeed,
  sparklineColor = "#6366F1",
  invertTrend = false,
  delay = 0,
}: KpiCardProps) {
  const [displayed, setDisplayed] = useState("0");
  const sparkData = generateSparkline(sparklineSeed, 7, 20, 100).map((v, i) => ({
    v,
    i,
  }));

  // Animated number counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayed(value);
    }, delay + 50);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const isPositive = change > 0;
  const isGood = invertTrend ? !isPositive : isPositive;
  const trendColor = Math.abs(change) < 0.1
    ? "var(--text-tertiary)"
    : isGood
    ? "var(--success)"
    : "var(--error)";

  const TrendIcon = Math.abs(change) < 0.1 ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className="card animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.4)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
        {/* Mini sparkline */}
        <div style={{ width: 60, height: 28 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparklineColor}
                strokeWidth={1.5}
                dot={false}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Big value */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginTop: 10,
          marginBottom: 8,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {displayed}
      </div>

      {/* Trend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <TrendIcon size={13} style={{ color: trendColor, flexShrink: 0 }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: trendColor,
          }}
        >
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>vs prev 7d</span>
      </div>
    </div>
  );
}
