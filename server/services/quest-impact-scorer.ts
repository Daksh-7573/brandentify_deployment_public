/**
 * Quest Impact Scoring System
 * 
 * Assigns predefined impact scores to quest types based on:
 * - Time commitment required
 * - Potential reach and visibility
 * - Professional value
 * - Engagement potential
 * 
 * Impact Levels:
 * - High Impact (80-100): Deep, strategic activities with significant professional value
 * - Medium Impact (40-79): Valuable activities requiring moderate effort
 * - Quick Win (10-39): Fast, tactical activities with immediate results
 */

export interface QuestImpactScore {
  questType: string;
  impactScore: number;
  impactLevel: 'high' | 'medium' | 'quick_win';
  estimatedMinutes: number;
  description: string;
}

export class QuestImpactScorer {
  
  /**
   * Predefined impact scores for different quest types
   */
  private readonly QUEST_IMPACT_SCORES: Record<string, QuestImpactScore> = {
    // HIGH IMPACT QUESTS (80-100 points)
    'case_study_post': {
      questType: 'case_study_post',
      impactScore: 95,
      impactLevel: 'high',
      estimatedMinutes: 30,
      description: 'Create detailed case study with metrics and insights'
    },
    'thought_leadership_article': {
      questType: 'thought_leadership_article',
      impactScore: 90,
      impactLevel: 'high',
      estimatedMinutes: 45,
      description: 'Write comprehensive article on industry trends'
    },
    'portfolio_project_upload': {
      questType: 'portfolio_project_upload',
      impactScore: 88,
      impactLevel: 'high',
      estimatedMinutes: 25,
      description: 'Upload complete project with visuals and results'
    },
    'client_testimonial_post': {
      questType: 'client_testimonial_post',
      impactScore: 85,
      impactLevel: 'high',
      estimatedMinutes: 20,
      description: 'Share client success story with measurable outcomes'
    },
    'linkedin_article': {
      questType: 'linkedin_article',
      impactScore: 82,
      impactLevel: 'high',
      estimatedMinutes: 40,
      description: 'Publish long-form LinkedIn article'
    },
    
    // MEDIUM IMPACT QUESTS (40-79 points)
    'industry_pulse_post': {
      questType: 'industry_pulse_post',
      impactScore: 75,
      impactLevel: 'medium',
      estimatedMinutes: 15,
      description: 'Share industry insight on Brandentify'
    },
    'linkedin_carousel': {
      questType: 'linkedin_carousel',
      impactScore: 70,
      impactLevel: 'medium',
      estimatedMinutes: 25,
      description: 'Create educational carousel post'
    },
    'skill_showcase_post': {
      questType: 'skill_showcase_post',
      impactScore: 68,
      impactLevel: 'medium',
      estimatedMinutes: 18,
      description: 'Demonstrate specific skill with example'
    },
    'twitter_thread': {
      questType: 'twitter_thread',
      impactScore: 65,
      impactLevel: 'medium',
      estimatedMinutes: 20,
      description: 'Create insightful Twitter/X thread'
    },
    'instagram_reel': {
      questType: 'instagram_reel',
      impactScore: 62,
      impactLevel: 'medium',
      estimatedMinutes: 30,
      description: 'Create short-form video content'
    },
    'linkedin_post_with_visuals': {
      questType: 'linkedin_post_with_visuals',
      impactScore: 60,
      impactLevel: 'medium',
      estimatedMinutes: 15,
      description: 'LinkedIn post with custom graphics'
    },
    'profile_completion': {
      questType: 'profile_completion',
      impactScore: 58,
      impactLevel: 'medium',
      estimatedMinutes: 12,
      description: 'Complete missing profile sections'
    },
    'industry_poll': {
      questType: 'industry_poll',
      impactScore: 55,
      impactLevel: 'medium',
      estimatedMinutes: 10,
      description: 'Create engaging industry poll'
    },
    'youtube_short': {
      questType: 'youtube_short',
      impactScore: 52,
      impactLevel: 'medium',
      estimatedMinutes: 35,
      description: 'Create YouTube short video'
    },
    'linkedin_video_post': {
      questType: 'linkedin_video_post',
      impactScore: 50,
      impactLevel: 'medium',
      estimatedMinutes: 28,
      description: 'Record and post native LinkedIn video'
    },
    'instagram_carousel': {
      questType: 'instagram_carousel',
      impactScore: 48,
      impactLevel: 'medium',
      estimatedMinutes: 22,
      description: 'Design visual carousel for Instagram'
    },
    'professional_tip_post': {
      questType: 'professional_tip_post',
      impactScore: 45,
      impactLevel: 'medium',
      estimatedMinutes: 12,
      description: 'Share actionable professional tip'
    },
    
    // QUICK WIN QUESTS (10-39 points)
    'linkedin_comment_engagement': {
      questType: 'linkedin_comment_engagement',
      impactScore: 38,
      impactLevel: 'quick_win',
      estimatedMinutes: 8,
      description: 'Engage with 5 relevant posts through comments'
    },
    'connection_request': {
      questType: 'connection_request',
      impactLevel: 'quick_win',
      impactScore: 35,
      estimatedMinutes: 10,
      description: 'Send personalized connection requests'
    },
    'linkedin_quick_post': {
      questType: 'linkedin_quick_post',
      impactScore: 32,
      impactLevel: 'quick_win',
      estimatedMinutes: 8,
      description: 'Share quick industry observation'
    },
    'twitter_engagement': {
      questType: 'twitter_engagement',
      impactScore: 30,
      impactLevel: 'quick_win',
      estimatedMinutes: 7,
      description: 'Engage with industry discussions on X'
    },
    'instagram_story': {
      questType: 'instagram_story',
      impactScore: 28,
      impactLevel: 'quick_win',
      estimatedMinutes: 5,
      description: 'Share quick Instagram story'
    },
    'linkedin_poll_response': {
      questType: 'linkedin_poll_response',
      impactScore: 25,
      impactLevel: 'quick_win',
      estimatedMinutes: 5,
      description: 'Participate in industry polls'
    },
    'repost_with_comment': {
      questType: 'repost_with_comment',
      impactScore: 22,
      impactLevel: 'quick_win',
      estimatedMinutes: 5,
      description: 'Share others content with your perspective'
    },
    'profile_headline_update': {
      questType: 'profile_headline_update',
      impactScore: 20,
      impactLevel: 'quick_win',
      estimatedMinutes: 8,
      description: 'Optimize profile headline'
    },
    'linkedin_reaction': {
      questType: 'linkedin_reaction',
      impactScore: 15,
      impactLevel: 'quick_win',
      estimatedMinutes: 3,
      description: 'React to industry content'
    },
    'hashtag_following': {
      questType: 'hashtag_following',
      impactScore: 12,
      impactLevel: 'quick_win',
      estimatedMinutes: 3,
      description: 'Follow relevant industry hashtags'
    },
    
    // BRANDENTIFY ENGAGEMENT QUESTS
    'deep_engage_single_pulse': {
      questType: 'deep_engage_single_pulse',
      impactScore: 60,
      impactLevel: 'medium',
      estimatedMinutes: 15,
      description: 'React, comment thoughtfully (50+ words), and share a pulse with your own commentary'
    },
    'comment_on_pulse': {
      questType: 'comment_on_pulse',
      impactScore: 40,
      impactLevel: 'medium',
      estimatedMinutes: 10,
      description: 'Leave thoughtful comments on pulses in your industry'
    },
    'any_engagement': {
      questType: 'any_engagement',
      impactScore: 35,
      impactLevel: 'quick_win',
      estimatedMinutes: 10,
      description: 'Complete engagement actions: reactions, comments, votes, or shares'
    },
    'engage_with_industry': {
      questType: 'engage_with_industry',
      impactScore: 35,
      impactLevel: 'quick_win',
      estimatedMinutes: 10,
      description: 'Engage with pulses from professionals in your industry'
    },
    'share_pulse': {
      questType: 'share_pulse',
      impactScore: 25,
      impactLevel: 'quick_win',
      estimatedMinutes: 5,
      description: 'Share valuable pulses with your network'
    },
    'react_to_pulse': {
      questType: 'react_to_pulse',
      impactScore: 20,
      impactLevel: 'quick_win',
      estimatedMinutes: 5,
      description: 'React to pulses with insightful or misinformed markers'
    },
    'vote_on_poll': {
      questType: 'vote_on_poll',
      impactScore: 15,
      impactLevel: 'quick_win',
      estimatedMinutes: 3,
      description: 'Participate in industry polls on Brandentify'
    }
  };

  /**
   * Get impact score for a specific quest type
   */
  getImpactScore(questType: string): QuestImpactScore | null {
    return this.QUEST_IMPACT_SCORES[questType] || null;
  }

  /**
   * Get all quest types by impact level
   */
  getQuestsByImpactLevel(level: 'high' | 'medium' | 'quick_win'): QuestImpactScore[] {
    return Object.values(this.QUEST_IMPACT_SCORES)
      .filter(quest => quest.impactLevel === level);
  }

  /**
   * Calculate weighted impact score based on user goals
   * Certain goals increase/decrease impact of specific quest types
   */
  getWeightedImpactScore(
    questType: string, 
    userGoals: string[]
  ): number {
    const baseScore = this.QUEST_IMPACT_SCORES[questType];
    if (!baseScore) return 0;

    let weightedScore = baseScore.impactScore;

    // Goal-based multipliers
    const goalMultipliers: Record<string, Record<string, number>> = {
      'visibility_awareness': {
        'linkedin_post_with_visuals': 1.2,
        'linkedin_carousel': 1.2,
        'instagram_reel': 1.15,
        'twitter_thread': 1.15
      },
      'career_growth': {
        'case_study_post': 1.25,
        'portfolio_project_upload': 1.3,
        'thought_leadership_article': 1.2,
        'skill_showcase_post': 1.15
      },
      'engagement_community': {
        'deep_engage_single_pulse': 1.35,
        'comment_on_pulse': 1.3,
        'linkedin_comment_engagement': 1.3,
        'any_engagement': 1.25,
        'engage_with_industry': 1.25,
        'industry_poll': 1.25,
        'share_pulse': 1.2,
        'connection_request': 1.2,
        'twitter_engagement': 1.2,
        'react_to_pulse': 1.15,
        'vote_on_poll': 1.15
      },
      'monetization_impact': {
        'client_testimonial_post': 1.3,
        'case_study_post': 1.25,
        'portfolio_project_upload': 1.2,
        'linkedin_article': 1.15
      }
    };

    // Apply multipliers based on user goals
    for (const goal of userGoals) {
      if (goalMultipliers[goal] && goalMultipliers[goal][questType]) {
        weightedScore *= goalMultipliers[goal][questType];
      }
    }

    return Math.round(weightedScore);
  }

  /**
   * Get all quest scores sorted by impact
   */
  getAllQuestScores(sortByImpact: boolean = true): QuestImpactScore[] {
    const scores = Object.values(this.QUEST_IMPACT_SCORES);
    
    if (sortByImpact) {
      return scores.sort((a, b) => b.impactScore - a.impactScore);
    }
    
    return scores;
  }

  /**
   * Get recommended quest types based on available time
   */
  getQuestsByTimeAvailable(maxMinutes: number): QuestImpactScore[] {
    return Object.values(this.QUEST_IMPACT_SCORES)
      .filter(quest => quest.estimatedMinutes <= maxMinutes)
      .sort((a, b) => b.impactScore - a.impactScore);
  }
}

export const questImpactScorer = new QuestImpactScorer();

