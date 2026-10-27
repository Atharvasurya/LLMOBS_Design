"use client";
import { cn } from "@/lib/utils";
import { MODEL_LABELS, MODEL_COLORS } from "@/lib/mock/data";
import type { ModelId } from "@/types";
import { Inbox } from "lucide-react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function Card({ children, className, glowColor, style, ...props }: CardProps) {
  return (
    <div
      className={cn("card animate-fade-in-up", className)}
      style={{
        ...(glowColor ? { boxShadow: `0 0 20px ${glowColor}` } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "1rem",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function SkeletonCard({ height = 160 }: { height?: number }) {
  return (
    <div
      className="card"
      style={{ height, display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 32, width: "60%", borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 10, width: "30%", borderRadius: 6 }} />
    </div>
  );
}

export function EmptyState({
  title = "No data",
  description = "No data available for the selected filters.",
  icon,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 12,
        color: "var(--text-tertiary)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
        }}
      >
        {icon || <Inbox size={22} />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{title}</div>
      <div style={{ fontSize: 12.5, textAlign: "center", maxWidth: 280, color: "var(--text-tertiary)" }}>
        {description}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: "success" | "error" | "timeout" | "warning" | "critical" | "info" }) {
  const MAP = {
    success: { label: "Success", cls: "badge-success" },
    error: { label: "Error", cls: "badge-error" },
    timeout: { label: "Timeout", cls: "badge-warning" },
    warning: { label: "Warning", cls: "badge-warning" },
    critical: { label: "Critical", cls: "badge-critical" },
    info: { label: "Info", cls: "badge-info" },
  };
  const { label, cls } = MAP[status];
  return (
    <span
      className={cls}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 99,
        letterSpacing: "0.03em",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
}

export function ModelBadge({
  model,
  label,
  color,
}: {
  model: string;
  label?: string;
  color?: string;
}) {
  const displayLabel = label || MODEL_LABELS[model as ModelId] || model;
  const displayColor = color || MODEL_COLORS[model as ModelId] || "#6366F1";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11.5,
        fontWeight: 500,
        color: "var(--text-secondary)",
        background: "var(--bg-surface-2)",
        border: "1px solid var(--border)",
        padding: "2px 8px",
        borderRadius: 6,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: displayColor, flexShrink: 0 }} />
      {displayLabel}
    </span>
  );
}
