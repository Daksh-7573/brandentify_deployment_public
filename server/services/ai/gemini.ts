import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiChatMessage } from "./prompts";
import type { ProviderResult, ProviderStreamHandlers } from "./ollama";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = Number.parseInt(process.env.GEMINI_TIMEOUT_MS || "60000", 10);

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key?.trim()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key.trim();
}

function mapMessages(messages: AiChatMessage[]) {
  const systemParts: string[] = [];
  const history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    const last = history[history.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${message.content}`;
    } else {
      history.push({ role, parts: [{ text: message.content }] });
    }
  }

  if (history.length > 0 && history[0].role === "model") {
    history.shift();
  }

  const last = history[history.length - 1];
  const promptHistory = last?.role === "user" ? history.slice(0, -1) : history;
  const userPrompt = last?.role === "user" ? last.parts[0].text : messages[messages.length - 1]?.content || "";

  return {
    systemInstruction: systemParts.join("\n\n").trim() || undefined,
    history: promptHistory,
    userPrompt,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Gemini request timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function generateWithGemini(
  messages: AiChatMessage[],
  handlers: ProviderStreamHandlers = {},
  options?: { temperature?: number; maxTokens?: number }
): Promise<ProviderResult> {
  const apiKey = getApiKey();
  console.log(`[AI Provider] Trying Gemini using ${GEMINI_MODEL}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const { systemInstruction, history, userPrompt } = mapMessages(messages);

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: options?.temperature ?? 0.45,
      maxOutputTokens: options?.maxTokens ?? 2048,
    },
  });

  const chat = model.startChat({ history });
  handlers.onProvider?.("gemini", GEMINI_MODEL);

  const streamResult = await withTimeout(chat.sendMessageStream(userPrompt), GEMINI_TIMEOUT_MS);

  let content = "";
  for await (const chunk of streamResult.stream) {
    const token = chunk.text();
    if (token) {
      content += token;
      handlers.onToken?.(token);
    }
  }

  if (!content.trim()) {
    const response = await streamResult.response;
    content = response.text()?.trim() || "";
  }

  if (!content.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return {
    content,
    provider: "gemini",
    model: GEMINI_MODEL,
    fallbackUsed: false,
  };
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim());
}
