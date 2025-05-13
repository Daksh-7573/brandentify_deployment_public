import OpenAI from "openai";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { PDFExtract } from 'pdf.js-extract';
import multer from 'multer';
import { Express } from 'express';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
// do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Setup OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// PDF extraction
const pdfExtract = new PDFExtract();
const extractPDF = promisify(pdfExtract.extract.bind(pdfExtract));

// Setup upload directory and multer
const uploadDir = path.join(process.cwd(), '/public/uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Configure upload limits
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file type is supported
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are supported.') as any);
    }
  },
});

/**
 * Extract text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text content
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const data = await extractPDF(filePath);
    // Join all page content
    return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a Word document
 * This is a placeholder - in a real implementation, you'd use a library like mammoth.js
 */
async function extractTextFromWord(filePath: string): Promise<string> {
  throw new Error('Word document extraction not implemented yet');
}

/**
 * Extract text from a resume file
 * @param filePath Path to the resume file
 * @param fileType MIME type of the file
 * @returns Extracted text content
 */
export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromWord(filePath);
  } else {
    throw new Error('Unsupported file type');
  }
}

/**
 * Parse a resume using OpenAI GPT-4o
 * @param resumeText The text content of the resume
 * @returns Structured data extracted from the resume
 */
export async function parseResume(resumeText: string): Promise<any> {
  try {
    // Prepare the prompt for GPT
    const prompt = `
      I need you to carefully analyze this resume text and extract structured information for a professional profile.
      
      Please extract the following information in a structured JSON format:
      
      - personalInfo: name, title, location, email, phone, summary
      - skills: array of {name, category, level} objects where level is 1-5 based on emphasis or years of experience
      - workExperience: array of jobs with {title, company, location, startDate, endDate, description, highlights, industry, domain}
      - education: array of {degree, institution, location, startDate, endDate, fieldOfStudy, gpa, achievements}
      - projects: array of {title, description, technologies, url, startDate, endDate} 
      - certifications: array of {name, issuer, date, url}
      
      For complex resumes with design elements, pay special attention to:
      1. Properly associating dates with experiences
      2. Distinguishing job titles from company names
      3. Recognizing skills mentioned throughout the resume, not just in dedicated skills sections
      4. Identifying the current role based on date ranges (no end date typically means current position)
      5. Inferring industry and domain from context if not explicitly stated
      
      If the resume has unusual formatting or Canva-style design, focus primarily on extracting accurate content over preserving formatting.
      Ensure all text is extracted even if scattered across different visual sections.
      
      Return ONLY valid JSON without explanations or markdown. Missing or uncertain values should be omitted rather than guessed.
      
      Resume text:
      ${resumeText}
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    });
    
    // Parse and return the extracted data
    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error parsing resume with OpenAI:', error);
    throw new Error('Failed to parse resume content');
  }
}

/**
 * Clean up temporary files
 * @param filePath Path to the file to delete
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
}