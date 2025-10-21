/**
 * Career Intelligence Suite API Routes
 * 
 * Handles:
 * - Resume scoring and analysis
 * - One-click fix application
 * - Job description matching
 * - Gap analysis
 */

import express from 'express';
import { resumeScorerService } from './services/career-intelligence/resume-scorer';
import { jobMatcherService } from './services/career-intelligence/job-matcher';
import { upload, extractTextFromFile } from './services/resume-parser-service';
import { extractTextFromPdf } from './utils/pdf-extractor';
import fs from 'fs';

export const registerCareerIntelligenceRoutes = (app: express.Express) => {
  
  // ============================================
  // RESUME SCORER
  // ============================================
  
  /**
   * Analyze resume from file upload
   * POST /api/career-tools/upload-resume
   */
  app.post('/api/career-tools/upload-resume', upload.single('resume'), async (req, res) => {
    try {
      const { userId, targetRole } = req.body;
      const file = req.file;
      
      if (!file || !userId) {
        return res.status(400).json({ 
          error: 'Resume file and user ID are required' 
        });
      }
      
      console.log(`[API] Extracting text from uploaded resume: ${file.originalname}`);
      
      // Extract text from uploaded file
      let resumeText: string;
      try {
        if (file.mimetype === 'application/pdf') {
          const fileBuffer = fs.readFileSync(file.path);
          resumeText = await extractTextFromPdf(fileBuffer);
          
          // If PDF extraction returned empty, provide helpful message
          if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({
              error: 'Could not extract text from PDF. Please try copying and pasting your resume text instead.',
              suggestion: 'For best results, open your PDF and copy-paste the text directly.'
            });
          }
        } else {
          resumeText = await extractTextFromFile(file.path, file.mimetype);
        }
      } catch (extractError: any) {
        console.error('[API] Text extraction error:', extractError);
        
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
          error: 'Could not extract text from file. Please try a different file or paste your resume text.',
          details: extractError.message
        });
      }
      
      // Clean up uploaded file after extraction
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      if (!resumeText || resumeText.trim().length < 100) {
        return res.status(400).json({
          error: 'Extracted text is too short. Please ensure your resume has sufficient content.',
          extractedLength: resumeText?.length || 0
        });
      }
      
      console.log(`[API] Successfully extracted ${resumeText.length} characters from ${file.originalname}`);
      
      // Analyze the extracted resume text
      const result = await resumeScorerService.analyzeResume(
        resumeText,
        parseInt(userId),
        targetRole
      );
      
      res.json({
        success: true,
        resumeScoreId: result.resumeScoreId,
        score: result.result.scoreBreakdown,
        criticalIssues: result.result.criticalIssues,
        importantIssues: result.result.importantIssues,
        optionalIssues: result.result.optionalIssues,
        analysis: result.result.analysis,
        extractedText: resumeText.substring(0, 500) + '...' // Preview of extracted text
      });
    } catch (error: any) {
      console.error('[API] Resume upload analysis error:', error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to analyze uploaded resume' 
      });
    }
  });
  
  /**
   * Analyze resume and get brutal feedback (text-based)
   * POST /api/career-tools/analyze-resume
   */
  app.post('/api/career-tools/analyze-resume', async (req, res) => {
    try {
      const { resumeText, userId, targetRole } = req.body;
      
      if (!resumeText || !userId) {
        return res.status(400).json({ 
          error: 'Resume text and user ID are required' 
        });
      }
      
      console.log(`[API] Analyzing resume for user ${userId}`);
      
      const result = await resumeScorerService.analyzeResume(
        resumeText,
        parseInt(userId),
        targetRole
      );
      
      res.json({
        success: true,
        resumeScoreId: result.resumeScoreId,
        score: result.result.scoreBreakdown,
        criticalIssues: result.result.criticalIssues,
        importantIssues: result.result.importantIssues,
        optionalIssues: result.result.optionalIssues,
        analysis: result.result.analysis
      });
    } catch (error: any) {
      console.error('[API] Resume analysis error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to analyze resume' 
      });
    }
  });
  
  /**
   * Get resume score with all fixes
   * GET /api/career-tools/resume-score/:id
   */
  app.get('/api/career-tools/resume-score/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await resumeScorerService.getResumeScore(parseInt(id));
      
      res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error('[API] Get resume score error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get resume score' 
      });
    }
  });
  
  /**
   * Apply a fix (one-click)
   * POST /api/career-tools/apply-fix
   */
  app.post('/api/career-tools/apply-fix', async (req, res) => {
    try {
      const { resumeScoreId, fixId } = req.body;
      
      if (!resumeScoreId || !fixId) {
        return res.status(400).json({ 
          error: 'Resume score ID and fix ID are required' 
        });
      }
      
      console.log(`[API] Applying fix ${fixId} to resume score ${resumeScoreId}`);
      
      const result = await resumeScorerService.applyFix(
        parseInt(resumeScoreId),
        parseInt(fixId)
      );
      
      res.json({
        success: true,
        newScore: result.newScore,
        appliedCount: result.appliedCount,
        remainingCount: result.remainingCount,
        message: `Fix applied! Score improved to ${result.newScore}/100`
      });
    } catch (error: any) {
      console.error('[API] Apply fix error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to apply fix' 
      });
    }
  });
  
  // ============================================
  // JOB DESCRIPTION MATCHER
  // ============================================
  
  /**
   * Analyze job description and get match score
   * POST /api/career-tools/match-job
   */
  app.post('/api/career-tools/match-job', async (req, res) => {
    try {
      const { jobDescription, userId, jobTitle, companyName, jobUrl } = req.body;
      
      if (!jobDescription || !userId || !jobTitle) {
        return res.status(400).json({ 
          error: 'Job description, user ID, and job title are required' 
        });
      }
      
      console.log(`[API] Matching job for user ${userId}: ${jobTitle}`);
      
      const result = await jobMatcherService.analyzeJobMatch(
        jobDescription,
        parseInt(userId),
        jobTitle,
        companyName,
        jobUrl
      );
      
      res.json({
        success: true,
        jobMatchId: result.jobMatchId,
        matchScore: result.result.matchScore,
        matchedSkills: result.result.matchedSkills,
        missingSkills: result.result.missingSkills,
        gapAnalysis: result.result.gapAnalysis,
        resumeRewrites: result.result.resumeRewrites,
        applicationStrategy: result.result.applicationStrategy,
        interviewProbability: result.result.interviewProbability,
        salaryEstimate: result.result.salaryEstimate,
        experienceMatch: result.result.experienceMatch,
        educationMatch: result.result.educationMatch
      });
    } catch (error: any) {
      console.error('[API] Job matching error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to match job' 
      });
    }
  });
  
  /**
   * Get job match by ID
   * GET /api/career-tools/job-match/:id
   */
  app.get('/api/career-tools/job-match/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await jobMatcherService.getJobMatch(parseInt(id));
      
      res.json({
        success: true,
        jobMatch: result
      });
    } catch (error: any) {
      console.error('[API] Get job match error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get job match' 
      });
    }
  });
  
  /**
   * Update job match status (applied, interview, etc)
   * PATCH /api/career-tools/job-match/:id/status
   */
  app.patch('/api/career-tools/job-match/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'applied', 'interview', 'offer', 'rejected'
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Update status in database
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        await client.query(
          `UPDATE job_matches 
           SET result_status = $1, 
               applied_at = CASE WHEN $1 = 'applied' THEN NOW() ELSE applied_at END,
               updated_at = NOW()
           WHERE id = $2`,
          [status, parseInt(id)]
        );
        
        res.json({
          success: true,
          message: `Job status updated to: ${status}`
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Update job status error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to update job status' 
      });
    }
  });
  
  console.log('✅ Career Intelligence routes loaded');
};
