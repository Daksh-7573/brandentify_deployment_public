/**
 * A simple PDF parser that extracts text directly from a buffer.
 * This approach bypasses OpenAI completely, avoiding any API issues.
 */

/**
 * Extract text from binary file data
 * @param fileBuffer The binary file buffer
 * @returns The extracted text content
 */
export async function extractTextFromBinaryData(fileBuffer: Buffer): Promise<string> {
  try {
    console.log(`Starting text extraction from binary data, buffer size: ${fileBuffer.length} bytes`);
    
    // Check if it's a PDF by looking at the signature
    const isPdf = fileBuffer.length > 4 && 
                  fileBuffer[0] === 0x25 && // %
                  fileBuffer[1] === 0x50 && // P
                  fileBuffer[2] === 0x44 && // D
                  fileBuffer[3] === 0x46;   // F
    
    if (isPdf) {
      console.log("File identified as PDF based on signature");
      return extractTextFromPdf(fileBuffer);
    } else {
      console.log("File not identified as PDF, attempting to extract as plain text");
      return extractPlainText(fileBuffer);
    }
  } catch (error: unknown) {
    console.error("Error in extractTextFromBinaryData:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text from binary data: ${errorMessage}`);
  }
}

/**
 * Extract text from a PDF buffer using pdf.js
 * @param fileBuffer PDF file buffer
 * @returns The extracted text content
 */
async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  try {
    console.log("Using pdf.js to extract text from PDF");
    
    // Import pdf.js - we'll handle the case where it's not installed
    try {
      // This is wrapped in a try/catch since we're using a fallback approach anyway
      // @ts-ignore - Ignore the TypeScript error about missing module
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
      // @ts-ignore - Ignore the TypeScript error about missing module
      const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.js');
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    
      console.log("Loading PDF document with pdf.js");
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    let extractedText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Extracting text from page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      extractedText += strings.join(' ') + '\n';
    }
    
    console.log(`Extracted ${extractedText.length} characters of text from PDF`);
    return extractedText;
  } catch (error: unknown) {
    console.error("Error in PDF text extraction:", error);
    
    // Try alternative method: Basic PDF text extraction with patterns
    console.log("Attempting basic pattern-based PDF text extraction");
    return basicPdfTextExtraction(fileBuffer);
  }
}

/**
 * Basic PDF text extraction using simple patterns
 * @param fileBuffer The PDF buffer
 * @returns The extracted text content
 */
function basicPdfTextExtraction(fileBuffer: Buffer): string {
  try {
    console.log("Performing basic pattern-based PDF text extraction");
    
    // Convert buffer to string
    const pdfText = fileBuffer.toString('utf-8');
    
    // Look for text markers in PDF
    const textContentPattern = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
    const matches = pdfText.match(textContentPattern) || [];
    
    // Extract text from parentheses (simplified PDF text extraction)
    let extractedText = matches
      .map(match => match.slice(1, -1)) // Remove surrounding parentheses
      .join(' ')
      .replace(/\\(\d{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\[nr]/g, '\n') // Replace PDF newlines and returns
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    // Fall back to first 5000 chars of raw content if pattern extraction failed
    if (extractedText.length < 100) {
      console.log("Pattern extraction produced insufficient text, using raw content");
      extractedText = pdfText.substring(0, 5000);
    }
    
    console.log(`Basic extraction produced ${extractedText.length} characters`);
    return extractedText;
  } catch (error: unknown) {
    console.error("Error in basic PDF text extraction:", error);
    // Return empty string if both methods fail
    return "";
  }
}

/**
 * Extract text from non-PDF binary data
 * @param fileBuffer The binary file buffer
 * @returns The extracted text content
 */
function extractPlainText(fileBuffer: Buffer): string {
  try {
    console.log("Attempting to extract text from binary file as plain text");
    
    // Try UTF-8 first
    let text = fileBuffer.toString('utf-8');
    
    // If the text contains mostly unprintable characters, try other encodings
    if (text.replace(/[\x20-\x7E]/g, '').length > text.length * 0.7) {
      console.log("UTF-8 decoding produced mostly unprintable characters, trying latin1");
      text = fileBuffer.toString('latin1');
    }
    
    // Clean up the text (remove control characters)
    const cleanText = text
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars except \n (0x0A) and \r (0x0D)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log(`Extracted ${cleanText.length} characters from non-PDF file`);
    return cleanText;
  } catch (error: unknown) {
    console.error("Error in plain text extraction:", error);
    return "";
  }
}