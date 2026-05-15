import { generateAIResponse } from "./central-ai-provider";

export class AIProviderService {
  static async generate(prompt: string): Promise<string> {
    try {
      const result = await generateAIResponse(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      });
      return result.text;
    } catch (err) {
      console.error("[AI] Central provider failed:", err);
      return "AI service temporarily unavailable.";
    }
  }
}
