/**
 * Deterministic Fallback Generator
 * 
 * Generates quest content without AI, purely rule-based.
 * This ensures system never crashes due to AI provider failures.
 * 
 * Key Principles:
 * - NO dependencies on external APIs
 * - ALWAYS available (no network calls)
 * - RETURNS valid structured data
 * - Ensures scheduler continues functioning
 */

import { db, sql } from '../db';
import { questDefinitions } from '@shared/schema';

interface FallbackQuestResult {
  personalizedTitle: string;
  personalizedDescription: string;
  personalizedMuskTip: string;
  deliverableFormat: string;
  quantityValue: number;
  quantityType: string;
  platformConstraints: string;
  guidanceSnippet: string;
  estimatedTime: number;
}

interface FallbackSocialQuestResult {
  personalizedTitle: string;
  personalizedDescription: string;
  personalizedMuskTip: string;
  platform: string;
  hashtags: string[];
  contentType: string;
  estimatedTime: number;
}

export class DeterministicFallbackGenerator {
  /**
   * Generate fallback career quest (NO AI required)
   * Pure rule-based generation ensures reliability
   */
  async generateFallbackCareerQuest(questContext: {
    questType: string;
    baseTitle: string;
    baseDescription: string;
    userProfile: {
      name: string;
      title: string;
      industry: string;
      domain: string;
      location: string;
    };
    brandGoal: string;
    primaryAudience: string;
    variables?: any;
  }): Promise<FallbackQuestResult> {
    const { userProfile, questType, baseTitle, baseDescription, brandGoal } = questContext;

    // Estimate time based on quest type
    const timeEstimates: Record<string, number> = {
      'portfolio-project': 120,
      'skill-development': 90,
      'networking': 45,
      'content-creation': 60,
      'certification': 180,
      'personal-branding': 75,
      'experience-gain': 120,
      'mentorship': 60,
    };

    const estimatedTime = timeEstimates[questType] || 60;

    // Generate personalized title by adding location/industry context
    const personalizedTitle = `${baseTitle} - For ${userProfile.title}s in ${userProfile.location}`;

    // Expand base description with specific context
    const personalizedDescription = `
${baseDescription}

SPECIFIC GUIDANCE FOR YOUR PROFILE:
- Your role as ${userProfile.title} in ${userProfile.location}
- Industry context: ${userProfile.industry}
- Brand goal alignment: ${brandGoal}

DELIVERABLES:
1. Complete the main objective specific to your situation
2. Document progress with metrics and evidence
3. Share results with your audience (${userProfile.location} professionals in ${userProfile.industry})

TIMELINE: Approximately ${estimatedTime} minutes over the next 7 days
    `.trim();

    // Musk-style tip: Direct, action-focused
    const personalizedMuskTip =
      `Your ${userProfile.title} background in ${userProfile.location} gives you unique context others don't have. ` +
      `Use that. Don't just follow the generic path—add your perspective. ` +
      `Results > excuses. Ship something this week.`;

    // Format based on quest type
    const formats: Record<string, string> = {
      'portfolio-project': '1 complete project with GitHub repo, live demo, and 200+ word writeup',
      'skill-development': 'Certificate of completion + 3 practical examples applying new skill',
      'networking': '5 meaningful connection requests with personalized messages + responses',
      'content-creation': '3 posts across primary platform with metrics tracking and audience feedback',
      'certification': 'Certification document + implementation plan for certified skill',
      'personal-branding': '1 updated LinkedIn profile + 1 article or case study shared publicly',
      'experience-gain': '1 completed project/task + writeup about what you learned',
      'mentorship': '1 mentoring session completed + reflection document on key insights',
    };

    const deliverableFormat = formats[questType] || 'Complete the specified deliverable and document results';

    // Platform constraints (best practices)
    const constraints = `Follow industry best practices for ${userProfile.industry}. ` +
      `Make it relevant to ${userProfile.location} market. ` +
      `Ensure quality over quantity. ` +
      `Include metrics where possible.`;

    // Step-by-step guidance
    const guidanceSnippet = `
STEP 1: Understand the objective (5 min)
- Read the complete quest description
- Identify how it aligns with ${brandGoal}

STEP 2: Plan your approach (10 min)
- Break down into smaller tasks
- List resources you'll need
- Set a realistic deadline

STEP 3: Execute (${estimatedTime - 30} min)
- Work on the main deliverable
- Document progress as you go
- Keep track of metrics

STEP 4: Review & Polish (10 min)
- Ensure quality standards met
- Add final touches
- Prepare to share with audience

STEP 5: Share & Gather Feedback (5 min)
- Share with primary audience (${userProfile.location} ${userProfile.industry} professionals)
- Collect feedback for improvement

STEP 6: Document Learning (5 min)
- Write brief reflection on key takeaways
- Plan how to apply learnings next
    `.trim();

    return {
      personalizedTitle,
      personalizedDescription,
      personalizedMuskTip,
      deliverableFormat,
      quantityValue: 1,
      quantityType: 'complete deliverable',
      platformConstraints: constraints,
      guidanceSnippet,
      estimatedTime,
    };
  }

  /**
   * Generate fallback social quest (NO AI required)
   * Simple, rule-based generation
   */
  async generateFallbackSocialQuest(
    userId: number,
    questDefinitionId: number,
    platform: string,
    userProfile?: any
  ): Promise<FallbackSocialQuestResult> {
    // Fetch quest definition for base content
    const [questDef] = await db
      .select()
      .from(questDefinitions)
      .where(sql`id = ${questDefinitionId}`)
      .limit(1)
      .catch(() => [null]);

    const baseTitle = questDef?.title || 'Social Media Quest';
    const baseDescription = questDef?.description || 'Create engaging content and build your social presence';

    // Platform-specific guidance
    const platformGuides: Record<string, {
      contentType: string;
      constraints: string;
      timeEst: number;
      hashtags: string[];
    }> = {
      LinkedIn: {
        contentType: 'Professional article or detailed post',
        constraints: '500+ words if article, 150+ if post, professional tone',
        timeEst: 45,
        hashtags: ['#CareerGrowth', '#Leadership', '#ProfessionalDevelopment', '#Industry', '#Networking'],
      },
      Twitter: {
        contentType: 'Thread (5-10 tweets) or extended post',
        constraints: 'Engaging, concise, relevant to audience',
        timeEst: 30,
        hashtags: ['#Industry', '#Insight', '#Trending', '#Thought Leadership', '#Professional'],
      },
      Instagram: {
        contentType: '3 high-quality carousel posts or 1 Reel',
        constraints: 'Visual-first, professional aesthetic, grid-friendly',
        timeEst: 60,
        hashtags: ['#Professional', '#Branding', '#Career', '#Industry', '#Growth'],
      },
      YouTube: {
        contentType: 'Short video (under 5 mins)',
        constraints: 'Clear audio, good lighting, engaging thumbnail',
        timeEst: 90,
        hashtags: ['#Video', '#Industry', '#Learning', '#Professional', '#Career'],
      },
      Medium: {
        contentType: 'Published article (1000+ words)',
        constraints: 'Well-researched, structured, actionable insights',
        timeEst: 120,
        hashtags: ['#Writing', '#Industry', '#Learning', '#Career', '#Insight'],
      },
      TikTok: {
        contentType: '2-3 short videos (under 60 seconds each)',
        constraints: 'Trending audio, authentic, engaging hook',
        timeEst: 45,
        hashtags: ['#Professional', '#CareerTips', '#Industry', '#Learning', '#Trend'],
      },
    };

    const guide = platformGuides[platform] || platformGuides['LinkedIn'];

    const title = `${baseTitle} on ${platform}`;
    const description = `
${baseDescription}

PLATFORM: ${platform}
CONTENT TYPE: ${guide.contentType}

REQUIREMENTS:
${guide.constraints}

TIMEFRAME: Approximately ${guide.timeEst} minutes
DEADLINE: 7 days

Create content that aligns with your professional brand and provides value to your audience. Think about what your connections want to learn or see from you.
    `.trim();

    const muskTip =
      `Show, don't tell. On ${platform}, authenticity wins. ` +
      `Share what you actually know, not generic advice. ` +
      `Be specific. Specificity gets engagement.`;

    return {
      personalizedTitle: title,
      personalizedDescription: description,
      personalizedMuskTip: muskTip,
      platform,
      hashtags: guide.hashtags,
      contentType: guide.contentType,
      estimatedTime: guide.timeEst,
    };
  }

  /**
   * Generate fallback news/pulse content
   * For Musk Pulse generation when AI is unavailable
   */
  generateFallbackPulseContent(context: {
    industry: string;
    role: string;
    location: string;
    recentNews?: string;
  }): string {
    const { industry, role, location } = context;

    return `
INDUSTRY PULSE: ${industry}

Dear ${role} in ${location},

This week's focus areas for your professional development:

1. SKILL DEVELOPMENT
   Current market demand in ${location}: Advanced skills in ${industry} leaders are prioritizing
   Action: Dedicate 5 hours this week to skill advancement in your specialization

2. NETWORKING OPPORTUNITY
   Growth area: Connecting with peers in ${location} ${industry} community
   Action: Reach out to 3 professionals this week and schedule quick chats

3. CONTENT IDEA
   What's working: Stories about real implementations, challenges overcome
   Action: Share one insight from your recent work or learning

4. MARKET TREND
   Watch: Major announcements and shifts in ${industry}
   Action: Review industry news this week and identify implications for your role

5. YOUR ACTION ITEMS
   This week: One skill improvement, one connection, one content piece
   This month: Build momentum on your professional brand in ${location}

Remember: Consistent small actions compound into significant career growth.

---
To maximize this pulse, focus on what differentiates YOU in your market.
    `.trim();
  }
}

export const deterministicFallbackGenerator = new DeterministicFallbackGenerator();
