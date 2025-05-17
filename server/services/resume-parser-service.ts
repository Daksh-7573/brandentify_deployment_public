import OpenAI from "openai";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { PDFExtract } from 'pdf.js-extract';
import multer from 'multer';
import { Express } from 'express';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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
    const data = await extractPDF(filePath, { type: 'text' });
    
    // Handle the data safely with proper type checking
    if (data && data.pages && Array.isArray(data.pages)) {
      return data.pages
        .map(page => {
          if (page.content && Array.isArray(page.content)) {
            return page.content
              .map(item => {
                if (item && typeof item === 'object' && 'str' in item) {
                  return item.str || '';
                }
                return '';
              })
              .join(' ');
          }
          return '';
        })
        .join('\n');
    }
    
    return 'Failed to extract content from PDF';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a file based on its MIME type
 */
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  } else if (
    mimeType === 'application/msword' || 
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // For Word documents, we would need to use a specialized library
    // For now, we'll throw an error
    throw new Error('Word document parsing not implemented yet');
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Clean up a temporary file
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
    console.log(`Deleted temporary file: ${filePath}`);
  } catch (error) {
    console.warn(`Failed to delete temporary file: ${filePath}`, error);
  }
}

/**
 * Use OpenAI to parse resume content
 */
export async function parseResume(resumeText: string): Promise<any> {
  try {
    const prompt = `
    Parse the following resume text and extract the following information in JSON format:
    - Personal information (name, email, phone, location, website)
    - Professional summary or objective
    - Work experiences (company, title, date range, description, achievements)
    - Education (institution, degree, field of study, date range)
    - Skills (technical, soft, languages)
    - Projects (if any)
    - Certifications (if any)
    
    Format the response as a JSON object with the following structure:
    {
      "personalInfo": {
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "website": ""
      },
      "summary": "",
      "experiences": [
        {
          "company": "",
          "title": "",
          "startDate": "",
          "endDate": "",
          "description": "",
          "achievements": []
        }
      ],
      "education": [
        {
          "institution": "",
          "degree": "",
          "fieldOfStudy": "",
          "startDate": "",
          "endDate": ""
        }
      ],
      "skills": [],
      "projects": [],
      "certifications": []
    }
    
    Resume text:
    ${resumeText}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing resume with OpenAI:', error);
    throw new Error('Failed to parse resume content');
  }
}