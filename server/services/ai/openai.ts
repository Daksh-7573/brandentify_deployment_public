import OpenAI from "openai";
import type { AiChatMessage } from "./prompts";
import type { ProviderResult, ProviderStreamHandlers } from "./ollama";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_TIMEOUT_MS = Number.parseInt(process.env.OPENAI_TIMEOUT_MS || "25000", 10);

function createAbortController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();
  return controller;
}

export async function generateWithOpenAI(
  messages: AiChatMessage[],
  handlers: ProviderStreamHandlers = {},
  options?: { temperature?: number; maxTokens?: number }
): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  console.log(`[AI Provider] Trying OpenAI using ${OPENAI_MODEL}`);

  const controller = createAbortController(OPENAI_TIMEOUT_MS);
  const openai = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS, maxRetries: 1 });

  const response = await openai.chat.completions.create(
    {
      model: OPENAI_MODEL,
      messages,
      stream: true,
      temperature: options?.temperature ?? 0.45,
      max_tokens: options?.maxTokens ?? 1200,
    },
    { signal: controller.signal }
  );

  handlers.onProvider?.("openai", OPENAI_MODEL);

  let content = "";
  for await (const chunk of response) {
    const token = chunk.choices?.[0]?.delta?.content || "";
    if (token) {
      content += token;
      handlers.onToken?.(token);
    }
  }

  if (!content.trim()) {
    throw new Error("OpenAI returned an empty response");
  }

  return {
    content,
    provider: "openai",
    model: OPENAI_MODEL,
    fallbackUsed: true,
  };
}