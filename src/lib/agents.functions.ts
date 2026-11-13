import { createServerFn } from "@tanstack/react-start";
import { ALL_AGENT_IDS, type AgentId } from "./agents";
import {
  planMissionCore,
  runAgentCore,
  synthesizeCore,
  executeMissionCore,
  type MissionPlan,
  type AgentRunResult,
} from "./orchestrator/supervisor";
import type { StrategicReport } from "./orchestrator/types";

export type { MissionPlan, AgentRunResult };

export const planMission = createServerFn({ method: "POST" })
  .inputValidator((data: { goal: string }) => {
    if (!data?.goal || typeof data.goal !== "string") throw new Error("goal required");
    return { goal: data.goal.slice(0, 2000) };
  })
  .handler(async ({ data }): Promise<MissionPlan> => planMissionCore(data.goal));

export const runAgent = createServerFn({ method: "POST" })
  .inputValidator((data: { agent: AgentId; goal: string; task: string }) => {
    if (!ALL_AGENT_IDS.includes(data.agent)) throw new Error("invalid agent");
    return {
      agent: data.agent,
      goal: String(data.goal).slice(0, 2000),
      task: String(data.task).slice(0, 1000),
    };
  })
  .handler(async ({ data }): Promise<AgentRunResult> =>
    runAgentCore(data.agent, data.goal, data.task),
  );

export const synthesize = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { goal: string; results: Array<{ agent: AgentId; output: string }> }) => ({
      goal: String(data.goal).slice(0, 2000),
      results: (data.results || []).slice(0, 6).map((r) => ({
        agent: r.agent,
        output: String(r.output).slice(0, 6000),
      })),
    }),
  )
  .handler(
    async ({ data }): Promise<{ summary: string; report: StrategicReport }> =>
      synthesizeCore(data.goal, data.results),
  );

/** Server-side end-to-end mission execution (resilient orchestration). */
export const executeMission = createServerFn({ method: "POST" })
  .inputValidator((data: { goal: string; missionId: string }) => {
    if (!data?.goal || !data?.missionId) throw new Error("goal and missionId required");
    return { goal: data.goal.slice(0, 2000), missionId: data.missionId };
  })
  .handler(async ({ data }) => executeMissionCore(data.goal));
