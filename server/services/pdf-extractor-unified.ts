/**
 * Unified PDF Extraction Service
 * 
 * Uses pdfjs-dist as the single source of truth for all PDF text extraction.
 * Replaces: pdf-parse, pdf.js-extract (which are now redundant).
 * Works on both Node.js and browser environments.
 */

/**
 * Extract text from a PDF buffer using pdfjs-dist
 * @param pdfBuffer PDF file as a Buffer
 * @returns Extracted text content from all pages
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting PDF text extraction with pdfjs-dist...");

    // Validate buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Invalid or empty PDF buffer provided");
    }

    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);

    // Import pdfjs dynamically
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");

    // Set worker source (required for pdfjs to function)
    const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

    let extractedText = "";

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Extracting text from page ${i} of ${pdf.numPages}`);
      
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Extract text items and maintain spacing
        const strings = content.items
          .map((item: any) => (item.str || "").trim())
          .filter((str: string) => str.length > 0)
          .join(" ");
        
        if (strings) {
          extractedText += strings + "\n";
        }
      } catch (pageError) {
        console.warn(`Warning: Failed to extract text from page ${i}:`, pageError);
        // Continue to next page instead of failing entirely
      }
    }

    if (!extractedText.trim()) {
      console.warn("No text extracted from PDF - may be an image-based PDF");
    }

    console.log(`Extracted ${extractedText.length} characters from ${pdf.numPages} pages`);
    return extractedText;
  } catch (error: unknown) {
    console.error("Error extracting PDF text with pdfjs-dist:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract text from PDF file path
 * @param filePath Path to PDF file
 * @returns Extracted text content
 */
export async function extractTextFromPdfFile(filePath: string): Promise<string> {
  try {
    const fs = await import("fs/promises");
    const buffer = await fs.readFile(filePath);
    return extractTextFromPdf(buffer);
  } catch (error: unknown) {
    console.error(`Error reading PDF file from path "${filePath}":`, error);
    throw new Error(
      `Failed to read PDF file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract first N pages of text from PDF
 * @param pdfBuffer PDF file as a Buffer
 * @param pageCount Number of pages to extract (default: all)
 * @returns Extracted text content
 */
export async function extractPartialPdf(
  pdfBuffer: Buffer,
  pageCount?: number
): Promise<string> {
  try {
    console.log(`Extracting first ${pageCount || "all"} pages from PDF...`);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Invalid or empty PDF buffer provided");
    }

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
    const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.js");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    const maxPages = pageCount && pageCount < pdf.numPages ? pageCount : pdf.numPages;

    let extractedText = "";

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item: any) => (item.str || "").trim())
        .filter((str: string) => str.length > 0)
        .join(" ");
      
      if (strings) {
        extractedText += strings + "\n";
      }
    }

    console.log(`Extracted ${extractedText.length} characters from ${maxPages} pages`);
    return extractedText;
  } catch (error: unknown) {
    console.error("Error extracting partial PDF:", error);
    throw error;
  }
}
