/**
 * Marketaux news API service for financial news sentiment.
 * @see https://www.marketaux.com/documentation
 */

import { env } from "../server/env";
import { fetchJson, truncateText } from "../server/http";
import { extractTickerFromGoal } from "./finnhub.service";

const BASE = "https://api.marketaux.com/v1";

export type MarketauxArticle = {
  title: string;
  description: string;
  url: string;
  published_at: string;
  entities?: Array<{ symbol?: string; sentiment_score?: number }>;
};

export async function marketauxNews(
  query: string,
  opts: { symbols?: string; limit?: number } = {},
): Promise<MarketauxArticle[]> {
  const key = env.marketauxApiKey();
  if (!key) return [];

  const params = new URLSearchParams({
    api_token: key,
    language: "en",
    limit: String(opts.limit ?? 8),
  });
  if (opts.symbols) params.set("symbols", opts.symbols);
  else if (query) params.set("search", query.slice(0, 200));

  try {
    const data = await fetchJson<{ data?: MarketauxArticle[] }>(`${BASE}/news/all?${params}`);
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function gatherMarketauxContext(goal: string): Promise<string> {
  const symbol = extractTickerFromGoal(goal);
  const articles = await marketauxNews(goal, symbol ? { symbols: symbol } : {});

  if (!articles.length) return "";

  const parts = ["## Marketaux Financial News"];
  for (const a of articles) {
    const sentiment = a.entities?.[0]?.sentiment_score;
    parts.push(
      `\n- **${a.title}** (${a.published_at?.slice(0, 10) ?? "n/a"})` +
        (sentiment != null ? ` [sentiment: ${sentiment.toFixed(2)}]` : "") +
        `\n  ${truncateText(a.description ?? "", 250)}`,
    );
  }
  return parts.join("\n");
}
