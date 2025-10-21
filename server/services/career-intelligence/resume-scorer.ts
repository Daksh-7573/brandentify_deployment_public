/**
 * Resume Scorer Service
 * 
 * Provides brutal, actionable resume analysis with:
 * - Overall score (0-100) broken down by category
 * - Ranked fixes by impact
 * - One-click apply functionality
 * - ATS compatibility check
 * 
 * Uses FREE local Ollama with OpenAI fallback
 */

import { LocalAIService } from '../local-ai-service';
import { pool } from '../../db';
import { resumeScores, resumeFixes, type InsertResumeScore, type InsertResumeFix } from '@shared/schema';

const localAI = new LocalAIService();

export interface ResumeScoreBreakdown {
  overall: number; // 0-100
  atsCompatibility: number; // 0-25
  impactMetrics: number; // 0-25
  keywords: number; // 0-20
  structure: number; // 0-15
  clarity: number; // 0-15
}

export interface ResumeFix {
  priority: 'critical' | 'important' | 'optional';
  category: 'metrics' | 'verbs' | 'keywords' | 'structure' | 'formatting';
  lineNumber?: number;
  currentText: string;
  suggestedText: string;
  reasoning: string;
  expectedImpact: string; // "+40% callbacks"
  timeToFix: string; // "5 minutes"
  impactScore: number; // 0-100 for ranking
}

export interface ResumeAnalysisResult {
  scoreBreakdown: ResumeScoreBreakdown;
  criticalIssues: ResumeFix[];
  importantIssues: ResumeFix[];
  optionalIssues: ResumeFix[];
  analysis: string; // Full AI commentary
  lineByLineAnalysis: Array<{
    lineNumber: number;
    content: string;
    score: number;
    issues: string[];
  }>;
}

export class ResumeScorerService {
  /**
   * Analyze a resume and provide brutal, actionable feedback
   */
  async analyzeResume(resumeText: string, userId: number, targetRole?: string): Promise<{ 
    resumeScoreId: number;
    result: ResumeAnalysisResult;
  }> {
    console.log(`[ResumeScorer] Analyzing resume for user ${userId}, role: ${targetRole || 'general'}`);
    
    // Generate AI analysis
    const aiAnalysis = await this.generateAIAnalysis(resumeText, targetRole);
    
    // Parse AI response into structured data
    const parsed = this.parseAIAnalysis(aiAnalysis.fullAnalysis, resumeText);
    
    // Calculate scores
    const scoreBreakdown = this.calculateScores(parsed);
    
    // Organize fixes by priority
    const { criticalIssues, importantIssues, optionalIssues } = this.categorizeFixes(parsed.fixes);
    
    // Save to database
    const resumeScoreId = await this.saveToDatabase(
      userId,
      resumeText,
      scoreBreakdown,
      criticalIssues,
      importantIssues,
      optionalIssues,
      aiAnalysis.fullAnalysis,
      targetRole
    );
    
    return {
      resumeScoreId,
      result: {
        scoreBreakdown,
        criticalIssues,
        importantIssues,
        optionalIssues,
        analysis: aiAnalysis.fullAnalysis,
        lineByLineAnalysis: parsed.lineAnalysis
      }
    };
  }

  /**
   * Generate AI analysis using Ollama/OpenAI
   */
  private async generateAIAnalysis(resumeText: string, targetRole?: string): Promise<{
    fullAnalysis: string;
  }> {
    const prompt = this.buildAnalysisPrompt(resumeText, targetRole);
    
    console.log(`[ResumeScorer] Resume text length: ${resumeText.length} characters`);
    console.log(`[ResumeScorer] Resume text preview: ${resumeText.substring(0, 200)}...`);
    console.log(`[ResumeScorer] Prompt length: ${prompt.length} characters`);
    
    try {
      const response = await localAI.generateNewsContent(prompt);
      console.log(`[ResumeScorer] AI response preview: ${response.substring(0, 300)}...`);
      return {
        fullAnalysis: response
      };
    } catch (error) {
      console.error('[ResumeScorer] AI analysis failed:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  /**
   * Build the brutal analysis prompt
   */
  private buildAnalysisPrompt(resumeText: string, targetRole?: string): string {
    return `You are a BRUTAL resume expert who gives honest, actionable feedback. Analyze this resume and be HARSH but helpful.

${targetRole ? `TARGET ROLE: ${targetRole}\n\n` : ''}RESUME:
${resumeText}

Provide analysis in this EXACT format:

=== OVERALL ASSESSMENT ===
Give a brutal 2-3 sentence summary of this resume's quality.

=== ATS COMPATIBILITY (0-25) ===
Score: [number]
Issues:
- [Specific issue]
- [Specific issue]

=== IMPACT METRICS (0-25) ===
Score: [number]
Issues:
- [Specific issue - call out lack of numbers]
- [Specific issue]

=== KEYWORD OPTIMIZATION (0-20) ===
Score: [number]
Issues:
- [Missing keywords for ${targetRole || 'this role'}]
- [Specific issue]

=== STRUCTURE & FORMATTING (0-15) ===
Score: [number]
Issues:
- [Specific issue]

=== CLARITY & ACTION VERBS (0-15) ===
Score: [number]
Issues:
- [Weak verbs like "responsible for"]
- [Specific issue]

=== LINE-BY-LINE BRUTAL FIXES ===
For each major issue, provide:

FIX #1 [CRITICAL/IMPORTANT/OPTIONAL]
Category: [metrics/verbs/keywords/structure/formatting]
Line: [approximate line number or section]
Current: "[exact text from resume]"
Problem: [What's wrong - be brutal]
Rewrite: "[exact improved version]"
Why: [Why this is better]
Impact: [e.g., "+40% callbacks"]
Time: [e.g., "5 minutes"]
Score: [impact score 0-100]

[Continue for all major issues - at least 10 fixes]

=== BOTTOM LINE ===
Current callback rate estimate: [X]%
After fixes callback rate: [Y]%
Main problem killing this resume: [brutal truth]
Fix this FIRST: [#1 priority]`;
  }

  /**
   * Parse AI response into structured data
   */
  private parseAIAnalysis(aiResponse: string, resumeText: string): {
    fixes: ResumeFix[];
    lineAnalysis: any[];
    scores: {
      atsCompatibility: number;
      impactMetrics: number;
      keywords: number;
      structure: number;
      clarity: number;
    };
  } {
    const fixes: ResumeFix[] = [];
    const scores = {
      atsCompatibility: 15, // Default moderate scores
      impactMetrics: 12,
      keywords: 10,
      structure: 10,
      clarity: 10
    };
    
    // Extract scores using regex
    const atsMatch = aiResponse.match(/ATS COMPATIBILITY.*?Score:\s*(\d+)/i);
    const metricsMatch = aiResponse.match(/IMPACT METRICS.*?Score:\s*(\d+)/i);
    const keywordsMatch = aiResponse.match(/KEYWORD.*?Score:\s*(\d+)/i);
    const structureMatch = aiResponse.match(/STRUCTURE.*?Score:\s*(\d+)/i);
    const clarityMatch = aiResponse.match(/CLARITY.*?Score:\s*(\d+)/i);
    
    if (atsMatch) scores.atsCompatibility = Math.min(25, parseInt(atsMatch[1]));
    if (metricsMatch) scores.impactMetrics = Math.min(25, parseInt(metricsMatch[1]));
    if (keywordsMatch) scores.keywords = Math.min(20, parseInt(keywordsMatch[1]));
    if (structureMatch) scores.structure = Math.min(15, parseInt(structureMatch[1]));
    if (clarityMatch) scores.clarity = Math.min(15, parseInt(clarityMatch[1]));
    
    // Extract fixes using pattern matching
    const fixPattern = /FIX #\d+ \[(CRITICAL|IMPORTANT|OPTIONAL)\]\s*Category: ([^\n]+)\s*Line: ([^\n]+)\s*Current: "([^"]+)"\s*Problem: ([^\n]+)\s*Rewrite: "([^"]+)"\s*Why: ([^\n]+)\s*Impact: ([^\n]+)\s*Time: ([^\n]+)\s*Score: (\d+)/gi;
    
    let match;
    while ((match = fixPattern.exec(aiResponse)) !== null) {
      fixes.push({
        priority: match[1].toLowerCase() as 'critical' | 'important' | 'optional',
        category: match[2].trim().toLowerCase() as any,
        lineNumber: this.findLineNumber(resumeText, match[4]),
        currentText: match[4],
        suggestedText: match[6],
        reasoning: `${match[5]} ${match[7]}`,
        expectedImpact: match[8],
        timeToFix: match[9],
        impactScore: parseInt(match[10])
      });
    }
    
    // If no fixes extracted, create some defaults based on common issues
    if (fixes.length === 0) {
      fixes.push({
        priority: 'critical',
        category: 'metrics',
        currentText: '[Resume section without metrics]',
        suggestedText: '[Add quantified achievements]',
        reasoning: 'No quantifiable metrics found - hiring managers skip resumes without numbers',
        expectedImpact: '+40% callbacks',
        timeToFix: '30 minutes',
        impactScore: 90
      });
    }
    
    return {
      fixes,
      lineAnalysis: [],
      scores
    };
  }

  /**
   * Find line number of text in resume
   */
  private findLineNumber(resumeText: string, searchText: string): number | undefined {
    const lines = resumeText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText.substring(0, 30))) {
        return i + 1;
      }
    }
    return undefined;
  }

  /**
   * Calculate overall scores
   */
  private calculateScores(parsed: ReturnType<typeof this.parseAIAnalysis>): ResumeScoreBreakdown {
    const overall = 
      parsed.scores.atsCompatibility +
      parsed.scores.impactMetrics +
      parsed.scores.keywords +
      parsed.scores.structure +
      parsed.scores.clarity;
    
    return {
      overall: Math.round(overall),
      atsCompatibility: parsed.scores.atsCompatibility,
      impactMetrics: parsed.scores.impactMetrics,
      keywords: parsed.scores.keywords,
      structure: parsed.scores.structure,
      clarity: parsed.scores.clarity
    };
  }

  /**
   * Categorize fixes by priority
   */
  private categorizeFixes(fixes: ResumeFix[]): {
    criticalIssues: ResumeFix[];
    importantIssues: ResumeFix[];
    optionalIssues: ResumeFix[];
  } {
    // Sort by impact score
    const sorted = [...fixes].sort((a, b) => b.impactScore - a.impactScore);
    
    return {
      criticalIssues: sorted.filter(f => f.priority === 'critical'),
      importantIssues: sorted.filter(f => f.priority === 'important'),
      optionalIssues: sorted.filter(f => f.priority === 'optional')
    };
  }

  /**
   * Save analysis to database
   */
  private async saveToDatabase(
    userId: number,
    resumeText: string,
    scoreBreakdown: ResumeScoreBreakdown,
    criticalIssues: ResumeFix[],
    importantIssues: ResumeFix[],
    optionalIssues: ResumeFix[],
    analysis: string,
    targetRole?: string
  ): Promise<number> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert resume score
      const scoreResult = await client.query(
        `INSERT INTO resume_scores (
          user_id, resume_text, overall_score, 
          ats_compatibility, impact_metrics, keyword_score, 
          structure_score, clarity_score,
          critical_issues_count, important_issues_count, optional_issues_count,
          analysis, target_role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          userId,
          resumeText,
          scoreBreakdown.overall,
          scoreBreakdown.atsCompatibility,
          scoreBreakdown.impactMetrics,
          scoreBreakdown.keywords,
          scoreBreakdown.structure,
          scoreBreakdown.clarity,
          criticalIssues.length,
          importantIssues.length,
          optionalIssues.length,
          analysis,
          targetRole
        ]
      );
      
      const resumeScoreId = scoreResult.rows[0].id;
      
      // Insert all fixes
      const allFixes = [...criticalIssues, ...importantIssues, ...optionalIssues];
      
      for (const fix of allFixes) {
        await client.query(
          `INSERT INTO resume_fixes (
            resume_score_id, priority, category, line_number,
            current_text, suggested_text, reasoning,
            expected_impact, time_to_fix, impact_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            resumeScoreId,
            fix.priority,
            fix.category,
            fix.lineNumber,
            fix.currentText,
            fix.suggestedText,
            fix.reasoning,
            fix.expectedImpact,
            fix.timeToFix,
            fix.impactScore
          ]
        );
      }
      
      await client.query('COMMIT');
      
      console.log(`[ResumeScorer] Saved analysis: ID ${resumeScoreId}, Score: ${scoreBreakdown.overall}, Fixes: ${allFixes.length}`);
      
      return resumeScoreId;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[ResumeScorer] Database error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply a fix to resume
   */
  async applyFix(resumeScoreId: number, fixId: number): Promise<{
    newScore: number;
    appliedCount: number;
    remainingCount: number;
  }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Mark fix as applied
      await client.query(
        `UPDATE resume_fixes 
         SET is_applied = true, applied_at = NOW() 
         WHERE id = $1`,
        [fixId]
      );
      
      // Get updated fix counts
      const countsResult = await client.query(
        `SELECT 
          COUNT(*) FILTER (WHERE is_applied = true) as applied_count,
          COUNT(*) as total_count
         FROM resume_fixes
         WHERE resume_score_id = $1`,
        [resumeScoreId]
      );
      
      const appliedCount = parseInt(countsResult.rows[0].applied_count);
      const totalCount = parseInt(countsResult.rows[0].total_count);
      const remainingCount = totalCount - appliedCount;
      
      // Recalculate score (each fix worth ~2-5 points)
      const scoreResult = await client.query(
        `SELECT overall_score FROM resume_scores WHERE id = $1`,
        [resumeScoreId]
      );
      
      const currentScore = scoreResult.rows[0].overall_score;
      const scoreImprovement = Math.min(5, Math.floor(100 - currentScore) / remainingCount);
      const newScore = Math.min(100, currentScore + scoreImprovement);
      
      // Update resume score
      await client.query(
        `UPDATE resume_scores SET overall_score = $1, updated_at = NOW() WHERE id = $2`,
        [newScore, resumeScoreId]
      );
      
      await client.query('COMMIT');
      
      return {
        newScore,
        appliedCount,
        remainingCount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get resume score with fixes
   */
  async getResumeScore(resumeScoreId: number): Promise<any> {
    const client = await pool.connect();
    
    try {
      const scoreResult = await client.query(
        `SELECT * FROM resume_scores WHERE id = $1`,
        [resumeScoreId]
      );
      
      if (scoreResult.rows.length === 0) {
        throw new Error('Resume score not found');
      }
      
      const fixesResult = await client.query(
        `SELECT * FROM resume_fixes 
         WHERE resume_score_id = $1 
         ORDER BY impact_score DESC`,
        [resumeScoreId]
      );
      
      return {
        score: scoreResult.rows[0],
        fixes: fixesResult.rows
      };
    } finally {
      client.release();
    }
  }
}

export const resumeScorerService = new ResumeScorerService();
