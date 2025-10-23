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
      
      console.log('[API] Resume upload request:', {
        hasFile: !!file,
        userId,
        targetRole,
        bodyKeys: Object.keys(req.body)
      });
      
      if (!file || !userId) {
        console.error('[API] Missing required fields - file:', !!file, 'userId:', userId);
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
  
  // ============================================
  // PHASE 2: SKILL BENCHMARK ENGINE
  // ============================================
  
  /**
   * Benchmark user skill against market data
   * POST /api/career-tools/benchmark-skill
   */
  app.post('/api/career-tools/benchmark-skill', async (req, res) => {
    try {
      const { userId, skillName, userProficiency, industry, yearsOfExperience } = req.body;
      
      if (!userId || !skillName || userProficiency === undefined) {
        return res.status(400).json({ 
          error: 'User ID, skill name, and proficiency are required' 
        });
      }
      
      console.log(`[API] Benchmarking skill: ${skillName} for user ${userId}`);
      
      // Generate AI-powered benchmark analysis
      const { generateSkillBenchmark } = await import('./services/career-intelligence/skill-benchmark.js');
      const analysis = await generateSkillBenchmark({
        userId: parseInt(userId),
        skillName,
        userProficiency: parseInt(userProficiency),
        industry,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined
      });
      
      // Store in database
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `INSERT INTO skill_benchmarks_new 
           (user_id, skill_name, user_proficiency, market_average, percentile_rank, 
            market_demand, average_salary, salary_by_level, top_companies_hiring,
            learning_path, time_to_improve, related_skills, industry_trends,
            certification_recommendations, analysis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING id`,
          [
            parseInt(userId),
            skillName,
            parseInt(userProficiency),
            analysis.marketAverage,
            analysis.percentileRank,
            analysis.marketDemand,
            analysis.averageSalary,
            JSON.stringify(analysis.salaryByLevel),
            analysis.topCompaniesHiring,
            JSON.stringify(analysis.learningPath),
            analysis.timeToImprove,
            analysis.relatedSkills,
            JSON.stringify(analysis.industryTrends),
            JSON.stringify(analysis.certificationRecommendations),
            analysis.analysis
          ]
        );
        
        const benchmarkId = result.rows[0].id;
        
        res.json({
          success: true,
          benchmarkId,
          analysis
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Skill benchmark error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to benchmark skill' 
      });
    }
  });
  
  /**
   * Get skill benchmark by ID
   * GET /api/career-tools/skill-benchmark/:id
   */
  app.get('/api/career-tools/skill-benchmark/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT * FROM skill_benchmarks_new WHERE id = $1`,
          [parseInt(id)]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Benchmark not found' });
        }
        
        res.json({
          success: true,
          benchmark: result.rows[0]
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Get skill benchmark error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get skill benchmark' 
      });
    }
  });
  
  /**
   * Get user's skill benchmarks
   * GET /api/career-tools/user/:userId/skill-benchmarks
   */
  app.get('/api/career-tools/user/:userId/skill-benchmarks', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT * FROM skill_benchmarks_new 
           WHERE user_id = $1 
           ORDER BY created_at DESC`,
          [parseInt(userId)]
        );
        
        res.json({
          success: true,
          benchmarks: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Get user benchmarks error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get user benchmarks' 
      });
    }
  });
  
  // ============================================
  // PHASE 2: PITCH DECK ANALYZER
  // ============================================
  
  /**
   * Upload and analyze pitch deck
   * POST /api/career-tools/upload-pitch-deck
   */
  app.post('/api/career-tools/upload-pitch-deck', upload.single('deck'), async (req, res) => {
    try {
      const { userId, deckName, fundingStage, targetRaise } = req.body;
      const file = req.file;
      
      if (!file || !userId || !deckName) {
        return res.status(400).json({ 
          error: 'Deck file, user ID, and deck name are required' 
        });
      }
      
      console.log(`[API] Analyzing pitch deck: ${deckName} for user ${userId}`);
      
      // Extract text from deck
      let deckText: string;
      try {
        if (file.mimetype === 'application/pdf') {
          const { extractTextFromPdf } = await import('./utils/pdf-extractor');
          const fileBuffer = fs.readFileSync(file.path);
          deckText = await extractTextFromPdf(fileBuffer);
        } else {
          const { extractTextFromFile } = await import('./services/resume-parser-service');
          deckText = await extractTextFromFile(file.path, file.mimetype);
        }
      } catch (extractError: any) {
        console.error('[API] Deck text extraction error:', extractError);
        
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        
        return res.status(400).json({
          error: 'Could not extract text from deck file',
          details: extractError.message
        });
      }
      
      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      if (!deckText || deckText.trim().length < 200) {
        return res.status(400).json({
          error: 'Deck content is too short for meaningful analysis'
        });
      }
      
      // Analyze pitch deck with AI
      const { analyzePitchDeck } = await import('./services/career-intelligence/pitch-deck-analyzer.js');
      const analysis = await analyzePitchDeck({
        userId: parseInt(userId),
        deckName,
        deckText,
        fundingStage,
        targetRaise
      });
      
      // Store in database
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `INSERT INTO pitch_deck_analyses 
           (user_id, deck_name, overall_score, story_score, market_score, 
            financials_score, team_score, problem_statement_analysis, 
            solution_analysis, market_size_analysis, business_model_analysis,
            competitive_analysis, traction_analysis, financial_projections_analysis,
            team_analysis, ask_analysis, investor_feedback, critical_issues,
            strengths_highlighted, funding_probability, suggested_valuation,
            recommended_changes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           RETURNING id`,
          [
            parseInt(userId),
            deckName,
            analysis.overallScore,
            analysis.storyScore,
            analysis.marketScore,
            analysis.financialsScore,
            analysis.teamScore,
            JSON.stringify(analysis.problemStatementAnalysis),
            JSON.stringify(analysis.solutionAnalysis),
            JSON.stringify(analysis.marketSizeAnalysis),
            JSON.stringify(analysis.businessModelAnalysis),
            JSON.stringify(analysis.competitiveAnalysis),
            JSON.stringify(analysis.tractionAnalysis),
            JSON.stringify(analysis.financialProjectionsAnalysis),
            JSON.stringify(analysis.teamAnalysis),
            JSON.stringify(analysis.askAnalysis),
            analysis.investorFeedback,
            JSON.stringify(analysis.criticalIssues),
            JSON.stringify(analysis.strengthsHighlighted),
            analysis.fundingProbability,
            analysis.suggestedValuation,
            JSON.stringify(analysis.recommendedChanges)
          ]
        );
        
        const analysisId = result.rows[0].id;
        
        res.json({
          success: true,
          analysisId,
          analysis
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Pitch deck analysis error:', error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to analyze pitch deck' 
      });
    }
  });
  
  /**
   * Get pitch deck analysis by ID
   * GET /api/career-tools/pitch-deck/:id
   */
  app.get('/api/career-tools/pitch-deck/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT * FROM pitch_deck_analyses WHERE id = $1`,
          [parseInt(id)]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Pitch deck analysis not found' });
        }
        
        res.json({
          success: true,
          analysis: result.rows[0]
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Get pitch deck analysis error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get pitch deck analysis' 
      });
    }
  });
  
  /**
   * Get user's pitch deck analyses
   * GET /api/career-tools/user/:userId/pitch-decks
   */
  app.get('/api/career-tools/user/:userId/pitch-decks', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { pool } = await import('./db');
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT id, deck_name, overall_score, funding_probability, 
                  created_at, suggested_valuation
           FROM pitch_deck_analyses 
           WHERE user_id = $1 
           ORDER BY created_at DESC`,
          [parseInt(userId)]
        );
        
        res.json({
          success: true,
          analyses: result.rows
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('[API] Get user pitch decks error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get user pitch decks' 
      });
    }
  });
  
  console.log('✅ Career Intelligence routes loaded (Phase 1 + Phase 2)');
};
