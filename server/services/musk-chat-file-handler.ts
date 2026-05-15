/**
 * Musk Chat File Handler
 * 
 * Handles file uploads (resumes) within Musk Chat without creating new workflows
 * Integrates directly into existing message pipeline
 * 
 * Flow:
 * 1. Detect file upload in chat request
 * 2. Extract text from file (PDF/DOCX/TXT)
 * 3. Send to Ollama for analysis (local-first)
 * 4. If Ollama fails → fallback to OpenAI
 * 5. Inject response into existing chat message system
 * 6. Return as normal AI message to user
 */

import { Request } from 'express';
import fs from 'fs';

interface FileUploadInChat {
  fileName: string;
  fileSize: number;
  fileExt: string;
  fileBuffer: Buffer;
}

interface ResumeAnalysisForChat {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  suggestions: string[];
  score: number;
  source: 'ollama' | 'openai' | 'auto';
}

/**
 * Detect and validate file upload in Musk Chat request
 * No new endpoints - reuses existing multipart handling
 */
export function detectFileUploadInChat(req: Request): FileUploadInChat | null {
  try {
    // Check for file upload in request
    console.log("File received:", !!(req.files && Object.keys(req.files).length > 0));
    if (!req.files || Object.keys(req.files).length === 0) {
      return null;
    }

    // Support common field names
    let file = (req.files.file as any) || (req.files.resume as any) || (req.files.attachment as any);
    
    if (!file) {
      return null;
    }

    // Ensure it's the single file (not array)
    if (Array.isArray(file)) {
      file = file[0];
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    console.log("File mimetype:", file?.mimetype);
    const allowedFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

    // Validate file format
    if (!allowedFormats.includes(fileExt || '')) {
      console.warn(`[MuskChat] Unsupported file type: ${fileExt}`);
      return null;
    }

    // Validate file size (max 10MB for resumes)
    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      console.warn(`[MuskChat] File too large: ${file.size} bytes`);
      return null;
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      fileExt: fileExt || '',
      fileBuffer: file.data || (file.tempFilePath && fs.readFileSync(file.tempFilePath))
    };
  } catch (error) {
    console.warn('[MuskChat] Error detecting file upload:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Extract text from uploaded file
 * Supports: PDF, DOCX, TXT, RTF
 * Does NOT return buffer to frontend - only plain text
 */
export async function extractTextFromUploadedFile(fileUpload: FileUploadInChat): Promise<string> {
  // Temporarily disabled - will be reimplemented in Phase 2
  throw new Error('Resume analysis temporarily unavailable - being rebuilt');
}

/**
 * Analyze extracted resume text with Ollama-first, OpenAI fallback
 * 
 * Provider Priority:
 * 1. Ollama (local, free, no API key needed) - Returns structured JSON
 * 2. OpenAI (fallback only if Ollama unavailable) - Returns formatted text
 * 3. Error response if all providers fail
 */
export async function analyzeResumeTextInChat(resumeText: string): Promise<ResumeAnalysisForChat> {
  // Temporarily disabled - will be reimplemented in Phase 2
  throw new Error('Resume analysis temporarily unavailable - being rebuilt');
}

/**
 * Extract a section from OpenAI's formatted response
 */
function extractSectionFromOpenAIResponse(text: string, sectionName: string): string {
  try {
    const regex = new RegExp(`##\\s*[🔍📊⚠️✅💡📝]*\\s*${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      // Remove the header and return just the content
      return match[0]
        .replace(/^##[^\\n]*\\n/, '')
        .replace(/^###[^\\n]*\\n/gm, '')
        .trim()
        .substring(0, 200);
    }
  } catch (error) {
    console.warn('[MuskChat] Error extracting section:', error);
  }
  return '';
}

/**
 * Extract bullet points from OpenAI's formatted response
 */
function extractBulletPointsFromOpenAIResponse(text: string, pattern: string): string[] {
  try {
    const regex = new RegExp(`${pattern}[\\s\\S]*?(?=##|$)`, 'i');
    const match = text.match(regex);
    if (match) {
      const bulletPoints = match[0].match(/^[-•*]\s+(.+?)$/gm) || [];
      return bulletPoints.map(bp => 
        bp.replace(/^[-•*]\s+/, '')
          .replace(/\*\*/g, '')
          .replace(/`/g, '')
          .trim()
      ).filter(bp => bp.length > 0 && bp.length < 200);
    }
  } catch (error) {
    console.warn('[MuskChat] Error extracting bullet points:', error);
  }
  return [];
}

/**
 * Extract score/rating from OpenAI's formatted response
 */
function extractScoreFromOpenAIResponse(text: string, defaultScore: number): number {
  try {
    const scoreMatch = text.match(/\b(\d+)\/100\b/) || text.match(/score[:\s]+(\d+)/i);
    if (scoreMatch && scoreMatch[1]) {
      const score = parseInt(scoreMatch[1], 10);
      return Number.isNaN(score) ? defaultScore : Math.min(100, Math.max(0, score));
    }
  } catch (error) {
    console.warn('[MuskChat] Error extracting score:', error);
  }
  return defaultScore;
}

/**
 * Format resume analysis as a natural chat message
 * Integrates seamlessly into existing Musk Chat response format
 */
export function formatResumeAnalysisForChat(
  analysis: ResumeAnalysisForChat,
  fileName: string
): string {
  try {
    const sourceLabel = analysis.source === 'ollama'
      ? '(Local Analysis)'
      : analysis.source === 'openai'
        ? '(Cloud Analysis)'
        : '(AI Analysis)';
    
    let message = `📄 **Resume Analysis** ${sourceLabel}\n\n`;
    message += `**File:** ${fileName}\n\n`;

    // Summary
    message += `**Summary:**\n${analysis.summary}\n\n`;

    // Score
    if (analysis.score > 0) {
      message += `**Overall Score:** ${analysis.score}/100\n\n`;
    }

    // Strengths
    if (analysis.strengths && analysis.strengths.length > 0) {
      message += `**Strengths:**\n`;
      analysis.strengths.slice(0, 3).forEach(strength => {
        message += `• ${strength}\n`;
      });
      message += '\n';
    }

    // Areas to Improve
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      message += `**Areas to Improve:**\n`;
      analysis.weaknesses.slice(0, 3).forEach(weakness => {
        message += `• ${weakness}\n`;
      });
      message += '\n';
    }

    // Key Skills Detected
    if (analysis.skills && analysis.skills.length > 0) {
      message += `**Key Skills Detected:**\n`;
      analysis.skills.slice(0, 5).forEach(skill => {
        message += `• ${skill}\n`;
      });
      message += '\n';
    }

    // Suggestions
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      message += `**My Recommendations:**\n`;
      analysis.suggestions.slice(0, 3).forEach(suggestion => {
        message += `• ${suggestion}\n`;
      });
      message += '\n';
    }

    message += `---\n*Analysis completed by ${analysis.source === 'ollama' ? 'Local AI' : 'OpenAI'} · Ready to discuss any aspect in detail*`;

    return message;
  } catch (error) {
    console.error('[MuskChat] Error formatting analysis:', error);
    return 'Resume analysis completed. Feel free to ask me questions about your resume.';
  }
}

/**
 * Handle complete file upload workflow within Musk Chat
 * This is the main orchestrator function called from handleMuskChat
 * 
 * Returns: AI response message to inject into chat, or null if no file upload
 */
export async function handleChatFileUpload(
  req: Request,
  userId: number
): Promise<string | null> {
  try {
    // Step 1: Detect file upload
    const fileUpload = detectFileUploadInChat(req);
    if (!fileUpload) {
      return null; // No file upload, proceed as normal chat
    }

    console.log(`[MuskChat] Processing file upload in chat: ${fileUpload.fileName} (${fileUpload.fileSize} bytes)`);

    // Step 2: Extract text
    const resumeText = await extractTextFromUploadedFile(fileUpload);

    // Step 3: Analyze with Ollama-first, OpenAI fallback
    const analysis = await analyzeResumeTextInChat(resumeText);

    // Step 4: Format as chat message
    const chatMessage = formatResumeAnalysisForChat(analysis, fileUpload.fileName);

    console.log(`[MuskChat] File upload processed successfully, response ready`);
    
    return chatMessage; // This will be injected into the chat message pipeline
  } catch (error) {
    console.error('[MuskChat] Error handling file upload:', error instanceof Error ? error.message : String(error));
    
    // Return graceful error message for chat
    return `I encountered an issue analyzing your resume: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use a different file format (PDF, Word, or Text).`;
  }
}
