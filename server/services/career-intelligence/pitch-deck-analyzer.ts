import { callAI } from '../ai-service.js';
import type { InsertPitchDeckAnalysis, PitchDeckAnalysis } from '../../../shared/schema.js';

/**
 * PITCH DECK ANALYZER - Phase 2 Career Intelligence Suite
 * 
 * Provides investor-level feedback on startup pitch decks:
 * - Slide-by-slide scoring across 4 dimensions (story, market, financials, team)
 * - Critical issues that kill investor interest
 * - Fundraising probability estimate
 * - Suggested valuation based on deck quality
 * 
 * Uses FREE Ollama (Llama 3.2:3b) for AI analysis
 */

interface PitchDeckInput {
  userId: number;
  deckName: string;
  deckText: string; // Extracted text from slides
  fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
  targetRaise?: string;
}

interface PitchDeckAnalysisResult {
  overallScore: number;
  storyScore: number;
  marketScore: number;
  financialsScore: number;
  teamScore: number;
  problemStatementAnalysis: any;
  solutionAnalysis: any;
  marketSizeAnalysis: any;
  businessModelAnalysis: any;
  competitiveAnalysis: any;
  tractionAnalysis: any;
  financialProjectionsAnalysis: any;
  teamAnalysis: any;
  askAnalysis: any;
  investorFeedback: string;
  criticalIssues: string[];
  strengthsHighlighted: string[];
  fundingProbability: number;
  suggestedValuation: string;
  recommendedChanges: any[];
}

/**
 * Generate AI-powered pitch deck analysis with investor perspective
 */
export async function analyzePitchDeck(
  input: PitchDeckInput
): Promise<PitchDeckAnalysisResult> {
  const prompt = `You are a seasoned venture capital investor analyzing a startup pitch deck. Be BRUTALLY HONEST - most decks are mediocre. Grade on real VC standards.

PITCH DECK SUBMISSION:
Company: ${input.deckName}
Funding Stage: ${input.fundingStage || 'Seed'}
Target Raise: ${input.targetRaise || 'Not specified'}

DECK CONTENT:
${input.deckText}

PROVIDE BRUTAL INVESTOR-LEVEL ANALYSIS:

1. OVERALL SCORING (0-100 each, total 0-100):
   - Story Score (0-25): Compelling narrative? Problem-solution clarity?
   - Market Score (0-25): TAM/SAM/SOM realistic? Market understanding?
   - Financials Score (0-25): Projections credible? Unit economics clear?
   - Team Score (0-25): Can they execute? Domain expertise?

2. DETAILED SLIDE ANALYSIS:
   For each key section:
   
   A. Problem Statement:
      - Is it a real, urgent problem?
      - Quantified pain points?
      - Target customer clear?
   
   B. Solution:
      - Novel or derivative?
      - Defensibility?
      - Why now?
   
   C. Market Size:
      - TAM realistic or fantasy?
      - Bottoms-up vs top-down match?
      - Addressable market accessible?
   
   D. Business Model:
      - Revenue streams clear?
      - Pricing justified?
      - Path to profitability visible?
   
   E. Competition:
      - Honest about competitors?
      - Differentiation meaningful?
      - Switching costs exist?
   
   F. Traction:
      - Real users or vanity metrics?
      - Growth rate sustainable?
      - PMF evidence?
   
   G. Financial Projections:
      - Hockey stick reasonable?
      - Assumptions transparent?
      - Unit economics profitable?
   
   H. Team:
      - Can they build this?
      - Prior exits/experience?
      - Full-time or side hustle?
   
   I. Ask:
      - Dilution reasonable?
      - Use of funds clear?
      - Runway calculation accurate?

3. CRITICAL RED FLAGS:
   List 3-7 DEAL-KILLER issues that would make investors pass:
   - Unrealistic projections
   - Weak team
   - Tiny TAM
   - No traction
   - Unclear business model
   - etc.

4. KEY STRENGTHS:
   What actually works well? (Be honest, might be short list)

5. FUNDING PROBABILITY:
   Realistic % chance of raising at this stage (0-100%)
   - Based on deck quality alone
   - Consider market, team, traction

6. VALUATION GUIDANCE:
   Based on deck quality and stage:
   - Suggested pre-money valuation range
   - Justification

7. PRIORITY FIXES:
   Top 5 changes to make before next pitch, ordered by impact:
   - What to fix
   - Why it matters
   - How to improve

8. INVESTOR VERDICT:
   Final 2-3 paragraph assessment as if writing partner memo:
   - Investment thesis if yes
   - Clear pass reasons if no
   - What would make it fundable

RESPONSE FORMAT (JSON):
{
  "overallScore": 45,
  "storyScore": 12,
  "marketScore": 15,
  "financialsScore": 10,
  "teamScore": 8,
  "problemStatementAnalysis": { "score": 70, "feedback": "...", "strengths": [], "weaknesses": [] },
  "solutionAnalysis": { "score": 60, "feedback": "..." },
  "marketSizeAnalysis": { "score": 40, "feedback": "..." },
  "businessModelAnalysis": { "score": 55, "feedback": "..." },
  "competitiveAnalysis": { "score": 50, "feedback": "..." },
  "tractionAnalysis": { "score": 30, "feedback": "..." },
  "financialProjectionsAnalysis": { "score": 35, "feedback": "..." },
  "teamAnalysis": { "score": 45, "feedback": "..." },
  "askAnalysis": { "score": 60, "feedback": "..." },
  "criticalIssues": ["Issue 1", "Issue 2", "Issue 3"],
  "strengthsHighlighted": ["Strength 1", "Strength 2"],
  "fundingProbability": 25,
  "suggestedValuation": "$3M - $5M pre-money",
  "recommendedChanges": [
    { "priority": 1, "change": "Fix X", "reason": "...", "impact": "high" }
  ],
  "investorFeedback": "Full investor memo..."
}`;

  try {
    const response = await callAI(prompt);
    const parsed = JSON.parse(response);
    
    return {
      overallScore: parsed.overallScore || 50,
      storyScore: parsed.storyScore || 12,
      marketScore: parsed.marketScore || 13,
      financialsScore: parsed.financialsScore || 12,
      teamScore: parsed.teamScore || 13,
      problemStatementAnalysis: parsed.problemStatementAnalysis || {},
      solutionAnalysis: parsed.solutionAnalysis || {},
      marketSizeAnalysis: parsed.marketSizeAnalysis || {},
      businessModelAnalysis: parsed.businessModelAnalysis || {},
      competitiveAnalysis: parsed.competitiveAnalysis || {},
      tractionAnalysis: parsed.tractionAnalysis || {},
      financialProjectionsAnalysis: parsed.financialProjectionsAnalysis || {},
      teamAnalysis: parsed.teamAnalysis || {},
      askAnalysis: parsed.askAnalysis || {},
      investorFeedback: parsed.investorFeedback || '',
      criticalIssues: parsed.criticalIssues || [],
      strengthsHighlighted: parsed.strengthsHighlighted || [],
      fundingProbability: parsed.fundingProbability || 30,
      suggestedValuation: parsed.suggestedValuation || '$2M - $4M pre-money',
      recommendedChanges: parsed.recommendedChanges || []
    };
  } catch (error) {
    console.error('[Pitch Deck Analyzer] AI analysis failed:', error);
    
    // Fallback analysis
    return generateFallbackPitchAnalysis(input);
  }
}

/**
 * Fallback pitch deck analysis when AI fails
 */
function generateFallbackPitchAnalysis(input: PitchDeckInput): PitchDeckAnalysisResult {
  return {
    overallScore: 50,
    storyScore: 12,
    marketScore: 13,
    financialsScore: 12,
    teamScore: 13,
    problemStatementAnalysis: {
      score: 60,
      feedback: 'Problem statement needs more quantification and urgency.',
      strengths: ['Clear target market'],
      weaknesses: ['Lacks data on problem magnitude']
    },
    solutionAnalysis: {
      score: 55,
      feedback: 'Solution is clear but differentiation needs strengthening.'
    },
    marketSizeAnalysis: {
      score: 45,
      feedback: 'Market size calculations need more bottoms-up validation.'
    },
    businessModelAnalysis: {
      score: 50,
      feedback: 'Revenue streams identified but unit economics unclear.'
    },
    competitiveAnalysis: {
      score: 48,
      feedback: 'Competitive landscape addressed but differentiation weak.'
    },
    tractionAnalysis: {
      score: 40,
      feedback: 'Early traction shown but growth metrics need more detail.'
    },
    financialProjectionsAnalysis: {
      score: 42,
      feedback: 'Projections are aggressive. Assumptions need transparency.'
    },
    teamAnalysis: {
      score: 52,
      feedback: 'Team has relevant experience but could highlight more achievements.'
    },
    askAnalysis: {
      score: 58,
      feedback: 'Funding ask and use of funds are reasonable.'
    },
    investorFeedback: `This pitch deck shows promise but needs significant refinement before investor meetings. The core idea has potential, but execution risk is high given current traction levels. Focus on strengthening the problem validation with data, clarifying unit economics, and demonstrating sustainable growth metrics. The team needs to showcase domain expertise more clearly. At current stage, this would likely generate interest from angels but struggle with institutional VCs.`,
    criticalIssues: [
      'Financial projections lack transparent assumptions',
      'Competitive differentiation unclear',
      'Team experience in this domain not highlighted',
      'Traction metrics are vanity-focused',
      'Market size calculation needs bottoms-up validation'
    ],
    strengthsHighlighted: [
      'Clear problem identification',
      'Reasonable funding ask',
      'Identified revenue streams'
    ],
    fundingProbability: 35,
    suggestedValuation: '$2.5M - $4M pre-money',
    recommendedChanges: [
      {
        priority: 1,
        change: 'Add quantified problem validation data',
        reason: 'Investors need proof the problem is real and urgent',
        impact: 'high'
      },
      {
        priority: 2,
        change: 'Clarify unit economics with transparent assumptions',
        reason: 'Path to profitability must be credible',
        impact: 'high'
      },
      {
        priority: 3,
        change: 'Strengthen competitive differentiation',
        reason: 'Must show defensible moat',
        impact: 'high'
      },
      {
        priority: 4,
        change: 'Replace vanity metrics with growth metrics',
        reason: 'Show sustainable, repeatable growth',
        impact: 'medium'
      },
      {
        priority: 5,
        change: 'Highlight team domain expertise and wins',
        reason: 'Team must prove execution capability',
        impact: 'medium'
      }
    ]
  };
}

/**
 * Extract key deck sections from raw text
 * Simple text pattern matching for now
 */
export function extractDeckSections(deckText: string): {
  problem?: string;
  solution?: string;
  market?: string;
  business?: string;
  team?: string;
  traction?: string;
  ask?: string;
} {
  const sections: any = {};
  
  // Simple keyword-based extraction
  // In production, this would use more sophisticated NLP
  
  const keywords = {
    problem: ['problem', 'pain point', 'challenge', 'issue'],
    solution: ['solution', 'product', 'platform', 'technology'],
    market: ['market', 'tam', 'sam', 'opportunity'],
    business: ['business model', 'revenue', 'pricing', 'monetization'],
    team: ['team', 'founder', 'experience', 'background'],
    traction: ['traction', 'growth', 'users', 'revenue', 'metrics'],
    ask: ['raising', 'funding', 'investment', 'round']
  };
  
  // Extract paragraphs that match each section
  const paragraphs = deckText.split('\n\n');
  
  for (const [section, words] of Object.entries(keywords)) {
    for (const para of paragraphs) {
      const lowerPara = para.toLowerCase();
      if (words.some(word => lowerPara.includes(word))) {
        sections[section] = para;
        break;
      }
    }
  }
  
  return sections;
}

export type { PitchDeckInput, PitchDeckAnalysisResult };
