/**
 * Utility for PDF text extraction with pdf-parse library
 */

/**
 * Extract text from a PDF file using pdf-parse library
 * @param pdfBuffer PDF file as a Buffer
 * @returns Extracted text content
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting PDF text extraction with pdf-parse...");
    
    // Validate the buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Invalid or empty PDF buffer provided");
    }
    
    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
    
    // Dynamically import pdf-parse - it exports PDFParse as a named export
    const { PDFParse } = await import('pdf-parse');
    
    // Use pdf-parse to extract text
    const data = await PDFParse(pdfBuffer);
    
    console.log(`[PDF EXTRACTOR] Extracted text length: ${data.text.length} characters`);
    console.log(`[PDF EXTRACTOR] Number of pages: ${data.numpages}`);
    console.log(`[PDF EXTRACTOR] Text preview: "${data.text.substring(0, 300)}..."`);
    
    // Validate extracted text
    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF appears to be scanned or image-based. Please use a text-based PDF or paste your resume text directly.');
    }
    
    // Clean up the extracted text
    const cleanedText = data.text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
    
    console.log(`[PDF EXTRACTOR] Returning ${cleanedText.length} characters of cleaned text`);
    
    return cleanedText;
    
  } catch (error: any) {
    console.error("[PDF EXTRACTOR] Error extracting text from PDF:", error.message);
    
    // If it's a pdf-parse specific error, provide helpful guidance
    if (error.message && error.message.includes('Invalid PDF')) {
      throw new Error('The uploaded file is not a valid PDF. Please upload a valid PDF file or paste your resume text directly.');
    }
    
    // Generic error - might be scanned PDF
    throw new Error('Could not extract text from PDF. This often happens with scanned PDFs or image-based PDFs. Please paste your resume text directly for the best results.');
  }
}
