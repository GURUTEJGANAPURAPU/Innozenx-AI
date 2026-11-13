// Server-only Groq client helpers. Never import this from client modules.
import { env } from "./server/env";
import { withRetry } from "./server/retry";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export type GroqChatOptions = {
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
};

async function groqFetch(body: Record<string, unknown>, stream: boolean): Promise<Response> {
  const apiKey = env.groqApiKey();
  return withRetry(
    async () => {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...body, stream }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Groq error ${res.status}: ${text.slice(0, 400)}`);
      }
      return res;
    },
    { maxAttempts: 3 },
  );
}

export async function groqChat(messages: Msg[], opts: GroqChatOptions = {}): Promise<string> {
  if (opts.onChunk) {
    let full = "";
    for await (const chunk of groqChatStream(messages, opts)) {
      full += chunk;
    }
    return full.trim();
  }

  const res = await groqFetch(
    {
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 1800,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    },
    false,
  );
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/** Stream Groq chat completion chunks for real-time UI updates. */
export async function* groqChatStream(
  messages: Msg[],
  opts: GroqChatOptions = {},
): AsyncGenerator<string> {
  const res = await groqFetch(
    {
      model: MODEL,
      messages,
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.maxTokens ?? 600,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    },
    true,
  );

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Groq stream unavailable");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          opts.onChunk?.(content);
          yield content;
        }
      } catch {
        /* skip malformed SSE chunks */
      }
    }
  }
}
