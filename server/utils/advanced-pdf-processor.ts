import fs from 'fs/promises';
import { LocalAIService } from '../services/local-ai-service';
import path from 'path';
import { extractTextFromPdf } from './pdf-extractor';

const localAI = new LocalAIService();

/**
 * Advanced PDF processing system that implements Musk's multi-step approach
 * for complex PDF resume understanding.
 */
export async function processPdfWithAdvancedAlgorithm(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("🧠 Starting advanced PDF processing with Musk's intelligence...");
    
    // Step 1: Try direct extraction first (faster)
    console.log("Step 1: Attempting direct PDF text extraction");
    const extractedText = await extractTextFromPdf(pdfBuffer);
    
    // If we got meaningful text directly, return it
    if (extractedText && extractedText.length > 300) {
      console.log(`✅ Successfully extracted ${extractedText.length} chars directly from PDF`);
      return extractedText;
    }
    
    console.log("Direct extraction insufficient, proceeding to AI-powered extraction");
    
    // Step 2: Use local AI for semantic understanding of PDF content
    console.log("Step 2: Applying local AI model for semantic layout detection and content extraction");
    
    // Create a temporary file for the PDF
    const tmpDir = './tmp';
    try {
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (err: any) {
      console.log("Tmp dir already exists, continuing...");
    }
    
    const tmpFilePath = path.join(tmpDir, `resume-${Date.now()}.pdf`);
    await fs.writeFile(tmpFilePath, pdfBuffer);
    
    // Convert to base64 for API submission
    const base64Data = pdfBuffer.toString('base64');
    
    // Step 3: Use local AI to read and understand the PDF content with enhanced resume parsing prompt
    const extractedContent = await localAI.analyzeResume(base64Data);
    console.log(`✅ Extracted ${extractedContent.length} characters via local AI processing`);
    
    // Clean up temporary file
    await fs.unlink(tmpFilePath);
    
    return extractedContent;
    
  } catch (error: any) {
    console.error("Error in advanced PDF processing:", error);
    throw new Error(`Advanced PDF processing failed: ${error.message}`);
  }
}

/**
 * Analyzes the extracted resume text to create a structured representation
 * following Musk's semantic grouping approach.
 */
export async function createStructuredResumeData(resumeText: string) {
  try {
    console.log("🧠 Creating structured resume data using semantic grouping");
    
    const structuredData = await localAI.analyzeResume(resumeText);
    console.log("✅ Successfully created structured resume data");
    return structuredData;
    
  } catch (error: any) {
    console.error("Error creating structured resume data:", error);
    throw new Error(`Structured data creation failed: ${error.message}`);
  }
}