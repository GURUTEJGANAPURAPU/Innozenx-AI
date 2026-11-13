/**
 * Supervisor orchestration — core business logic shared by server functions.
 */

import { groqChat } from "../groq.server";
import { ALL_AGENT_IDS, AGENTS, type AgentId } from "../agents";
import { runAgentTools } from "../agents/tools/agent-tools";
import {
  formatStrategicReportMarkdown,
  parseStrategicReport,
  type StrategicReport,
} from "./types";

export type MissionPlan = {
  objective: string;
  reasoning: string;
  subtasks: Array<{ agent: AgentId; task: string }>;
};

export type AgentRunResult = {
  agent: AgentId;
  output: string;
  sources: string[];
  progressLog: string[];
};

const PLANNER_SYSTEM = `You are the Supervisor of INNOZENX AI, an elite multi-agent operating system.
Tagline: Assemble. Analyze. Achieve.

Available specialist agents:
${ALL_AGENT_IDS.map((id) => `- ${id}: ${AGENTS[id].tagline} (${AGENTS[id].capabilities.join(", ")})`).join("\n")}

Given a user goal, decompose it into 2-5 concrete subtasks and assign each to the SINGLE best agent.
For startup/launch goals, prefer assembling: research, startup, finance, and coding agents.
Respond ONLY as strict JSON with this shape:
{
  "objective": "<one sentence restating the goal>",
  "reasoning": "<2 sentences on why these agents were assembled>",
  "subtasks": [{ "agent": "<one of: ${ALL_AGENT_IDS.join("|")}>", "task": "<crisp directive for that agent>" }]
}`;

const AGENT_SYSTEMS: Record<AgentId, string> = {
  research: `You are the Research Agent of INNOZENX AI. Deliver rigorous, source-aware analysis using the LIVE WEB DATA provided.
Use markdown with sections: Snapshot, Key Findings (bullet, numbered), Competitive Landscape, Trends, Risks, Notable Sources (cite URLs from data).
Be specific; avoid filler. If live data is unavailable, state assumptions clearly.`,
  finance: `You are the Finance Agent of INNOZENX AI. Deliver analyst-grade output using LIVE MARKET DATA when provided.
Sections: Snapshot, Fundamentals, Recent Catalysts, Valuation View, Risk Factors, Position Sizing Suggestion.
Cite concrete metrics from the data. If no live data, provide framework-based analysis with clear assumptions.`,
  startup: `You are the Startup Agent of INNOZENX AI. Sections: Problem & Insight, Business Model, ICP & Market Sizing (TAM/SAM/SOM rough), MVP Scope, GTM Plan, 12-Month Milestones, Investor One-Liner.`,
  coding: `You are the Coding Agent of INNOZENX AI. Sections: Recommended Stack (with rationale), High-Level Architecture (ASCII or bullets), Key Modules, Implementation Steps, Open-Source References, Pitfalls.`,
  career: `You are the Career Agent of INNOZENX AI. Sections: Profile Read, Strengths, Gaps, ATS Optimization Tips, 90-Day Roadmap, Sample Interview Questions with Approach.`,
};

const SYNTHESIS_SYSTEM = `You are the Supervisor of INNOZENX AI delivering the FINAL STRATEGIC REPORT.
Tagline: Assemble. Analyze. Achieve.

Synthesize the agent outputs into a decisive executive briefing.
Respond ONLY as strict JSON with this shape:
{
  "executiveSummary": "<3-4 sentence executive summary>",
  "keyInsights": ["<insight 1>", "<insight 2>", "... up to 5"],
  "recommendations": ["<recommendation 1>", "... up to 5"],
  "risks": ["<risk 1>", "... up to 4"],
  "actionPlan": ["<step 1>", "... numbered 5-7 steps"],
  "nextSteps": ["<immediate next step>", "... up to 4"]
}
Be sharp, opinionated, and actionable.`;

export async function planMissionCore(goal: string): Promise<MissionPlan> {
  const raw = await groqChat(
    [
      { role: "system", content: PLANNER_SYSTEM },
      { role: "user", content: goal },
    ],
    { json: true, temperature: 0.4, maxTokens: 900 },
  );
  let parsed: MissionPlan;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Supervisor returned invalid JSON");
  }
  parsed.subtasks = (parsed.subtasks || [])
    .filter((s) => ALL_AGENT_IDS.includes(s.agent as AgentId))
    .slice(0, 5);
  if (parsed.subtasks.length === 0) {
    parsed.subtasks = [{ agent: "research", task: goal }];
  }
  return parsed;
}

export async function runAgentCore(
  agent: AgentId,
  goal: string,
  task: string,
): Promise<AgentRunResult> {
  const progressLog: string[] = [];
  const toolCtx = await runAgentTools(agent, goal, task, (ev) => {
    progressLog.push(ev.message);
  });

  progressLog.push("Generating analysis with Groq…");

  const userContent = toolCtx.context
    ? `MISSION GOAL: ${goal}\n\nYOUR ASSIGNMENT: ${task}\n\nLIVE DATA:\n${toolCtx.context.slice(0, 12000)}\n\nDeliver in clean markdown. Be concrete and confident. No preamble.`
    : `MISSION GOAL: ${goal}\n\nYOUR ASSIGNMENT: ${task}\n\nDeliver in clean markdown. Be concrete and confident. No preamble.`;

  const output = await groqChat(
    [
      { role: "system", content: AGENT_SYSTEMS[agent] },
      { role: "user", content: userContent },
    ],
    { temperature: 0.7, maxTokens: 2000 },
  );

  return { agent, output, sources: toolCtx.sources, progressLog };
}

export async function synthesizeCore(
  goal: string,
  results: Array<{ agent: AgentId; output: string }>,
): Promise<{ summary: string; report: StrategicReport }> {
  const bundle = results
    .map((r) => `## ${AGENTS[r.agent].name}\n${r.output}`)
    .join("\n\n---\n\n");

  const raw = await groqChat(
    [
      { role: "system", content: SYNTHESIS_SYSTEM },
      { role: "user", content: `GOAL: ${goal}\n\nAGENT OUTPUTS:\n${bundle}` },
    ],
    { json: true, temperature: 0.55, maxTokens: 1600 },
  );

  let report: StrategicReport | null = null;
  try {
    report = parseStrategicReport(JSON.parse(raw));
  } catch {
    /* fall through */
  }
  if (!report) {
    report = {
      executiveSummary: raw.slice(0, 500),
      keyInsights: [],
      recommendations: [],
      risks: [],
      actionPlan: [],
      nextSteps: [],
    };
  }

  return { summary: formatStrategicReportMarkdown(report), report };
}

export async function executeMissionCore(goal: string): Promise<{
  plan: MissionPlan;
  results: AgentRunResult[];
  summary: string;
  report: StrategicReport;
}> {
  const plan = await planMissionCore(goal);

  const results = await Promise.all(
    plan.subtasks.map((s) => runAgentCore(s.agent, goal, s.task)),
  );

  const valid = results.filter((r) => r.output);
  if (valid.length === 0) throw new Error("All agents failed");

  const { summary, report } = await synthesizeCore(
    goal,
    valid.map((r) => ({ agent: r.agent, output: r.output })),
  );

  return { plan, results: valid, summary, report };
}
