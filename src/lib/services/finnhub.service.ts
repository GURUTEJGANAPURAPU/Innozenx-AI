/**
 * Finnhub API service for market data and company profiles.
 * @see https://finnhub.io/docs/api
 */

import { env } from "../server/env";
import { fetchJson, truncateText } from "../server/http";

const BASE = "https://finnhub.io/api/v1";

function authParams(): string {
  const key = env.finnhubApiKey();
  return key ? `token=${encodeURIComponent(key)}` : "";
}

export async function finnhubCompanyProfile(symbol: string): Promise<Record<string, unknown> | null> {
  const token = authParams();
  if (!token) return null;
  try {
    return await fetchJson(`${BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&${token}`);
  } catch {
    return null;
  }
}

export async function finnhubQuote(symbol: string): Promise<Record<string, unknown> | null> {
  const token = authParams();
  if (!token) return null;
  try {
    return await fetchJson(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}&${token}`);
  } catch {
    return null;
  }
}

export async function finnhubCompanyNews(
  symbol: string,
  from: string,
  to: string,
): Promise<Array<Record<string, unknown>>> {
  const token = authParams();
  if (!token) return [];
  try {
    const data = await fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&${token}`,
    );
    return Array.isArray(data) ? data.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export async function finnhubMarketNews(): Promise<Array<Record<string, unknown>>> {
  const token = authParams();
  if (!token) return [];
  try {
    const data = await fetchJson<Array<Record<string, unknown>>>(`${BASE}/news?category=general&${token}`);
    return Array.isArray(data) ? data.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function extractTickerFromGoal(goal: string): string | null {
  const upper = goal.toUpperCase();
  const match = upper.match(/\b([A-Z]{1,5})\b(?:\s+STOCK|\s+SHARES?|\s+EQUITY)?/);
  if (match && match[1].length >= 2) return match[1];
  const known = ["NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "AMD", "INTC", "IBM"];
  for (const t of known) {
    if (upper.includes(t)) return t;
  }
  return null;
}

export async function gatherFinnhubContext(goal: string): Promise<string> {
  const symbol = extractTickerFromGoal(goal);
  const today = new Date();
  const from = new Date(today.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const to = today.toISOString().slice(0, 10);

  const parts: string[] = ["## Finnhub Market Data"];

  if (symbol) {
    const [profile, quote, news] = await Promise.all([
      finnhubCompanyProfile(symbol),
      finnhubQuote(symbol),
      finnhubCompanyNews(symbol, from, to),
    ]);
    if (profile) parts.push(`\n### ${symbol} Profile\n${JSON.stringify(profile, null, 2)}`);
    if (quote) parts.push(`\n### ${symbol} Quote\n${JSON.stringify(quote, null, 2)}`);
    if (news.length)
      parts.push(
        `\n### ${symbol} Recent News\n${news.map((n) => `- ${n.headline}: ${truncateText(String(n.summary ?? ""), 200)}`).join("\n")}`,
      );
  } else {
    const news = await finnhubMarketNews();
    if (news.length)
      parts.push(`\n### General Market News\n${news.map((n) => `- ${n.headline}`).join("\n")}`);
  }

  return parts.length > 1 ? parts.join("\n") : "";
}
