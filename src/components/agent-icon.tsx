import { Telescope, LineChart, Rocket, Code2, Briefcase, Brain, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { AgentId } from "@/lib/agents";

const MAP: Record<AgentId | "supervisor", LucideIcon> = {
  research: Telescope,
  finance: LineChart,
  startup: Rocket,
  coding: Code2,
  career: Briefcase,
  supervisor: Brain,
};

export function AgentIcon({
  agent,
  className,
  style,
}: {
  agent: AgentId | "supervisor";
  className?: string;
  style?: CSSProperties;
}) {
  const I = MAP[agent];
  return <I className={className} style={style} />;
}
