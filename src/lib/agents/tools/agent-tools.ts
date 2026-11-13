/**
 * Agent tool execution — gathers real-world data before LLM synthesis.
 */

import type { AgentId } from "../../agents";
import { tavilySearch, formatTavilyContext } from "../../services/tavily.service";
import { gatherFinanceData } from "../../services/finance.service";

export type ToolProgressEvent = {
  phase: "tools" | "generating";
  message: string;
  sources?: string[];
};

export type ToolContext = {
  agent: AgentId;
  sources: string[];
  context: string;
  events: ToolProgressEvent[];
};

export async function runAgentTools(
  agent: AgentId,
  goal: string,
  task: string,
  onProgress?: (event: ToolProgressEvent) => void,
): Promise<ToolContext> {
  const events: ToolProgressEvent[] = [];
  const emit = (event: ToolProgressEvent) => {
    events.push(event);
    onProgress?.(event);
  };

  switch (agent) {
    case "research": {
      emit({ phase: "tools", message: "Searching web via Tavily…" });
      const search = await tavilySearch(`${goal} — ${task}`, { maxResults: 6 });
      const sources = search.results.map((r) => r.url).filter(Boolean);
      emit({
        phase: "tools",
        message: `Found ${search.results.length} sources`,
        sources,
      });
      return {
        agent,
        sources,
        context: formatTavilyContext(search),
        events,
      };
    }

    case "finance": {
      emit({ phase: "tools", message: "Fetching market data (Finnhub, TwelveData, FMP, Marketaux)…" });
      const data = await gatherFinanceData(goal, task);
      emit({
        phase: "tools",
        message: data.sources.length
          ? `Data from: ${data.sources.join(", ")}`
          : "No live market data available — using LLM knowledge",
        sources: data.sources,
      });
      return {
        agent,
        sources: data.sources,
        context: data.context,
        events,
      };
    }

    default:
      emit({ phase: "tools", message: "Preparing analysis…" });
      return { agent, sources: [], context: "", events };
  }
}
