"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/cards/Card";
import { formatCurrency, formatLatency, formatNumber } from "@/lib/utils";
import {
  MessageSquare,
  Sparkles,
  Play,
  Copy,
  Check,
  Search,
  Code,
  Tag,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";

interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  category: "chat" | "rag" | "extraction" | "summarization";
  model: string;
  invocations: number;
  avgLatency: number;
  avgCost: number;
  template: string;
  variables: string[];
}

const MOCK_PROMPTS: PromptTemplate[] = [
  {
    id: "p-01",
    name: "Customer Support RAG Agent",
    version: "v2.4",
    category: "rag",
    model: "GPT-4o",
    invocations: 482100,
    avgLatency: 780,
    avgCost: 0.0034,
    template: `You are an AI customer support specialist for Acme SaaS.
Use the following retrieved knowledge context to assist the user:

Context:
{{knowledge_context}}

User question:
{{user_query}}

Guidelines:
- Maintain a courteous and empathetic tone.
- If the context doesn't contain the answer, escalate to human support.`,
    variables: ["knowledge_context", "user_query"],
  },
  {
    id: "p-02",
    name: "Doc Extraction & JSON Normalizer",
    version: "v3.1",
    category: "extraction",
    model: "Claude 3.5",
    invocations: 310500,
    avgLatency: 1120,
    avgCost: 0.0058,
    template: `Extract key financial entities, invoice numbers, total amounts, and tax codes from the raw invoice text.
Return ONLY valid JSON matching this schema:
{
  "invoice_id": string,
  "vendor": string,
  "line_items": [{ "description": string, "amount": number }],
  "total": number
}

Raw invoice:
{{raw_document_text}}`,
    variables: ["raw_document_text"],
  },
  {
    id: "p-03",
    name: "Code Review & Security Auditor",
    version: "v1.2",
    category: "code" as any,
    model: "GPT-4o",
    invocations: 125400,
    avgLatency: 1450,
    avgCost: 0.0082,
    template: `Analyze the following diff for SQL injection, auth vulnerabilities, and unhandled promises.

Language: {{code_language}}
Diff:
{{git_diff}}

Provide high-priority remediations first.`,
    variables: ["code_language", "git_diff"],
  },
  {
    id: "p-04",
    name: "Executive Summarizer",
    version: "v1.0",
    category: "summarization",
    model: "Gemini Pro",
    invocations: 94000,
    avgLatency: 490,
    avgCost: 0.0011,
    template: `Summarize the meeting transcript below into 3 core bullet decisions and 2 action items with assigned owners.

Transcript:
{{meeting_transcript}}`,
    variables: ["meeting_transcript"],
  },
];

export default function PromptsPage() {
  const [prompts] = useState<PromptTemplate[]>(MOCK_PROMPTS);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(MOCK_PROMPTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  const filtered = prompts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.template.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedPrompt.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPlayground = () => {
    setRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      setRunningTest(false);
      setTestResult(
        `[Simulation OK] Status 200\nTokens: 384 input, 92 output\nLatency: 640ms\nCost: $0.0018\n\nOutput:\nHello! I reviewed your account information based on the retrieved knowledge context. Your subscription is active, and your renewal date is November 15th.`
      );
    }, 800);
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header KPI cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <Card>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Managed Prompts</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
              {prompts.length} templates
            </div>
            <div style={{ fontSize: 11, color: "var(--success)", marginTop: 4 }}>
              4 active in production
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Total Prompt Invocations</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent-primary)", marginTop: 4 }}>
              1.01M
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Last 30 days
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Avg Prompt Latency</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent-secondary)", marginTop: 4 }}>
              960 ms
            </div>
            <div style={{ fontSize: 11, color: "var(--success)", marginTop: 4 }}>
              -12% vs previous versions
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Avg Cost per Call</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--warning)", marginTop: 4 }}>
              $0.0046
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Optimized via token caching
            </div>
          </Card>
        </div>

        {/* 2-Column Layout: Prompt List (Left) + Detail / Playground (Right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* List */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Search size={14} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 12.5,
                  width: "100%",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtered.map((p) => {
                const isSelected = selectedPrompt.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPrompt(p);
                      setTestResult(null);
                    }}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      background: isSelected ? "rgba(99, 102, 241, 0.1)" : "transparent",
                      border: "none",
                      borderLeft: isSelected ? "3px solid var(--accent-primary)" : "3px solid transparent",
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          {p.version}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                          marginTop: 4,
                          display: "flex",
                          gap: 10,
                        }}
                      >
                        <span>{p.model}</span>
                        <span>•</span>
                        <span>{formatNumber(p.invocations)} calls</span>
                        <span>•</span>
                        <span>{formatLatency(p.avgLatency)}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-tertiary)" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Prompt Viewer & Playground */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {selectedPrompt.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 7px",
                        borderRadius: 99,
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "var(--accent-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {selectedPrompt.version}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                    Model: <strong>{selectedPrompt.model}</strong> • Avg Cost: <strong>${selectedPrompt.avgCost.toFixed(4)}</strong>/req
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface-2)",
                      color: copied ? "var(--success)" : "var(--text-secondary)",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy Template"}</span>
                  </button>

                  <button
                    onClick={handleRunPlayground}
                    disabled={runningTest}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "none",
                      background: "var(--accent-primary)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: runningTest ? "not-allowed" : "pointer",
                      opacity: runningTest ? 0.7 : 1,
                    }}
                  >
                    <Play size={14} />
                    <span>{runningTest ? "Running..." : "Test in Playground"}</span>
                  </button>
                </div>
              </div>

              {/* Template Content */}
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Code size={14} />
                  <span>Prompt Template</span>
                </div>
                <pre
                  style={{
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 12,
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {selectedPrompt.template}
                </pre>
              </div>

              {/* Variables */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 6 }}>
                  Interpolated Variables:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selectedPrompt.variables.map((v) => (
                    <span
                      key={v}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: "rgba(34, 211, 238, 0.1)",
                        border: "1px solid rgba(34, 211, 238, 0.2)",
                        color: "var(--accent-secondary)",
                        fontSize: 11,
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                    >
                      {"{{"} {v} {"}}"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Simulated Test Output */}
              {testResult && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--success)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Simulated Execution Response</span>
                  </div>
                  <pre
                    style={{
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: 11.5,
                      color: "var(--text-primary)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {testResult}
                  </pre>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
