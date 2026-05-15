import type { Express, Request, Response } from "express";
import { getConfiguredProviderOrder, isGeminiConfigured } from "../services/ai/provider";

export function registerMuskAIRoutes(app: Express): void {
  app.get("/api/musk-ai/status", (_req: Request, res: Response) => {
    const order = getConfiguredProviderOrder();
    res.json({
      success: true,
      primary: order[0] ?? "fallback",
      providerOrder: order,
      configured: {
        gemini: isGeminiConfigured(),
        openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
        ollama: process.env.AI_ENABLE_OLLAMA !== "false",
      },
      models: {
        gemini: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
        ollama: process.env.OLLAMA_MODEL || "phi3",
      },
    });
  });
}
