import { IStorage } from "../storage";
import { 
  MuskSuggestion, 
  UserProfileIntelligence, 
  BehaviorHeatmap,
  userProfileSegments,
  careerLevels,
  userGoalTypes
} from "../../shared/schema-musk-suggestions";

export interface SuggestionContext {
  userId: number;
  industry?: string;
  title?: string;
  location?: string;
  lastLoginTime?: Date;
  profileCompleteness?: number;
  hasRecentPulses?: boolean;
  hasProjects?: boolean;
  currentTime: Date;
  recentPageViews?: string[];
  // Enhanced context information
  profileIntelligence?: UserProfileIntelligence;
  behaviorPatterns?: {
    preferredContentTypes: string[];
    activeTimeOfDay: number[];
    topEngagementCategories: string[];
    averageSessionDuration: number;
  };
  careerLevel?: string;
  userSegment?: string;
  primaryGoal?: string;
  skillGaps?: string[];
  learningStyle?: string;
}

/**
 * Rules-based suggestion generator for Musk AI
 */
export class MuskSuggestionService {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Get active suggestions for a user based on their context
   */
  async getSuggestionsForUser(userId: number): Promise<MuskSuggestion[]> {
    try {
      // 1. Get existing active suggestions
      const existingSuggestions = await this.storage.getMuskSuggestionsForUser(userId);
      
      // 2. Get user context data
      const context = await this.buildUserContext(userId);
      
      // 3. Generate new suggestions based on context
      const newSuggestions = await this.generateSuggestions(context);
      
      // 4. Combine and filter suggestions
      const allSuggestions = [...existingSuggestions, ...newSuggestions];
      
      // 5. Apply cooldown and priority rules
      return this.prioritizeAndFilterSuggestions(allSuggestions);
    } catch (error) {
      console.error("Error getting suggestions for user:", error);
      return [];
    }
  }

  /**
   * Build user context for suggestion generation
   */
  private async buildUserContext(userId: number): Promise<SuggestionContext> {
    // Get user data
    const user = await this.storage.getUser(userId);
    
    // Get user activity data
    const lastLoginTime = new Date(); // Replace with actual last login time
    const profileCompleteness = user?.profileCompleted || 0;
    
    // Check if user has recent pulses
    const pulses = await this.storage.getPulsesByUserId(userId);
    const hasRecentPulses = pulses.length > 0;
    
    // Check if user has projects
    const projects = await this.storage.getProjectsByUserId(userId);
    const hasProjects = projects.length > 0;
    
    // Get recent page views from behavior tracking
    const recentBehavior = await this.storage.getMuskBehaviorTrackingByUser(userId);
    const recentPageViews = recentBehavior
      .filter(b => b.eventType === 'page_view')
      .map(b => {
        try {
          return JSON.parse(b.eventData).page;
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
    
    // Get advanced profile intelligence if available
    let profileIntelligence;
    try {
      profileIntelligence = await this.storage.getUserProfileIntelligence(userId);
    } catch (error) {
      console.log('No profile intelligence data found for user');
    }
    
    // Analyze behavior patterns from heatmap data
    let behaviorPatterns;
    try {
      const behaviorHeatmap = await this.storage.getBehaviorHeatmapForUser(userId);
      
      if (behaviorHeatmap && behaviorHeatmap.length > 0) {
        // Find preferred content types
        const contentTypeMap = new Map<string, number>();
        behaviorHeatmap.forEach(entry => {
          const current = contentTypeMap.get(entry.contentType) || 0;
          contentTypeMap.set(entry.contentType, current + 1);
        });
        
        const preferredContentTypes = Array.from(contentTypeMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([type]) => type);
          
        // Find active hours of day
        const timeMap = new Map<number, number>();
        behaviorHeatmap.forEach(entry => {
          if (entry.timeOfDay !== null) {
            const current = timeMap.get(entry.timeOfDay) || 0;
            timeMap.set(entry.timeOfDay, current + 1);
          }
        });
        
        const activeTimeOfDay = Array.from(timeMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([hour]) => hour);
        
        // Calculate average session duration
        const durations = behaviorHeatmap
          .filter(entry => entry.timeSpent)
          .map(entry => entry.timeSpent || 0);
          
        const averageSessionDuration = durations.length > 0
          ? durations.reduce((sum, val) => sum + val, 0) / durations.length
          : 0;
          
        // Find top engagement categories
        const categoriesMap = new Map<string, number>();
        behaviorHeatmap.forEach(entry => {
          const engagementStrength = entry.engagementStrength || 1;
          
          if (entry.contentType.includes('_')) {
            const category = entry.contentType.split('_')[0];
            const current = categoriesMap.get(category) || 0;
            categoriesMap.set(category, current + engagementStrength);
          }
        });
        
        const topEngagementCategories = Array.from(categoriesMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category]) => category);
          
        behaviorPatterns = {
          preferredContentTypes,
          activeTimeOfDay,
          topEngagementCategories,
          averageSessionDuration
        };
      }
    } catch (error) {
      console.log('No behavior heatmap data found for user');
    }
    
    // Extract values from profile intelligence
    const userSegment = profileIntelligence?.segment;
    const careerLevel = profileIntelligence?.careerLevel;
    const primaryGoal = profileIntelligence?.primaryGoal;
    const learningStyle = profileIntelligence?.learningStyle;
    
    // Parse JSON arrays from profile intelligence
    let skillGaps: string[] = [];
    if (profileIntelligence?.skillGaps) {
      try {
        skillGaps = JSON.parse(profileIntelligence.skillGaps);
      } catch (error) {
        console.log('Invalid skill gaps JSON data');
      }
    }
    
    return {
      userId,
      industry: user?.industry || undefined,
      title: user?.title || undefined,
      location: user?.location || undefined,
      lastLoginTime,
      profileCompleteness,
      hasRecentPulses,
      hasProjects,
      currentTime: new Date(),
      recentPageViews: recentPageViews || [],
      // Enhanced context information
      profileIntelligence,
      behaviorPatterns,
      careerLevel,
      userSegment,
      primaryGoal,
      skillGaps,
      learningStyle
    };
  }

  /**
   * Generate new suggestions based on user context
   */
  private async generateSuggestions(context: SuggestionContext): Promise<MuskSuggestion[]> {
    const suggestions: MuskSuggestion[] = [];
    
    // --- ORIGINAL SUGGESTION TYPES ---
    
    // Add daily industry suggestion if it's morning or early afternoon (between 8am and 2pm)
    const hour = context.currentTime.getHours();
    if (hour >= 8 && hour <= 14) {
      suggestions.push(await this.createDailyIndustrySuggestion(context));
    }
    
    // Optimized timing for inactivity suggestions based on user activity level
    const hoursSinceLastLogin = (context.currentTime.getTime() - (context.lastLoginTime?.getTime() || 0)) / (1000 * 60 * 60);
    
    // Determine user activity level
    const isHighlyActive = (context.recentPageViews || []).length > 10; // User viewed many pages recently
    const isModeratelyActive = (context.recentPageViews || []).length > 3; // Some recent activity
    const isNewUser = hoursSinceLastLogin < 48 && (context.profileCompleteness || 0) < 40; // New user with incomplete profile
    const isDormant = hoursSinceLastLogin > 120; // No activity for 5+ days
    
    // Apply optimal trigger windows based on activity level
    if (isHighlyActive && hoursSinceLastLogin >= 36) {
      // For highly active users, suggest after 36 hours
      suggestions.push(await this.createInactivitySuggestion(context));
    } else if (isModeratelyActive && hoursSinceLastLogin >= 48) {
      // For moderately active users, suggest after 48 hours
      suggestions.push(await this.createInactivitySuggestion(context));
    } else if (isNewUser && hoursSinceLastLogin >= 24) {
      // For new users, re-engage after just 24 hours
      suggestions.push(await this.createInactivitySuggestion(context));
    } else if (isDormant) {
      // For dormant users, create a soft re-engagement
      suggestions.push(await this.createDormantUserSuggestion(context));
    }
    
    // Add profile completion suggestion if profile is <80% complete
    // Adjust frequency based on completion level
    if (context.profileCompleteness !== undefined && context.profileCompleteness < 80) {
      // For very incomplete profiles, show more frequently
      if (context.profileCompleteness < 40) {
        suggestions.push(await this.createProfileCompletionSuggestion(context, 48)); // Every 2 days
      } else {
        suggestions.push(await this.createProfileCompletionSuggestion(context, 72)); // Every 3 days
      }
    }
    
    // Add project suggestion if user has no projects
    if (!context.hasProjects) {
      suggestions.push(await this.createProjectSuggestion(context));
    }
    
    // Add pulse engagement suggestion if we have new content that matches user's industry
    if (context.hasRecentPulses) {
      suggestions.push(await this.createEngagePulseSuggestion(context));
    }
    
    // --- ENHANCED SUGGESTION TYPES ---
    
    // 1. Deep Profile Intelligence based suggestions
    if (context.userSegment) {
      // Different suggestions based on user segment
      if (context.userSegment === 'jobSeeker') {
        suggestions.push(await this.createJobSeekerSuggestion(context));
      } else if (context.userSegment === 'creator') {
        suggestions.push(await this.createContentCreatorSuggestion(context));
      } else if (context.userSegment === 'networker') {
        suggestions.push(await this.createNetworkingSuggestion(context));
      }
    }
    
    // 2. Behavioral Pattern-based suggestions
    if (context.behaviorPatterns) {
      // Suggest content based on user's preferred content types
      if (context.behaviorPatterns.preferredContentTypes.length > 0) {
        suggestions.push(await this.createContentPreferenceSuggestion(context));
      }
      
      // Optimal time suggestion based on user's active hours
      if (context.behaviorPatterns.activeTimeOfDay.length > 0) {
        const preferredHour = context.behaviorPatterns.activeTimeOfDay[0];
        const currentHour = context.currentTime.getHours();
        
        // If we're close to the user's preferred engagement time, suggest posting
        if (Math.abs(currentHour - preferredHour) <= 2) {
          suggestions.push(await this.createOptimalTimeSuggestion(context));
        }
      }
    }
    
    // 3. Check for skill gaps if available
    if (context.skillGaps && context.skillGaps.length > 0) {
      suggestions.push(await this.createSkillGapSuggestion(context));
    }
    
    // 4. Create milestone-based suggestions
    suggestions.push(await this.createMilestoneSuggestion(context));
    
    // 5. Create trending topic suggestion based on user's industry
    suggestions.push(await this.createTrendingTopicSuggestion(context));
    
    // 6. Strategic engagement suggestion for visibility
    suggestions.push(await this.createStrategicEngagementSuggestion(context));
    
    // Filter out any null suggestions
    return suggestions.filter(Boolean) as MuskSuggestion[];
  }

  /**
   * Apply priority, cooldown and other rules to filter suggestions
   */
  private prioritizeAndFilterSuggestions(suggestions: MuskSuggestion[]): MuskSuggestion[] {
    // Remove dismissed suggestions
    const activeSuggestions = suggestions.filter(s => !s.dismissed);
    
    // Sort by priority (highest first)
    const sortedSuggestions = [...activeSuggestions].sort((a, b) => {
      // First by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Limit to top 3 suggestions
    return sortedSuggestions.slice(0, 3);
  }

  /**
   * Create a daily industry suggestion
   */
  private async createDailyIndustrySuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
    const industry = context.industry || 'Technology';
    
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'daily',
      title: 'Industry Trend Alert',
      message: `Hot topic in ${industry} today! Many professionals are sharing posts about AI integration. Want to join the conversation?`,
      actionLink: '/create-pulse',
      actionText: 'Share your thoughts',
      priority: 3,
      cooldownHours: 24,
      relevanceScore: 85,
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(context.currentTime.getTime() + 12 * 60 * 60 * 1000), // Expires in 12 hours
    };
  }

  /**
   * Create an inactivity suggestion
   */
  private async createInactivitySuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'inactivity',
      title: 'Reconnect with your network',
      message: "Your network has been active while you were away. Check out these trending posts in your field!",
      actionLink: '/industry-pulse',
      actionText: 'See what\'s new',
      priority: 5, // Higher priority for re-engagement
      cooldownHours: 48,
      relevanceScore: 90,
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(context.currentTime.getTime() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    };
  }

  /**
   * Create a profile completion suggestion
   */
  private async createProfileCompletionSuggestion(context: SuggestionContext, cooldownHours: number = 72): Promise<MuskSuggestion> {
    const remainingPercent = 100 - (context.profileCompleteness || 0);
    
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'resumeUpdate',
      title: 'Complete Your Profile',
      message: `Your profile is just ${remainingPercent}% away from being a perfect professional showcase. Complete it to attract more opportunities!`,
      actionLink: '/profile',
      actionText: 'Finish your profile',
      priority: 4,
      cooldownHours: cooldownHours, // Configurable cooldown
      relevanceScore: 80,
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null // Doesn't expire until profile is completed
    };
  }
  
  /**
   * Create a dormant user suggestion - softer re-engagement for users away 5+ days
   */
  private async createDormantUserSuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'inactivity',
      title: 'Welcome Back!',
      message: "We've missed you! The community has been growing while you were away. Your expertise would be valuable in ongoing discussions.",
      actionLink: '/discover',
      actionText: 'See what\'s happening',
      priority: 5, // High priority for dormant users
      cooldownHours: 72, // Longer cooldown for dormant users
      relevanceScore: 95, // Very relevant for dormant users
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(context.currentTime.getTime() + 48 * 60 * 60 * 1000), // Expires in 48 hours
    };
  }
  
  /**
   * Create a suggestion to engage with relevant pulse content
   */
  private async createEngagePulseSuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
    const industry = context.industry || 'your industry';
    
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'newPulse',
      title: 'New Content for You',
      message: `There's new content in ${industry} that matches your interests. Join the conversation and share your insights!`,
      actionLink: '/industry-pulse',
      actionText: 'View relevant content',
      priority: 3,
      cooldownHours: 24, // Daily recommendation if available
      relevanceScore: 85,
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(context.currentTime.getTime() + 12 * 60 * 60 * 1000), // Expires in 12 hours
    };
  }

  /**
   * Create a project suggestion
   */
  private async createProjectSuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
    return {
      id: 0, // Will be assigned by DB
      userId: context.userId,
      type: 'projectCompletion',
      title: 'Showcase Your Work',
      message: "Adding projects to your profile increases visibility by 70%. Upload your first project to stand out!",
      actionLink: '/profile?tab=projects',
      actionText: 'Add a project',
      priority: 3,
      cooldownHours: 96, // 4 days
      relevanceScore: 75,
      shown: false,
      dismissed: false,
      actionTaken: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null // Doesn't expire until a project is added
    };
  }

  /**
   * Mark suggestion as dismissed
   */
  async dismissSuggestion(suggestionId: number): Promise<void> {
    await this.storage.updateMuskSuggestion(suggestionId, {
      dismissed: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Mark suggestion as having action taken
   */
  async markSuggestionActionTaken(suggestionId: number): Promise<void> {
    await this.storage.updateMuskSuggestion(suggestionId, {
      actionTaken: true,
      dismissed: true, // Also dismiss it
      updatedAt: new Date(),
    });
  }

  /**
   * Track user behavior for future suggestions
   */
  async trackUserBehavior(userId: number, eventType: string, eventData: Record<string, any>): Promise<void> {
    await this.storage.createMuskBehaviorTracking({
      userId,
      eventType,
      eventData: JSON.stringify(eventData),
      createdAt: new Date(),
    });
  }
}