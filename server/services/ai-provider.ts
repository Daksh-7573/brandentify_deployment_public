import OpenAI from "openai";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3";
const OLLAMA_TIMEOUT_MS = 10_000;

export async function generateAIResponse(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    console.log("[AIProvider] Attempting Ollama");

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = (await ollamaResponse.json()) as { response?: string };

    if (data?.response && data.response.trim()) {
      return data.response.trim();
    }

    throw new Error("Ollama returned empty response");
  } catch (error) {
    console.warn("[AIProvider] Falling back to OpenAI", error);
    return await generateOpenAIResponse(prompt);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateOpenAIResponse(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a career strategy expert." },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty response");
  }

  return text;
}
