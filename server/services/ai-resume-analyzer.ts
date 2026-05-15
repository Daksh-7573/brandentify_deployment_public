const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3";

export interface ResumeAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  score: number;
}

export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  const prompt = `You are a career strategist.

Analyze this resume and return STRICT JSON:

{
  "summary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["..."],
  "score": number
}

Resume:
${text.slice(0, 4000)}`;

  const ollamaResult = await analyzeWithOllama(prompt);
  if (ollamaResult) {
    return ollamaResult;
  }

  const openAiResult = await analyzeWithOpenAI(prompt);
  if (openAiResult) {
    return openAiResult;
  }

  return fallbackResponse();
}

async function analyzeWithOllama(prompt: string): Promise<ResumeAnalysis | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    } as RequestInit);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { response?: string };
    return safeParse(data.response || "");
  } catch (error) {
    console.warn("[ResumeAnalyzer] Ollama failed, trying OpenAI fallback:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function analyzeWithOpenAI(prompt: string): Promise<ResumeAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    } as RequestInit);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content || "";
    return safeParse(content);
  } catch (error) {
    console.error("[ResumeAnalyzer] OpenAI fallback failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

function safeParse(text: string): ResumeAnalysis | null {
  if (!text || !text.trim()) {
    return null;
  }

  const raw = text.trim();
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = codeBlockMatch ? codeBlockMatch[1] : raw;
  const jsonMatch = candidate.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<ResumeAnalysis>;
    return normalize(parsed);
  } catch {
    return null;
  }
}

function normalize(parsed: Partial<ResumeAnalysis>): ResumeAnalysis {
  return {
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : "Resume analysis unavailable",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 8) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String).slice(0, 8) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String).slice(0, 8) : [],
    score: normalizeScore(parsed.score),
  };
}

function normalizeScore(score: unknown): number {
  const value = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(value)) {
    return 50;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function fallbackResponse(): ResumeAnalysis {
  return {
    summary: "Resume analysis unavailable",
    strengths: [],
    weaknesses: [],
    improvements: ["Try again later"],
    score: 50,
  };
}
