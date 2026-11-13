// Client-safe agent metadata used by UI and shared with server.
export type AgentId =
  | "research"
  | "finance"
  | "startup"
  | "coding"
  | "career";

export type AgentDef = {
  id: AgentId;
  name: string;
  tagline: string;
  color: string; // tailwind utility friendly hex for glow only
  icon: string;  // lucide icon name
  capabilities: string[];
};

export const AGENTS: Record<AgentId, AgentDef> = {
  research: {
    id: "research",
    name: "Research Agent",
    tagline: "Web, market & competitor intelligence",
    color: "#06B6D4",
    icon: "Telescope",
    capabilities: ["Market research", "Trend analysis", "Competitor scan", "Source synthesis"],
  },
  finance: {
    id: "finance",
    name: "Finance Agent",
    tagline: "Markets, equities & risk",
    color: "#22D3EE",
    icon: "LineChart",
    capabilities: ["Equity analysis", "Financial reports", "Risk", "Portfolio ideas"],
  },
  startup: {
    id: "startup",
    name: "Startup Agent",
    tagline: "Business, GTM & investor strategy",
    color: "#A78BFA",
    icon: "Rocket",
    capabilities: ["Business model", "Market sizing", "GTM plan", "Investor brief"],
  },
  coding: {
    id: "coding",
    name: "Coding Agent",
    tagline: "Architecture & implementation",
    color: "#F472B6",
    icon: "Code2",
    capabilities: ["Architecture", "Stack picks", "Code scaffolds", "Bug analysis"],
  },
  career: {
    id: "career",
    name: "Career Agent",
    tagline: "Resume, ATS & interview prep",
    color: "#FBBF24",
    icon: "Briefcase",
    capabilities: ["Resume review", "ATS optimization", "Roadmap", "Interview prep"],
  },
};

export const ALL_AGENT_IDS = Object.keys(AGENTS) as AgentId[];
