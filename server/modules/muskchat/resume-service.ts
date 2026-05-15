import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { db } from "../../db";
import { muskResumeUploads } from "@shared/schema";
import { generateMuskChatResponse } from "./ai-provider";
import { buildResumeMessages } from "./prompts";
import { extractTextFromPDF } from "../../services/resume-parser";
import type { MuskProviderResult } from "./types";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MIN_TEXT_LENGTH = 80;
const PRIVATE_UPLOAD_DIR = path.join(process.cwd(), "private_uploads", "musk-resumes");

export const RESUME_MIME_TYPES = new Set(["application/pdf"]);

export function validateResumeFile(file: Express.Multer.File): void {
  if (!file) {
    throw new Error("No resume file was uploaded.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Resume file is too large. Upload a PDF under 8MB.");
  }

  const ext = path.extname(file.originalname || "").toLowerCase();
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
  const isPdfExt = ext === ".pdf";

  if (!isPdfMime && !isPdfExt) {
    throw new Error("Only PDF resumes are supported. Please upload a .pdf file.");
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function extractResumeText(file: Express.Multer.File): Promise<string> {
  validateResumeFile(file);

  if (!file.buffer?.length) {
    throw new Error("The uploaded PDF could not be read. Please try again.");
  }

  let rawText = "";
  try {
    rawText = await extractTextFromPDF(file.buffer);
  } catch (error) {
    console.error("[Musk Resume] pdf-parse extraction failed:", error);
    throw new Error(
      "Could not extract text from this PDF. Use a text-based PDF (not a scanned image-only file)."
    );
  }

  const text = cleanExtractedText(rawText);
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "Too little text was found in this PDF. Export a text-based resume PDF or run OCR before uploading."
    );
  }

  return text;
}

async function storeResumeFile(file: Express.Multer.File, userId: number): Promise<string> {
  await fs.promises.mkdir(PRIVATE_UPLOAD_DIR, { recursive: true });
  const fileName = `${userId}-${Date.now()}-${randomUUID()}.pdf`;
  const filePath = path.join(PRIVATE_UPLOAD_DIR, fileName);
  await fs.promises.writeFile(filePath, file.buffer);
  return `private://musk-resumes/${fileName}`;
}

function extractScore(markdown: string): number | null {
  const scoreMatch = markdown.match(/(?:score|overall score)[^\d]{0,20}(\d{1,3})\s*(?:\/|out of)?\s*100/i);
  if (!scoreMatch) return null;
  const score = Number.parseInt(scoreMatch[1], 10);
  if (!Number.isFinite(score)) return null;
  return Math.max(0, Math.min(100, score));
}

export async function analyzeResumeUpload(params: {
  userId: number;
  conversationId?: number;
  file: Express.Multer.File;
  onToken?: (token: string) => void;
  onProvider?: (provider: string, model: string) => void;
}): Promise<{
  extractedText: string;
  fileUrl: string;
  ai: MuskProviderResult;
  score: number | null;
}> {
  const extractedText = await extractResumeText(params.file);
  const fileUrl = await storeResumeFile(params.file, params.userId);
  const ai = await generateMuskChatResponse(buildResumeMessages(extractedText), {
    onToken: params.onToken,
    onProvider: (provider, model) => params.onProvider?.(provider, model),
  });

  return {
    extractedText,
    fileUrl,
    ai,
    score: extractScore(ai.content),
  };
}

export async function persistResumeUpload(params: {
  userId: number;
  conversationId?: number;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  aiFeedback: string;
  score: number | null;
  providerUsed: string;
}) {
  const [upload] = await db
    .insert(muskResumeUploads)
    .values({
      userId: params.userId,
      conversationId: params.conversationId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      extractedText: params.extractedText,
      aiFeedback: params.aiFeedback,
      score: params.score,
      providerUsed: params.providerUsed,
    })
    .returning();

  return upload;
}
