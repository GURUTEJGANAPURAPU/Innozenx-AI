/**
 * Financial Modeling Prep (FMP) API service for fundamentals and financials.
 * @see https://site.financialmodelingprep.com/developer/docs
 */

import { env } from "../server/env";
import { fetchJson, truncateText } from "../server/http";
import { extractTickerFromGoal } from "./finnhub.service";

const BASE = "https://financialmodelingprep.com/api/v3";

function keyParam(): string {
  const key = env.fmpApiKey();
  return key ? `apikey=${encodeURIComponent(key)}` : "";
}

export async function fmpProfile(symbol: string): Promise<Record<string, unknown> | null> {
  const kp = keyParam();
  if (!kp) return null;
  try {
    const data = await fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/profile/${encodeURIComponent(symbol)}?${kp}`,
    );
    return Array.isArray(data) ? data[0] ?? null : null;
  } catch {
    return null;
  }
}

export async function fmpKeyMetrics(symbol: string): Promise<Array<Record<string, unknown>>> {
  const kp = keyParam();
  if (!kp) return [];
  try {
    const data = await fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/key-metrics-ttm/${encodeURIComponent(symbol)}?${kp}`,
    );
    return Array.isArray(data) ? data.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function fmpIncomeStatement(symbol: string): Promise<Array<Record<string, unknown>>> {
  const kp = keyParam();
  if (!kp) return [];
  try {
    const data = await fetchJson<Array<Record<string, unknown>>>(
      `${BASE}/income-statement/${encodeURIComponent(symbol)}?limit=2&${kp}`,
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function gatherFmpContext(goal: string): Promise<string> {
  const symbol = extractTickerFromGoal(goal);
  if (!symbol) return "";

  const [profile, metrics, income] = await Promise.all([
    fmpProfile(symbol),
    fmpKeyMetrics(symbol),
    fmpIncomeStatement(symbol),
  ]);

  const parts: string[] = ["## Financial Modeling Prep"];
  if (profile)
    parts.push(
      `\n### ${symbol} Profile\n${truncateText(JSON.stringify(profile, null, 2), 1500)}`,
    );
  if (metrics.length)
    parts.push(`\n### Key Metrics TTM\n${truncateText(JSON.stringify(metrics, null, 2), 1200)}`);
  if (income.length)
    parts.push(`\n### Income Statement\n${truncateText(JSON.stringify(income, null, 2), 1200)}`);
  return parts.length > 1 ? parts.join("\n") : "";
}
