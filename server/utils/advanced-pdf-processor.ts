import fs from 'fs/promises';
import { OpenAI } from 'openai';
import path from 'path';
import { extractTextFromPdf } from './pdf-extractor';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
    
    // Step 2: Use GPT-4o for semantic understanding of PDF content
    console.log("Step 2: Applying AI model for semantic layout detection and content extraction");
    
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
    
    // Step 3: Use GPT-4o to read and understand the PDF content with enhanced resume parsing prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Musk, an AI resume expert with advanced PDF parsing capabilities. 
          Your task is to extract ALL text content from a resume PDF, maintaining its original structure and organization.
          
          Follow this process when extracting resume content:
          1. Identify all sections using semantic understanding (Work Experience, Education, Skills, etc.)
          2. Maintain proper hierarchical structure and formatting
          3. Preserve all bullet points, dates, job titles, and company names exactly as shown
          4. Extract any contact information, technical skills, certifications, and projects
          5. Keep the exact wording from the original resume
          
          Format your response as plain text with clear section headers and appropriate spacing.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This is a resume PDF. Please extract ALL text content while preserving the structure and organization. Include all section headers, personal details, work experience entries (with dates, titles, companies), education, skills, and any other information present. Do not summarize or skip any content."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.0
    });
    
    // Clean up the temporary file
    await fs.unlink(tmpFilePath);
    
    const aiExtractedText = completion.choices[0].message.content;
    
    if (!aiExtractedText || aiExtractedText.length < 200) {
      console.log("❌ AI extraction failed or returned insufficient text");
      throw new Error("Failed to extract meaningful text from the PDF using AI");
    }
    
    console.log(`✅ Successfully extracted ${aiExtractedText.length} chars from PDF using advanced AI`);
    console.log("First 100 chars:", aiExtractedText.substring(0, 100));
    
    return aiExtractedText;
    
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
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Musk, an AI resume expert that converts raw resume text into structured JSON data.
          Parse the resume text and extract key information into a structured format.
          
          Include these sections in your JSON output:
          - personal_info (name, email, phone, location, portfolio links)
          - summary
          - experience (array of jobs with company, title, dates, and bullet points)
          - education (array of schools with degree, institution, dates)
          - skills (grouped by category if possible)
          - certifications
          - projects (if present)
          - additional_sections (any other resume sections)
          
          Format each section properly and include all information from the original text.
          If certain information is missing or unclear, use null values rather than making assumptions.`
        },
        {
          role: "user",
          content: `Convert this resume text into a structured JSON format:
          
          ${resumeText}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.0
    });
    
    const structuredData = completion.choices[0].message.content;
    console.log("✅ Successfully created structured resume data");
    
    return structuredData;
  } catch (error: any) {
    console.error("Error creating structured resume data:", error);
    return null;
  }
}

/**
 * Implements the full Musk PDF understanding pipeline as described in the requirements.
 * This function orchestrates the multiple steps needed for intelligent PDF resume processing.
 */
export async function muskResumeIntelligence(pdfBuffer: Buffer): Promise<{
  extractedText: string,
  structuredData?: string,
  confidenceScore?: number
}> {
  try {
    // Step 1 & 2: Extract text with advanced processing
    const extractedText = await processPdfWithAdvancedAlgorithm(pdfBuffer);
    
    // Step 3: Create structured data representation (optional)
    // Only do this if needed for specific functionality
    // const structuredData = await createStructuredResumeData(extractedText);
    
    return {
      extractedText,
      confidenceScore: 0.95, // Placeholder for a real confidence scoring system
    };
  } catch (error: any) {
    console.error("Error in Musk Resume Intelligence pipeline:", error);
    throw new Error(`Resume intelligence processing failed: ${error.message}`);
  }
}