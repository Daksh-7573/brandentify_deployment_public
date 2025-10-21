import { callAI } from '../ai-service.js';
import type { InsertSkillBenchmark, SkillBenchmark } from '../../../shared/schema.js';

/**
 * SKILL BENCHMARK ENGINE - Phase 2 Career Intelligence Suite
 * 
 * Analyzes user skills against market data to provide:
 * - Percentile ranking vs peers
 * - Salary impact analysis
 * - Learning roadmaps with time estimates
 * - Certification recommendations
 * - Market demand assessment
 * 
 * Uses FREE Ollama (Llama 3.2:3b) for AI analysis
 */

interface SkillBenchmarkInput {
  userId: number;
  skillName: string;
  userProficiency: number; // 0-100 self-assessment
  industry?: string;
  yearsOfExperience?: number;
}

interface BenchmarkAnalysis {
  marketAverage: number;
  percentileRank: number;
  marketDemand: 'high' | 'medium' | 'low';
  averageSalary: string;
  salaryByLevel: {
    junior: string;
    mid: string;
    senior: string;
  };
  topCompaniesHiring: string[];
  learningPath: {
    phase: string;
    duration: string;
    resources: string[];
    milestones: string[];
  }[];
  timeToImprove: string;
  relatedSkills: string[];
  industryTrends: {
    trend: 'rising' | 'stable' | 'declining';
    growthRate: string;
    outlook: string;
  };
  certificationRecommendations: {
    name: string;
    provider: string;
    estimatedCost: string;
    timeToComplete: string;
    impactScore: number;
  }[];
  analysis: string;
}

/**
 * Generate AI-powered skill benchmark analysis
 * Uses market intelligence data and AI to provide brutal, actionable insights
 */
export async function generateSkillBenchmark(
  input: SkillBenchmarkInput
): Promise<BenchmarkAnalysis> {
  const prompt = `You are a career intelligence analyst providing BRUTAL, market-data-driven skill assessment. No sugar-coating.

SKILL ANALYSIS REQUEST:
Skill: ${input.skillName}
User Proficiency (Self-Assessed): ${input.userProficiency}/100
Industry: ${input.industry || 'General Tech'}
Years of Experience: ${input.yearsOfExperience || 'Not specified'}

PROVIDE A COMPREHENSIVE BENCHMARK ANALYSIS:

1. MARKET POSITIONING:
   - What's the realistic market average proficiency for this skill? (0-100)
   - Where does this user rank? (percentile, be honest)
   - Market demand (high/medium/low) with evidence

2. SALARY INTELLIGENCE:
   - Average salary for someone with this skill level
   - Breakdown by level (Junior, Mid, Senior) - realistic USD ranges
   - Top 5 companies actively hiring for this skill

3. LEARNING ROADMAP (3-phase plan):
   For each phase:
   - What to learn (specific)
   - How long it takes (realistic estimates)
   - 3-4 concrete resources (courses, books, projects)
   - Key milestones to hit

4. TIME TO IMPROVE:
   - Realistic timeline to reach top 25% in this skill
   - Based on current proficiency and typical learning curves

5. SKILL ECOSYSTEM:
   - 5-7 related skills often learned together
   - Which ones are most valuable to add

6. MARKET TRENDS:
   - Is this skill rising, stable, or declining?
   - Annual growth/decline rate estimate
   - 2-year outlook

7. CERTIFICATION STRATEGY:
   Recommend 3-5 certifications:
   - Certification name
   - Provider (e.g., AWS, Google, CompTIA)
   - Estimated cost
   - Time to complete
   - Impact score (0-100) on career prospects

8. BRUTAL SUMMARY:
   - Where they truly stand
   - Biggest gaps vs market
   - Highest-impact actions
   - Timeline to competitiveness

RESPONSE FORMAT (JSON):
{
  "marketAverage": 65,
  "percentileRank": 45,
  "marketDemand": "high",
  "averageSalary": "$85,000 - $120,000",
  "salaryByLevel": {
    "junior": "$60,000 - $80,000",
    "mid": "$85,000 - $120,000",
    "senior": "$130,000 - $180,000"
  },
  "topCompaniesHiring": ["Google", "Amazon", "Microsoft", "Meta", "Netflix"],
  "learningPath": [
    {
      "phase": "Foundation",
      "duration": "2-3 months",
      "resources": ["Course X", "Book Y", "Project Z"],
      "milestones": ["Build X", "Complete Y", "Deploy Z"]
    }
  ],
  "timeToImprove": "4-6 months to reach top 25%",
  "relatedSkills": ["Skill A", "Skill B"],
  "industryTrends": {
    "trend": "rising",
    "growthRate": "+15% YoY",
    "outlook": "Strong demand through 2026"
  },
  "certificationRecommendations": [
    {
      "name": "Cert Name",
      "provider": "Provider",
      "estimatedCost": "$300",
      "timeToComplete": "40 hours",
      "impactScore": 85
    }
  ],
  "analysis": "Detailed brutal assessment..."
}`;

  try {
    const response = await callAI(prompt);
    const parsed = JSON.parse(response);
    
    return {
      marketAverage: parsed.marketAverage || 70,
      percentileRank: parsed.percentileRank || 50,
      marketDemand: parsed.marketDemand || 'medium',
      averageSalary: parsed.averageSalary || '$70,000 - $100,000',
      salaryByLevel: parsed.salaryByLevel || {
        junior: '$50,000 - $70,000',
        mid: '$70,000 - $100,000',
        senior: '$100,000 - $150,000'
      },
      topCompaniesHiring: parsed.topCompaniesHiring || [],
      learningPath: parsed.learningPath || [],
      timeToImprove: parsed.timeToImprove || '3-6 months',
      relatedSkills: parsed.relatedSkills || [],
      industryTrends: parsed.industryTrends || {
        trend: 'stable',
        growthRate: '0%',
        outlook: 'Moderate demand'
      },
      certificationRecommendations: parsed.certificationRecommendations || [],
      analysis: parsed.analysis || ''
    };
  } catch (error) {
    console.error('[Skill Benchmark] AI analysis failed:', error);
    
    // Fallback with basic analysis
    return generateFallbackBenchmark(input);
  }
}

/**
 * Fallback benchmark analysis when AI fails
 * Provides basic, reasonable estimates
 */
function generateFallbackBenchmark(input: SkillBenchmarkInput): BenchmarkAnalysis {
  const { skillName, userProficiency } = input;
  
  // Basic percentile calculation based on self-assessment
  const percentileRank = Math.min(Math.max(userProficiency - 10, 0), 95);
  
  return {
    marketAverage: 65,
    percentileRank,
    marketDemand: 'medium',
    averageSalary: '$75,000 - $110,000',
    salaryByLevel: {
      junior: '$55,000 - $75,000',
      mid: '$75,000 - $110,000',
      senior: '$110,000 - $160,000'
    },
    topCompaniesHiring: ['Tech Companies', 'Startups', 'Enterprises'],
    learningPath: [
      {
        phase: 'Foundation',
        duration: '2-3 months',
        resources: [
          'Online courses on Udemy/Coursera',
          'Official documentation',
          'Practice projects on GitHub'
        ],
        milestones: [
          'Complete fundamentals course',
          'Build 2-3 practice projects',
          'Contribute to open source'
        ]
      },
      {
        phase: 'Intermediate',
        duration: '3-4 months',
        resources: [
          'Advanced courses',
          'Industry-specific books',
          'Real-world project work'
        ],
        milestones: [
          'Build production-ready project',
          'Gain professional experience',
          'Network with experts'
        ]
      },
      {
        phase: 'Advanced',
        duration: '3-6 months',
        resources: [
          'Expert-level resources',
          'Mentorship programs',
          'Conference attendance'
        ],
        milestones: [
          'Achieve certification',
          'Lead team projects',
          'Contribute thought leadership'
        ]
      }
    ],
    timeToImprove: userProficiency < 50 ? '6-9 months' : '3-6 months',
    relatedSkills: [],
    industryTrends: {
      trend: 'stable',
      growthRate: '+5% YoY',
      outlook: 'Consistent demand across industries'
    },
    certificationRecommendations: [
      {
        name: `Professional ${skillName} Certification`,
        provider: 'Industry Association',
        estimatedCost: '$300 - $500',
        timeToComplete: '40-60 hours',
        impactScore: 75
      }
    ],
    analysis: `Based on your self-assessment of ${userProficiency}/100 in ${skillName}, you're performing around the ${percentileRank}th percentile compared to other professionals. To reach top 25%, focus on advanced projects, certifications, and real-world experience. The skill shows stable market demand with competitive salaries across experience levels.`
  };
}

/**
 * Calculate salary impact of improving skill proficiency
 */
export function calculateSalaryImpact(
  currentProficiency: number,
  targetProficiency: number,
  baseRange: { min: number; max: number }
): string {
  const improvement = targetProficiency - currentProficiency;
  const impactMultiplier = improvement / 25; // Every 25 points = ~1 level jump
  
  const potentialIncrease = Math.round(baseRange.min * 0.3 * impactMultiplier);
  
  return `$${potentialIncrease.toLocaleString()} - $${Math.round(potentialIncrease * 1.5).toLocaleString()}`;
}

export type { SkillBenchmarkInput, BenchmarkAnalysis };
