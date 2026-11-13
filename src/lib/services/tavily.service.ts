/**
 * Tavily web search API service for the Research Agent.
 * @see https://docs.tavily.com/
 */

import { env } from "../server/env";
import { fetchJson, truncateText } from "../server/http";

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type TavilySearchResponse = {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
};

export async function tavilySearch(
  query: string,
  opts: { maxResults?: number; searchDepth?: "basic" | "advanced" } = {},
): Promise<TavilySearchResponse> {
  const apiKey = env.tavilyApiKey();
  if (!apiKey) {
    return { query, results: [], answer: undefined };
  }

  const data = await fetchJson<{
    results?: Array<{ title?: string; url?: string; content?: string; score?: number }>;
    answer?: string;
  }>("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      api_key: apiKey,
      query: query.slice(0, 400),
      max_results: opts.maxResults ?? 5,
      search_depth: opts.searchDepth ?? "advanced",
      include_answer: true,
    },
  });

  return {
    query,
    answer: data.answer,
    results: (data.results ?? []).map((r) => ({
      title: r.title ?? "Untitled",
      url: r.url ?? "",
      content: truncateText(r.content ?? "", 800),
      score: r.score,
    })),
  };
}

export function formatTavilyContext(search: TavilySearchResponse): string {
  const parts: string[] = [`Query: ${search.query}`];
  if (search.answer) parts.push(`Summary: ${search.answer}`);
  for (const r of search.results) {
    parts.push(`\n### ${r.title}\nURL: ${r.url}\n${r.content}`);
  }
  return parts.join("\n");
}
