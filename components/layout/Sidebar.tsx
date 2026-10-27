"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Cpu,
  DollarSign,
  Timer,
  MessageSquare,
  Bell,
  Settings,
  Hexagon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/traces", label: "Traces", icon: GitBranch },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/cost", label: "Cost Analytics", icon: DollarSign },
  { href: "/latency", label: "Latency", icon: Timer },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
  { href: "/alerts", label: "Alerts", icon: Bell },
] as const;

const BOTTOM_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "68px" : "220px",
        minWidth: collapsed ? "68px" : "220px",
        background: "var(--bg-surface-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 0.2s ease, min-width 0.2s ease",
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 18px" : "0 16px",
          borderBottom: "1px solid var(--border)",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #6366F1, #4f46e5)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 12px rgba(99,102,241,0.4)",
          }}
        >
          <Hexagon size={16} color="white" fill="rgba(255,255,255,0.2)" />
        </div>
        {!collapsed && (
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            TraceLens
          </span>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", active && "active")}
              title={collapsed ? label : undefined}
              style={{ justifyContent: collapsed ? "center" : undefined }}
            >
              <Icon size={17} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          padding: "8px 8px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", active && "active")}
              title={collapsed ? label : undefined}
              style={{ justifyContent: collapsed ? "center" : undefined }}
            >
              <Icon size={17} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "8px 0" : "8px 10px",
            marginTop: 4,
            justifyContent: collapsed ? "center" : undefined,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            AT
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                Atharva
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Admin</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            fontSize: 12,
            transition: "all 0.15s ease",
            marginTop: 4,
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
