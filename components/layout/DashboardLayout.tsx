"use client";
import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/traces": "Traces",
  "/models": "Models",
  "/cost": "Cost Analytics",
  "/latency": "Latency",
  "/prompts": "Prompts",
  "/alerts": "Alerts",
  "/settings": "Settings",
};

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const basePath = "/" + (pathname ? pathname.split("/")[1] : "overview");
  const title = PAGE_TITLES[basePath] ?? "TraceLens";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bg-base)",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <TopBar title={title} />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
          }}
          id="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100vh",
            overflow: "hidden",
            background: "var(--bg-base)",
          }}
        >
          <div style={{ flex: 1, padding: "20px" }}>{children}</div>
        </div>
      }
    >
      <LayoutInner>{children}</LayoutInner>
    </Suspense>
  );
}
