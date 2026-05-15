import fs from "fs";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { db } from "../db";
import { resumeContextCache } from "@shared/schema";
import { eq } from "drizzle-orm";

const MAX_RESUME_CHARS = 5000;
const MIN_RESUME_CHARS = 200;
const AI_TIMEOUT_MS = 4500;
const TOTAL_AI_BUDGET_MS = 9000;

type AIProvider = "ollama" | "openai" | "fallback";

interface StructuredResumeAnalysis {
  overallScore: number;
  keyStrengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  missingSkills: string[];
  summary: string;
}

export interface MuskResumeAnalysisInput {
  userId: number;
  resumeText: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
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

function cleanResumeText(text: string): string {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function shortenForAI(text: string, maxChars = MAX_RESUME_CHARS): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[TRUNCATED_FOR_ANALYSIS]`;
}

function normalizeScore(value: unknown): number {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(score)) return 60;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeStringArray(value: unknown, maxItems = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function extractJsonCandidate(raw: string): string | null {
  if (!raw || !raw.trim()) return null;
  const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = blockMatch ? blockMatch[1] : raw;
  const objectMatch = candidate.match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : null;
}

function parseStructuredAnalysis(raw: string): StructuredResumeAnalysis | null {
  const jsonCandidate = extractJsonCandidate(raw);
  if (!jsonCandidate) return null;

  try {
    const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
    const summary = String(parsed.summary || "").trim();
    return {
      overallScore: normalizeScore(parsed.overallScore),
      keyStrengths: normalizeStringArray(parsed.keyStrengths),
      weaknesses: normalizeStringArray(parsed.weaknesses),
      suggestedImprovements: normalizeStringArray(parsed.suggestedImprovements),
      missingSkills: normalizeStringArray(parsed.missingSkills),
      summary: summary || "Resume analysis completed.",
    };
  } catch {
    return null;
  }
}

function buildPrompt(cleanText: string): string {
  return [
    "Analyze this resume and return:",
    "1. Overall Score (0-100)",
    "2. Key Strengths (3-5 points)",
    "3. Weaknesses (3-5 points)",
    "4. Suggested Improvements",
    "5. Missing Skills (if any)",
    "",
    "Return STRICT JSON format using this schema only:",
    "{",
    '  \"overallScore\": 0,',
    '  \"keyStrengths\": [\"\"],',
    '  \"weaknesses\": [\"\"],',
    '  \"suggestedImprovements\": [\"\"],',
    '  \"missingSkills\": [\"\"],',
    '  \"summary\": \"\"',
    "}",
    "",
    "Resume Text:",
    cleanText,
  ].join("\n");
}

function fallbackAnalysis(reason: string): StructuredResumeAnalysis {
  return {
    overallScore: 60,
    keyStrengths: ["Resume text was extracted successfully"],
    weaknesses: ["Automated analysis unavailable right now"],
    suggestedImprovements: ["Retry in a moment for deeper analysis"],
    missingSkills: ["Role-specific tooling", "Domain certifications"],
    summary: reason,
  };
}

function formatForChat(analysis: StructuredResumeAnalysis): string {
  const strengths = analysis.keyStrengths.length > 0 ? analysis.keyStrengths : ["No strengths detected"];
  const improvements = analysis.suggestedImprovements.length > 0 ? analysis.suggestedImprovements : ["No improvements provided"];
  const suggestions = analysis.missingSkills.length > 0 ? analysis.missingSkills : ["No missing skills detected"];

  return [
    "ðŸ“„ Resume Analysis",
    "",
    `Score: ${analysis.overallScore}/100`,
    "",
    "âœ… Strengths:",
    ...strengths.map((item) => `- ${item}`),
    "",
    "âš ï¸ Improvements:",
    ...improvements.map((item) => `- ${item}`),
    "",
    "ðŸš€ Suggestions:",
    ...suggestions.map((item) => `- ${item}`),
  ].join("\n");
}

async function callOllama(prompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "phi3";

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 650,
      },
    }),
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`Ollama failed: ${response.status}`);
  }

  const payload = (await response.json()) as { response?: string };
  const text = (payload.response || "").trim();
  if (!text) {
    throw new Error("Ollama returned empty response");
  }

  return text;
}

async function callOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: AI_TIMEOUT_MS, maxRetries: 1 });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a strict resume reviewer and must output valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 650,
    response_format: { type: "json_object" },
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty response");
  }

  return text;
}

async function analyzeWithFallback(cleanText: string): Promise<{ analysis: StructuredResumeAnalysis; provider: AIProvider }> {
  const prompt = buildPrompt(cleanText);
  const startedAt = Date.now();

  const remainingBudget = () => TOTAL_AI_BUDGET_MS - (Date.now() - startedAt);
  const runWithinBudget = async <T>(label: string, call: () => Promise<T>): Promise<T> => {
    const budget = remainingBudget();
    if (budget <= 0) {
      throw new Error(`${label} skipped: total AI budget exhausted`);
    }
    const timeout = Math.min(AI_TIMEOUT_MS, budget);
    return withTimeout(call(), timeout, label);
  };

  try {
    const ollamaRaw = await runWithinBudget("Ollama analysis", () => callOllama(prompt));
    const parsed = parseStructuredAnalysis(ollamaRaw);
    if (parsed) {
      return { analysis: parsed, provider: "ollama" };
    }
    console.warn("[Resume] Ollama JSON parse failed, trying OpenAI fallback");
  } catch (error) {
    console.warn("[Resume] Ollama failed, trying OpenAI fallback:", error instanceof Error ? error.message : String(error));
  }

  try {
    const openAiRaw = await runWithinBudget("OpenAI analysis", () => callOpenAI(prompt));
    const parsed = parseStructuredAnalysis(openAiRaw);
    if (parsed) {
      return { analysis: parsed, provider: "openai" };
    }
    return {
      analysis: fallbackAnalysis("AI returned non-JSON output. Using fallback analysis."),
      provider: "fallback",
    };
  } catch (error) {
    console.warn("[Resume] OpenAI fallback failed:", error instanceof Error ? error.message : String(error));
  }

  return {
    analysis: fallbackAnalysis("AI providers were unavailable. Fallback analysis generated."),
    provider: "fallback",
  };
}

async function persistResumeContext(input: MuskResumeAnalysisInput, cleanText: string): Promise<void> {
  const existing = await db
    .select()
    .from(resumeContextCache)
    .where(eq(resumeContextCache.userId, input.userId))
    .limit(1)
    .catch(() => [] as any[]);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (existing.length > 0) {
    await db
      .update(resumeContextCache)
      .set({
        resumeText: cleanText,
        resumeTextPreview: cleanText.slice(0, 1000),
        fileName: input.fileName ?? null,
        fileSize: input.fileSize ?? cleanText.length,
        fileType: input.fileType ?? "application/pdf",
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(resumeContextCache.userId, input.userId));
  } else {
    await db.insert(resumeContextCache).values({
      userId: input.userId,
      resumeText: cleanText,
      resumeTextPreview: cleanText.slice(0, 1000),
      detectedRole: null,
      skills: [],
      detectedIndustry: null,
      fileName: input.fileName ?? null,
      fileSize: input.fileSize ?? cleanText.length,
      fileType: input.fileType ?? "application/pdf",
      expiresAt,
    });
  }
}

export async function extractResumeTextFromPdfUpload(file: Express.Multer.File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.mimetype !== "application/pdf") {
    throw new Error("Invalid file. Only PDF is allowed.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File too large. Max size is 5MB.");
  }

  let buffer: Buffer;
  if (file.buffer && file.buffer.length > 0) {
    buffer = file.buffer;
  } else if (file.path) {
    const chunks: Buffer[] = [];
    const stream = fs.createReadStream(file.path);
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    buffer = Buffer.concat(chunks);
  } else {
    throw new Error("Unable to access uploaded file");
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const cleaned = cleanResumeText(result.text || "");
    if (cleaned.length < MIN_RESUME_CHARS) {
      throw new Error("Invalid resume");
    }
    return cleaned;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function analyzeMuskResume(input: MuskResumeAnalysisInput): Promise<{
  summary: string;
  highlights: string[];
  score: number;
  provider: AIProvider;
  parsed: StructuredResumeAnalysis;
}> {
  const cleanedText = cleanResumeText(input.resumeText || "");
  if (cleanedText.length < MIN_RESUME_CHARS) {
    throw new Error("Invalid resume");
  }

  const truncatedText = shortenForAI(cleanedText);
  console.log("[Resume] Sending to AI");
  const { analysis, provider } = await analyzeWithFallback(truncatedText);
  console.log("[Resume] AI response received");

  await persistResumeContext(input, cleanedText);

  const highlights = Array.from(new Set([
    input.fileName ? `File: ${input.fileName}` : "PDF uploaded",
    `Provider: ${provider}`,
    `Text length: ${cleanedText.length}`,
  ]));

  return {
    summary: formatForChat(analysis),
    highlights,
    score: analysis.overallScore,
    provider,
    parsed: analysis,
  };
}

export async function cleanupUploadedResumeFile(file?: Express.Multer.File): Promise<void> {
  if (!file?.path) return;
  await fs.promises.unlink(file.path).catch(() => undefined);
}
