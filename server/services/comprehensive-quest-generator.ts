/**
 * Comprehensive Quest Generator
 * 
 * Generates fully detailed, personalized quests for ALL quest types:
 * - pulse_creation
 * - portfolio
 * - resume
 * - learning
 * - social_quest
 * 
 * Each quest includes:
 * - Personalized title/description based on user profile
 * - Detailed deliverable specifications
 * - Specific quantities (# of images, slides, bullet points, etc.)
 * - Platform constraints and requirements
 * - Step-by-step guidance
 * - AI-generated Musk tip
 */

import { db } from '../db';
import { users, brandGoals } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface DetailedPersonalizedQuest {
  // Core quest data
  type: string;
  title: string;
  description: string;
  targetAction: string;
  xpReward: number;
  platform?: string;
  
  // Detailed specifications (like social quests)
  deliverableFormat: string;        // e.g., "3 images with captions, 600×400px each"
  quantityValue: number;            // e.g., 3
  quantityType: string;             // e.g., "images"
  platformConstraints: string;      // Specific requirements
  guidanceSnippet: string;          // Step-by-step guidance
  estimatedTimeMinutes: number;     // Time estimate
  
  // AI-generated content
  muskTip: string;                  // Personalized Musk tip
  
  // Metadata
  category: string;                 // 'career' or 'social'
  difficultyLevel: string;          // 'beginner' | 'intermediate' | 'advanced'
}

export class ComprehensiveQuestGenerator {
  
  /**
   * Generate fully detailed career quest (pulse_creation type)
   */
  private async generatePulseCreationQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const name = userProfile.name || 'professional';
    
    // Determine if this is an authority-building goal
    const isAuthorityGoal = brandGoals.includes('professional_1');
    const isVisibilityGoal = brandGoals.some(g => g.startsWith('visibility_'));
    
    const questVariations = [
      {
        title: `Share ${location} ${industry} Success Story with Data`,
        description: `Create a Brandentifier pulse sharing a recent ${domain} success story from your work in ${location}. Include specific metrics, before/after results, and lessons learned. Position yourself as a ${location}-based ${industry} authority by showcasing real project outcomes.`,
        deliverableFormat: `1 pulse post with 3 professional images: (1) project before state, (2) key methodology diagram, (3) final results dashboard. Each image 800×600px, high quality.`,
        quantityValue: 3,
        quantityType: "images with data visualizations",
        platformConstraints: `Brandentifier pulse format. Images must show actual project data. Include metrics in captions. Professional ${location} business aesthetic.`,
        guidanceSnippet: `Structure: Opening hook with main metric → Challenge faced in ${location} market → Your ${domain} solution → Implementation steps (numbered) → Results with charts → Key learning. Use ${location}-specific examples and ${industry} terminology.`,
        muskTip: `The best pulses show receipts, not claims. Lead with "${location} ${domain} project: [BIG METRIC]" in your opening line. Your 3 images should tell the story without text - before, process, after. Include at least 5 specific numbers. Tag relevant ${location} companies or institutions you worked with. End with "Which metric surprised you most?" to drive engagement.`
      },
      {
        title: `${industry} Insight: 3 Lessons from ${location} Market`,
        description: `Create an insights-driven pulse sharing 3 key lessons you've learned working in ${industry} within the ${location} market. Focus on ${domain} expertise and include real examples from your experience.`,
        deliverableFormat: `1 pulse (400-500 words) with 2 supporting images: (1) ${location} market context chart, (2) results comparison graphic. Minimum 800×600px each.`,
        quantityValue: 2,
        quantityType: "professional charts/graphics",
        platformConstraints: `Must include ${location}-specific data or examples. Professional formatting with numbered lessons. Clean visual hierarchy.`,
        guidanceSnippet: `Format: Hook statement → "Here are 3 lessons:" → Lesson 1 (with metric) → Lesson 2 (with example) → Lesson 3 (with result) → Takeaway for ${location} ${industry} professionals. Add 2 visuals showing market trends or your results.`,
        muskTip: `Lessons without specifics are LinkedIn fluff. Each lesson needs: (1) What happened in ${location}, (2) What you did differently, (3) Exact result with number. Your 2 images should be DATA, not stock photos. Make one image compare ${location} vs broader market. Include local company names (with permission) for credibility.`
      },
      {
        title: `${location} ${industry} Trend Analysis with Original Research`,
        description: `Share original research or analysis on an emerging ${industry} trend specifically impacting the ${location} market. Demonstrate ${domain} thought leadership with data-driven insights.`,
        deliverableFormat: `1 comprehensive pulse (500-600 words) with 4 research visuals: trend graph, market breakdown, your analysis framework, actionable takeaways chart.`,
        quantityValue: 4,
        quantityType: "research graphics (charts, frameworks, data visualizations)",
        platformConstraints: `Must include original research or unique ${location} market data. Cite 3+ ${location}-specific sources. Professional research report aesthetic.`,
        guidanceSnippet: `Research structure: Trend statement with ${location} impact → Data collection method → 4 key findings (each with visual) → ${location} market implications → Predictions for ${industry} professionals. Include methodology notes.`,
        muskTip: `Research posts without new data are just opinion blogs. Your 4 visuals need to show something people haven't seen: ${location} market data you collected, surveys you ran, or analysis you did. Lead with "I analyzed 47 ${industry} companies in ${location} and found..." Include your data sources and sample size. Make finding #2 or #3 controversial to drive discussion.`
      }
    ];
    
    // Select variation based on goals
    const selectedQuest = isAuthorityGoal ? questVariations[0] : 
                          isVisibilityGoal ? questVariations[2] : 
                          questVariations[1];
    
    return {
      type: 'pulse_creation',
      ...selectedQuest,
      targetAction: 'create_pulse',
      xpReward: 60,
      platform: 'Brandentifier',
      estimatedTimeMinutes: 35,
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  /**
   * Generate fully detailed portfolio quest
   */
  private async generatePortfolioQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    
    return {
      type: 'portfolio',
      title: `Build Authority Portfolio: ${location} ${industry} Case Study Showcase`,
      description: `Create a comprehensive case study showcasing your best ${domain} project from ${location}. Include detailed strategy, execution, results, and stakeholder impact. Position yourself as the go-to ${industry} expert in ${location}.`,
      targetAction: 'create_portfolio',
      xpReward: 80,
      platform: 'Brandentifier',
      deliverableFormat: `1 comprehensive case study with 7 sections: Executive Summary, Challenge/Context (${location} market), Your ${domain} Strategy, Implementation Timeline, Results Dashboard (with 6+ metrics), Client/Stakeholder Testimonials, Key Learnings`,
      quantityValue: 7,
      quantityType: "detailed sections with visuals",
      platformConstraints: `Must include: project timeline visualization, before/after metrics comparison, ${location} market context, stakeholder quotes, ROI data, methodology diagrams. Minimum 5 professional images/charts.`,
      guidanceSnippet: `Structure each section: (1) Executive Summary (150 words, key metrics upfront) → (2) Challenge (${location} specific context, why this mattered) → (3) Strategy (your ${domain} approach, frameworks used) → (4) Timeline (visual with milestones) → (5) Results (6+ metrics with charts) → (6) Testimonials (3 stakeholder quotes) → (7) Lessons (what you'd do differently). Include ${location} company/institution names where appropriate.`,
      estimatedTimeMinutes: 45,
      muskTip: `Portfolio pieces that hide results hide weakness. Lead your Executive Summary with your biggest number: "${location} ${industry} project delivered [X% improvement]". Your Results section needs minimum 6 metrics - revenue impact, time saved, quality gains, stakeholder satisfaction, market response, ROI. Make your Timeline visual show WHEN key decisions happened, not just tasks. Get 3 quotes from actual stakeholders (clients, team leads, partners). Name ${location} institutions you worked with for credibility.`,
      category: 'career',
      difficultyLevel: 'advanced'
    };
  }
  
  /**
   * Generate fully detailed resume quest
   */
  private async generateResumeQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    
    return {
      type: 'resume',
      title: `Quantify ${domain} Impact: Add 5 Metric-Driven Resume Achievements`,
      description: `Transform 5 resume bullet points from your ${industry} experience into metric-driven achievement statements. Focus on ${location} market impact and ${domain} results that demonstrate authority.`,
      targetAction: 'update_resume',
      xpReward: 50,
      platform: 'Brandentifier',
      deliverableFormat: `5 quantified achievement bullets, each with: action verb, specific ${domain} methodology, measurable result (%, $, or #), ${location} context. Format: "Action Verb + [${domain} Method] + [Specific Result with Number] + [Impact in ${location}]"`,
      quantityValue: 5,
      quantityType: "metric-driven achievement statements",
      platformConstraints: `Each bullet MUST include: (1) Strong action verb, (2) ${domain} specific methodology or tool, (3) Quantified result (minimum one number), (4) Business impact or ${location} market context. No vague claims like "improved" or "helped" without metrics.`,
      guidanceSnippet: `Transform process: Find soft claim → Identify what you actually did (${domain} method) → Calculate the metric (%, $, time, count) → Add ${location} or ${industry} context. Example for ${industry}: "Led ${domain} initiative that increased ${location} market share 34% (€2.1M added revenue) by implementing [specific strategy], engaging 89 stakeholders across 12 ${location} institutions."`,
      estimatedTimeMinutes: 25,
      muskTip: `Recruiters spend 7 seconds on resumes - metrics are the only thing they remember. Each of your 5 bullets needs minimum ONE number, preferably three: magnitude (34%), scale (2.1M), or comparison (2x faster). For ${industry} in ${location}, emphasize local market impact. Replace "Managed team" with "Led 12-person ${domain} team generating €890K quarterly revenue". Replace "Improved processes" with "Reduced ${location} client onboarding 67% (14 days to 4.6 days) using [specific ${domain} methodology]". If you can't find metrics, you're not trying hard enough - everything has a number.`,
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  /**
   * Generate fully detailed learning quest
   */
  private async generateLearningQuest(userProfile: any, brandGoals: string[]): Promise<DetailedPersonalizedQuest> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    
    return {
      type: 'learning',
      title: `Research ${location} ${industry} Trends: 3-Source Competitive Analysis`,
      description: `Conduct competitive intelligence research on emerging ${industry} trends specifically impacting the ${location} market. Analyze 3 recent sources and synthesize insights for ${domain} professionals.`,
      targetAction: 'trend_research',
      xpReward: 40,
      platform: 'Brandentifier',
      deliverableFormat: `1 research summary (600-800 words) with 3 trend analyses, each citing a different ${location}-specific source. Include: 2 comparison charts (${location} vs broader market), 1 implications framework for ${domain} professionals, 1 actionable recommendations list.`,
      quantityValue: 3,
      quantityType: "${location} industry sources with analysis",
      platformConstraints: `Sources must be: (1) Published within last 3 months, (2) ${location} or ${industry}-specific, (3) From credible publications (industry journals, ${location} business news, research firms). Include 3 visuals: trend comparison chart, ${location} market breakdown, your strategic framework.`,
      guidanceSnippet: `Research structure: (1) Trend Overview (what's changing in ${location} ${industry}) → (2) Source #1 Analysis (key finding + your ${domain} interpretation) → (3) Source #2 Analysis (contrasting viewpoint) → (4) Source #3 Analysis (${location} specific data) → (5) Synthesized Implications (3 takeaways for ${domain} professionals) → (6) Your Prediction (what ${location} market will do next). Create 3 visuals to illustrate trends.`,
      estimatedTimeMinutes: 30,
      muskTip: `Generic trend reports are noise. Make yours specific to ${location} by finding local data: ${location} business journals, regional industry associations, local university research. Your 3 sources should show different angles: (1) What's happening globally in ${industry}, (2) How ${location} market differs, (3) What ${domain} experts predict next. In your implications section, be SPECIFIC: "For ${location} ${domain} professionals, this means investing in [X skill] by Q2 2026 to maintain competitive advantage." Include your contrarian take if data supports it.`,
      category: 'career',
      difficultyLevel: 'intermediate'
    };
  }
  
  /**
   * Generate AI-personalized career quests for a user
   */
  async generateDetailedCareerQuests(userId: number, count: number = 2): Promise<DetailedPersonalizedQuest[]> {
    try {
      // Get user profile
      const [userProfile] = await db.select().from(users).where(eq(users.id, userId));
      if (!userProfile) {
        console.log('[ComprehensiveQuestGenerator] User not found');
        return [];
      }
      
      // Get user's brand goals
      const [userBrandGoals] = await db.select().from(brandGoals).where(eq(brandGoals.userId, userId));
      const selectedGoals = userBrandGoals?.selectedGoals || [];
      
      // Generate different quest types
      const quests: DetailedPersonalizedQuest[] = [];
      
      // Generate one of each type, then select based on count
      const [pulseQuest, portfolioQuest, resumeQuest, learningQuest] = await Promise.all([
        this.generatePulseCreationQuest(userProfile, selectedGoals),
        this.generatePortfolioQuest(userProfile, selectedGoals),
        this.generateResumeQuest(userProfile, selectedGoals),
        this.generateLearningQuest(userProfile, selectedGoals)
      ]);
      
      // Priority order based on brand goals
      if (selectedGoals.includes('professional_1')) {
        // Authority building - prioritize portfolio and pulse
        quests.push(portfolioQuest, pulseQuest, resumeQuest, learningQuest);
      } else if (selectedGoals.some(g => g.startsWith('visibility_'))) {
        // Visibility - prioritize pulse and learning
        quests.push(pulseQuest, learningQuest, portfolioQuest, resumeQuest);
      } else {
        // Default priority
        quests.push(pulseQuest, resumeQuest, learningQuest, portfolioQuest);
      }
      
      console.log(`[ComprehensiveQuestGenerator] Generated ${quests.length} detailed career quests for user ${userId}`);
      return quests.slice(0, count);
      
    } catch (error) {
      console.error('[ComprehensiveQuestGenerator] Error:', error);
      return [];
    }
  }
}

export const comprehensiveQuestGenerator = new ComprehensiveQuestGenerator();
