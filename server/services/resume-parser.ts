import { PDFParse } from "pdf-parse";

const MIN_EXTRACTED_LENGTH = 40;

/**
 * Extract plain text from a PDF buffer using pdf-parse (PDFParse class).
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!buffer?.length) {
    throw new Error("PDF file is empty.");
  }

  let parser: PDFParse | null = null;

  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result?.text || "").trim();

    if (text.length >= MIN_EXTRACTED_LENGTH) {
      return text;
    }

    throw new Error(
      text.length === 0
        ? "No readable text found in this PDF."
        : "Too little text extracted from this PDF."
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ResumeParser] pdf-parse failed:", message);

    if (message.includes("Invalid PDF") || message.includes("PDF structure")) {
      throw new Error("This file is not a valid PDF. Export your resume as PDF and try again.");
    }

    if (message.includes("Too little text") || message.includes("No readable text")) {
      throw new Error(
        "This PDF appears to be image-only (scanned). Use a text-based PDF or run OCR first."
      );
    }

    throw new Error(`Failed to extract text from PDF: ${message}`);
  } finally {
    if (parser) {
      await parser.destroy().catch(() => undefined);
    }
  }
}
