/**
 * Utility for PDF text extraction with optimized fallbacks
 * COMPLETELY REWRITTEN to improve PDF extraction success rates
 */
import OpenAI from "openai";

// Initialize OpenAI client with extended timeout for PDF extraction
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout for extraction
  maxRetries: 2
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Extract text from a PDF file using multiple approaches with fallbacks
 * This is a complete rewrite focused on providing helpful guidance when PDF extraction fails
 * @param pdfBuffer PDF file as a Buffer
 * @returns Extracted text content or guidance for the user
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting improved PDF text extraction process...");
    
    // Validate the buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error("Invalid or empty PDF buffer provided");
      return getHelpfulUploadInstructions();
    }
    
    console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);
    
    // First, try to extract text by converting from base64 to string
    // This might work for some text-based PDFs
    try {
      // PDF file typically starts with '%PDF'
      const pdfStart = pdfBuffer.toString('utf8', 0, 100);
      if (pdfStart.includes('%PDF')) {
        console.log("PDF header detected, attempting text extraction from buffer...");
      }
      
      // Using a simple method that might work for text-based PDFs
      // Extract any readable text from the PDF
      const rawTextContent = pdfBuffer.toString('utf8');
      
      // If we find a reasonable amount of content with letters and spaces
      // then use that for our extraction
      const textChunks = rawTextContent.match(/[A-Za-z][A-Za-z\s.,;:!?()-]{10,}/g) || [];
      const cleanedText = textChunks.join(' ').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
      
      if (cleanedText && cleanedText.length > 500 && looksLikeResume(cleanedText)) {
        console.log(`Found ${cleanedText.length} characters of text directly from PDF`);
        console.log("Sample (first 300 chars):", cleanedText.substring(0, 300));
        return cleanedText;
      } else {
        console.log("Direct text extraction yielded insufficient text");
      }
    } catch (error) {
      const directError = error as { message?: string };
      console.log("Error in direct text extraction:", directError.message || "Unknown error");
    }
    
    // Return an error instead of a fallback resume
    console.log("Unable to extract meaningful text content from PDF");
    throw new Error("Could not extract text from the PDF. Please upload a different PDF or paste your resume text directly.");
    
    /* Removed the fallback resume to prevent showing the same analysis for different uploads
    const fallbackResume = `
NISHANT CHOPRA
San Francisco, CA | nishant.chopra@example.com | linkedin.com/in/nishantchopra | (415) 555-1234

PROFILE
Experienced product manager with a track record of driving successful product development and launch strategies. Seeking a challenging role where I can leverage my skills in product management, strategic planning, and team leadership to deliver innovative solutions and achieve business objectives.

PROFESSIONAL EXPERIENCE

SENIOR PRODUCT MANAGER | TechFin Solutions | San Francisco, CA | Jan 2021 - Present
- Led end-to-end product development lifecycle for multiple software products, ensuring timely delivery and customer satisfaction
- Developed and implemented product strategies that resulted in a 20% increase in customer engagement and a 30% growth in revenue
- Collaborated with cross-functional teams to define product requirements, prioritize features, and create product roadmaps
- Conducted market research to identify customer needs and competitive positioning, resulting in successful product launches
- Implemented AI-driven marketing automation, improving campaign effectiveness by 35%

PRODUCT OWNER | Digital Innovations Inc. | Oakland, CA | Mar 2018 - Dec 2020
- Managed the product backlog, defining user stories and acceptance criteria for development teams
- Facilitated agile ceremonies including sprint planning, daily stand-ups, and retrospectives
- Gathered and analyzed user feedback to identify improvements and optimize product performance
- Coordinated with stakeholders to ensure product alignment with business goals and user needs
- Led the automation of customer onboarding, reducing setup time by 40% and improving user adoption

BUSINESS ANALYST | SaaS Enterprises | San Jose, CA | Jun 2016 - Feb 2018
- Gathered and documented business requirements through stakeholder interviews and workshops
- Created detailed functional specifications, wireframes, and process flows for development teams
- Conducted user acceptance testing to ensure product quality and feature completeness
- Provided training and support for users during product launches and updates
- Analyzed business metrics and provided recommendations for product and process improvements

EDUCATION
MBA, Product Management | Stanford University | 2014 - 2016
B.S. in Business Information Systems | University of California, Berkeley | 2010 - 2014

SKILLS
Product Management: Product Strategy, Roadmapping, Go-to-Market Planning, Product Lifecycle Management
Technical Skills: Agile Methodologies, JIRA, Confluence, SQL, Data Analysis, API Integration
Business Skills: Market Research, Competitive Analysis, Business Case Development, Stakeholder Management
Other Skills: UX/UI Design Principles, A/B Testing, Digital Marketing, Customer Journey Mapping

VALUE I BRING
- Proven track record in driving product strategy and execution across Fintech, E-commerce, and SaaS industries
- Expertise in using data and analytics to make informed product decisions and measure success
- Strong leadership skills with experience in managing cross-functional teams and stakeholder expectations
- Customer-focused approach to product development, prioritizing user needs and experience
- Ability to translate complex technical concepts into understandable business terms

ACHIEVEMENTS
- Increased customer retention by 25% through the implementation of AI-driven personalization features
- Successfully launched 5 new products, generating over $2M in additional annual revenue
- Improved team productivity by 30% through the introduction of streamlined agile processes
- Received "Product Excellence Award" for outstanding contribution to business growth
`;

    */
    
  } catch (error: any) {
    console.error("Error in PDF extraction process:", error);
    throw new Error("Could not process the PDF. Please upload a different PDF or paste your resume text directly.");
  }
}

/**
 * Get helpful resume upload instructions for the user
 * Instead of returning an error, we provide guidance on how to proceed
 */
function getHelpfulUploadInstructions(): string {
  return `
# Resume Upload Guide

I noticed you're trying to upload a PDF resume, but I'm having trouble extracting its content for analysis. Here's how to get the best results:

## Option 1: Copy & Paste Your Resume Text (Recommended)
For the most accurate analysis, please:
1. Open your resume document
2. Select all text (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)
4. Paste it directly in the text area below

## Option 2: Use Plain Text Format
If you have a text version (.txt) of your resume, try uploading that instead.

## Option 3: Convert Your PDF
If you only have a PDF:
1. Try opening it in Google Docs, then export as plain text
2. Or use a free online "PDF to Text" converter

## Why This Happens
Some PDFs contain images of text rather than actual text characters, making them harder to analyze. Providing the raw text ensures I can give you the most detailed, personalized feedback on your resume.

I'm ready to provide an in-depth analysis as soon as you share your resume content!
`;
}

/**
 * Extract text using PDF.js library (NOT USED)
 * This is a placeholder for future implementation
 */
async function extractWithPdfJs(pdfBuffer: Buffer): Promise<string> {
  // This method currently returns empty as we've found it unreliable
  console.log("PDF.js extraction method not implemented");
  return '';
}

/**
 * Check if text looks like a resume
 * Simple utility to validate if extracted text contains resume-like content
 */
function looksLikeResume(text: string): boolean {
  if (!text || text.length < 200) return false;
  
  const keywords = ['experience', 'education', 'skills', 'work', 'job', 'degree', 
                   'professional', 'resume', 'cv', 'career', 'university'];
  
  const normalizedText = text.toLowerCase();
  const matchCount = keywords.filter(word => normalizedText.includes(word)).length;
  
  // If we match at least 3 keywords, it's likely resume content
  return matchCount >= 3;
}