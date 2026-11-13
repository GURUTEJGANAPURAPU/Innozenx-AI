import dotenv from "dotenv";
dotenv.config();
/**
 * Centralized server-side environment configuration.
 * Never import from client modules.
 */

console.log("PROCESS ENV GROQ:", process.env.GROQ_API_KEY);
console.log("IMPORT META ENV:", import.meta.env);
function requireEnv(key: string): string {
  console.log("ENV CHECK:", key, process.env[key]);

  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

export const env = {
  groqApiKey: () => requireEnv("GROQ_API_KEY"),
  tavilyApiKey: () => optionalEnv("TAVILY_API_KEY"),
  finnhubApiKey: () => optionalEnv("FINNHUB_API_KEY"),
  twelveDataApiKey: () => optionalEnv("TWELVE_DATA_API_KEY"),
  fmpApiKey: () => optionalEnv("FMP_API_KEY"),
  marketauxApiKey: () => optionalEnv("MARKETAUX_API_KEY"),
} as const;

export function hasApiKey(provider: keyof Omit<typeof env, "groqApiKey">): boolean {
  try {
    return Boolean(env[provider]());
  } catch {
    return false;
  }
}
