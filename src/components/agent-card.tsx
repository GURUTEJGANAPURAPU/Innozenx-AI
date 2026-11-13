import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle, AlertCircle, Brain } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import type { AgentRun } from "@/lib/missions-store";
import type { AgentRunStatus } from "@/lib/orchestrator/types";
import { AgentIcon } from "./agent-icon";

export function AgentCard({ run, index }: { run: AgentRun; index: number }) {
  const def = AGENTS[run.agent];
  const status = run.status;
  const isRunning = status === "running";
  const isPlanning = status === "planning";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass relative overflow-hidden rounded-xl p-4"
    >
      {/* glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-3xl"
        style={{ background: def.color }}
      />
      <div className="relative flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border-strong"
          style={{
            background: `color-mix(in oklab, ${def.color} 18%, transparent)`,
            boxShadow: isRunning || isPlanning
              ? `0 0 24px -4px ${def.color}`
              : "none",
          }}
        >
          <AgentIcon agent={def.id} className="h-5 w-5" style={{ color: def.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-display text-sm font-semibold text-foreground">
              {def.name}
            </div>
            <StatusBadge status={status} />
          </div>
          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {isRunning || isPlanning ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {truncate(
                  run.progressLog?.[run.progressLog.length - 1] ?? run.task,
                  80,
                )}
              </span>
            ) : (
              truncate(run.task, 80)
            )}
          </div>
          {(isRunning || isPlanning) && (
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="shimmer h-full w-full rounded-full bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40" />
            </div>
          )}
          {isCompleted && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Output ready
              {run.sources && run.sources.length > 0 && (
                <span className="text-muted-foreground">
                  · {run.sources.length} source{run.sources.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
          {isFailed && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {run.error ?? "Failed"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: AgentRunStatus }) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider";
  switch (status) {
    case "planning":
      return (
        <span className={`${base} border-primary/40 bg-primary/10 text-primary-glow`}>
          <Brain className="h-3 w-3" /> Planning
        </span>
      );
    case "running":
      return (
        <span className={`${base} border-accent/40 bg-accent/10 text-accent`}>
          <Loader2 className="h-3 w-3 animate-spin" /> Running
        </span>
      );
    case "completed":
      return (
        <span className={`${base} border-success/40 bg-success/10 text-success`}>
          <CheckCircle2 className="h-3 w-3" /> Completed
        </span>
      );
    case "failed":
      return (
        <span className={`${base} border-destructive/40 bg-destructive/10 text-destructive`}>
          <AlertCircle className="h-3 w-3" /> Failed
        </span>
      );
    default:
      return (
        <span className={`${base} border-border bg-surface-2 text-muted-foreground`}>
          <Circle className="h-3 w-3" /> Idle
        </span>
      );
  }
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
