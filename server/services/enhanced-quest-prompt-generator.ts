/**
 * Enhanced Quest Prompt Generator
 * 
 * Generates highly detailed, structured AI prompts for quest generation
 * Ensures consistent quality and detailed quest content across all types
 */

export class EnhancedQuestPromptGenerator {
  /**
   * Generate enhanced prompt for profile update quests
   * Returns structured prompt that ensures detailed output
   */
  static generateProfileUpdatePrompt(
    name: string,
    industry: string,
    domain: string,
    location: string,
    primaryAudience: string,
    brandGoal: string,
    fieldName: string,
    characterLimit: number,
    platformFeature: string,
    isRefinement: boolean = false
  ): string {
    return `You are Musk, a high-performance career architect who pushes professionals to build visible proof of expertise.

Generate a DETAILED, ACTIONABLE quest for ${name} to ${isRefinement ? 'enhance their existing' : 'create their'} "${fieldName.replace(/_/g, ' ')}" profile field.

CONTEXT:
- Industry: ${industry} | Domain: ${domain} | Location: ${location}
- Target Audience: ${primaryAudience}
- Career Goal: ${brandGoal}
- Platform: ${platformFeature}
- Character Limit: ${characterLimit} chars

REQUIREMENTS:
Output ONLY valid JSON with these EXACT fields:

{
  "personalizedTitle": "ACTION VERB + SPECIFIC OUTCOME (5-7 words)",
  "personalizedDescription": "3-4 sentences explaining: (1) What they should write, (2) Why it matters for their goal, (3) Who benefits, (4) Specific success metric",
  "deliverableFormat": "Exact format: e.g., '80-character headline positioning you as a ${domain} expert'",
  "estimatedTime": 15,
  "guidanceSnippet": "Step-by-step instructions (6-8 steps, numbered, action-oriented)",
  "expectedOutcome": "Specific impact: e.g., 'Get noticed by ${primaryAudience} looking for ${domain} expertise'",
  "personalizedMuskTip": "Direct, blunt, motivational quote (1-2 sentences). Must emphasize proof and visibility."
}

Examples of good tips:
- "Stop hiding. ${primaryAudience} need proof you're serious about ${domain}. Write it. Post it. Own it."
- "Your ${fieldName} is your career marketing. Make it undeniable."

CRITICAL: Return ONLY the JSON. No extra text, no explanations.`;
  }

  /**
   * Generate enhanced prompt for pulse creation quests
   */
  static generatePulseCreationPrompt(
    name: string,
    industry: string,
    domain: string,
    location: string,
    primaryAudience: string,
    brandGoal: string,
    platformFeature: string
  ): string {
    return `You are Musk, a visibility strategist obsessed with building proof of expertise.

Generate a DETAILED, INSPIRING quest for ${name} to create a Brandentify pulse that proves their ${domain} expertise.

CONTEXT:
- Industry: ${industry} | Domain: ${domain} | Location: ${location}
- Audience: ${primaryAudience}
- Goal: ${brandGoal}
- Platform: ${platformFeature}

REQUIREMENTS:
Output ONLY valid JSON:

{
  "personalizedTitle": "ACTION VERB + SPECIFIC OUTCOME (5-7 words)",
  "personalizedDescription": "4-5 sentences: (1) What success story to share, (2) Why it proves expertise, (3) Format & length, (4) Who should see it, (5) Expected impact",
  "deliverableFormat": "Exact format: '1 pulse post (400-600 words) + 3 high-quality images on Brandentify Industry Pulse'",
  "estimatedTime": 40,
  "guidanceSnippet": "7-9 step-by-step guide: research → outline → write → add images → optimize → review → publish",
  "expectedOutcome": "Specific result: e.g., 'Establish ${location} ${domain} expertise in eyes of ${primaryAudience}'",
  "personalizedMuskTip": "Blunt and direct. Emphasize: metrics, results, proof, not theory."
}

Good tips:
- "${primaryAudience} don't care about theory. Show them results. Lead with your biggest metric."
- "Post your wins. Make them impossible to ignore."

CRITICAL: Return ONLY valid JSON. No extra text.`;
  }

  /**
   * Generate enhanced prompt for portfolio quests
   */
  static generatePortfolioPrompt(
    name: string,
    domain: string,
    location: string,
    primaryAudience: string,
    brandGoal: string
  ): string {
    return `You are Musk, obsessed with building visible proof of capability.

Generate a DETAILED, SPECIFIC quest for ${name} to add a portfolio project that demonstrates real ${domain} expertise.

CONTEXT:
- Domain: ${domain} | Location: ${location}
- Audience: ${primaryAudience}
- Goal: ${brandGoal}

REQUIREMENTS:
Output ONLY valid JSON:

{
  "personalizedTitle": "VERB + SPECIFIC PROJECT TYPE (5-7 words)",
  "personalizedDescription": "4-5 sentences: (1) What project to add, (2) Why it matters, (3) What to include, (4) Format details, (5) How it supports their goal",
  "deliverableFormat": "'1 portfolio project: title + 300-500 word description + 3-5 images + tech stack + measurable results'",
  "estimatedTime": 45,
  "guidanceSnippet": "8-10 steps: select project → outline → write description → gather images → list technologies → document results → add testimonial → optimize → review → publish",
  "expectedOutcome": "Specific outcome: e.g., 'Prove to ${primaryAudience} you can execute high-impact ${domain} projects'",
  "personalizedMuskTip": "Emphasize execution, results, scale, not theory."
}

Good tips:
- "Real projects with real results. That's what ${primaryAudience} hire for."
- "Add the project that shows your best work. The one that changed everything."

CRITICAL: Return ONLY valid JSON. No extra text.`;
  }

  /**
   * Generate enhanced prompt for social media quests
   */
  static generateSocialMediaPrompt(
    name: string,
    platform: string,
    industry: string,
    domain: string,
    primaryAudience: string,
    brandGoal: string,
    platformGuidelines: string
  ): string {
    return `You are Musk, a content strategist who builds authority on external platforms.

Generate a DETAILED quest for ${name} to create and share ${platform} content that establishes ${domain} expertise.

CONTEXT:
- Platform: ${platform}
- Industry: ${industry} | Domain: ${domain}
- Audience: ${primaryAudience}
- Goal: ${brandGoal}
- Guidelines: ${platformGuidelines}

REQUIREMENTS:
Output ONLY valid JSON:

{
  "personalizedTitle": "VERB + SPECIFIC CONTENT TYPE (5-7 words)",
  "personalizedDescription": "4-5 sentences: (1) Content to create, (2) Why on ${platform}, (3) Format & length, (4) Hooks to use, (5) Expected reach",
  "deliverableFormat": "Exact format for ${platform}: content specs (length, media, style)",
  "estimatedTime": 25,
  "guidanceSnippet": "6-8 ${platform}-specific steps: research topic → write headline → draft content → optimize for algorithm → add media → schedule/post → monitor engagement",
  "expectedOutcome": "Specific outcome: e.g., 'Gain credibility with ${primaryAudience} on ${platform}'",
  "personalizedMuskTip": "Platform-specific motivation. Emphasize: virality, reach, authority, not vanity metrics."
}

CRITICAL: Return ONLY valid JSON. No extra text.`;
  }

  /**
   * Generate fallback quest when AI fails
   * Creates detailed, high-quality content deterministically
   */
  static generateDetailedFallbackQuest(questType: string, context: any): Record<string, any> {
    const { name = 'Professional', domain = 'Your Field', primaryAudience = 'Your Target Audience' } = context;

    const fallbacks: Record<string, Record<string, any>> = {
      profile_update: {
        personalizedTitle: `Craft Your Professional Positioning`,
        personalizedDescription: `Write a compelling 150-character statement that defines what you do and who you help. This is your elevator pitch—the moment to explain your unique value as a ${domain} professional. Focus on the specific problem you solve for ${primaryAudience}. Be specific, be bold, be memorable. This statement will appear on your profile and shape how people perceive your expertise.`,
        deliverableFormat: `150-character positioning statement for your profile`,
        estimatedTime: 15,
        guidanceSnippet: `1. Define your core expertise in ${domain}
2. Identify the primary problem you solve
3. Name your ideal audience: ${primaryAudience}
4. Draft 2-3 versions focusing on benefit, not features
5. Get feedback from trusted colleagues
6. Polish for clarity and impact
7. Add to your profile today`,
        expectedOutcome: `Get noticed by ${primaryAudience} who recognize your ${domain} expertise`,
        personalizedMuskTip: `Stop being generic. ${primaryAudience} skip the vague ones. Tell them exactly what you do and why they should care. Make them see your value instantly.`
      },
      pulse_creation: {
        personalizedTitle: `Share Your ${domain} Success Story`,
        personalizedDescription: `Create a detailed pulse post on Brandentify that showcases a real ${domain} achievement. Share the challenge you faced, your strategic approach, measurable results, and key lessons learned. Make it specific, data-driven, and valuable to ${primaryAudience}. This post positions you as a knowledgeable authority in your field.`,
        deliverableFormat: `1 pulse post (500-700 words) + 3 professional images`,
        estimatedTime: 40,
        guidanceSnippet: `1. Choose your best ${domain} project or achievement
2. Outline the challenge, approach, results, learnings
3. Write with specific metrics and concrete details
4. Find or create 3 supporting images
5. Format with clear headings and bullet points
6. Optimize title for clarity and impact
7. Publish and track engagement`,
        expectedOutcome: `Establish credibility as a ${domain} expert to ${primaryAudience}`,
        personalizedMuskTip: `Real results beat theory every single time. Lead with numbers. Show what you actually achieved. Make it impossible for ${primaryAudience} to ignore.`
      },
      portfolio: {
        personalizedTitle: `Showcase Your Best ${domain} Project`,
        personalizedDescription: `Add a portfolio project that demonstrates your expertise and execution capability. Choose a project you're proud of, document the challenge and solution thoroughly, include high-quality images, and highlight measurable results. This is your proof of work.`,
        deliverableFormat: `1 portfolio entry: title + 400-word description + 4 images + tech stack + outcomes`,
        estimatedTime: 50,
        guidanceSnippet: `1. Select your most impactful ${domain} project
2. Document the business challenge clearly
3. Explain your solution and methodology
4. Gather high-quality project images
5. List all tools and technologies used
6. Calculate and include measurable results
7. Write a compelling project description
8. Add to your portfolio with full context`,
        expectedOutcome: `Prove to ${primaryAudience} that you can execute complex ${domain} projects`,
        personalizedMuskTip: `Your best work speaks for itself. Make sure ${primaryAudience} can see exactly what you did, how you did it, and what happened as a result.`
      },
      social_post: {
        personalizedTitle: `Build Authority on Your Preferred Platform`,
        personalizedDescription: `Create strategic content on a social platform where your audience is active. Share insights, lessons, or proven strategies from your ${domain} experience. Make it valuable, make it specific, make it worth someone's time to stop and read.`,
        deliverableFormat: `1 strategic social post with optimal format for your platform`,
        estimatedTime: 30,
        guidanceSnippet: `1. Identify where ${primaryAudience} spends time
2. Choose a valuable insight from your ${domain} expertise
3. Craft a compelling hook in the first line
4. Write the full post with clear takeaways
5. Add relevant media or visuals
6. Use platform-specific formatting and hashtags
7. Post at optimal engagement time
8. Respond to comments and engage`,
        expectedOutcome: `Gain visibility and authority with ${primaryAudience} on social media`,
        personalizedMuskTip: `Attention is currency. Grab it in the first sentence. Give them something they didn't know. Make them think, "I need to know this person."`
      }
    };

    return fallbacks[questType] || fallbacks['profile_update'];
  }
}

export const enhancedQuestPromptGenerator = EnhancedQuestPromptGenerator;
