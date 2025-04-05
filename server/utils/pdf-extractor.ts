/**
 * Utility for PDF text extraction with robust error handling and fallback mechanisms
 */
import * as pdfjs from 'pdfjs-dist';
import OpenAI from "openai";

// Ensure the PDF.js worker is set up correctly
const pdfjsLib = pdfjs as any;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Extract text from a PDF file using multiple approaches with fallbacks
 * @param pdfBuffer PDF file as a Buffer
 * @returns Extracted text content or error message
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting PDF text extraction...");
    // First attempt: Try using PDF.js
    const pdfJsText = await extractWithPdfJs(pdfBuffer);
    
    if (isValidTextContent(pdfJsText)) {
      console.log(`Successfully extracted text with PDF.js: ${pdfJsText.length} characters`);
      return pdfJsText;
    }
    
    console.log("PDF.js extraction failed or returned insufficient text, trying with OpenAI...");
    
    // Second attempt: Try using OpenAI
    const openaiText = await extractWithOpenAI(pdfBuffer);
    
    if (isValidTextContent(openaiText)) {
      console.log(`Successfully extracted text with OpenAI: ${openaiText.length} characters`);
      return openaiText;
    }
    
    console.log("All extraction methods failed, returning error");
    return "Could not extract text from the provided PDF. The file may be corrupted, password-protected, or contain only images without embedded text.";
    
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    return `Error processing PDF: ${error.message}`;
  }
}

/**
 * Extract text using PDF.js library
 */
async function extractWithPdfJs(pdfBuffer: Buffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error("PDF.js extraction failed:", error);
    return '';
  }
}

/**
 * Extract text using OpenAI API
 */
async function extractWithOpenAI(pdfBuffer: Buffer): Promise<string> {
  try {
    // Convert buffer to base64
    const base64Data = pdfBuffer.toString('base64');
    
    // Use OpenAI to analyze the content
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a specialized PDF text extractor. Your job is to read the PDF content from the provided base64-encoded file and extract meaningful text from it. Focus on identifying resume content such as name, experience, skills, education, etc. Return ONLY the extracted content in plain text format, do not include any analysis or commentary."
        },
        {
          role: "user",
          content: `Extract the text content from this PDF file (base64 encoded): ${base64Data.substring(0, 4000)}...`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });
    
    return response.choices[0].message.content || '';
  } catch (error: any) {
    console.error("OpenAI extraction failed:", error);
    return '';
  }
}

/**
 * Check if the extracted text is valid and contains actual resume content
 */
function isValidTextContent(text: string): boolean {
  if (!text || text.length < 100) {
    return false;
  }
  
  // Check for common resume keywords to verify we have actual resume content
  const resumeKeywords = [
    'resume', 'experience', 'education', 'skills', 'work', 'job', 
    'university', 'degree', 'professional', 'profile', 'objective', 
    'certification', 'project', 'achievement'
  ];
  
  return resumeKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}