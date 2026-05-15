import type { AiChatMessage } from "./prompts";
import { getConfiguredProviderOrder, type AiProviderId } from "./config";
import { generateWithGemini, isGeminiConfigured } from "./gemini";
import { generateWithOllama } from "./ollama";
import { generateWithOpenAI } from "./openai";
import type { ProviderResult, ProviderStreamHandlers } from "./ollama";
import { generateMuskChatFallback, streamFallbackContent } from "./musk-chat-fallback";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runProvider(
  providerId: AiProviderId,
  messages: AiChatMessage[],
  handlers: ProviderStreamHandlers,
  options?: { temperature?: number; maxTokens?: number }
): Promise<ProviderResult> {
  switch (providerId) {
    case "gemini":
      if (!isGeminiConfigured()) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      return generateWithGemini(messages, handlers, options);
    case "openai":
      return generateWithOpenAI(messages, handlers, options);
    case "ollama":
      return generateWithOllama(messages, handlers, options);
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

export async function generateBrandentifyResponse(
  messages: AiChatMessage[],
  handlers: ProviderStreamHandlers = {},
  options?: { temperature?: number; maxTokens?: number }
): Promise<ProviderResult> {
  const order = getConfiguredProviderOrder();
  console.log(`[AI Provider] Generating response (${messages.length} messages), order: ${order.join(" → ")}`);

  const liveProviders = order.filter((id) => id !== "fallback");

  for (let index = 0; index < liveProviders.length; index += 1) {
    const providerId = liveProviders[index];
    try {
      const result = await runProvider(providerId, messages, handlers, options);
      const isFallback = index > 0;
      console.log(`[AI Provider] ${providerId} succeeded with model ${result.model}${isFallback ? " (fallback)" : ""}`);
      return {
        ...result,
        fallbackUsed: isFallback || result.fallbackUsed,
      };
    } catch (error) {
      console.warn(`[AI Provider] ${providerId} failed: ${toErrorMessage(error)}`);
    }
  }

  console.warn("[AI Provider] All live providers failed — using built-in coach fallback");
  const content = generateMuskChatFallback(messages);
  handlers.onProvider?.("fallback", "musk-coach-fallback");
  await streamFallbackContent(content, handlers.onToken);

  return {
    content,
    provider: "fallback",
    model: "musk-coach-fallback",
    fallbackUsed: true,
  };
}

export { getConfiguredProviderOrder, isGeminiConfigured };
