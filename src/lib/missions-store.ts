import type { AgentId } from "./agents";
import type { MissionPlan } from "./agents.functions";
import type { AgentRunStatus, MissionActivityEvent, StrategicReport } from "./orchestrator/types";

export type AgentRun = {
  agent: AgentId;
  task: string;
  status: AgentRunStatus;
  output?: string;
  /** Partial output during streaming */
  streamOutput?: string;
  error?: string;
  sources?: string[];
  progressLog?: string[];
  startedAt?: number;
  endedAt?: number;
};

export type Mission = {
  id: string;
  title: string;
  goal: string;
  createdAt: number;
  updatedAt: number;
  plan?: MissionPlan;
  runs: AgentRun[];
  summary?: string;
  report?: StrategicReport;
  activity?: MissionActivityEvent[];
  status: "planning" | "running" | "complete" | "error";
};

const KEY = "innozenx.missions.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

/** Migrate legacy mission records to current schema */
function migrateMission(m: Mission): Mission {
  return {
    ...m,
    runs: (m.runs ?? []).map((r) => ({
      ...r,
      status: migrateStatus(r.status as string),
    })),
    activity: m.activity ?? [],
  };
}

function migrateStatus(status: string): AgentRunStatus {
  switch (status) {
    case "pending":
      return "idle";
    case "done":
      return "completed";
    case "error":
      return "failed";
    default:
      return status as AgentRunStatus;
  }
}

export function loadMissions(): Mission[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Mission[];
    return Array.isArray(arr) ? arr.map(migrateMission) : [];
  } catch {
    return [];
  }
}

export function saveMissions(list: Mission[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertMission(m: Mission) {
  const list = loadMissions();
  const idx = list.findIndex((x) => x.id === m.id);
  const next = { ...m, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  saveMissions(list);
  if (isBrowser()) window.dispatchEvent(new CustomEvent("innozenx:missions"));
  return next;
}

export function getMission(id: string): Mission | undefined {
  return loadMissions().find((m) => m.id === id);
}

export function deleteMission(id: string) {
  saveMissions(loadMissions().filter((m) => m.id !== id));
  if (isBrowser()) window.dispatchEvent(new CustomEvent("innozenx:missions"));
}

export function newMissionId() {
  return `m_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function appendActivity(
  missionId: string,
  event: Omit<MissionActivityEvent, "id" | "at"> & { at?: number },
) {
  const m = getMission(missionId);
  if (!m) return;
  const entry: MissionActivityEvent = {
    id: `ev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    at: event.at ?? Date.now(),
    agent: event.agent,
    kind: event.kind,
    message: event.message,
  };
  upsertMission({ ...m, activity: [entry, ...(m.activity ?? [])].slice(0, 100) });
}
