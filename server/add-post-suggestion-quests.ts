import { db } from './db';
import { questDefinitions } from '@shared/schema';

async function addPostSuggestionQuests() {
  try {
    console.log('Starting: Adding post suggestion quest definitions');

    // Social Media Post Suggestion Quests
    const postSuggestionQuests = [
      {
        title: "LinkedIn Thought Leadership",
        description: "Share an AI-suggested professional insight or industry update on LinkedIn",
        type: "social_post",
        target_count: 1,
        target_action: "post_linkedin_suggestion",
        xp_reward: 60,
        badge_reward: "thought_leader",
        musk_tip: "LinkedIn posts with personal insights get 3x more engagement than generic content. Use industry keywords and add your unique perspective."
      },
      {
        title: "Instagram Professional Story",
        description: "Share an AI-suggested behind-the-scenes or workspace content on Instagram",
        type: "social_post",
        target_count: 1,
        target_action: "post_instagram_suggestion",
        xp_reward: 50,
        badge_reward: null,
        musk_tip: "Visual storytelling on Instagram helps humanize your brand. Show your workspace, tools, or daily professional routine."
      },
      {
        title: "Twitter Industry Insights",
        description: "Share an AI-suggested industry trend or quick professional tip on Twitter",
        type: "social_post",
        target_count: 1,
        target_action: "post_twitter_suggestion",
        xp_reward: 45,
        badge_reward: null,
        musk_tip: "Twitter threads perform 3x better than single tweets. Break complex ideas into digestible parts with relevant hashtags."
      },
      {
        title: "YouTube Knowledge Share",
        description: "Create AI-suggested video content about your expertise or career journey",
        type: "social_post",
        target_count: 1,
        target_action: "post_youtube_suggestion",
        xp_reward: 80,
        badge_reward: "video_creator",
        musk_tip: "YouTube videos with clear thumbnails and industry-specific titles get 10x more views. Keep videos under 5 minutes for better engagement."
      },
      {
        title: "Facebook Professional Network",
        description: "Share AI-suggested career achievements or professional milestones on Facebook",
        type: "social_post",
        target_count: 1,
        target_action: "post_facebook_suggestion",
        xp_reward: 40,
        badge_reward: null,
        musk_tip: "Facebook posts work best when you share personal career wins and lessons learned. Be authentic and relatable."
      },
      {
        title: "TikTok Career Tips",
        description: "Create AI-suggested short-form content about your industry or career advice",
        type: "social_post",
        target_count: 1,
        target_action: "post_tiktok_suggestion",
        xp_reward: 55,
        badge_reward: null,
        musk_tip: "TikTok career content performs best with quick tips, day-in-the-life videos, and industry myth-busting. Use trending sounds."
      },
      {
        title: "Multi-Platform Content Creator",
        description: "Share AI-suggested cross-platform content strategy across 2+ social channels",
        type: "social_post",
        target_count: 2,
        target_action: "post_multi_platform_suggestion",
        xp_reward: 100,
        badge_reward: "social_strategist",
        musk_tip: "Adapt the same core message for different platforms. LinkedIn gets professional insights, Instagram gets visuals, Twitter gets quick takes."
      },
      {
        title: "Industry Hashtag Master",
        description: "Create content using AI-suggested hashtags optimized for your industry and domain",
        type: "social_post",
        target_count: 1,
        target_action: "post_hashtag_optimized_suggestion",
        xp_reward: 35,
        badge_reward: null,
        musk_tip: "Use 3-5 specific hashtags rather than 20 generic ones. Mix popular industry tags with niche domain-specific hashtags."
      },
      {
        title: "Visual Content Creator",
        description: "Share AI-suggested visual content like infographics, charts, or professional photography",
        type: "social_post",
        target_count: 1,
        target_action: "post_visual_content_suggestion",
        xp_reward: 65,
        badge_reward: "visual_storyteller",
        musk_tip: "Visual content gets 40x more shares than text-only posts. Use tools like Canva or share well-designed charts from your work."
      },
      {
        title: "Engagement Catalyst",
        description: "Create AI-suggested content designed to spark professional discussions and comments",
        type: "social_post",
        target_count: 1,
        target_action: "post_engagement_optimized_suggestion",
        xp_reward: 70,
        badge_reward: "community_builder",
        musk_tip: "End posts with questions or controversial (but professional) takes. Comments boost your content in algorithms and build connections."
      }
    ];

    // Insert quests into the database
    for (const quest of postSuggestionQuests) {
      await db.insert(questDefinitions).values({
        title: quest.title,
        description: quest.description,
        type: quest.type as any,
        targetCount: quest.target_count,
        targetAction: quest.target_action,
        xpReward: quest.xp_reward,
        badgeReward: quest.badge_reward as any,
        muskTip: quest.musk_tip
      });
      console.log(`Added post suggestion quest: ${quest.title}`);
    }

    console.log(`Successfully added ${postSuggestionQuests.length} post suggestion quest definitions`);
    return {
      success: true,
      message: `Successfully added ${postSuggestionQuests.length} post suggestion quest definitions`
    };
  } catch (error) {
    console.error('Error while adding post suggestion quests:', error);
    return {
      success: false,
      message: 'Error while adding post suggestion quests',
      error: String(error)
    };
  }
}

// Export the function for external use
export { addPostSuggestionQuests };

// Run the script if called directly
addPostSuggestionQuests()
  .then(result => {
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });