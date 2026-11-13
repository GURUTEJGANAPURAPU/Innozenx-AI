import { useMissions } from "@/hooks/use-missions";
import { AGENTS } from "@/lib/agents";
import { AgentIcon } from "./agent-icon";
import { Activity, Cpu, Zap, Brain } from "lucide-react";
import type { MissionActivityEvent } from "@/lib/orchestrator/types";

export function ActivityPanel() {
  const missions = useMissions();
  const live = missions.find((m) => m.status === "running" || m.status === "planning");
  const events = buildEvents(missions);

  return (
    <aside className="hidden h-full w-[300px] shrink-0 flex-col border-l border-border bg-background/40 backdrop-blur xl:flex">
      <div className="border-b border-border px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          <div className="font-display text-sm font-semibold">Live activity</div>
        </div>
        <div className="mt-1 text-[11.5px] text-muted-foreground">
          {live
            ? live.status === "planning"
              ? `Supervisor planning “${truncate(live.title, 28)}”`
              : `Mission “${truncate(live.title, 28)}” is active`
            : "Awaiting next mission"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 py-4">
        <Stat label="Missions" value={String(missions.length)} icon={<Cpu className="h-3.5 w-3.5" />} />
        <Stat
          label="Completed"
          value={String(missions.filter((m) => m.status === "complete").length)}
          icon={<Zap className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="border-t border-border px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Agent stream
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin">
        {events.length === 0 ? (
          <div className="mx-2 mt-4 rounded-lg border border-dashed border-border p-4 text-[12px] text-muted-foreground/70">
            No activity yet. Launch a mission and watch the agents collaborate in real time.
          </div>
        ) : (
          <ol className="relative ml-3 border-l border-border">
            {events.map((e) => (
              <ActivityEventItem key={e.id} event={e} />
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function ActivityEventItem({ event }: { event: MissionActivityEvent & { missionTitle?: string } }) {
  const isSupervisor = event.agent === "supervisor";
  const def = isSupervisor ? null : AGENTS[event.agent];
  const dotColor =
    event.kind === "completed"
      ? "bg-success"
      : event.kind === "failed"
        ? "bg-destructive"
        : event.kind === "planning"
          ? "bg-primary"
          : "bg-accent pulse-dot";

  return (
    <li className="relative pl-4 pb-4">
      <span
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-background ${dotColor}`}
      />
      <div className="flex items-center gap-1.5">
        {isSupervisor ? (
          <Brain className="h-3 w-3 text-primary-glow" />
        ) : (
          <AgentIcon agent={def!.id} className="h-3 w-3" style={{ color: def!.color }} />
        )}
        <span className="text-[11.5px] font-semibold text-foreground">
          {isSupervisor ? "Supervisor" : def!.name.replace(" Agent", "")}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{time(event.at)}</span>
      </div>
      <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{event.message}</div>
    </li>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="glass rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function buildEvents(missions: ReturnType<typeof useMissions>) {
  const events: Array<MissionActivityEvent & { missionTitle?: string }> = [];

  for (const m of missions.slice(0, 6)) {
    for (const ev of m.activity ?? []) {
      events.push({ ...ev, missionTitle: m.title });
    }
    for (const r of m.runs) {
      if (r.startedAt && !m.activity?.some((a) => a.message.includes(r.task.slice(0, 30)))) {
        events.push({
          id: `run_${m.id}_${r.agent}_${r.startedAt}`,
          at: r.startedAt,
          agent: r.agent,
          kind: r.status === "completed" ? "completed" : r.status === "failed" ? "failed" : r.status === "planning" ? "planning" : "running",
          message:
            r.status === "running" || r.status === "planning"
              ? `Working: ${truncate(r.task, 60)}`
              : r.status === "completed"
                ? `Delivered output for "${truncate(m.title, 30)}"`
                : r.error ?? "Failed",
        });
      }
    }
  }

  return events.sort((a, b) => b.at - a.at).slice(0, 40);
}

function time(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
