/**
 * Job Description Matcher Service
 * 
 * Analyzes job descriptions and provides:
 * - Match score (0-100%) against user profile
 * - Gap analysis (what's missing)
 * - Resume rewrite suggestions tailored to JD
 * - Application strategy
 * - Interview probability
 * 
 * Uses FREE local Ollama with OpenAI fallback
 */

import { LocalAIService } from '../local-ai-service';
import { pool } from '../../db';
import { jobMatches, type InsertJobMatch } from '@shared/schema';

const localAI = LocalAIService.getInstance();

export interface JobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  experienceYears: number;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  education: string;
  responsibilities: string[];
}

export interface GapAnalysis {
  critical: Array<{
    gap: string;
    why: string;
    howToFix: string;
    timeEstimate: string;
    impact: string;
  }>;
  important: Array<{
    gap: string;
    why: string;
    howToFix: string;
    timeEstimate: string;
  }>;
  optional: Array<{
    gap: string;
    benefit: string;
  }>;
}

export interface ResumeRewrite {
  section: string;
  lineNumber?: number;
  currentText: string;
  rewrittenText: string;
  reasoning: string;
  keywords: string[];
}

export interface JobMatchResult {
  matchScore: number; // 0-100
  hardRequirementsMatched: number;
  hardRequirementsTotal: number;
  preferredRequirementsMatched: number;
  preferredRequirementsTotal: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  educationMatch: boolean;
  gapAnalysis: GapAnalysis;
  resumeRewrites: ResumeRewrite[];
  applicationStrategy: string;
  interviewProbability: number; // 0-100
  salaryEstimate: string;
}

export class JobMatcherService {
  /**
   * Analyze job description and match against user profile
   */
  async analyzeJobMatch(
    jobDescription: string,
    userId: number,
    jobTitle: string,
    companyName?: string,
    jobUrl?: string
  ): Promise<{
    jobMatchId: number;
    result: JobMatchResult;
  }> {
    console.log(`[JobMatcher] Analyzing job for user ${userId}: ${jobTitle} at ${companyName}`);
    
    // Get user profile data
    const userProfile = await this.getUserProfile(userId);
    
    // Extract job requirements using AI
    const requirements = await this.extractJobRequirements(jobDescription, jobTitle);
    
    // Calculate match score
    const matchResult = this.calculateMatchScore(userProfile, requirements);
    
    // Generate gap analysis using AI
    const gapAnalysis = await this.generateGapAnalysis(
      userProfile,
      requirements,
      jobDescription,
      matchResult
    );
    
    // Generate tailored resume rewrites
    const resumeRewrites = await this.generateResumeRewrites(
      userProfile,
      requirements,
      jobDescription,
      jobTitle
    );
    
    // Generate application strategy
    const applicationStrategy = await this.generateApplicationStrategy(
      matchResult,
      gapAnalysis,
      jobTitle,
      companyName
    );
    
    // Save to database
    const jobMatchId = await this.saveToDatabase(
      userId,
      jobTitle,
      companyName,
      jobDescription,
      jobUrl,
      matchResult,
      gapAnalysis,
      resumeRewrites,
      applicationStrategy,
      requirements
    );
    
    return {
      jobMatchId,
      result: {
        ...matchResult,
        gapAnalysis,
        resumeRewrites,
        applicationStrategy
      }
    };
  }

  /**
   * Get user profile with all relevant data
   */
  private async getUserProfile(userId: number): Promise<any> {
    const client = await pool.connect();
    
    try {
      // Get user data
      const userResult = await client.query(
        `SELECT id, name, title, industry, domain, location, looking_for 
         FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userResult.rows[0];
      
      // Get skills
      const skillsResult = await client.query(
        `SELECT name, proficiency, level FROM skills WHERE user_id = $1`,
        [userId]
      );
      
      // Get work experience
      const experienceResult = await client.query(
        `SELECT title, company, industry, domain, start_date, end_date, key_responsibilities
         FROM work_experiences WHERE user_id = $1 ORDER BY start_date DESC`,
        [userId]
      );
      
      // Get education
      const educationResult = await client.query(
        `SELECT degree, field_of_study, institution FROM educations WHERE user_id = $1`,
        [userId]
      );
      
      // Calculate years of experience
      const experiences = experienceResult.rows;
      let totalMonths = 0;
      experiences.forEach(exp => {
        const start = new Date(exp.start_date);
        const end = exp.end_date ? new Date(exp.end_date) : new Date();
        totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + 
                       (end.getMonth() - start.getMonth());
      });
      const yearsExperience = Math.floor(totalMonths / 12);
      
      return {
        ...user,
        skills: skillsResult.rows,
        experiences: experienceResult.rows,
        educations: educationResult.rows,
        yearsExperience
      };
    } finally {
      client.release();
    }
  }

  /**
   * Extract job requirements using AI
   */
  private async extractJobRequirements(
    jobDescription: string,
    jobTitle: string
  ): Promise<JobRequirements> {
    const prompt = `Extract structured data from this job description:

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

Provide ONLY a JSON response with this exact structure (no markdown, no extra text):
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3", "skill4"],
  "experienceYears": 5,
  "experienceLevel": "mid",
  "education": "Bachelor's degree required",
  "responsibilities": ["responsibility1", "responsibility2"]
}`;

    try {
      const response = await localAI.generateNewsContent(prompt);
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          requiredSkills: parsed.requiredSkills || [],
          preferredSkills: parsed.preferredSkills || [],
          experienceYears: parsed.experienceYears || 0,
          experienceLevel: parsed.experienceLevel || 'mid',
          education: parsed.education || '',
          responsibilities: parsed.responsibilities || []
        };
      }
      
      // Fallback to basic extraction
      return this.fallbackExtraction(jobDescription);
    } catch (error) {
      console.error('[JobMatcher] Requirements extraction failed:', error);
      return this.fallbackExtraction(jobDescription);
    }
  }

  /**
   * Fallback extraction if AI fails
   */
  private fallbackExtraction(jd: string): JobRequirements {
    const skills = [];
    const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript'];
    commonSkills.forEach(skill => {
      if (jd.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
    
    return {
      requiredSkills: skills.slice(0, 5),
      preferredSkills: skills.slice(5, 8),
      experienceYears: 3,
      experienceLevel: 'mid',
      education: 'Bachelor\'s degree',
      responsibilities: []
    };
  }

  /**
   * Calculate match score
   */
  private calculateMatchScore(user: any, requirements: JobRequirements): Omit<JobMatchResult, 'gapAnalysis' | 'resumeRewrites' | 'applicationStrategy'> {
    let score = 0;
    
    // Hard requirements (60% weight)
    const userSkillNames = user.skills.map((s: any) => s.name.toLowerCase());
    const matchedRequired = requirements.requiredSkills.filter(req =>
      userSkillNames.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
    );
    const hardReqScore = (matchedRequired.length / Math.max(requirements.requiredSkills.length, 1)) * 60;
    score += hardReqScore;
    
    // Experience level (20% weight)
    const experienceMatch = user.yearsExperience >= requirements.experienceYears;
    if (experienceMatch) {
      score += 20;
    } else {
      score += (user.yearsExperience / Math.max(requirements.experienceYears, 1)) * 20;
    }
    
    // Preferred skills (10% weight)
    const matchedPreferred = requirements.preferredSkills.filter(pref =>
      userSkillNames.some(us => us.includes(pref.toLowerCase()) || pref.toLowerCase().includes(us))
    );
    score += (matchedPreferred.length / Math.max(requirements.preferredSkills.length, 1)) * 10;
    
    // Education (10% weight)
    const hasEducation = user.educations && user.educations.length > 0;
    const educationMatch = hasEducation;
    if (educationMatch) {
      score += 10;
    }
    
    // Calculate missing skills
    const missingSkills = requirements.requiredSkills.filter(req =>
      !userSkillNames.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
    );
    
    // Estimate interview probability (based on match score with adjustments)
    const interviewProbability = Math.min(100, Math.round(score * 1.1));
    
    // Estimate salary
    const salaryEstimate = this.estimateSalary(requirements.experienceLevel);
    
    return {
      matchScore: Math.round(score),
      hardRequirementsMatched: matchedRequired.length,
      hardRequirementsTotal: requirements.requiredSkills.length,
      preferredRequirementsMatched: matchedPreferred.length,
      preferredRequirementsTotal: requirements.preferredSkills.length,
      matchedSkills: matchedRequired,
      missingSkills,
      experienceMatch,
      educationMatch,
      interviewProbability,
      salaryEstimate
    };
  }

  /**
   * Estimate salary based on level
   */
  private estimateSalary(level: string): string {
    const ranges: Record<string, string> = {
      entry: '$50k-$70k',
      mid: '$80k-$120k',
      senior: '$120k-$180k',
      lead: '$160k-$220k',
      executive: '$200k-$400k+'
    };
    return ranges[level] || '$80k-$150k';
  }

  /**
   * Generate gap analysis using AI
   */
  private async generateGapAnalysis(
    user: any,
    requirements: JobRequirements,
    jobDescription: string,
    matchResult: any
  ): Promise<GapAnalysis> {
    const prompt = `Analyze gaps between user profile and job requirements. Be BRUTAL and specific.

USER PROFILE:
- Skills: ${user.skills.map((s: any) => `${s.name} (${s.proficiency}%)`).join(', ')}
- Experience: ${user.yearsExperience} years as ${user.title}
- Education: ${user.educations?.map((e: any) => `${e.degree} in ${e.field_of_study}`).join(', ')}

JOB REQUIREMENTS:
${jobDescription.substring(0, 1000)}

MATCH SCORE: ${matchResult.matchScore}%
MISSING SKILLS: ${matchResult.missingSkills.join(', ')}

Provide gaps in this format:

🔴 CRITICAL GAPS (Blockers - fix in 30 days):
Gap: [specific missing requirement]
Why: [why this kills application]
Fix: [exactly how to fix]
Time: [time estimate]
Impact: [how this affects match %]

🟡 IMPORTANT GAPS (Fix in 90 days):
[same format]

🟢 OPTIONAL (Nice to have):
[same format]`;

    try {
      const response = await localAI.generateNewsContent(prompt);
      return this.parseGapAnalysis(response);
    } catch (error) {
      console.error('[JobMatcher] Gap analysis failed:', error);
      return {
        critical: [{
          gap: 'Missing required skills',
          why: 'No matching skills found',
          howToFix: 'Learn the required technologies',
          timeEstimate: '3-6 months',
          impact: '+30% match score'
        }],
        important: [],
        optional: []
      };
    }
  }

  /**
   * Parse gap analysis from AI response
   */
  private parseGapAnalysis(response: string): GapAnalysis {
    const gapAnalysis: GapAnalysis = {
      critical: [],
      important: [],
      optional: []
    };
    
    // Extract critical gaps
    const criticalSection = response.match(/🔴 CRITICAL[\s\S]*?(?=🟡|🟢|$)/i);
    if (criticalSection) {
      const gapMatches = criticalSection[0].matchAll(/Gap: ([^\n]+)\s*Why: ([^\n]+)\s*Fix: ([^\n]+)\s*Time: ([^\n]+)\s*Impact: ([^\n]+)/gi);
      for (const match of gapMatches) {
        gapAnalysis.critical.push({
          gap: match[1].trim(),
          why: match[2].trim(),
          howToFix: match[3].trim(),
          timeEstimate: match[4].trim(),
          impact: match[5].trim()
        });
      }
    }
    
    return gapAnalysis;
  }

  /**
   * Generate tailored resume rewrites
   */
  private async generateResumeRewrites(
    user: any,
    requirements: JobRequirements,
    jobDescription: string,
    jobTitle: string
  ): Promise<ResumeRewrite[]> {
    // For now, return basic recommendations
    // In a full implementation, this would use AI to rewrite each resume section
    return [
      {
        section: 'Summary',
        currentText: `${user.title} with ${user.yearsExperience} years experience`,
        rewrittenText: `${jobTitle} with ${user.yearsExperience}+ years of proven expertise in ${requirements.requiredSkills.slice(0, 3).join(', ')}`,
        reasoning: 'Match job title exactly and highlight required skills',
        keywords: requirements.requiredSkills.slice(0, 5)
      }
    ];
  }

  /**
   * Generate application strategy
   */
  private async generateApplicationStrategy(
    matchResult: any,
    gapAnalysis: GapAnalysis,
    jobTitle: string,
    companyName?: string
  ): Promise<string> {
    if (matchResult.matchScore >= 75) {
      return `HIGH MATCH (${matchResult.matchScore}%) - Apply NOW:\n\n1. Tailor resume to highlight ${matchResult.matchedSkills.join(', ')}\n2. Apply within 48 hours (jobs get 100+ applications fast)\n3. Network: Find someone at ${companyName || 'this company'} on LinkedIn\n4. Expected outcome: 70%+ interview rate`;
    } else if (matchResult.matchScore >= 50) {
      return `MODERATE MATCH (${matchResult.matchScore}%) - Fix gaps first:\n\n1. Address critical gap: ${gapAnalysis.critical[0]?.gap || 'Missing skills'}\n2. Then apply with tailored resume\n3. Time to ready: ${gapAnalysis.critical[0]?.timeEstimate || '30 days'}\n4. Expected outcome: 40% interview rate after fixes`;
    } else {
      return `LOW MATCH (${matchResult.matchScore}%) - Not recommended:\n\nMissing ${matchResult.missingSkills.length} critical skills. Better to:\n1. Target roles matching your ${user.title} background\n2. Build skills: ${matchResult.missingSkills.slice(0, 3).join(', ')}\n3. Revisit in 3-6 months`;
    }
  }

  /**
   * Save to database
   */
  private async saveToDatabase(
    userId: number,
    jobTitle: string,
    companyName: string | undefined,
    jobDescription: string,
    jobUrl: string | undefined,
    matchResult: any,
    gapAnalysis: GapAnalysis,
    resumeRewrites: ResumeRewrite[],
    applicationStrategy: string,
    requirements: JobRequirements
  ): Promise<number> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO job_matches (
          user_id, job_title, company_name, job_description, job_url,
          match_score, hard_requirements_matched, hard_requirements_total,
          preferred_requirements_matched, preferred_requirements_total,
          required_skills, matched_skills, missing_skills,
          experience_match, education_match,
          gap_analysis, resume_rewrites, application_strategy,
          interview_probability, salary_estimate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id`,
        [
          userId,
          jobTitle,
          companyName,
          jobDescription,
          jobUrl,
          matchResult.matchScore,
          matchResult.hardRequirementsMatched,
          matchResult.hardRequirementsTotal,
          matchResult.preferredRequirementsMatched,
          matchResult.preferredRequirementsTotal,
          requirements.requiredSkills,
          matchResult.matchedSkills,
          matchResult.missingSkills,
          matchResult.experienceMatch,
          matchResult.educationMatch,
          JSON.stringify(gapAnalysis),
          JSON.stringify(resumeRewrites),
          applicationStrategy,
          matchResult.interviewProbability,
          matchResult.salaryEstimate
        ]
      );
      
      console.log(`[JobMatcher] Saved job match: ID ${result.rows[0].id}, Score: ${matchResult.matchScore}%`);
      
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  /**
   * Get job match by ID
   */
  async getJobMatch(jobMatchId: number): Promise<any> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM job_matches WHERE id = $1`,
        [jobMatchId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Job match not found');
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

export const jobMatcherService = new JobMatcherService();
