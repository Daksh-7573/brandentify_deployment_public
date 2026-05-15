import { localAIService } from "./local-ai-service";

export interface NormalizedAIResponse {
  text: string;
  tokens: number;
  model: string;
  provider: "ollama" | "openai" | "deterministic";
  fallbackUsed: boolean;
}

interface AIRequestOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export async function generateAIResponse(
  prompt: string,
  options?: AIRequestOptions
): Promise<NormalizedAIResponse> {
  const fullPrompt = options?.systemPrompt
    ? `${options.systemPrompt}\n\n${prompt}`
    : prompt;

  const result = await localAIService.generateCompletionDetailed(
    fullPrompt,
    options?.temperature,
    options?.maxTokens,
    'general-completion'
  );

  const text = (result.text || "").trim();

  if (!text) {
    throw new Error("AI provider returned empty response");
  }

  return {
    text,
    tokens: estimateTokens(text),
    model: result.model,
    provider: result.provider,
    fallbackUsed: result.fallbackUsed,
  };
}
