/**
 * Predictive Career Modeling - Phase 3
 * 
 * This service anticipates career moves and proactively suggests opportunities
 * before users ask, using pattern analysis and industry trend forecasting.
 */

import { analyzeUserPatternsSync } from './learning-pattern-recognition';
import { getRecentMessagesSync } from './conversation-memory';

export interface CareerPrediction {
  id: string;
  type: 'role_transition' | 'skill_gap' | 'industry_shift' | 'leadership_opportunity' | 'market_trend';
  prediction: string;
  confidence: number;
  timeframe: 'next_3_months' | 'next_6_months' | 'next_year' | 'long_term';
  triggers: string[];
  preventiveActions: string[];
  opportunities: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PredictiveInsight {
  userId: string;
  predictions: CareerPrediction[];
  overallCareerTrajectory: 'ascending' | 'stable' | 'transition_needed' | 'at_risk';
  nextLikelyMove: string;
  confidence: number;
  generatedAt: Date;
}

// Industry trend data (would normally come from external APIs)
const INDUSTRY_TRENDS = {
  'hospitality': {
    emerging_roles: ['Guest Experience Director', 'Revenue Optimization Manager', 'Sustainability Manager'],
    declining_roles: ['Traditional Front Desk Manager'],
    growing_skills: ['Data Analytics', 'Digital Marketing', 'Sustainability Practices'],
    market_outlook: 'recovery_growth'
  },
  'technology': {
    emerging_roles: ['AI Ethics Officer', 'Quantum Computing Specialist', 'DevSecOps Engineer'],
    declining_roles: ['Legacy System Administrator'],
    growing_skills: ['AI/ML', 'Cloud Security', 'Quantum Computing'],
    market_outlook: 'rapid_growth'
  },
  'healthcare': {
    emerging_roles: ['Digital Health Manager', 'Telemedicine Coordinator', 'Health Data Analyst'],
    declining_roles: ['Traditional Records Clerk'],
    growing_skills: ['Digital Health Platforms', 'Data Analysis', 'Telehealth Technologies'],
    market_outlook: 'steady_growth'
  }
};

/**
 * Generate predictive career insights for a user
 */
export function generatePredictiveInsights(
  userId: string,
  userProfile: any,
  userExperiences: any[],
  userSkills: any[]
): PredictiveInsight {
  console.log(`[Predictive Modeling] Generating insights for user ${userId}`);
  
  const userPatterns = analyzeUserPatternsSync(userId);
  const recentMessages = getRecentMessagesSync(userId, 10);
  
  const predictions: CareerPrediction[] = [];
  
  // Analyze role transition probability
  const roleTransitionPrediction = analyzeRoleTransitionLikelihood(userProfile, userExperiences, userPatterns);
  if (roleTransitionPrediction) predictions.push(roleTransitionPrediction);
  
  // Analyze skill gaps
  const skillGapPredictions = analyzeSkillGaps(userProfile, userSkills, userExperiences);
  predictions.push(...skillGapPredictions);
  
  // Analyze industry shift potential
  const industryShiftPrediction = analyzeIndustryShiftPotential(userProfile, userExperiences, recentMessages);
  if (industryShiftPrediction) predictions.push(industryShiftPrediction);
  
  // Analyze leadership opportunities
  const leadershipPrediction = analyzeLeadershipOpportunities(userProfile, userExperiences, userPatterns);
  if (leadershipPrediction) predictions.push(leadershipPrediction);
  
  // Analyze market trends impact
  const marketTrendPredictions = analyzeMarketTrendImpact(userProfile, userExperiences);
  predictions.push(...marketTrendPredictions);
  
  // Determine overall career trajectory
  const overallTrajectory = determineCareerTrajectory(predictions, userProfile, userExperiences);
  
  // Predict next likely move
  const nextLikelyMove = predictNextCareerMove(predictions, userProfile, userPatterns);
  
  // Calculate overall confidence
  const confidence = calculatePredictiveConfidence(predictions, userPatterns.confidence);
  
  return {
    userId,
    predictions: predictions.sort((a, b) => b.confidence - a.confidence),
    overallCareerTrajectory: overallTrajectory,
    nextLikelyMove,
    confidence,
    generatedAt: new Date()
  };
}

/**
 * Analyze likelihood of role transition
 */
function analyzeRoleTransitionLikelihood(
  userProfile: any,
  userExperiences: any[],
  userPatterns: any
): CareerPrediction | null {
  if (!userProfile || !userExperiences.length) return null;
  
  const currentTitle = userProfile.title || '';
  const yearsInCurrentRole = calculateYearsInCurrentRole(userExperiences);
  const lookingFor = userProfile.lookingFor || '';
  
  let confidence = 0;
  const triggers: string[] = [];
  
  // Analyze tenure in current role
  if (yearsInCurrentRole >= 3) {
    confidence += 0.3;
    triggers.push('Extended tenure in current role');
  }
  
  // Analyze user patterns for career change signals
  if (userPatterns.preferences.focusAreas.includes('career_change')) {
    confidence += 0.4;
    triggers.push('Active interest in career change');
  }
  
  // Analyze profile settings
  if (lookingFor === 'job_opportunities') {
    confidence += 0.3;
    triggers.push('Actively seeking new opportunities');
  }
  
  if (confidence < 0.3) return null;
  
  return {
    id: 'role_transition_prediction',
    type: 'role_transition',
    prediction: `High likelihood of role transition within next 6-12 months based on tenure and engagement patterns`,
    confidence,
    timeframe: yearsInCurrentRole >= 5 ? 'next_3_months' : 'next_6_months',
    triggers,
    preventiveActions: [
      'Update resume with recent achievements',
      'Expand professional network in target industry',
      'Develop transition-relevant skills'
    ],
    opportunities: [
      'Senior leadership positions in current industry',
      'Cross-industry roles leveraging transferable skills',
      'Consulting or advisory positions'
    ],
    riskLevel: confidence > 0.7 ? 'low' : 'medium'
  };
}

/**
 * Analyze skill gaps based on industry trends
 */
function analyzeSkillGaps(
  userProfile: any,
  userSkills: any[],
  userExperiences: any[]
): CareerPrediction[] {
  const predictions: CareerPrediction[] = [];
  
  if (!userProfile?.industry) return predictions;
  
  const industry = userProfile.industry.toLowerCase();
  const industryTrends = INDUSTRY_TRENDS[industry] || INDUSTRY_TRENDS['technology']; // Default fallback
  
  const currentSkills = userSkills.map(skill => skill.name.toLowerCase());
  const growingSkills = industryTrends.growing_skills.map(skill => skill.toLowerCase());
  
  // Find missing critical skills
  const missingSkills = growingSkills.filter(skill => 
    !currentSkills.some(userSkill => userSkill.includes(skill.split(' ')[0]))
  );
  
  if (missingSkills.length > 0) {
    predictions.push({
      id: 'skill_gap_prediction',
      type: 'skill_gap',
      prediction: `Critical skill gaps identified in emerging ${industry} competencies`,
      confidence: 0.8,
      timeframe: 'next_3_months',
      triggers: ['Industry evolution', 'Market demand shifts'],
      preventiveActions: [
        `Develop ${missingSkills[0]} skills through online courses`,
        'Attend industry conferences and workshops',
        'Seek mentorship in emerging technologies'
      ],
      opportunities: [
        'Certification programs in high-demand skills',
        'Internal training and development programs',
        'Cross-functional project assignments'
      ],
      riskLevel: missingSkills.length > 2 ? 'high' : 'medium'
    });
  }
  
  return predictions;
}

/**
 * Analyze potential for industry shift
 */
function analyzeIndustryShiftPotential(
  userProfile: any,
  userExperiences: any[],
  recentMessages: any[]
): CareerPrediction | null {
  if (!userProfile || !userExperiences.length) return null;
  
  // Look for signals in conversation history
  const messagesText = recentMessages.map(m => m.message.toLowerCase()).join(' ');
  const industryShiftKeywords = ['switch', 'change industry', 'transition', 'move to', 'different field'];
  
  const hasShiftSignals = industryShiftKeywords.some(keyword => messagesText.includes(keyword));
  
  if (!hasShiftSignals) return null;
  
  return {
    id: 'industry_shift_prediction',
    type: 'industry_shift',
    prediction: 'Potential industry transition detected based on recent conversations and interests',
    confidence: 0.6,
    timeframe: 'next_year',
    triggers: ['Expressed interest in career change', 'Industry dissatisfaction signals'],
    preventiveActions: [
      'Research target industries thoroughly',
      'Identify transferable skills',
      'Build network in target industry'
    ],
    opportunities: [
      'Leverage existing expertise in new context',
      'Cross-industry consulting opportunities',
      'Hybrid roles bridging current and target industries'
    ],
    riskLevel: 'medium'
  };
}

/**
 * Analyze leadership advancement opportunities
 */
function analyzeLeadershipOpportunities(
  userProfile: any,
  userExperiences: any[],
  userPatterns: any
): CareerPrediction | null {
  if (!userProfile) return null;
  
  const currentTitle = userProfile.title || '';
  const isCurrentlyLeader = /director|manager|lead|head|vp|chief/i.test(currentTitle);
  const hasLeadershipFocus = userPatterns.preferences.focusAreas.includes('leadership');
  
  if (!isCurrentlyLeader && !hasLeadershipFocus) return null;
  
  const yearsExperience = calculateTotalYearsExperience(userExperiences);
  let confidence = 0.5;
  
  if (yearsExperience >= 7) confidence += 0.2;
  if (isCurrentlyLeader) confidence += 0.2;
  if (hasLeadershipFocus) confidence += 0.1;
  
  return {
    id: 'leadership_opportunity_prediction',
    type: 'leadership_opportunity',
    prediction: 'Strong potential for senior leadership advancement based on experience and focus areas',
    confidence,
    timeframe: isCurrentlyLeader ? 'next_year' : 'long_term',
    triggers: ['Leadership experience', 'Strategic thinking development'],
    preventiveActions: [
      'Develop executive presence',
      'Build cross-functional relationships',
      'Gain P&L responsibility experience'
    ],
    opportunities: [
      'C-suite preparation programs',
      'Board advisory positions',
      'Industry thought leadership roles'
    ],
    riskLevel: 'low'
  };
}

/**
 * Analyze market trend impact on career
 */
function analyzeMarketTrendImpact(
  userProfile: any,
  userExperiences: any[]
): CareerPrediction[] {
  const predictions: CareerPrediction[] = [];
  
  if (!userProfile?.industry) return predictions;
  
  const industry = userProfile.industry.toLowerCase();
  const industryTrends = INDUSTRY_TRENDS[industry] || INDUSTRY_TRENDS['technology'];
  
  // Analyze if current role is in declining category
  const currentTitle = userProfile.title || '';
  const isInDecliningRole = industryTrends.declining_roles.some(role => 
    currentTitle.toLowerCase().includes(role.toLowerCase().split(' ')[0])
  );
  
  if (isInDecliningRole) {
    predictions.push({
      id: 'market_trend_risk',
      type: 'market_trend',
      prediction: 'Current role category showing decline in market demand',
      confidence: 0.7,
      timeframe: 'next_year',
      triggers: ['Industry automation', 'Market evolution', 'Technology disruption'],
      preventiveActions: [
        'Develop skills in emerging role categories',
        'Position for transition to growth areas',
        'Build expertise in automation-resistant competencies'
      ],
      opportunities: [
        'Lead digital transformation initiatives',
        'Mentor others in role transitions',
        'Become subject matter expert in emerging areas'
      ],
      riskLevel: 'high'
    });
  }
  
  return predictions;
}

/**
 * Determine overall career trajectory
 */
function determineCareerTrajectory(
  predictions: CareerPrediction[],
  userProfile: any,
  userExperiences: any[]
): 'ascending' | 'stable' | 'transition_needed' | 'at_risk' {
  const highRiskPredictions = predictions.filter(p => p.riskLevel === 'high');
  const opportunityPredictions = predictions.filter(p => p.type === 'leadership_opportunity');
  const transitionPredictions = predictions.filter(p => p.type === 'role_transition' || p.type === 'industry_shift');
  
  if (highRiskPredictions.length > 0) return 'at_risk';
  if (opportunityPredictions.length > 0) return 'ascending';
  if (transitionPredictions.length > 0) return 'transition_needed';
  return 'stable';
}

/**
 * Predict next likely career move
 */
function predictNextCareerMove(
  predictions: CareerPrediction[],
  userProfile: any,
  userPatterns: any
): string {
  const highConfidencePredictions = predictions.filter(p => p.confidence > 0.6);
  
  if (highConfidencePredictions.length === 0) {
    return 'Continue building expertise in current role while exploring growth opportunities';
  }
  
  const topPrediction = highConfidencePredictions[0];
  
  switch (topPrediction.type) {
    case 'role_transition':
      return 'Likely to pursue senior leadership position within 6-12 months';
    case 'industry_shift':
      return 'Potential career pivot to new industry leveraging transferable skills';
    case 'leadership_opportunity':
      return 'Strong candidate for executive advancement and increased responsibilities';
    case 'skill_gap':
      return 'Focus on skill development to maintain competitive advantage';
    default:
      return 'Strategic career development and opportunity evaluation';
  }
}

/**
 * Calculate predictive confidence based on data quality
 */
function calculatePredictiveConfidence(predictions: CareerPrediction[], patternConfidence: number): number {
  if (predictions.length === 0) return 0.3;
  
  const avgPredictionConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  const dataQualityScore = patternConfidence;
  
  return Math.min((avgPredictionConfidence + dataQualityScore) / 2, 1);
}

/**
 * Helper functions
 */
function calculateYearsInCurrentRole(experiences: any[]): number {
  if (!experiences.length) return 0;
  
  const currentRole = experiences.find(exp => exp.isCurrentRole) || experiences[0];
  const startDate = new Date(currentRole.startDate);
  const endDate = currentRole.endDate ? new Date(currentRole.endDate) : new Date();
  
  return Math.abs(endDate.getFullYear() - startDate.getFullYear());
}

function calculateTotalYearsExperience(experiences: any[]): number {
  return experiences.reduce((total, exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + Math.abs(endDate.getFullYear() - startDate.getFullYear());
  }, 0);
}