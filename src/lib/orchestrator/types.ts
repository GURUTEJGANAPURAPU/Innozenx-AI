/**
 * Centralized multi-agent orchestration types and utilities.
 */

import type { AgentId } from "../agents";
import type { MissionPlan } from "../agents.functions";

export type AgentRunStatus = "idle" | "planning" | "running" | "completed" | "failed";

export type StrategicReport = {
  executiveSummary: string;
  keyInsights: string[];
  recommendations: string[];
  risks: string[];
  actionPlan: string[];
  nextSteps: string[];
};

export type MissionActivityEvent = {
  id: string;
  at: number;
  agent: AgentId | "supervisor";
  kind: "planning" | "running" | "completed" | "failed" | "info";
  message: string;
};

/** Convert legacy status values to the new unified status enum */
export function normalizeAgentStatus(status: string): AgentRunStatus {
  switch (status) {
    case "pending":
      return "idle";
    case "planning":
      return "planning";
    case "running":
      return "running";
    case "done":
    case "completed":
      return "completed";
    case "error":
    case "failed":
      return "failed";
    default:
      return "idle";
  }
}

export function formatStrategicReportMarkdown(report: StrategicReport): string {
  const sections = [
    `## Executive Summary\n\n${report.executiveSummary}`,
    `## Key Insights\n\n${report.keyInsights.map((i) => `- ${i}`).join("\n")}`,
    `## Recommendations\n\n${report.recommendations.map((r) => `- ${r}`).join("\n")}`,
    `## Risks\n\n${report.risks.map((r) => `- ${r}`).join("\n")}`,
    `## Action Plan\n\n${report.actionPlan.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
    `## Next Steps\n\n${report.nextSteps.map((s) => `- ${s}`).join("\n")}`,
  ];
  return sections.join("\n\n");
}

export function parseStrategicReport(raw: unknown): StrategicReport | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  if (!r.executiveSummary) return null;
  return {
    executiveSummary: String(r.executiveSummary),
    keyInsights: arr(r.keyInsights),
    recommendations: arr(r.recommendations),
    risks: arr(r.risks),
    actionPlan: arr(r.actionPlan),
    nextSteps: arr(r.nextSteps),
  };
}

export type OrchestrationPhase = "planning" | "executing" | "synthesizing" | "complete" | "error";

export type OrchestrationState = {
  phase: OrchestrationPhase;
  plan?: MissionPlan;
  progressMessage?: string;
};
