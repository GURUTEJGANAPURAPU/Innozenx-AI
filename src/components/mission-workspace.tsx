import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Sparkles, Brain, Send } from "lucide-react";
import { planMission, runAgent, synthesize } from "@/lib/agents.functions";
import { AGENTS, type AgentId } from "@/lib/agents";
import {
  newMissionId,
  upsertMission,
  appendActivity,
  type Mission,
  type AgentRun,
} from "@/lib/missions-store";
import { AgentCard } from "./agent-card";
import { Markdown } from "./markdown";
import { AgentIcon } from "./agent-icon";

const EXAMPLES = [
  "Launch an AI startup in the developer-tools space",
  "Analyze NVIDIA stock for a 6-month horizon",
  "Build a winning hackathon strategy for INNOZENX AI",
  "Prepare me for a Staff Engineer interview at Stripe",
  "Design a SaaS pricing model for an AI agents platform",
];

export function NewMission() {
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();
  const plan = useServerFn(planMission);
  const run = useServerFn(runAgent);
  const synth = useServerFn(synthesize);
  const [launching, setLaunching] = useState(false);

  const launch = async (text: string) => {
    const g = text.trim();
    if (!g || launching) return;
    setLaunching(true);
    const id = newMissionId();
    const base: Mission = {
      id,
      title: g.length > 60 ? g.slice(0, 57) + "…" : g,
      goal: g,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      runs: [],
      status: "planning",
    };
    upsertMission(base);
    navigate({ to: "/app/$missionId", params: { missionId: id } });

    // Kick off in the background — MissionView will pick up and continue.
    void orchestrate(id, g, plan, run, synth).catch(() => {
      /* surfaced in mission view */
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-accent" />
          Supervisor online · 5 specialists ready
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          <span className="text-gradient">What would you like</span>
          <br />
          <span className="text-foreground">to achieve today?</span>
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          Describe a goal. The Supervisor assembles a custom team of AI experts and returns a strategic briefing.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onSubmit={(e) => {
          e.preventDefault();
          launch(goal);
        }}
        className="mt-8"
      >
        <div className="glass-strong group relative rounded-2xl p-1.5 ring-glow transition focus-within:shadow-glow">
          <div className="flex items-end gap-2">
            <textarea
              autoFocus
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  launch(goal);
                }
              }}
              placeholder="e.g. Help me launch a profitable AI agents startup in 12 months..."
              rows={3}
              className="min-h-[88px] flex-1 resize-none bg-transparent px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!goal.trim() || launching}
              className="m-1 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:scale-[1.02]"
            >
              <Send className="h-4 w-4" /> Launch
            </button>
          </div>
        </div>
      </motion.form>

      <div className="mt-6">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Suggested missions
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <motion.button
              key={e}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => launch(e)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-[12.5px] text-foreground/80 transition hover:border-primary/40 hover:bg-surface hover:text-foreground"
            >
              {e}
              <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.values(AGENTS)).map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="glass flex items-center gap-2 rounded-lg px-3 py-2"
          >
            <div
              className="grid h-7 w-7 place-items-center rounded-md"
              style={{ background: `color-mix(in oklab, ${a.color} 18%, transparent)` }}
            >
              <AgentIcon agent={a.id} className="h-3.5 w-3.5" style={{ color: a.color }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-foreground">{a.name}</div>
              <div className="truncate text-[10.5px] text-muted-foreground">{a.tagline}</div>
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66 }}
          className="glass flex items-center gap-2 rounded-lg px-3 py-2"
        >
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-accent">
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-foreground">Supervisor</div>
            <div className="truncate text-[10.5px] text-muted-foreground">Decomposes & synthesizes</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- Mission view ----------

export function MissionView({ mission: initial }: { mission: Mission }) {
  const [mission, setMission] = useState<Mission>(initial);
  const plan = useServerFn(planMission);
  const run = useServerFn(runAgent);
  const synth = useServerFn(synthesize);
  const startedRef = useRef(false);

  // sync when the mission id changes (navigation)
  useEffect(() => {
    setMission(initial);
    startedRef.current = false;
  }, [initial.id]);

  // poll local storage updates from the background orchestrator
  useEffect(() => {
    const sync = () => {
      const list = JSON.parse(localStorage.getItem("innozenx.missions.v1") || "[]") as Mission[];
      const found = list.find((m) => m.id === initial.id);
      if (found) setMission(found);
    };
    const i = setInterval(sync, 600);
    window.addEventListener("innozenx:missions", sync);
    return () => {
      clearInterval(i);
      window.removeEventListener("innozenx:missions", sync);
    };
  }, [initial.id]);

  // resume orchestration if mission was created but not yet planned/run
  useEffect(() => {
    if (startedRef.current) return;
    if (mission.status === "complete" || mission.status === "error") return;
    if (mission.status === "planning" && !mission.plan) {
      startedRef.current = true;
      void orchestrate(mission.id, mission.goal, plan, run, synth).catch(() => {});
    }
  }, [mission.id, mission.status, mission.plan, plan, run, synth]);

  const planning = mission.status === "planning" && !mission.plan;
  const running = mission.status === "running";
  const complete = mission.status === "complete";

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Mission
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {mission.title}
        </h1>
        <div className="mt-2 inline-flex items-center gap-2 text-[12px] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${
            complete ? "bg-success" : mission.status === "error" ? "bg-destructive" : "bg-accent pulse-dot"
          }`} />
          {planning && "Supervisor analyzing objective…"}
          {running && "Agents executing in parallel…"}
          {complete && "Mission complete · Strategic report ready"}
          {mission.status === "error" && "Mission failed"}
        </div>
      </div>

      {/* Supervisor plan */}
      <AnimatePresence>
        {mission.plan && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-6 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold">Supervisor briefing</div>
                <div className="text-[11.5px] text-muted-foreground">Task decomposition & agent assembly</div>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/85">
              {mission.plan.reasoning}
            </p>
            <ul className="mt-3 grid gap-1.5">
              {mission.plan.subtasks.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]">
                  <span
                    className="mt-1 inline-flex h-5 shrink-0 items-center rounded-md border border-border px-1.5 text-[10.5px] font-semibold uppercase tracking-wider"
                    style={{ color: AGENTS[s.agent].color }}
                  >
                    {AGENTS[s.agent].name.replace(" Agent", "")}
                  </span>
                  <span className="text-foreground/85">{s.task}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
        {planning && (
          <motion.div
            key="plan-skel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass mb-6 space-y-3 rounded-2xl p-5"
          >
            <div className="h-3 w-1/3 overflow-hidden rounded bg-surface-2"><div className="shimmer h-full w-full" /></div>
            <div className="h-3 w-2/3 overflow-hidden rounded bg-surface-2"><div className="shimmer h-full w-full" /></div>
            <div className="h-3 w-1/2 overflow-hidden rounded bg-surface-2"><div className="shimmer h-full w-full" /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent grid */}
      {mission.runs.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Agents on mission
            </div>
            <div className="text-[11px] text-muted-foreground">
              {mission.runs.filter((r) => r.status === "completed").length}/{mission.runs.length} complete
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {mission.runs.map((r, i) => (
              <AgentCard key={`${r.agent}-${i}`} run={r} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Per-agent outputs */}
      {mission.runs.filter((r) => r.status === "completed" && r.output).map((r, i) => (
        <motion.section
          key={`out-${r.agent}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mb-4 rounded-2xl p-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <div
              className="grid h-7 w-7 place-items-center rounded-md"
              style={{ background: `color-mix(in oklab, ${AGENTS[r.agent].color} 18%, transparent)` }}
            >
              <AgentIcon agent={r.agent} className="h-3.5 w-3.5" style={{ color: AGENTS[r.agent].color }} />
            </div>
            <div className="font-display text-sm font-semibold">{AGENTS[r.agent].name}</div>
          </div>
          <Markdown>{r.output!}</Markdown>
        </motion.section>
      ))}

      {/* Final synthesis */}
      <AnimatePresence>
        {mission.summary && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 overflow-hidden rounded-2xl border border-border-strong bg-gradient-to-br from-surface-2 to-surface p-6 shadow-elegant"
          >
            <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary-glow">
                <Sparkles className="h-3 w-3" /> Final strategic report
              </div>
              <Markdown>{mission.summary}</Markdown>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Orchestration ----------

async function orchestrate(
  id: string,
  goal: string,
  planFn: (args: { data: { goal: string } }) => Promise<Awaited<ReturnType<typeof planMission>>>,
  runFn: (args: { data: { agent: import("@/lib/agents").AgentId; goal: string; task: string } }) => Promise<import("@/lib/agents.functions").AgentRunResult>,
  synthFn: (args: { data: { goal: string; results: Array<{ agent: import("@/lib/agents").AgentId; output: string }> } }) => Promise<{ summary: string; report: import("@/lib/orchestrator/types").StrategicReport }>,
) {
  const read = () => {
    const list = JSON.parse(localStorage.getItem("innozenx.missions.v1") || "[]") as Mission[];
    return list.find((m) => m.id === id);
  };
  const update = (patch: Partial<Mission> | ((m: Mission) => Mission)) => {
    const m = read();
    if (!m) return;
    const next = typeof patch === "function" ? patch(m) : { ...m, ...patch };
    upsertMission(next);
  };

  try {
    appendActivity(id, {
      agent: "supervisor",
      kind: "planning",
      message: "Analyzing objective and assembling agent team…",
    });

    const plan = await planFn({ data: { goal } });

    appendActivity(id, {
      agent: "supervisor",
      kind: "info",
      message: `Plan ready — ${plan.subtasks.length} agents assigned: ${plan.subtasks.map((s) => s.agent).join(", ")}`,
    });

    const runs: AgentRun[] = plan.subtasks.map((s) => ({
      agent: s.agent,
      task: s.task,
      status: "planning",
      startedAt: Date.now(),
    }));
    update({ plan, runs, status: "running" });

    // Transition to running
    update((m) => ({
      ...m,
      runs: m.runs.map((r) => ({ ...r, status: "running" as const })),
    }));

    for (const r of plan.subtasks) {
      appendActivity(id, {
        agent: r.agent,
        kind: "running",
        message: `Started: ${r.task}`,
      });
    }

    const results = await Promise.all(
      runs.map(async (r, idx) => {
        try {
          const out = await runFn({ data: { agent: r.agent, goal, task: r.task } });
          update((m) => {
            const next = [...m.runs];
            next[idx] = {
              ...next[idx],
              status: "completed",
              output: out.output,
              sources: out.sources,
              progressLog: out.progressLog,
              endedAt: Date.now(),
            };
            return { ...m, runs: next };
          });
          appendActivity(id, {
            agent: r.agent,
            kind: "completed",
            message: `Completed analysis${out.sources.length ? ` (${out.sources.length} data sources)` : ""}`,
          });
          return { agent: r.agent, output: out.output };
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "failed";
          update((m) => {
            const next = [...m.runs];
            next[idx] = { ...next[idx], status: "failed", error: msg, endedAt: Date.now() };
            return { ...m, runs: next };
          });
          appendActivity(id, {
            agent: r.agent,
            kind: "failed",
            message: msg,
          });
          return null;
        }
      }),
    );

    const valid = results.filter(Boolean) as Array<{ agent: import("@/lib/agents").AgentId; output: string }>;
    if (valid.length === 0) {
      update({ status: "error" });
      appendActivity(id, {
        agent: "supervisor",
        kind: "failed",
        message: "All agents failed — mission aborted",
      });
      return;
    }

    appendActivity(id, {
      agent: "supervisor",
      kind: "running",
      message: "Synthesizing final strategic report…",
    });

    const { summary, report } = await synthFn({ data: { goal, results: valid } });
    update({ summary, report, status: "complete" });
    appendActivity(id, {
      agent: "supervisor",
      kind: "completed",
      message: "Strategic report ready",
    });
  } catch (e: unknown) {
    update({ status: "error" });
    appendActivity(id, {
      agent: "supervisor",
      kind: "failed",
      message: e instanceof Error ? e.message : "Mission failed",
    });
  }
}

export { orchestrate };
