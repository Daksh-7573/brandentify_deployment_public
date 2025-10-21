import { Request, Response } from 'express';
import { storage } from './storage';
import { extractTextFromPDF } from './utils/pdf-extractor';
import { ResumeScorerService } from './services/career-intelligence/resume-scorer';

const resumeScorerService = new ResumeScorerService();

// Resume upload handler that integrates with Resume Scorer
export const handleResumeUploadFixed = async (req: Request, res: Response) => {
  console.log("Resume upload handler called - FIXED VERSION");
  console.log("Request body:", req.body);
  console.log("Request files:", req.files ? Object.keys(req.files) : 'No files');
  
  try {
    // Get user ID from request body
    const rawUserId = req.body.userId;
    console.log(`Resume upload: Received rawUserId: ${rawUserId}`);
    
    let userId = 0;
    
    // Handle both numeric IDs and Firebase UIDs
    if (rawUserId) {
      // If it's already a number, use it directly
      if (typeof rawUserId === 'number') {
        userId = rawUserId;
        console.log(`Resume upload: Using numeric userId directly: ${userId}`);
      }
      // If it's a numeric string (e.g., "2"), convert it
      else if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
        userId = parseInt(rawUserId, 10);
        console.log(`Resume upload: Converted numeric string "${rawUserId}" to number: ${userId}`);
      }
      // Only do username lookup for non-numeric strings (Firebase UIDs)
      else if (typeof rawUserId === 'string') {
        try {
          const user = await storage.getUserByUsername(rawUserId);
          if (user) {
            userId = user.id;
            console.log(`Resume upload: Found numeric ID ${userId} for Firebase UID ${rawUserId}`);
          }
        } catch (userLookupError) {
          console.error(`Resume upload: Error looking up user:`, userLookupError);
        }
      }
    }
    
    // Check if file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No files uploaded");
      return res.status(400).json({ error: "No resume file was uploaded" });
    }
    
    // Get the uploaded file
    const resumeFile = (req.files.file || req.files.resume) as any;
    
    if (!resumeFile) {
      console.log("Resume file not found in request");
      return res.status(400).json({ error: "Resume file not found in the request" });
    }
    
    console.log(`Processing file: ${resumeFile.name}`);
    
    // Simple file validation - accept common resume formats
    const fileExt = resumeFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileExt || '')) {
      return res.status(400).json({
        error: "INVALID_FILE",
        message: "File type not allowed. Please upload PDF, DOC, DOCX, TXT, or RTF files."
      });
    }
    
    // Extract text from PDF/DOCX
    let resumeText = '';
    try {
      if (fileExt === 'pdf') {
        resumeText = await extractTextFromPDF(resumeFile.tempFilePath || resumeFile.data);
        console.log(`Extracted ${resumeText.length} characters from PDF`);
      } else if (fileExt === 'txt') {
        resumeText = resumeFile.data.toString('utf-8');
      } else {
        // For DOC/DOCX, try basic extraction
        resumeText = resumeFile.data.toString('utf-8');
      }
      
      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error('Unable to extract text from document');
      }
    } catch (extractError) {
      console.error('Error extracting text:', extractError);
      return res.status(400).json({
        error: 'TEXT_EXTRACTION_FAILED',
        message: 'Could not extract text from the file. Please ensure it is a valid, readable document.'
      });
    }
    
    // Call Resume Scorer Service for real analysis
    console.log(`Analyzing resume for user ${userId}...`);
    const analysisResult = await resumeScorerService.analyzeResume(
      resumeText,
      userId,
      undefined // No target role specified
    );
    
    // Store context
    if (userId) {
      global.resumeContexts = global.resumeContexts || {};
      global.resumeContexts[userId.toString()] = {
        fileName: resumeFile.name,
        fileType: fileExt,
        uploadDate: new Date().toISOString(),
        processed: true,
        resumeText: resumeText.substring(0, 1000) // Store preview
      };
      console.log(`Stored resume context for user ${userId}`);
    }
    
    // Return analysis with scores
    console.log("Resume analysis completed successfully");
    return res.status(200).json({
      id: 'resume-analysis-' + Date.now(),
      success: true,
      resumeScoreId: analysisResult.resumeScoreId,
      score: analysisResult.result.scoreBreakdown,
      criticalIssues: analysisResult.result.criticalIssues,
      importantIssues: analysisResult.result.importantIssues,
      optionalIssues: analysisResult.result.optionalIssues,
      analysis: analysisResult.result.analysis,
      filename: resumeFile.name,
      extractedText: resumeText.substring(0, 500) + '...',
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error processing resume upload:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    return res.status(500).json({
      error: "Failed to process resume upload",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};