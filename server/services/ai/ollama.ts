import type { AiChatMessage } from "./prompts";

export interface ProviderStreamHandlers {
  onToken?: (token: string) => void;
  onProvider?: (provider: string, model: string) => void;
}

export interface ProviderResult {
  content: string;
  provider: "gemini" | "ollama" | "openai" | "fallback";
  model: string;
  fallbackUsed: boolean;
}

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3";
const OLLAMA_TIMEOUT_MS = Number.parseInt(process.env.OLLAMA_TIMEOUT_MS || "25000", 10);

function createAbortController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();
  return controller;
}

export async function generateWithOllama(
  messages: AiChatMessage[],
  handlers: ProviderStreamHandlers = {},
  options?: { temperature?: number; maxTokens?: number }
): Promise<ProviderResult> {
  const controller = createAbortController(OLLAMA_TIMEOUT_MS);
  console.log(`[AI Provider] Trying Ollama at ${OLLAMA_BASE_URL} using ${OLLAMA_MODEL}`);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: {
        temperature: options?.temperature ?? 0.45,
        num_predict: options?.maxTokens ?? 1200,
      },
    }),
    signal: controller.signal,
  } as RequestInit);

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Ollama request failed with HTTP ${response.status}: ${errorText.slice(0, 200)}`);
  }

  handlers.onProvider?.("ollama", OLLAMA_MODEL);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed) as { message?: { content?: string }; response?: string };
        const token = parsed.message?.content || parsed.response || "";
        if (token) {
          content += token;
          handlers.onToken?.(token);
        }
      } catch (error) {
        console.warn("[AI Provider] Ollama stream chunk parse error:", error instanceof Error ? error.message : String(error));
      }
    }
  }

  if (!content.trim()) {
    throw new Error("Ollama returned an empty response");
  }

  return {
    content,
    provider: "ollama",
    model: OLLAMA_MODEL,
    fallbackUsed: false,
  };
}