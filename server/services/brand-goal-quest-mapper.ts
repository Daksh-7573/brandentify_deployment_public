/**
 * Brand Goal to Quest Type Mapper
 * 
 * Maps the 12 Brand Goals to relevant quest types for strict filtering.
 * Users will ONLY receive quests that align with their selected Brand Goals.
 */

export class BrandGoalQuestMapper {
  
  /**
   * Maps each Brand Goal ID to the quest types it supports
   */
  private static readonly GOAL_TO_QUEST_TYPES: Record<string, string[]> = {
    
    // VISIBILITY & AWARENESS GOALS
    'visibility_1': [ // Improve visibility on social media networks
      'visibility',
      'pulse_creation',
      'networking',
      'engagement'
    ],
    
    'visibility_2': [ // Increase brand recognition among target audience
      'visibility',
      'profile_update',
      'pulse_creation',
      'networking',
      'engagement'
    ],
    
    'visibility_3': [ // Establish consistent online presence across platforms
      'pulse_creation',
      'visibility',
      'profile_update',
      'engagement'
    ],
    
    'visibility_4': [ // Appear in search results for name/expertise
      'profile_update',
      'visibility',
      'pulse_creation',
      'resume',
      'portfolio'
    ],
    
    'visibility_5': [ // Grow follower base with engaged audience
      'visibility',
      'networking',
      'pulse_creation',
      'engagement'
    ],
    
    // PROFESSIONAL & CAREER GROWTH GOALS
    'professional_1': [ // Position as authority in niche
      'pulse_creation',
      'portfolio',
      'resume',
      'learning',
      'visibility',
      'engagement'
    ],
    
    'professional_2': [ // Attract new business opportunities
      'networking',
      'portfolio',
      'visibility',
      'pulse_creation',
      'profile_update',
      'engagement'
    ],
    
    'professional_3': [ // Get featured on podcasts/collaborations
      'networking',
      'visibility',
      'pulse_creation',
      'portfolio',
      'engagement'
    ],
    
    // ENGAGEMENT & COMMUNITY GOALS
    'engagement_1': [ // Build loyal community around brand
      'engagement',
      'networking',
      'pulse_creation',
      'visibility'
    ],
    
    // MONETIZATION & IMPACT GOALS
    'monetization_1': [ // Attract sponsorships and brand collaborations
      'portfolio',
      'visibility',
      'pulse_creation',
      'networking',
      'engagement'
    ],
    
    'monetization_2': [ // Convert followers into leads/customers
      'networking',
      'pulse_creation',
      'portfolio',
      'profile_update',
      'engagement'
    ],
    
    'monetization_3': [ // Launch own product/service
      'portfolio',
      'pulse_creation',
      'profile_update',
      'visibility'
    ]
  };

  /**
   * Get allowed quest types for a user's selected Brand Goals
   * Returns ONLY quest types that match at least one selected goal
   */
  static getAllowedQuestTypes(selectedGoals: string[]): string[] {
    if (selectedGoals.length === 0) {
      // No goals selected - return empty array (strict filtering)
      return [];
    }

    const allowedTypes = new Set<string>();

    selectedGoals.forEach(goalId => {
      const questTypes = this.GOAL_TO_QUEST_TYPES[goalId];
      if (questTypes) {
        questTypes.forEach(type => allowedTypes.add(type));
      }
    });

    return Array.from(allowedTypes);
  }

  /**
   * Check if a quest type is allowed for selected Brand Goals
   */
  static isQuestTypeAllowed(questType: string, selectedGoals: string[]): boolean {
    const allowedTypes = this.getAllowedQuestTypes(selectedGoals);
    return allowedTypes.includes(questType);
  }

  /**
   * Get all quest types mapped to a specific goal (for debugging/testing)
   */
  static getQuestTypesForGoal(goalId: string): string[] {
    return this.GOAL_TO_QUEST_TYPES[goalId] || [];
  }
}
