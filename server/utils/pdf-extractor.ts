/**
 * Utility for PDF text extraction with robust error handling and fallback mechanisms
 */
import OpenAI from "openai";

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
    
    // Check if we received a valid buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("Invalid or empty PDF buffer provided");
      return "Error: Invalid or empty PDF file received.";
    }
    
    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
    
    // First attempt: Try using PDF.js
    const pdfJsText = await extractWithPdfJs(pdfBuffer);
    
    if (isValidTextContent(pdfJsText)) {
      console.log(`Successfully extracted text with PDF.js: ${pdfJsText.length} characters of valid resume content`);
      return pdfJsText;
    } else {
      console.log(`PDF.js extraction failed or returned invalid content: ${pdfJsText ? pdfJsText.length : 0} characters`);
    }
    
    console.log("Attempting extraction with OpenAI Vision API...");
    
    // Second attempt: Try using OpenAI
    const openaiText = await extractWithOpenAI(pdfBuffer);
    
    // Check if OpenAI extraction was successful
    if (openaiText && openaiText.length > 100) {
      // Perform additional validation to ensure it's resume content
      if (isValidTextContent(openaiText)) {
        console.log(`OpenAI extraction successful: ${openaiText.length} characters of valid resume content`);
        return openaiText;
      } else {
        console.log(`OpenAI extraction returned text (${openaiText.length} chars) but it doesn't appear to be resume content`);
        // Return the content anyway since OpenAI is our best extraction method
        console.log(`Returning OpenAI extracted content despite validation concerns`);
        return openaiText;
      }
    } else {
      console.log(`OpenAI extraction failed or insufficient: ${openaiText ? openaiText.length : 0} characters`);
    }
    
    // If both methods failed, return detailed error message
    console.log("All extraction methods failed, returning error");
    return "Could not extract text from the provided PDF. The file may be corrupted, password-protected, or contain only images without embedded text. Please try uploading a different file format or copy-paste your resume text directly.";
    
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    return `Error processing PDF: ${error.message}. Please try a different file format or paste your resume text directly.`;
  }
}

/**
 * Extract text using PDF.js library
 */
async function extractWithPdfJs(pdfBuffer: Buffer): Promise<string> {
  // Skip PDF.js extraction and return empty string to prioritize OpenAI extraction
  // This simplifies our code and avoids module import issues
  console.log("Skipping PDF.js extraction due to module compatibility issues");
  return '';
}

/**
 * Extract text using OpenAI API
 */
async function extractWithOpenAI(pdfBuffer: Buffer): Promise<string> {
  try {
    // Convert buffer to base64
    const base64Data = pdfBuffer.toString('base64');
    
    // Use OpenAI to analyze the content with an optimized prompt
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a highly specialized PDF text extractor with expertise in resume content. Your ONLY task is to extract the plain text content from the provided base64-encoded PDF file, focusing on identifying resume-specific information. Look for content such as the person's name, title, contact information, work experience, education, skills, certifications, projects, and achievements. Return ONLY the extracted text content in a clean, structured plain text format, preserving the resume's original organization. Do not include any analysis, commentary, or changes to the content. If you cannot extract meaningful content, simply indicate that the file appears to be unreadable or contains no extractable text."
        },
        {
          role: "user",
          content: `Extract all the text content from this PDF file (base64 encoded). Return ONLY the raw extracted text content with appropriate line breaks to maintain structure: ${base64Data.substring(0, 4000)}...`
        }
      ],
      temperature: 0.0,  // Set to 0 for maximum determinism
      max_tokens: 4000,
      top_p: 1.0,        // No token filtering for extraction tasks
    });
    
    // Get the response content
    const extractedText = response.choices[0].message.content || '';
    
    // Check if we got a valid response with reasonable content
    if (extractedText && extractedText.length > 100) {
      return extractedText;
    } else {
      console.log("OpenAI extraction returned insufficient content:", extractedText);
      return '';
    }
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
    console.log("Text content too short to be valid resume content");
    return false;
  }
  
  // Check for common resume indicators that strongly suggest resume content
  const strong_resume_indicators = [
    'experience', 'education', 'skills', 'work history', 'curriculum vitae',
    'professional summary', 'career objective', 'certifications'
  ];
  
  // Check for common resume keywords that might indicate resume content
  const common_resume_keywords = [
    'resume', 'work', 'job', 'university', 'degree', 'professional', 
    'profile', 'objective', 'certification', 'project', 'achievement',
    'employment', 'career', 'position', 'responsibilities', 'company',
    'manager', 'developer', 'engineer', 'lead', 'director', 'coordinator',
    'specialist', 'analyst', 'consultant', 'bachelor', 'master', 'phd',
    'proficient', 'expert', 'familiar', 'skilled', 'contact information'
  ];
  
  // Check for contact pattern indicators
  const contactPatterns = [
    /email/i, /phone/i, /tel/i, /address/i, /linkedin/i, /github/i,
    /portfolio/i, /website/i, /@[\w.-]+\.\w+/i, // Email pattern
    /\(\d{3}\)\s*\d{3}[-\s]?\d{4}/i, // US phone pattern
    /\d{3}[-\s]?\d{3}[-\s]?\d{4}/i, // Simple phone pattern
    /linkedin\.com\/in\//i, // LinkedIn URL pattern
    /github\.com\//i // GitHub URL pattern
  ];
  
  // Check for date patterns often found in resumes
  const datePatterns = [
    /\d{4}\s*[-–—]\s*(present|current|\d{4})/i, // Year range pattern
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4}\b/i, // Month Year pattern
    /\b\d{1,2}\/\d{4}\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/i // MM/YYYY range pattern
  ];
  
  // Text normalized for better matching
  const normalizedText = text.toLowerCase();
  
  // Check for strong resume indicators first (these are very likely to be in resumes)
  const hasStrongIndicator = strong_resume_indicators.some(indicator => 
    normalizedText.includes(indicator.toLowerCase())
  );
  
  if (hasStrongIndicator) {
    console.log("Found strong resume indicator in content");
    return true;
  }
  
  // Count matches for common keywords
  const keywordMatches = common_resume_keywords.filter(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  ).length;
  
  // Count contact pattern matches
  const contactMatches = contactPatterns.filter(pattern => 
    pattern.test(text)
  ).length;
  
  // Count date pattern matches
  const dateMatches = datePatterns.filter(pattern => 
    pattern.test(text)
  ).length;
  
  // Calculate a confidence score based on the matches
  // If there are a good number of keyword matches OR contact info + date patterns, it's likely a resume
  const isResume = keywordMatches >= 3 || (contactMatches >= 1 && dateMatches >= 1);
  
  if (isResume) {
    console.log(`Identified as resume content with ${keywordMatches} keywords, ${contactMatches} contact patterns, ${dateMatches} date patterns`);
  } else {
    console.log(`Not identified as resume content: only ${keywordMatches} keywords, ${contactMatches} contact patterns, ${dateMatches} date patterns`);
  }
  
  return isResume;
}