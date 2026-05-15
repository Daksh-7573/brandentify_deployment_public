/**
 * Musk / Brandentify AI provider order (first match wins).
 *
 * .env:
 *   GEMINI_API_KEY=...          (primary — gemini-2.5-flash)
 *   GEMINI_MODEL=gemini-2.5-flash
 *   OPENAI_API_KEY=...          (fallback)
 *   OLLAMA_BASE_URL=http://localhost:11434
 *   OLLAMA_MODEL=phi3
 */

export type AiProviderId = "gemini" | "openai" | "ollama" | "fallback";

export function getConfiguredProviderOrder(): AiProviderId[] {
  const fromEnv = process.env.AI_PROVIDER_ORDER?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry): entry is AiProviderId =>
        entry === "gemini" || entry === "openai" || entry === "ollama" || entry === "fallback"
      );
  }

  const order: AiProviderId[] = [];
  if (process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim()) {
    order.push("gemini");
  }
  if (process.env.OPENAI_API_KEY?.trim()) {
    order.push("openai");
  }
  if (process.env.AI_ENABLE_OLLAMA !== "false") {
    order.push("ollama");
  }
  order.push("fallback");
  return order;
}
