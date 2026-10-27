"use client";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, SkeletonCard, StatusBadge, ModelBadge, EmptyState } from "@/components/cards/Card";
import { getTraces } from "@/lib/api";
import { MODEL_COLORS } from "@/lib/mock/data";
import type { Trace, ModelId, Status, TraceFilters } from "@/types";
import { formatDateTime, formatCurrency, formatLatency, formatTokens } from "@/lib/utils";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

const MODEL_OPTIONS: { value: ModelId | "all"; label: string }[] = [
  { value: "all", label: "All Models" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-3-5", label: "Claude 3.5" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "llama-3.1", label: "Llama 3.1" },
];

const STATUS_OPTIONS: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
  { value: "timeout", label: "Timeout" },
];

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TraceFilters>({
    page: 1,
    pageSize: 20,
    model: "all",
    status: "all",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  const fetchTraces = useCallback(async () => {
    setLoading(true);
    const res = await getTraces(filters);
    setTraces(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchTraces(); }, [fetchTraces]);

  const totalPages = Math.ceil(total / filters.pageSize);

  function FilterSelect({ value, onChange, options }: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-secondary)",
          fontSize: 12.5,
          padding: "6px 10px",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filters bar */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 16px",
          }}
        >
          <SlidersHorizontal size={15} style={{ color: "var(--text-tertiary)" }} />
          {/* Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Search trace ID or prompt..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
                }
              }}
              style={{
                width: "100%",
                background: "var(--bg-surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "6px 10px 6px 28px",
                fontSize: 12.5,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
          <FilterSelect
            value={filters.model as string}
            onChange={(v) => setFilters((f) => ({ ...f, model: v as ModelId | "all", page: 1 }))}
            options={MODEL_OPTIONS}
          />
          <FilterSelect
            value={filters.status as string}
            onChange={(v) => setFilters((f) => ({ ...f, status: v as Status | "all", page: 1 }))}
            options={STATUS_OPTIONS}
          />
          {(filters.model !== "all" || filters.status !== "all" || filters.search) && (
            <button
              onClick={() => {
                setFilters({ page: 1, pageSize: 20, model: "all", status: "all", search: "" });
                setSearchInput("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--error)",
                background: "var(--error-bg)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              <X size={12} />
              Clear
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-tertiary)" }}>
            {total} traces
          </span>
        </div>

        {/* Table */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 40, borderRadius: 6 }} />
              ))}
            </div>
          ) : traces.length === 0 ? (
            <EmptyState title="No traces found" description="Try adjusting your filters or search query." icon={<Search size={20} />} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="tl-table">
                <thead>
                  <tr>
                    <th>Trace ID</th>
                    <th>Timestamp</th>
                    <th>Model</th>
                    <th>Project</th>
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
                          style={{ color: "#818cf8", fontFamily: "monospace", fontSize: 12, textDecoration: "none", fontWeight: 500 }}
                        >
                          {trace.id}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>
                        {formatDateTime(trace.timestamp)}
                      </td>
                      <td>
                        <ModelBadge model={trace.model} label={trace.modelLabel} color={MODEL_COLORS[trace.model]} />
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{trace.project}</td>
                      <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-secondary)", fontSize: 12.5 }} title={trace.prompt}>
                        {trace.prompt}
                      </td>
                      <td style={{ textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
                        {formatTokens(trace.tokensTotal)}
                      </td>
                      <td style={{ textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums", color: trace.latencyMs > 2000 ? "var(--error)" : trace.latencyMs > 1000 ? "var(--warning)" : "var(--text-primary)" }}>
                        {formatLatency(trace.latencyMs)}
                      </td>
                      <td style={{ textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(trace.cost)}
                      </td>
                      <td><StatusBadge status={trace.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page === 1}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: filters.page === 1 ? "var(--text-muted)" : "var(--text-secondary)",
                cursor: filters.page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12.5,
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page === totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: filters.page === totalPages ? "var(--text-muted)" : "var(--text-secondary)",
                cursor: filters.page === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12.5,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
