/**
 * Finance data aggregation — combines all finance API services.
 */

import { gatherFinnhubContext } from "./finnhub.service";
import { gatherTwelveDataContext } from "./twelvedata.service";
import { gatherFmpContext } from "./fmp.service";
import { gatherMarketauxContext } from "./marketaux.service";

export type FinanceToolResult = {
  sources: string[];
  context: string;
};

export async function gatherFinanceData(goal: string, task: string): Promise<FinanceToolResult> {
  const query = `${goal} ${task}`;
  const results = await Promise.allSettled([
    gatherFinnhubContext(query),
    gatherTwelveDataContext(query),
    gatherFmpContext(query),
    gatherMarketauxContext(query),
  ]);

  const sources: string[] = [];
  const sections: string[] = [];

  const labels = ["Finnhub", "Twelve Data", "FMP", "Marketaux"];
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value.trim()) {
      sources.push(labels[i]!);
      sections.push(r.value);
    }
  });

  return {
    sources,
    context: sections.length ? sections.join("\n\n---\n\n") : "",
  };
}
