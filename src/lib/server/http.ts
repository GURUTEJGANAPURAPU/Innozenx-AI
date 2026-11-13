/**
 * Shared HTTP helpers for external API services.
 */

import { withRetry } from "./retry";

export type FetchJsonOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
};

export async function fetchJson<T>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<T> {
  const { method = "GET", headers = {}, body, timeoutMs = 15000, retries = 3 } = opts;

  return withRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method,
          headers: { Accept: "application/json", ...headers },
          body: body != null ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
        }
        return (await res.json()) as T;
      } finally {
        clearTimeout(timer);
      }
    },
    { maxAttempts: retries },
  );
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}
