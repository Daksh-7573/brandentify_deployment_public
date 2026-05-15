import type { AiChatMessage } from "../../services/ai/prompts";
import type { ProviderResult, ProviderStreamHandlers } from "../../services/ai/ollama";
import { generateBrandentifyResponse } from "../../services/ai/provider";

export type { AiChatMessage, ProviderResult, ProviderStreamHandlers };

export async function generateMuskChatResponse(
  messages: AiChatMessage[],
  handlers?: Partial<ProviderStreamHandlers>
): Promise<ProviderResult> {
  return generateBrandentifyResponse(messages, {
    onToken: handlers?.onToken,
    onProvider: handlers?.onProvider,
  });
}
