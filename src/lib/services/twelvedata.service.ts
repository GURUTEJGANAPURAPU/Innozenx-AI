/**
 * Twelve Data API service for time-series and technical data.
 * @see https://twelvedata.com/docs
 */

import { env } from "../server/env";
import { fetchJson } from "../server/http";
import { extractTickerFromGoal } from "./finnhub.service";

const BASE = "https://api.twelvedata.com";

export async function twelveDataQuote(symbol: string): Promise<Record<string, unknown> | null> {
  const key = env.twelveDataApiKey();
  if (!key) return null;
  try {
    return await fetchJson(
      `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`,
    );
  } catch {
    return null;
  }
}

export async function twelveDataTimeSeries(
  symbol: string,
  interval = "1day",
  outputsize = 30,
): Promise<Record<string, unknown> | null> {
  const key = env.twelveDataApiKey();
  if (!key) return null;
  try {
    return await fetchJson(
      `${BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${encodeURIComponent(key)}`,
    );
  } catch {
    return null;
  }
}

export async function gatherTwelveDataContext(goal: string): Promise<string> {
  const symbol = extractTickerFromGoal(goal);
  if (!symbol) return "";

  const [quote, series] = await Promise.all([
    twelveDataQuote(symbol),
    twelveDataTimeSeries(symbol),
  ]);

  const parts: string[] = ["## Twelve Data"];
  if (quote) parts.push(`\n### ${symbol} Quote\n${JSON.stringify(quote, null, 2)}`);
  if (series) {
    const values = (series as { values?: unknown[] }).values;
    const preview = Array.isArray(values) ? values.slice(0, 10) : series;
    parts.push(`\n### ${symbol} Recent Time Series\n${JSON.stringify(preview, null, 2)}`);
  }
  return parts.length > 1 ? parts.join("\n") : "";
}
