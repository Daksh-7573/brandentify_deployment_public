import { IStorage } from "../storage";
import { MuskSuggestion } from "../../shared/schema-musk-suggestions";

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
    
    return {
      userId,
      industry: user.industry || undefined,
      title: user.title || undefined,
      location: user.location || undefined,
      lastLoginTime,
      profileCompleteness,
      hasRecentPulses,
      hasProjects,
      currentTime: new Date(),
      recentPageViews: recentPageViews || [],
    };
  }

  /**
   * Generate new suggestions based on user context
   */
  private async generateSuggestions(context: SuggestionContext): Promise<MuskSuggestion[]> {
    const suggestions: MuskSuggestion[] = [];
    
    // Add daily industry suggestion if it's morning (between 8am and 11am)
    const hour = context.currentTime.getHours();
    if (hour >= 8 && hour <= 11) {
      suggestions.push(await this.createDailyIndustrySuggestion(context));
    }
    
    // Add inactivity suggestion if user hasn't logged in for 72+ hours
    const hoursSinceLastLogin = (context.currentTime.getTime() - (context.lastLoginTime?.getTime() || 0)) / (1000 * 60 * 60);
    if (hoursSinceLastLogin >= 72) {
      suggestions.push(await this.createInactivitySuggestion(context));
    }
    
    // Add profile completion suggestion if profile is <80% complete
    if (context.profileCompleteness !== undefined && context.profileCompleteness < 80) {
      suggestions.push(await this.createProfileCompletionSuggestion(context));
    }
    
    // Add project suggestion if user has no projects
    if (!context.hasProjects) {
      suggestions.push(await this.createProjectSuggestion(context));
    }
    
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
  private async createProfileCompletionSuggestion(context: SuggestionContext): Promise<MuskSuggestion> {
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
      cooldownHours: 72, // Don't show again for 3 days
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