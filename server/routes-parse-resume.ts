import { Request, Response } from 'express';
import { extractTextFromBinaryData } from './services/simple-pdf-parser-new';
import { parseResumeText } from './services/profile-parser';

/**
 * Handler for the /parse-resume endpoint that completely bypasses OpenAI
 * Uses simple-pdf-parser to extract text from binary files
 */
export async function handleParseResume(req: Request, res: Response) {
  try {
    console.log("Processing resume parsing request");
    
    let fileBuffer: Buffer;
    
    // Determine if the request has a raw buffer or a base64 string
    if (req.body.fileData) {
      console.log("Resume data provided as base64, converting to buffer");
      const base64Data = req.body.fileData.split(',')[1] || req.body.fileData;
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (req.file) {
      console.log("Resume data provided as multipart file, accessing buffer");
      fileBuffer = req.file.buffer;
    } else {
      console.error("No file data provided in request");
      return res.status(400).json({
        error: "No file data provided. Please upload a resume file or provide file data."
      });
    }
    
    console.log(`File buffer size: ${fileBuffer.length} bytes`);
    
    if (fileBuffer.length === 0) {
      console.error("Empty file buffer received");
      return res.status(400).json({
        error: "Empty file received. Please upload a valid resume file."
      });
    }
    
    // Extract text from the binary data using our direct parser
    console.log("Extracting text from binary data");
    const extractedText = await extractTextFromBinaryData(fileBuffer);
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.error("No text could be extracted from the file");
      return res.status(400).json({
        error: "No text could be extracted from the uploaded file. Please ensure the file contains readable text."
      });
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters of text`);
    
    // Parse the extracted text to get structured resume data
    console.log("Parsing extracted text into structured resume data");
    const parsedResume = await parseResumeText(extractedText);
    
    // Return the structured resume data
    return res.json({
      success: true,
      rawText: extractedText,
      parsedResume,
    });
    
  } catch (error) {
    console.error("Error in resume parsing:", error);
    return res.status(500).json({
      error: "Failed to parse resume. Please try again or contact support.",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}