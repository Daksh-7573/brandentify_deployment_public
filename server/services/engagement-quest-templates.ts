/**
 * Engagement Quest Templates for Brandentifier Platform
 * 
 * These quests encourage users to engage with the Brandentifier community
 * through reactions, comments, shares, and discussions.
 */

export interface EngagementQuestTemplate {
  title: string;
  description: string;
  targetAction: string;
  targetCount: number;
  xpReward: number;
  estimatedTimeMinutes: number;
  muskTip: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const engagementQuestTemplates: EngagementQuestTemplate[] = [
  
  // PULSE REACTION QUESTS (Insightful/Misinformed)
  {
    title: "React to Pulses in Your Industry",
    description: "Engage with 3 pulses from professionals in your industry by marking them as 'insightful' or 'misinformed'. Show your expertise by recognizing valuable content.",
    targetAction: "react_to_pulse",
    targetCount: 3,
    xpReward: 20,
    estimatedTimeMinutes: 5,
    muskTip: "Don't just scroll—engage! Your reactions help surface quality content and show you're paying attention. Mark insights as 'insightful' to build credibility.",
    difficultyLevel: 'beginner'
  },
  {
    title: "Curate Quality Content",
    description: "React to 5 pulses today. Mark insightful content to help others discover valuable insights in your industry.",
    targetAction: "react_to_pulse",
    targetCount: 5,
    xpReward: 30,
    estimatedTimeMinutes: 8,
    muskTip: "Quality curation is a skill. Your 'insightful' reactions tell the algorithm what matters. Be the filter your network needs.",
    difficultyLevel: 'beginner'
  },

  // PULSE COMMENT QUESTS
  {
    title: "Add Thoughtful Comments",
    description: "Comment on 2 pulses with genuine insights or questions. Build relationships by adding value to conversations happening in your industry.",
    targetAction: "comment_on_pulse",
    targetCount: 2,
    xpReward: 40,
    estimatedTimeMinutes: 10,
    muskTip: "Generic comments are noise. Share a specific insight, ask a smart question, or add missing context. Make every comment count.",
    difficultyLevel: 'intermediate'
  },
  {
    title: "Start Meaningful Discussions",
    description: "Leave 3 thoughtful comments on pulses from your network. Share your perspective, ask questions, or provide additional insights to drive engagement.",
    targetAction: "comment_on_pulse",
    targetCount: 3,
    xpReward: 50,
    estimatedTimeMinutes: 15,
    muskTip: "Best comments: (1) Add new info, (2) Challenge respectfully, or (3) Ask 'why'. Avoid 'Great post!' and 'Thanks for sharing!'",
    difficultyLevel: 'intermediate'
  },
  {
    title: "Be the Conversation Starter",
    description: "Post 5 substantive comments that add value to ongoing discussions. Help build a vibrant professional community through quality engagement.",
    targetAction: "comment_on_pulse",
    targetCount: 5,
    xpReward: 70,
    estimatedTimeMinutes: 20,
    muskTip: "The best networkers don't just consume—they contribute. Your comments are your calling card. Make them memorable.",
    difficultyLevel: 'advanced'
  },

  // POLL PARTICIPATION QUESTS
  {
    title: "Vote on Industry Polls",
    description: "Participate in 2 polls from professionals in your network. Share your opinion and see how your views compare to the community.",
    targetAction: "vote_on_poll",
    targetCount: 2,
    xpReward: 15,
    estimatedTimeMinutes: 3,
    muskTip: "Polls are quick engagement wins. Vote, then comment with 'why' for bonus visibility. Your opinion matters.",
    difficultyLevel: 'beginner'
  },
  {
    title: "Community Voice",
    description: "Cast your vote on 4 industry polls. Help shape community insights by participating in key discussions and trends.",
    targetAction: "vote_on_poll",
    targetCount: 4,
    xpReward: 25,
    estimatedTimeMinutes: 5,
    muskTip: "After voting, leave a comment explaining your choice. Turns a 2-second action into a visibility moment.",
    difficultyLevel: 'beginner'
  },

  // PULSE SHARE QUESTS
  {
    title: "Amplify Valuable Content",
    description: "Share 1 valuable pulse with your network. Curate and distribute insights that will benefit your connections.",
    targetAction: "share_pulse",
    targetCount: 1,
    xpReward: 25,
    estimatedTimeMinutes: 3,
    muskTip: "Sharing is curation. Only share what you'd stake your reputation on. Add context when you share—tell them why it matters.",
    difficultyLevel: 'beginner'
  },
  {
    title: "Be a Content Curator",
    description: "Share 3 high-quality pulses with your network. Position yourself as a trusted source by sharing valuable industry insights.",
    targetAction: "share_pulse",
    targetCount: 3,
    xpReward: 45,
    estimatedTimeMinutes: 8,
    muskTip: "Content curation builds authority. Share with commentary: 'This matters because...' or 'Key takeaway for our industry...'",
    difficultyLevel: 'intermediate'
  },

  // MIXED ENGAGEMENT QUESTS
  {
    title: "Be Active in the Community",
    description: "Complete 5 engagement actions: any combination of reactions, comments, votes, or shares. Show you're an active community member.",
    targetAction: "any_engagement",
    targetCount: 5,
    xpReward: 40,
    estimatedTimeMinutes: 10,
    muskTip: "Consistency beats intensity. 10 minutes of daily engagement > 1 hour once a week. Show up, add value, repeat.",
    difficultyLevel: 'beginner'
  },
  {
    title: "Master Community Engagement",
    description: "Complete 10 engagement actions across the platform. Mix reactions, comments, shares, and poll votes to maximize your community presence.",
    targetAction: "any_engagement",
    targetCount: 10,
    xpReward: 80,
    estimatedTimeMinutes: 20,
    muskTip: "Diversify your engagement. React + comment = 2x visibility. Share + add your take = instant authority. Mix it up.",
    difficultyLevel: 'advanced'
  },

  // INDUSTRY-SPECIFIC ENGAGEMENT
  {
    title: "Connect with Your Industry Peers",
    description: "Engage with 3 pulses from professionals in your specific industry. React, comment, or share content that resonates with your expertise.",
    targetAction: "engage_with_industry",
    targetCount: 3,
    xpReward: 35,
    estimatedTimeMinutes: 10,
    muskTip: "Your industry network is your tribe. Engage deeply, not widely. 3 meaningful interactions > 30 random likes.",
    difficultyLevel: 'intermediate'
  },

  // DAILY ENGAGEMENT HABITS
  {
    title: "Start Your Day with Engagement",
    description: "Make 5 engagement actions first thing today: react to insights, comment with your perspective, or share valuable content.",
    targetAction: "any_engagement",
    targetCount: 5,
    xpReward: 35,
    estimatedTimeMinutes: 10,
    muskTip: "Morning engagement = all-day visibility. The algorithm loves early birds. First to engage? First to be seen.",
    difficultyLevel: 'beginner'
  },

  // QUALITY ENGAGEMENT
  {
    title: "Deep Engagement Challenge",
    description: "Pick 1 pulse and go deep: react, comment with a thoughtful response (50+ words), then share with your own commentary.",
    targetAction: "deep_engage_single_pulse",
    targetCount: 1,
    xpReward: 60,
    estimatedTimeMinutes: 15,
    muskTip: "Depth > breadth. One meaningful interaction can start a relationship. One generic comment gets lost in noise. Choose depth.",
    difficultyLevel: 'advanced'
  }
];

/**
 * Get engagement quests filtered by difficulty level
 */
export function getEngagementQuestsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): EngagementQuestTemplate[] {
  return engagementQuestTemplates.filter(quest => quest.difficultyLevel === difficulty);
}

/**
 * Get a random engagement quest
 */
export function getRandomEngagementQuest(): EngagementQuestTemplate {
  return engagementQuestTemplates[Math.floor(Math.random() * engagementQuestTemplates.length)];
}

/**
 * Get engagement quests by action type
 */
export function getEngagementQuestsByAction(action: string): EngagementQuestTemplate[] {
  return engagementQuestTemplates.filter(quest => quest.targetAction === action);
}

/**
 * Get quick engagement quests (under 10 minutes)
 */
export function getQuickEngagementQuests(): EngagementQuestTemplate[] {
  return engagementQuestTemplates.filter(quest => quest.estimatedTimeMinutes <= 10);
}
