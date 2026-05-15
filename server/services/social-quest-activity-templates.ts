/**
 * Social Quest Activity Templates
 * Comprehensive quest templates for all platforms and activity types
 * NO BRANDENTIFY - External platforms only
 */

export interface QuestActivityTemplate {
  id: string;
  platform: string;
  category: 'profile' | 'content' | 'engagement' | 'networking' | 'community';
  activityType: string;
  title: string;
  description: string;
  muskTip: string;
  xpReward: number;
  estimatedMinutes: number;
  canRepeat: boolean; // Can this quest be generated multiple times?
  repeatCondition?: string; // When can it be repeated?
  requiredFields?: string[]; // Required user profile fields
}

export const SOCIAL_QUEST_TEMPLATES: QuestActivityTemplate[] = [
  // ===== LINKEDIN PROFILE BUILDING =====
  {
    id: 'linkedin_add_skills',
    platform: 'linkedin',
    category: 'profile',
    activityType: 'add_skills',
    title: 'Add {skill_count} LinkedIn Skills in {industry}',
    description: 'Add {skill_count} industry-relevant skills to your LinkedIn profile with proficiency levels',
    muskTip: 'Skills are your SEO. Add specific, searchable skills that recruiters actually search for in {industry}.',
    xpReward: 40,
    estimatedMinutes: 10,
    canRepeat: false, // Only once per goal
    repeatCondition: 'when_goals_change',
    requiredFields: ['industry', 'domain']
  },
  {
    id: 'linkedin_update_headline',
    platform: 'linkedin',
    category: 'profile',
    activityType: 'update_headline',
    title: 'Optimize LinkedIn Headline for {target_role}',
    description: 'Update your LinkedIn headline to clearly communicate your unique value proposition for {target_role}',
    muskTip: 'Your headline is prime real estate. Use all 220 characters. Include keywords + results + unique angle.',
    xpReward: 60,
    estimatedMinutes: 15,
    canRepeat: false,
    repeatCondition: 'when_goals_change'
  },
  {
    id: 'linkedin_about_section',
    platform: 'linkedin',
    category: 'profile',
    activityType: 'update_about',
    title: 'Write Compelling LinkedIn About Section',
    description: 'Craft a powerful About section highlighting your {unique_expertise} and {competitive_advantage}',
    muskTip: 'Tell your story in first person. Problem → Solution → Proof → CTA. Make it scannable with line breaks.',
    xpReward: 80,
    estimatedMinutes: 25,
    canRepeat: false,
    repeatCondition: 'when_goals_change'
  },

  // ===== LINKEDIN CONTENT =====
  {
    id: 'linkedin_thought_leadership',
    platform: 'linkedin',
    category: 'content',
    activityType: 'post_article',
    title: 'Share {industry} Thought Leadership Post',
    description: 'Create a LinkedIn post sharing unique insights about {content_theme} in {industry}',
    muskTip: 'Hook in first line. One insight per post. Use line breaks. End with a question to drive engagement.',
    xpReward: 70,
    estimatedMinutes: 20,
    canRepeat: true
  },
  {
    id: 'linkedin_carousel',
    platform: 'linkedin',
    category: 'content',
    activityType: 'post_carousel',
    title: 'Create {industry} Educational Carousel',
    description: 'Design a 5-10 slide carousel teaching {target_audience} about {content_theme}',
    muskTip: 'Slide 1 = Hook. Slides 2-9 = Value bombs. Slide 10 = CTA. Keep text minimal, visuals strong.',
    xpReward: 90,
    estimatedMinutes: 35,
    canRepeat: true
  },
  {
    id: 'linkedin_achievement_post',
    platform: 'linkedin',
    category: 'content',
    activityType: 'share_achievement',
    title: 'Share Professional Achievement',
    description: 'Post about a recent achievement or milestone in {domain}, highlighting lessons learned',
    muskTip: 'Wins without lessons = bragging. Share what you learned, not just what you achieved. Be vulnerable.',
    xpReward: 60,
    estimatedMinutes: 15,
    canRepeat: true
  },

  // ===== LINKEDIN ENGAGEMENT =====
  {
    id: 'linkedin_comment_strategy',
    platform: 'linkedin',
    category: 'engagement',
    activityType: 'strategic_comments',
    title: 'Leave 5 Expert Comments in {industry}',
    description: 'Engage with 5 posts from {target_audience} with insightful, value-adding comments',
    muskTip: 'Generic praise is noise. Share specific insights: "In my experience with X, I found Y works better because Z."',
    xpReward: 50,
    estimatedMinutes: 15,
    canRepeat: true
  },

  // ===== LINKEDIN NETWORKING =====
  {
    id: 'linkedin_connect_strategy',
    platform: 'linkedin',
    category: 'networking',
    activityType: 'targeted_connections',
    title: 'Connect with 10 {target_audience} Professionals',
    description: 'Send personalized connection requests to 10 {target_audience} in {industry}',
    muskTip: 'Personalize every request. Mention specific common ground. No generic "I'd like to add you to my network."',
    xpReward: 40,
    estimatedMinutes: 20,
    canRepeat: true
  },

  // ===== TWITTER/X PROFILE =====
  {
    id: 'twitter_bio_optimization',
    platform: 'twitter',
    category: 'profile',
    activityType: 'update_bio',
    title: 'Optimize Twitter Bio for {domain}',
    description: 'Update your Twitter bio to clearly communicate what you do and who you help in {domain}',
    muskTip: 'Twitter bio = elevator pitch in 160 chars. What you do + Who for + Proof/Result. Add personality.',
    xpReward: 50,
    estimatedMinutes: 10,
    canRepeat: false,
    repeatCondition: 'when_goals_change'
  },

  // ===== TWITTER/X CONTENT =====
  {
    id: 'twitter_expertise_thread',
    platform: 'twitter',
    category: 'content',
    activityType: 'post_thread',
    title: 'Share {domain} Expertise Thread',
    description: 'Create a Twitter thread sharing your {signature_methodology} or insights about {content_theme}',
    muskTip: 'Tweet 1 = Hook with promise. Tweets 2-9 = Numbered value. Tweet 10 = Summary + CTA. Thread = micro-course.',
    xpReward: 80,
    estimatedMinutes: 25,
    canRepeat: true
  },
  {
    id: 'twitter_hot_take',
    platform: 'twitter',
    category: 'content',
    activityType: 'post_opinion',
    title: 'Share Contrarian {industry} Take',
    description: 'Post a well-reasoned contrarian opinion about a trend in {industry}',
    muskTip: 'Controversy drives engagement, but back it with logic. "Unpopular opinion:" + data + personal experience.',
    xpReward: 60,
    estimatedMinutes: 12,
    canRepeat: true
  },

  // ===== INSTAGRAM PROFILE =====
  {
    id: 'instagram_bio_cta',
    platform: 'instagram',
    category: 'profile',
    activityType: 'update_bio',
    title: 'Optimize Instagram Bio with Clear CTA',
    description: 'Update Instagram bio highlighting {unique_expertise} with clear call-to-action',
    muskTip: 'Line 1 = Who you help. Line 2 = How you help. Line 3 = Proof. Line 4 = CTA. Use emojis as bullets.',
    xpReward: 40,
    estimatedMinutes: 10,
    canRepeat: false,
    repeatCondition: 'when_goals_change'
  },

  // ===== INSTAGRAM CONTENT =====
  {
    id: 'instagram_carousel_tutorial',
    platform: 'instagram',
    category: 'content',
    activityType: 'post_carousel',
    title: 'Create {domain} Tutorial Carousel',
    description: 'Design a 10-slide carousel teaching {target_audience} about {content_theme}',
    muskTip: 'Carousel = swipe-worthy value. Slide 1 = Bold hook. Slides 2-9 = Actionable steps. Slide 10 = Save this!',
    xpReward: 85,
    estimatedMinutes: 40,
    canRepeat: true
  },
  {
    id: 'instagram_reel_tips',
    platform: 'instagram',
    category: 'content',
    activityType: 'post_reel',
    title: 'Create {domain} Tips Reel',
    description: 'Film a 30-60s Reel sharing quick wins or tips about {content_theme}',
    muskTip: 'Hook in first 3 seconds. One tip per Reel. Trending audio + on-screen text = viral formula.',
    xpReward: 75,
    estimatedMinutes: 35,
    canRepeat: true
  },

  // ===== REDDIT CONTENT =====
  {
    id: 'reddit_value_post',
    platform: 'reddit',
    category: 'content',
    activityType: 'community_post',
    title: 'Share Expertise in r/{industry} Subreddit',
    description: 'Create a detailed, value-packed post in relevant {industry} subreddit',
    muskTip: 'Reddit hates self-promotion but loves value. Give away your best stuff. Lurk first, contribute second.',
    xpReward: 70,
    estimatedMinutes: 30,
    canRepeat: true
  },
  {
    id: 'reddit_ama_participation',
    platform: 'reddit',
    category: 'engagement',
    activityType: 'answer_questions',
    title: 'Answer 10 Questions in {domain} Communities',
    description: 'Provide detailed, helpful answers to 10 questions in {domain}-related subreddits',
    muskTip: 'Position yourself as helpful expert, not salesperson. Link to resources, share experiences, be genuine.',
    xpReward: 60,
    estimatedMinutes: 25,
    canRepeat: true
  },

  // ===== FACEBOOK CONTENT =====
  {
    id: 'facebook_group_value',
    platform: 'facebook',
    category: 'content',
    activityType: 'group_post',
    title: 'Share Insights in {industry} Facebook Groups',
    description: 'Post valuable insights or solutions in 3 relevant {industry} Facebook groups',
    muskTip: 'Groups = trust accelerator. Answer questions thoroughly. Provide frameworks, not pitches.',
    xpReward: 55,
    estimatedMinutes: 20,
    canRepeat: true
  },

  // ===== YOUTUBE CONTENT =====
  {
    id: 'youtube_tutorial_video',
    platform: 'youtube',
    category: 'content',
    activityType: 'post_video',
    title: 'Create {domain} Tutorial Video',
    description: 'Film and upload a tutorial teaching {target_audience} about {content_theme}',
    muskTip: 'Title = searchable keywords. Thumbnail = click magnet. First 30 seconds = hook. Deliver massive value.',
    xpReward: 120,
    estimatedMinutes: 90,
    canRepeat: true
  },

  // ===== MEDIUM CONTENT =====
  {
    id: 'medium_deep_dive',
    platform: 'medium',
    category: 'content',
    activityType: 'write_article',
    title: 'Write {domain} Deep-Dive Article',
    description: 'Publish a comprehensive article (1500+ words) about {content_theme} on Medium',
    muskTip: 'Medium rewards depth. Research → Insights → Examples → Actionable takeaways. Use subheadings, images, lists.',
    xpReward: 100,
    estimatedMinutes: 60,
    canRepeat: true
  },

  // ===== GOOGLE MY BUSINESS =====
  {
    id: 'google_business_profile',
    platform: 'google',
    category: 'profile',
    activityType: 'optimize_profile',
    title: 'Optimize Google Business Profile',
    description: 'Complete and optimize your Google Business Profile with services, photos, and posts',
    muskTip: 'Local SEO goldmine. Complete every field. Add photos weekly. Respond to reviews. Post updates.',
    xpReward: 70,
    estimatedMinutes: 30,
    canRepeat: false,
    repeatCondition: 'quarterly'
  },
  {
    id: 'google_business_post',
    platform: 'google',
    category: 'content',
    activityType: 'create_update',
    title: 'Post Google Business Update',
    description: 'Create a Google Business post highlighting {service} or recent achievement',
    muskTip: 'Google posts expire in 7 days. Post weekly. Use CTAs. Add photos. Drive local visibility.',
    xpReward: 40,
    estimatedMinutes: 10,
    canRepeat: true
  },

  // ===== TIKTOK CONTENT =====
  {
    id: 'tiktok_educational',
    platform: 'tiktok',
    category: 'content',
    activityType: 'post_video',
    title: 'Create {domain} Educational TikTok',
    description: 'Film a 15-60s TikTok teaching one actionable tip about {content_theme}',
    muskTip: 'TikTok = edu-tainment. Hook first 3 seconds. One insight. Trending sounds. On-screen captions mandatory.',
    xpReward: 65,
    estimatedMinutes: 30,
    canRepeat: true
  },

  // ===== PINTEREST CONTENT =====
  {
    id: 'pinterest_pin_series',
    platform: 'pinterest',
    category: 'content',
    activityType: 'create_pins',
    title: 'Create {domain} Pin Series',
    description: 'Design 5 branded pins about {content_theme} optimized for search',
    muskTip: 'Pinterest = visual search engine. Keyword-rich titles/descriptions. Vertical images. Consistent branding.',
    xpReward: 55,
    estimatedMinutes: 35,
    canRepeat: true
  }
];

/**
 * Get templates for a specific platform
 */
export function getTemplatesByPlatform(platform: string): QuestActivityTemplate[] {
  return SOCIAL_QUEST_TEMPLATES.filter(t => t.platform === platform);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): QuestActivityTemplate[] {
  return SOCIAL_QUEST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get profile building templates (non-repeatable, goal-based)
 */
export function getProfileTemplates(): QuestActivityTemplate[] {
  return SOCIAL_QUEST_TEMPLATES.filter(t => t.category === 'profile' && !t.canRepeat);
}

/**
 * Get repeatable content templates
 */
export function getRepeatableTemplates(): QuestActivityTemplate[] {
  return SOCIAL_QUEST_TEMPLATES.filter(t => t.canRepeat);
}

