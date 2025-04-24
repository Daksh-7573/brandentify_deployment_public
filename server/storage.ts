import { pool } from './db';
import { sql } from 'drizzle-orm';
import { 
  users, User, InsertUser, 
  resumes, Resume, InsertResume,
  workExperiences, WorkExperience, InsertWorkExperience,
  educations, Education, InsertEducation,
  skills, Skill, InsertSkill,
  chatMessages, ChatMessage, InsertChatMessage,
  otpVerifications, OtpVerification, InsertOtpVerification,
  emailVerifications, EmailVerification, InsertEmailVerification,
  projects, Project, InsertProject,
  projectCollaborators, ProjectCollaborator, InsertProjectCollaborator,
  projectEndorsements, ProjectEndorsement, InsertProjectEndorsement,
  portfolios, Portfolio, InsertPortfolio,
  services, Service, InsertService,
  pulses, Pulse, InsertPulse,
  pulseComments, PulseComment, InsertPulseComment,
  pollVotes, PollVote, InsertPollVote,
  hashtags, Hashtag, InsertHashtag,
  pulseHashtags, PulseHashtag, InsertPulseHashtag,
  userHashtagFollows, UserHashtagFollow, InsertUserHashtagFollow,
  nowboardItems, NowboardItem, InsertNowboardItem,
  nowboardInspiredBy, NowboardInspiredBy, InsertNowboardInspiredBy,
  // Pulse Interaction System models
  pulseReactions, PulseReaction, InsertPulseReaction,
  userReactionQuotas, UserReactionQuota, InsertUserReactionQuota,
  pulseShares, PulseShare, InsertPulseShare,
  // New models for News Pulse feature
  newsSources, NewsSource, InsertNewsSource,
  newsArticles, NewsArticle, InsertNewsArticle,
  newsUserPreferences, NewsUserPreference, InsertNewsUserPreference,
  // Musk Match models
  muskMatches, MuskMatch, InsertMuskMatch,
  // Career Quests models
  questDefinitions, QuestDefinition, InsertQuestDefinition,
  userQuests, UserQuest, InsertUserQuest,
  userXp, UserXp, InsertUserXp,
  userBadges, UserBadge, InsertUserBadge,
  xpTransactions, XpTransaction, InsertXpTransaction,
  // Brand of the Day models
  brandsOfTheDay, BrandOfTheDay, InsertBrandOfTheDay
} from "@shared/schema";

// Import Musk suggestion models
import { 
  muskSuggestions, MuskSuggestion, InsertMuskSuggestion,
  muskBehaviorTracking, MuskBehaviorTracking, InsertMuskBehaviorTracking,
  userProfileIntelligence, UserProfileIntelligence, InsertUserProfileIntelligence,
  behaviorHeatmap, BehaviorHeatmap, InsertBehaviorHeatmap,
  contentScoring, ContentScoring, InsertContentScoring,
  industryTrendsMonitor, IndustryTrendsMonitor, InsertIndustryTrendsMonitor,
  userMilestones, UserMilestones, InsertUserMilestones,
  smartPostSuggestions, SmartPostSuggestions, InsertSmartPostSuggestions
} from "@shared/schema-musk-suggestions";

// Interface for all storage operations
export interface IStorage {
  // Nowboard Item operations
  getNowboardItems(): Promise<NowboardItem[]>;
  getNowboardItemsByUserId(userId: number): Promise<NowboardItem[]>;
  getNowboardItemById(id: number): Promise<NowboardItem | undefined>;
  getNowboardItemsByCategory(category: "growth" | "learning" | "launch" | "planning" | "collaboration" | "visibility"): Promise<NowboardItem[]>;
  createNowboardItem(item: InsertNowboardItem): Promise<NowboardItem>;
  updateNowboardItem(id: number, item: Partial<NowboardItem>): Promise<NowboardItem | undefined>;
  deleteNowboardItem(id: number): Promise<boolean>;
  
  // Nowboard Inspired By operations
  getInspiredByForNowboardItem(nowboardItemId: number): Promise<NowboardInspiredBy[]>;
  getInspiredByForUserAndItem(userId: number, nowboardItemId: number): Promise<NowboardInspiredBy | undefined>;
  markInspiredByNowboardItem(userId: number, nowboardItemId: number): Promise<NowboardInspiredBy>;
  unmarkInspiredByNowboardItem(userId: number, nowboardItemId: number): Promise<boolean>;
  isNowboardItemInspiredByUser(userId: number, nowboardItemId: number): Promise<boolean>;
  incrementInspiredCount(nowboardItemId: number): Promise<NowboardItem | undefined>;
  decrementInspiredCount(nowboardItemId: number): Promise<NowboardItem | undefined>;
  getUserInspiredCount(userId: number): Promise<number>;
  
  // User Hashtag Follow operations
  followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow>;
  unfollowHashtag(userId: number, hashtagId: number): Promise<boolean>;
  getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]>;
  isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean>;
  getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Poll Vote operations
  getPollVotesByPulseId(pulseId: number): Promise<PollVote[]>;
  getPollVoteByUserAndPulse(userId: number, pulseId: number): Promise<PollVote | undefined>;
  createPollVote(vote: InsertPollVote): Promise<PollVote>;
  updatePollVote(id: number, vote: Partial<PollVote>): Promise<PollVote | undefined>;
  deletePollVote(id: number): Promise<boolean>;
  
  // Pulse Reaction operations
  getPulseReactionsByPulseId(pulseId: number): Promise<PulseReaction[]>;
  getPulseReactionById(id: number): Promise<PulseReaction | undefined>;
  getPulseReactionByUserAndPulse(userId: number, pulseId: number, reactionType: "insightful" | "misinformed"): Promise<PulseReaction | undefined>;
  createPulseReaction(reaction: InsertPulseReaction): Promise<PulseReaction>;
  deletePulseReaction(id: number): Promise<boolean>;
  
  // User Reaction Quota operations
  getUserReactionQuota(userId: number): Promise<UserReactionQuota | undefined>;
  getOrCreateUserReactionQuota(userId: number): Promise<UserReactionQuota>;
  incrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota>;
  decrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota>;
  checkReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<{ 
    hasQuotaRemaining: boolean; 
    remaining: number; 
    used: number;
    max: number;
  }>;
  
  // Pulse Share operations
  getPulseSharesByRecipientId(recipientId: number): Promise<PulseShare[]>;
  createPulseShare(share: InsertPulseShare): Promise<PulseShare>;
  markPulseShareRead(id: number): Promise<PulseShare | undefined>;
  deletePulseShare(id: number): Promise<boolean>;
  
  // Resume operations
  getResumeByUserId(userId: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Work Experience operations
  getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]>;
  createWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: number, experience: Partial<WorkExperience>): Promise<WorkExperience | undefined>;
  deleteWorkExperience(id: number): Promise<boolean>;
  clearUserWorkExperiences(userId: number): Promise<number>;
  
  // Education operations
  getEducationsByUserId(userId: number): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<Education>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;
  
  // Skill operations
  getSkillsByUserId(userId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Project operations
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project Collaborator operations
  getProjectCollaboratorsByProjectId(projectId: number): Promise<ProjectCollaborator[]>;
  getProjectCollaboratorById(id: number): Promise<ProjectCollaborator | undefined>;
  createProjectCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator>;
  updateProjectCollaborator(id: number, collaborator: Partial<ProjectCollaborator>): Promise<ProjectCollaborator | undefined>;
  deleteProjectCollaborator(id: number): Promise<boolean>;
  
  // Project Endorsement operations
  getProjectEndorsementsByProjectId(projectId: number): Promise<ProjectEndorsement[]>;
  getProjectEndorsementById(id: number): Promise<ProjectEndorsement | undefined>;
  createProjectEndorsement(endorsement: InsertProjectEndorsement): Promise<ProjectEndorsement>;
  updateProjectEndorsement(id: number, endorsement: Partial<ProjectEndorsement>): Promise<ProjectEndorsement | undefined>;
  deleteProjectEndorsement(id: number): Promise<boolean>;
  
  // Chat Message operations
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessagesByType(userId: number, messageType: string): Promise<number>;
  
  // OTP verification operations for phone login
  createOtpVerification(verification: InsertOtpVerification): Promise<OtpVerification>;
  getOtpVerificationByPhoneNumber(phoneNumber: string): Promise<OtpVerification | undefined>;
  verifyOtp(phoneNumber: string, otp: string): Promise<boolean>;
  
  // Email verification operations
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  getEmailVerificationByEmail(email: string): Promise<EmailVerification | undefined>;
  getEmailVerificationByToken(token: string): Promise<EmailVerification | undefined>;
  updateEmailVerification(id: number, verification: Partial<EmailVerification>): Promise<EmailVerification | undefined>;
  verifyEmail(email: string, token: string): Promise<boolean>;
  
  // Portfolio operations
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;
  getPortfolioById(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number): Promise<boolean>;
  
  // Service operations
  getServicesByUserId(userId: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Pulse operations
  getPulses(): Promise<Pulse[]>;
  getPulsesByUserId(userId: number): Promise<Pulse[]>;
  getPulseById(id: number): Promise<Pulse | undefined>;
  createPulse(pulse: InsertPulse): Promise<Pulse>;
  updatePulse(id: number, pulse: Partial<Pulse>): Promise<Pulse | undefined>;
  deletePulse(id: number): Promise<boolean>;
  
  // Pulse Comment operations
  getPulseCommentsByPulseId(pulseId: number): Promise<PulseComment[]>;
  createPulseComment(comment: InsertPulseComment): Promise<PulseComment>;
  deletePulseComment(id: number): Promise<boolean>;
  
  // Hashtag operations
  getHashtags(): Promise<Hashtag[]>;
  getHashtagById(id: number): Promise<Hashtag | undefined>;
  getHashtagByTag(tag: string): Promise<Hashtag | undefined>;
  createHashtag(hashtag: InsertHashtag): Promise<Hashtag>;
  updateHashtag(id: number, hashtag: Partial<Hashtag>): Promise<Hashtag | undefined>;
  incrementHashtagCount(id: number): Promise<Hashtag | undefined>;
  
  // Pulse Hashtag operations
  createPulseHashtag(pulseHashtag: InsertPulseHashtag): Promise<PulseHashtag>;
  getPulseHashtagsByPulseId(pulseId: number): Promise<PulseHashtag[]>;
  getHashtagsByPulseId(pulseId: number): Promise<Hashtag[]>;
  extractAndSaveHashtags(text: string, pulseId: number): Promise<Hashtag[]>;
  searchHashtagsByPrefix(prefix: string): Promise<Hashtag[]>;
  
  // User Hashtag Following operations
  followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow>;
  unfollowHashtag(userId: number, hashtagId: number): Promise<boolean>;
  getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]>;
  isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean>;
  getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]>;
  
  // Debug and maintenance operations
  clearAllUsers(): Promise<void>;
  
  // News Source operations
  getNewsSources(): Promise<NewsSource[]>;
  getNewsSourceById(id: number): Promise<NewsSource | undefined>;
  getNewsSourcesByCategory(category: string): Promise<NewsSource[]>;
  createNewsSource(source: InsertNewsSource): Promise<NewsSource>;
  updateNewsSource(id: number, source: Partial<NewsSource>): Promise<NewsSource | undefined>;
  deleteNewsSource(id: number): Promise<boolean>;
  
  // News Article operations
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticleById(id: number): Promise<NewsArticle | undefined>;
  getNewsArticlesBySourceId(sourceId: number): Promise<NewsArticle[]>;
  getNewsArticlesByCategory(category: string): Promise<NewsArticle[]>;
  getUnprocessedNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticlesByIndustry(industry: string): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, article: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: number): Promise<boolean>;
  
  // News User Preference operations
  getNewsUserPreferenceByUserId(userId: number): Promise<NewsUserPreference | undefined>;
  createNewsUserPreference(preference: InsertNewsUserPreference): Promise<NewsUserPreference>;
  updateNewsUserPreference(id: number, preference: Partial<NewsUserPreference>): Promise<NewsUserPreference | undefined>;
  deleteNewsUserPreference(id: number): Promise<boolean>;
  
  // Musk Suggestion operations
  getMuskSuggestionsForUser(userId: number): Promise<MuskSuggestion[]>;
  createMuskSuggestion(suggestion: InsertMuskSuggestion): Promise<MuskSuggestion>;
  updateMuskSuggestion(id: number, suggestion: Partial<MuskSuggestion>): Promise<MuskSuggestion | undefined>;
  deleteMuskSuggestion(id: number): Promise<boolean>;
  dismissMuskSuggestion(id: number): Promise<void>;
  markMuskSuggestionActionTaken(id: number): Promise<void>;
  
  // Musk Behavior Tracking operations
  createMuskBehaviorTracking(tracking: InsertMuskBehaviorTracking): Promise<MuskBehaviorTracking>;
  getMuskBehaviorTrackingByUser(userId: number): Promise<MuskBehaviorTracking[]>;
  
  // News Pulse operations
  createNewsPulse(article: NewsArticle, userId: number): Promise<Pulse>;
  getLatestNewsPulses(userId: number, limit?: number): Promise<Pulse[]>;
  generateNewsContent(article: NewsArticle): Promise<{ title: string, content: string, hashtags: string[] }>;
  
  // User Profile Intelligence operations
  getUserProfileIntelligence(userId: number): Promise<UserProfileIntelligence | undefined>;
  createUserProfileIntelligence(intelligence: InsertUserProfileIntelligence): Promise<UserProfileIntelligence>;
  updateUserProfileIntelligence(id: number, intelligence: Partial<UserProfileIntelligence>): Promise<UserProfileIntelligence | undefined>;
  
  // Behavior Heatmap operations
  getBehaviorHeatmapForUser(userId: number): Promise<BehaviorHeatmap[]>;
  createBehaviorHeatmap(heatmap: InsertBehaviorHeatmap): Promise<BehaviorHeatmap>;
  
  // Content Scoring operations
  getContentScoringByContentId(contentId: number): Promise<ContentScoring | undefined>;
  createContentScoring(scoring: InsertContentScoring): Promise<ContentScoring>;
  updateContentScoring(id: number, scoring: Partial<ContentScoring>): Promise<ContentScoring | undefined>;
  
  // Industry Trends Monitor operations
  getIndustryTrends(): Promise<IndustryTrendsMonitor[]>;
  getIndustryTrendsByIndustry(industry: string): Promise<IndustryTrendsMonitor[]>;
  createIndustryTrend(trend: InsertIndustryTrendsMonitor): Promise<IndustryTrendsMonitor>;
  
  // User Milestones operations
  getUserMilestones(userId: number): Promise<UserMilestones[]>;
  createUserMilestone(milestone: InsertUserMilestones): Promise<UserMilestones>;
  markUserMilestoneAcknowledged(id: number): Promise<UserMilestones | undefined>;
  
  // Smart Post Suggestions operations
  getSmartPostSuggestionsForUser(userId: number): Promise<SmartPostSuggestions[]>;
  createSmartPostSuggestion(suggestion: InsertSmartPostSuggestions): Promise<SmartPostSuggestions>;
  markSmartPostSuggestionUsed(id: number): Promise<SmartPostSuggestions | undefined>;
  
  // Musk Match operations
  getMuskMatchesByUserId(userId: number): Promise<MuskMatch[]>;
  getMuskMatchById(id: number): Promise<MuskMatch | undefined>;
  createMuskMatch(match: InsertMuskMatch): Promise<MuskMatch>;
  updateMuskMatch(id: number, match: Partial<MuskMatch>): Promise<MuskMatch | undefined>;
  deleteMuskMatch(id: number): Promise<boolean>;
  
  // Brand of the Day operations
  getBrandsOfTheDay(): Promise<BrandOfTheDay[]>;
  getBrandsOfTheDayByDate(date: Date): Promise<BrandOfTheDay[]>;
  getBrandOfTheDayById(id: number): Promise<BrandOfTheDay | undefined>;
  getBrandOfTheDayByIndustryAndDomain(industry: string, domain: string, date?: Date): Promise<BrandOfTheDay | undefined>;
  getBrandsOfTheDayByUserId(userId: number): Promise<BrandOfTheDay[]>;
  createBrandOfTheDay(brand: InsertBrandOfTheDay): Promise<BrandOfTheDay>;
  updateBrandOfTheDay(id: number, brand: Partial<BrandOfTheDay>): Promise<BrandOfTheDay | undefined>;
  markBrandOfTheDayAsShared(id: number): Promise<BrandOfTheDay | undefined>;
  calculateBrandValueScore(userId: number): Promise<{
    userId: number;
    brandValueScore: number;
    scoreBreakdown: {
      profileStrength: number;
      careerQuests: number;
      pulseActivity: number;
      portfolioProjects: number;
      engagement: number;
      muskUsage: number;
      consistency: number;
      badges: number;
    };
  }>;
  markMuskMatchAsRead(id: number): Promise<MuskMatch | undefined>;
  markMuskMatchAsDismissed(id: number): Promise<MuskMatch | undefined>;
  markMuskMatchAsConnected(id: number): Promise<MuskMatch | undefined>;
  getPendingMuskMatches(userId: number): Promise<MuskMatch[]>;
  
  // Brands of the Day operations
  getBrandsOfTheDay(): Promise<BrandOfTheDay[]>;
  getBrandsOfTheDayByDate(date: Date): Promise<BrandOfTheDay[]>;
  getBrandOfTheDayById(id: number): Promise<BrandOfTheDay | undefined>;
  getBrandOfTheDayByIndustryAndDomain(industry: string, domain: string, date: Date): Promise<BrandOfTheDay | undefined>;
  getBrandsOfTheDayByUserId(userId: number): Promise<BrandOfTheDay[]>;
  createBrandOfTheDay(brand: InsertBrandOfTheDay): Promise<BrandOfTheDay>;
  updateBrandOfTheDay(id: number, brand: Partial<BrandOfTheDay>): Promise<BrandOfTheDay | undefined>;
  markBrandOfTheDayAsShared(id: number): Promise<BrandOfTheDay | undefined>;
  calculateBrandValueScore(userId: number): Promise<{
    userId: number;
    brandValueScore: number;
    scoreBreakdown: {
      profileStrength: number;
      careerQuests: number;
      pulseActivity: number;
      portfolioProjects: number;
      engagement: number;
      muskUsage: number;
      consistency: number;
      badges: number;
    };
  }>;
  
  // Career Quests operations
  // Quest Definition operations
  getQuestDefinitions(): Promise<QuestDefinition[]>;
  getQuestDefinitionById(id: number): Promise<QuestDefinition | undefined>;
  getActiveQuestDefinitions(): Promise<QuestDefinition[]>;
  getQuestDefinitionsByType(type: string): Promise<QuestDefinition[]>;
  createQuestDefinition(quest: InsertQuestDefinition): Promise<QuestDefinition>;
  updateQuestDefinition(id: number, quest: Partial<QuestDefinition>): Promise<QuestDefinition | undefined>;
  deleteQuestDefinition(id: number): Promise<boolean>;
  
  // User Quest operations
  getUserQuestsByUserId(userId: number): Promise<UserQuest[]>;
  getUserQuestById(id: number): Promise<UserQuest | undefined>;
  getActiveUserQuests(userId: number): Promise<UserQuest[]>;
  getCompletedUserQuests(userId: number): Promise<UserQuest[]>;
  getCurrentWeekUserQuests(userId: number): Promise<UserQuest[]>;
  createUserQuest(quest: InsertUserQuest): Promise<UserQuest>;
  updateUserQuest(id: number, quest: Partial<UserQuest>): Promise<UserQuest | undefined>;
  completeUserQuest(id: number, earnedXp?: number): Promise<UserQuest | undefined>;
  dismissUserQuest(id: number, reason?: string): Promise<UserQuest | undefined>;
  incrementQuestProgress(id: number): Promise<UserQuest | undefined>;
  assignWeeklyQuestsToUser(userId: number): Promise<UserQuest[]>;
  
  // User XP operations
  getUserXp(userId: number): Promise<UserXp | undefined>;
  createUserXp(userXp: InsertUserXp): Promise<UserXp>;
  updateUserXp(id: number, userXp: Partial<UserXp>): Promise<UserXp | undefined>;
  incrementUserXp(userId: number, amount: number, source: string, sourceId?: number): Promise<{ 
    userXp: UserXp, 
    transaction: XpTransaction 
  }>;
  resetMonthlyXp(userId: number): Promise<UserXp | undefined>;
  
  // User Badge operations
  getUserBadges(userId: number): Promise<UserBadge[]>;
  getUserBadgeById(id: number): Promise<UserBadge | undefined>;
  getUserBadgesByType(userId: number, badgeType: string): Promise<UserBadge[]>;
  createUserBadge(badge: InsertUserBadge): Promise<UserBadge>;
  updateUserBadge(id: number, badge: Partial<UserBadge>): Promise<UserBadge | undefined>;
  toggleBadgeDisplay(id: number, displayOnProfile: boolean, displayOnResume: boolean): Promise<UserBadge | undefined>;
  
  // XP Transaction operations
  getXpTransactions(userId: number): Promise<XpTransaction[]>;
  getXpTransactionById(id: number): Promise<XpTransaction | undefined>;
  getXpTransactionsBySource(userId: number, source: string): Promise<XpTransaction[]>;
  createXpTransaction(transaction: InsertXpTransaction): Promise<XpTransaction>;
}

// In-memory implementation of the storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private workExperiences: Map<number, WorkExperience>;
  private educations: Map<number, Education>;
  private skills: Map<number, Skill>;
  private chatMessages: Map<number, ChatMessage>;
  private otpVerifications: Map<number, OtpVerification>;
  private emailVerifications: Map<number, EmailVerification>;
  private projects: Map<number, Project>;
  private projectCollaborators: Map<number, ProjectCollaborator>;
  private projectEndorsements: Map<number, ProjectEndorsement>;
  private portfolios: Map<number, Portfolio>;
  private hashtags: Map<number, Hashtag>;
  private pulseHashtags: Map<number, PulseHashtag>;
  private services: Map<number, Service>;
  private pulses: Map<number, Pulse>;
  private pulseComments: Map<number, PulseComment>;
  private pollVotes: Map<number, PollVote>;
  private userHashtagFollows: Map<number, UserHashtagFollow>;
  // New models for Industry Pulse Interaction System
  private pulseReactions: Map<number, PulseReaction>;
  private userReactionQuotas: Map<number, UserReactionQuota>;
  private pulseShares: Map<number, PulseShare>;
  // New models for News Pulse feature
  private newsSources: Map<number, NewsSource>;
  private newsArticles: Map<number, NewsArticle>;
  private newsUserPreferences: Map<number, NewsUserPreference>;
  // Musk Match feature
  private muskMatches: Map<number, MuskMatch>;
  // Brand of the Day feature
  private brandsOfTheDay: Map<number, BrandOfTheDay>;
  
  // Musk suggestion models
  private muskSuggestions: Map<number, MuskSuggestion>;
  private muskBehaviorTracking: Map<number, MuskBehaviorTracking>;
  // Enhanced Musk intelligence models
  private userProfileIntelligence: Map<number, UserProfileIntelligence>;
  private behaviorHeatmap: Map<number, BehaviorHeatmap>;
  private contentScoring: Map<number, ContentScoring>;
  private industryTrendsMonitor: Map<number, IndustryTrendsMonitor>;
  private userMilestones: Map<number, UserMilestones>;
  private smartPostSuggestions: Map<number, SmartPostSuggestions>;
  
  // Nowboard models
  private nowboardItems: Map<number, NowboardItem>;
  private nowboardInspiredBy: Map<number, NowboardInspiredBy>;
  
  // Career Quests models
  private questDefinitions: Map<number, QuestDefinition>;
  private userQuests: Map<number, UserQuest>;
  private userXp: Map<number, UserXp>;
  private userBadges: Map<number, UserBadge>;
  private xpTransactions: Map<number, XpTransaction>;
  
  private currentUserId: number;
  private currentResumeId: number;
  private currentWorkExperienceId: number;
  private currentEducationId: number;
  private currentSkillId: number;
  private currentChatMessageId: number;
  private currentOtpVerificationId: number;
  private currentEmailVerificationId: number;
  private currentProjectId: number;
  private currentProjectCollaboratorId: number;
  private currentProjectEndorsementId: number;
  private currentPortfolioId: number;
  private currentServiceId: number;
  private currentPulseId: number;
  private currentPulseCommentId: number;
  private currentPollVoteId: number;
  private currentHashtagId: number;
  private currentPulseHashtagId: number;
  private currentUserHashtagFollowId: number;
  // Pulse interaction system IDs
  private currentPulseReactionId: number;
  private currentUserReactionQuotaId: number;
  private currentPulseShareId: number;
  // New IDs for News Pulse feature
  private currentNewsSourceId: number;
  private currentNewsArticleId: number;
  private currentNewsUserPreferenceId: number;
  // Musk Match ID
  private currentMuskMatchId: number;
  // Musk suggestion IDs
  private currentMuskSuggestionId: number;
  private currentMuskBehaviorTrackingId: number;
  // Enhanced Musk intelligence IDs
  private currentUserProfileIntelligenceId: number;
  private currentBehaviorHeatmapId: number;
  private currentContentScoringId: number;
  private currentIndustryTrendsMonitorId: number;
  private currentUserMilestonesId: number;
  private currentSmartPostSuggestionsId: number;
  
  // Nowboard IDs
  private currentNowboardItemId: number;
  private currentNowboardInspiredById: number;
  
  // Career Quests IDs
  private currentQuestDefinitionId: number;
  private currentUserQuestId: number;
  private currentUserXpId: number;
  private currentUserBadgeId: number;
  private currentXpTransactionId: number;
  
  // Brand of the Day ID
  private currentBrandOfTheDayId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.workExperiences = new Map();
    this.educations = new Map();
    this.skills = new Map();
    this.chatMessages = new Map();
    this.otpVerifications = new Map();
    this.emailVerifications = new Map();
    this.projects = new Map();
    this.projectCollaborators = new Map();
    this.projectEndorsements = new Map();
    this.portfolios = new Map();
    this.services = new Map();
    this.pulses = new Map();
    this.pulseComments = new Map();
    this.pollVotes = new Map();
    this.hashtags = new Map();
    this.pulseHashtags = new Map();
    this.userHashtagFollows = new Map();
    // Initialize pulse interaction system maps
    this.pulseReactions = new Map();
    this.userReactionQuotas = new Map();
    this.pulseShares = new Map();
    // Initialize news maps
    this.newsSources = new Map();
    this.newsArticles = new Map();
    this.newsUserPreferences = new Map();
    
    // Initialize Nowboard maps
    this.nowboardItems = new Map();
    this.nowboardInspiredBy = new Map();
    
    // Initialize Musk Match map
    this.muskMatches = new Map();
    
    // Initialize Brand of the Day map
    this.brandsOfTheDay = new Map();
    
    // Initialize Career Quests maps
    this.questDefinitions = new Map();
    this.userQuests = new Map();
    this.userXp = new Map();
    this.userBadges = new Map();
    this.xpTransactions = new Map();
    
    // Initialize Musk suggestion maps
    this.muskSuggestions = new Map();
    this.muskBehaviorTracking = new Map();
    
    // Initialize enhanced Musk intelligence maps
    this.userProfileIntelligence = new Map();
    this.behaviorHeatmap = new Map();
    this.contentScoring = new Map();
    this.industryTrendsMonitor = new Map();
    this.userMilestones = new Map();
    this.smartPostSuggestions = new Map();
    
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentWorkExperienceId = 1;
    this.currentEducationId = 1;
    this.currentSkillId = 1;
    this.currentChatMessageId = 1;
    this.currentOtpVerificationId = 1;
    this.currentEmailVerificationId = 1;
    this.currentProjectId = 1;
    this.currentProjectCollaboratorId = 1;
    this.currentProjectEndorsementId = 1;
    this.currentPortfolioId = 1;
    this.currentServiceId = 1;
    this.currentPulseId = 1;
    this.currentPulseCommentId = 1;
    this.currentPollVoteId = 1;
    this.currentHashtagId = 1;
    this.currentPulseHashtagId = 1;
    this.currentUserHashtagFollowId = 1;
    // Initialize pulse interaction system IDs
    this.currentPulseReactionId = 1;
    this.currentUserReactionQuotaId = 1; 
    this.currentPulseShareId = 1;
    // Initialize news IDs
    this.currentNewsSourceId = 1;
    this.currentNewsArticleId = 1;
    this.currentNewsUserPreferenceId = 1;
    // Initialize Musk Match ID
    this.currentMuskMatchId = 1;
    // Initialize Musk suggestion IDs
    this.currentMuskSuggestionId = 1;
    this.currentMuskBehaviorTrackingId = 1;
    // Initialize enhanced Musk intelligence IDs
    this.currentUserProfileIntelligenceId = 1;
    this.currentBehaviorHeatmapId = 1;
    this.currentContentScoringId = 1;
    this.currentIndustryTrendsMonitorId = 1;
    this.currentUserMilestonesId = 1;
    this.currentSmartPostSuggestionsId = 1;
    
    // Initialize Nowboard IDs
    this.currentNowboardItemId = 1;
    this.currentNowboardInspiredById = 1;
    
    // Initialize Career Quests IDs
    this.currentQuestDefinitionId = 1;
    this.currentUserQuestId = 1;
    this.currentUserXpId = 1;
    this.currentUserBadgeId = 1;
    this.currentXpTransactionId = 1;
    
    // Initialize Brand of the Day ID
    this.currentBrandOfTheDayId = 1;
    
    // Demo data initialization removed
  }
  /**
   * Initialize demo data function removed
   */
  private initializeDemoDataRemoved() {
    // This function has been intentionally emptied
  }
  /**
   * Demo data reinitialization function removed
   */
  async reinitializeDemoDataRemoved(): Promise<void> {
    // This function has been intentionally emptied
  }

/**
   * Clear all work experience, education, skills, project, portfolio, and service data
   */
  private clearDemoDataMaps(): void {
    // Clear all existing work experiences
    this.workExperiences.clear();
    
    // Clear all existing education
    this.educations.clear();
    
    // Clear all existing skills
    this.skills.clear();
    
    // Clear all existing projects
    this.projects.clear();
    
    // Clear all existing project collaborators
    this.projectCollaborators.clear();
    
    // Clear all existing project endorsements
    this.projectEndorsements.clear();
    
    // Clear all existing portfolios
    this.portfolios.clear();
    
    // Clear all existing services
    this.services.clear();
    
    // Clear all Career Quests data
    this.questDefinitions.clear();
    this.userQuests.clear();
    this.userXp.clear();
    this.userBadges.clear();
    this.xpTransactions.clear();
    
    // Clear all existing pulses
    this.pulses.clear();
    
    // Clear all existing pulse comments
    this.pulseComments.clear();
    
    // Clear all existing poll votes
    this.pollVotes.clear();
    
    // Clear all existing hashtags
    this.hashtags.clear();
    
    // Clear all existing pulse hashtags
    this.pulseHashtags.clear();
    
    // Clear all user hashtag follows
    this.userHashtagFollows.clear();
    
    // Clear all pulse reactions
    this.pulseReactions.clear();
    
    // Clear all user reaction quotas
    this.userReactionQuotas.clear();
    
    // Clear all pulse shares
    this.pulseShares.clear();
    
    // Clear all news sources
    this.newsSources.clear();
    
    // Clear all news articles
    this.newsArticles.clear();
    
    // Clear all news user preferences
    this.newsUserPreferences.clear();
    
    // Clear all Musk matches
    this.muskMatches.clear();
    
    // Clear all Brands of the Day
    this.brandsOfTheDay.clear();
    
    // Clear all Musk suggestions
    this.muskSuggestions.clear();
    
    // Clear all Musk behavior tracking
    this.muskBehaviorTracking.clear();
    
    // Clear all enhanced Musk intelligence data
    this.userProfileIntelligence.clear();
    this.behaviorHeatmap.clear();
    this.contentScoring.clear();
    this.industryTrendsMonitor.clear();
    this.userMilestones.clear();
    this.smartPostSuggestions.clear();
    
    // Clear all Nowboard data
    this.nowboardItems.clear();
    this.nowboardInspiredBy.clear();
  }
  
  /**
   * Clears all work experience data for a user
   * Used for debugging and resetting demo data
   */
  async clearUserWorkExperiences(userId: number): Promise<number> {
    let deleted = 0;
    const entries = Array.from(this.workExperiences.entries());
    
    for (const [id, exp] of entries) {
      if (exp.userId === userId) {
        this.workExperiences.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    console.log(`[db.getUser] Looking up user with ID: ${id}`);
    try {
      // Using explicit column names instead of SELECT * to ensure proper mapping
      const query = `
        SELECT id, username, email, password, phone_number as "phoneNumber", 
        name, photo_url as "photoURL", title, about_me as "aboutMe", 
        location, industry, domain, looking_for as "lookingFor", 
        visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
        email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
        email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
        FROM users WHERE id = $1
      `;
      
      console.log(`[db.getUser] Executing query: ${query} with params [${id}]`);
      const result = await pool.query(query, [id]);
      
      console.log(`[db.getUser] Query returned ${result.rows.length} rows:`, JSON.stringify(result.rows, null, 2));
      
      if (result.rows.length === 0) {
        console.log(`[db.getUser] No user found with ID: ${id}`);
        return undefined;
      }
      
      // Get the user from the result
      const user = result.rows[0];
      console.log(`[db.getUser] User found:`, user);
      console.log(`[db.getUser] Domain value specifically:`, user.domain);
      
      // If domain is missing from the user object but exists in the database, query it explicitly
      if (!user.domain) {
        console.log(`[db.getUser] Domain is missing, querying it explicitly`);
        try {
          const domainQuery = `SELECT domain FROM users WHERE id = $1`;
          const domainResult = await pool.query(domainQuery, [id]);
          
          if (domainResult.rows.length > 0 && domainResult.rows[0].domain) {
            user.domain = domainResult.rows[0].domain;
            console.log(`[db.getUser] Added domain explicitly:`, user.domain);
          }
        } catch (error) {
          console.error(`[db.getUser] Error fetching domain:`, error);
        }
      }
      
      return user as User;
      
      console.log(`[db.getUser] Found user with ID: ${id}`);
      return user;
    } catch (error) {
      console.error(`[db.getUser] Error fetching user with ID ${id}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Using explicit column names instead of SELECT * to ensure proper mapping
      const query = `
        SELECT id, username, email, password, phone_number as "phoneNumber", 
        name, photo_url as "photoURL", title, about_me as "aboutMe", 
        location, industry, domain, looking_for as "lookingFor", 
        visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
        email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
        email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
        FROM users WHERE email = $1
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Looking up user by username: ${username}`);
    
    try {
      // Using explicit column names instead of SELECT * to ensure proper mapping
      const query = `
        SELECT id, username, email, password, phone_number as "phoneNumber", 
        name, photo_url as "photoURL", title, about_me as "aboutMe", 
        location, industry, domain, looking_for as "lookingFor", 
        visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
        email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
        email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
        FROM users WHERE username = $1
      `;
      
      const result = await pool.query(query, [username]);
      
      if (result.rows.length === 0) {
        // Check if this is a Firebase UID and warn about it
        if (username && username.length > 20) {
          console.warn(`Firebase UID not found: ${username}. This is likely a Firebase UID that hasn't been properly registered.`);
        }
        return undefined;
      }
      
      const user = result.rows[0] as User;
      console.log(`Found user with username "${username}":`, user);
      console.log(`[getUserByUsername] Domain value specifically:`, user.domain);
      
      // If domain is missing, fetch it explicitly
      if (!user.domain) {
        console.log(`[getUserByUsername] Domain is missing, querying it explicitly`);
        try {
          const domainQuery = `SELECT domain FROM users WHERE id = $1`;
          const domainResult = await pool.query(domainQuery, [user.id]);
          
          if (domainResult.rows.length > 0 && domainResult.rows[0].domain) {
            user.domain = domainResult.rows[0].domain;
            console.log(`[getUserByUsername] Added domain explicitly:`, user.domain);
          }
        } catch (error) {
          console.error(`[getUserByUsername] Error fetching domain:`, error);
        }
      }
      
      return user;
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      return undefined;
    }
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    
    // Ensure all nullable fields have explicit null values instead of undefined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      password: insertUser.password ?? null,
      phoneNumber: insertUser.phoneNumber ?? null,
      name: insertUser.name ?? null,
      photoURL: insertUser.photoURL ?? null,
      title: insertUser.title ?? null,
      aboutMe: insertUser.aboutMe ?? null,
      location: insertUser.location ?? null,
      industry: insertUser.industry ?? null,
      domain: insertUser.domain ?? null,
      lookingFor: insertUser.lookingFor ?? null,
      visitingCardType: insertUser.visitingCardType ?? null,
      profileCompleted: insertUser.profileCompleted ?? null,
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null
    };
    
    this.users.set(id, user);
    return user;
  }

  // This method is now inactive as we use DatabaseStorage implementation
  // It remains here for historical purposes only and to avoid breaking any imports
  // All user updates should go through the DatabaseStorage.updateUser method
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    console.log('[WARNING] MemStorage.updateUser called but database is being used. Use DatabaseStorage.updateUser instead.');
    // Delegate to the real implementation
    return storage.updateUser(id, userData);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Resume operations
  async getResumeByUserId(userId: number): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(resume => resume.userId === userId);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const uploadedAt = new Date();
    const resume: Resume = { 
      ...insertResume, 
      id, 
      uploadedAt,
      score: insertResume.score ?? null 
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  // Work Experience operations
  async getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]> {
    try {
      const result = await pool.query('SELECT * FROM work_experiences WHERE user_id = $1', [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        company: row.company,
        location: row.location,
        industry: row.industry,
        startDate: row.start_date,
        endDate: row.end_date,
        description: row.description
      }));
    } catch (error) {
      console.error(`Error fetching work experiences for user ${userId}:`, error);
      return [];
    }
  }

  async createWorkExperience(insertExperience: InsertWorkExperience): Promise<WorkExperience> {
    const id = this.currentWorkExperienceId++;
    const experience: WorkExperience = { 
      ...insertExperience, 
      id,
      location: insertExperience.location ?? null,
      industry: insertExperience.industry ?? null,
      domain: insertExperience.domain ?? null,
      endDate: insertExperience.endDate ?? null,
      description: insertExperience.description ?? null
    };
    this.workExperiences.set(id, experience);
    return experience;
  }

  async updateWorkExperience(id: number, experienceData: Partial<WorkExperience>): Promise<WorkExperience | undefined> {
    const experience = this.workExperiences.get(id);
    if (!experience) return undefined;
    
    const updatedExperience = { ...experience, ...experienceData };
    this.workExperiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteWorkExperience(id: number): Promise<boolean> {
    return this.workExperiences.delete(id);
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    return Array.from(this.educations.values())
      .filter(education => education.userId === userId);
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = this.currentEducationId++;
    const education: Education = { 
      ...insertEducation, 
      id,
      location: insertEducation.location ?? null,
      endDate: insertEducation.endDate ?? null
    };
    this.educations.set(id, education);
    return education;
  }

  async updateEducation(id: number, educationData: Partial<Education>): Promise<Education | undefined> {
    const education = this.educations.get(id);
    if (!education) return undefined;
    
    const updatedEducation = { ...education, ...educationData };
    this.educations.set(id, updatedEducation);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    return this.educations.delete(id);
  }

  // Skill operations
  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    try {
      const result = await pool.query('SELECT * FROM skills WHERE user_id = $1', [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        level: row.level,
        proficiency: row.proficiency
      }));
    } catch (error) {
      console.error(`Error fetching skills for user ${userId}:`, error);
      return [];
    }
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const skill: Skill = { 
      ...insertSkill, 
      id,
      proficiency: insertSkill.proficiency ?? null
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Chat Message operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => {
        // Handle null timestamps safely (shouldn't happen, but TypeScript is strict)
        const timeA = a.timestamp ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.getTime() : 0;
        return timeA - timeB;
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const timestamp = new Date();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp,
      messageType: insertMessage.messageType ?? null
    };
    this.chatMessages.set(id, message);
    return message;
  }
  
  async deleteChatMessagesByType(userId: number, messageType: string): Promise<number> {
    let deletedCount = 0;
    
    // Get all messages
    const allMessages = Array.from(this.chatMessages.entries());
    
    // Filter messages by userId and messageType
    for (const [id, message] of allMessages) {
      if (message.userId === userId && message.messageType === messageType) {
        // Delete the message
        this.chatMessages.delete(id);
        deletedCount++;
      }
    }
    
    console.log(`[deleteChatMessagesByType] Deleted ${deletedCount} messages of type '${messageType}' for user ${userId}`);
    return deletedCount;
  }
  
  // OTP Verification operations
  async createOtpVerification(insertVerification: InsertOtpVerification): Promise<OtpVerification> {
    // First, check if there's an existing verification for this phone number
    const existingVerification = await this.getOtpVerificationByPhoneNumber(insertVerification.phoneNumber);
    
    // If there is, update it instead of creating a new one
    if (existingVerification) {
      const updatedVerification: OtpVerification = {
        ...existingVerification,
        otp: insertVerification.otp,
        expiresAt: insertVerification.expiresAt,
        verified: false,
        createdAt: new Date()
      };
      this.otpVerifications.set(existingVerification.id, updatedVerification);
      return updatedVerification;
    }
    
    // Otherwise, create a new verification
    const id = this.currentOtpVerificationId++;
    const createdAt = new Date();
    const verification: OtpVerification = {
      ...insertVerification,
      id,
      verified: false,
      createdAt
    };
    
    this.otpVerifications.set(id, verification);
    return verification;
  }
  
  async getOtpVerificationByPhoneNumber(phoneNumber: string): Promise<OtpVerification | undefined> {
    return Array.from(this.otpVerifications.values())
      .find(verification => verification.phoneNumber === phoneNumber);
  }
  
  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    console.log(`[storage] verifyOtp: Verifying ${phoneNumber} with OTP ${otp}`);
    
    const verification = await this.getOtpVerificationByPhoneNumber(phoneNumber);
    if (!verification) {
      console.log(`[storage] verifyOtp: No verification found for ${phoneNumber}`);
      return false;
    }
    
    console.log(`[storage] verifyOtp: Found verification:`, verification);
    
    // Check if the OTP has expired using the expiresAt field
    const now = new Date();
    if (now > verification.expiresAt) {
      console.log(`[storage] verifyOtp: OTP expired. Current time: ${now}, Expires at: ${verification.expiresAt}`);
      return false;
    }
    
    // Check if the OTP matches
    if (verification.otp !== otp) {
      console.log(`[storage] verifyOtp: OTP mismatch. Expected: ${verification.otp}, Received: ${otp}`);
      return false;
    }
    
    console.log(`[storage] verifyOtp: OTP validated successfully`);
    
    // Mark the verification as verified
    const updatedVerification: OtpVerification = {
      ...verification,
      verified: true
    };
    this.otpVerifications.set(verification.id, updatedVerification);
    
    return true;
  }
  
  // Email Verification operations
  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    // First, check if there's an existing verification for this email
    const existingVerification = await this.getEmailVerificationByEmail(insertVerification.email);
    
    // If there is, update it instead of creating a new one
    if (existingVerification) {
      const updatedVerification: EmailVerification = {
        ...existingVerification,
        token: insertVerification.token,
        expiresAt: insertVerification.expiresAt,
        verified: false,
        createdAt: new Date()
      };
      this.emailVerifications.set(existingVerification.id, updatedVerification);
      return updatedVerification;
    }
    
    // Otherwise, create a new verification
    const id = this.currentEmailVerificationId++;
    const createdAt = new Date();
    const verification: EmailVerification = {
      ...insertVerification,
      id,
      verified: false,
      createdAt
    };
    
    this.emailVerifications.set(id, verification);
    return verification;
  }
  
  async getEmailVerificationByEmail(email: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values())
      .find(verification => verification.email === email);
  }
  
  async getEmailVerificationByToken(token: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values())
      .find(verification => verification.token === token);
  }
  
  async updateEmailVerification(id: number, verificationData: Partial<EmailVerification>): Promise<EmailVerification | undefined> {
    const verification = this.emailVerifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification = { ...verification, ...verificationData };
    this.emailVerifications.set(id, updatedVerification);
    return updatedVerification;
  }
  
  async verifyEmail(email: string, token: string): Promise<boolean> {
    console.log(`[storage] verifyEmail: Verifying ${email} with token ${token}`);
    
    const verification = await this.getEmailVerificationByEmail(email);
    if (!verification) {
      console.log(`[storage] verifyEmail: No verification found for ${email}`);
      return false;
    }
    
    console.log(`[storage] verifyEmail: Found verification:`, verification);
    
    // Check if the token has expired using the expiresAt field
    const now = new Date();
    if (now > verification.expiresAt) {
      console.log(`[storage] verifyEmail: Token expired. Current time: ${now}, Expires at: ${verification.expiresAt}`);
      return false;
    }
    
    // Check if the token matches
    if (verification.token !== token) {
      console.log(`[storage] verifyEmail: Token mismatch. Expected: ${verification.token}, Received: ${token}`);
      return false;
    }
    
    console.log(`[storage] verifyEmail: Token validated successfully`);
    
    // Mark the verification as verified
    const updatedVerification: EmailVerification = {
      ...verification,
      verified: true
    };
    this.emailVerifications.set(verification.id, updatedVerification);
    
    // Also update the user's emailVerified status
    const user = await this.getUserByEmail(email);
    if (user) {
      await this.updateUser(user.id, { 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });
    }
    
    return true;
  }
  
  // Project operations
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId);
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const project: Project = {
      ...insertProject,
      id,
      createdAt,
      updatedAt,
      mediaUrls: insertProject.mediaUrls ?? [],
      description: insertProject.description ?? null,
      startDate: insertProject.startDate ?? null,
      projectUrl: insertProject.projectUrl ?? null,
      thumbnailUrl: insertProject.thumbnailUrl ?? null,
      thumbnailFile: insertProject.thumbnailFile ?? null,
      category: insertProject.category ?? null
    };
    
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedAt = new Date();
    const updatedProject = { ...project, ...projectData, updatedAt };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // When deleting a project, we should also delete all related collaborators and endorsements
    
    // First, delete all collaborators
    const collaborators = await this.getProjectCollaboratorsByProjectId(id);
    for (const collaborator of collaborators) {
      await this.deleteProjectCollaborator(collaborator.id);
    }
    
    // Then, delete all endorsements
    const endorsements = await this.getProjectEndorsementsByProjectId(id);
    for (const endorsement of endorsements) {
      await this.deleteProjectEndorsement(endorsement.id);
    }
    
    // Finally, delete the project itself
    return this.projects.delete(id);
  }
  
  // Project Collaborator operations
  async getProjectCollaboratorsByProjectId(projectId: number): Promise<ProjectCollaborator[]> {
    return Array.from(this.projectCollaborators.values())
      .filter(collaborator => collaborator.projectId === projectId);
  }
  
  async getProjectCollaboratorById(id: number): Promise<ProjectCollaborator | undefined> {
    return this.projectCollaborators.get(id);
  }
  
  async createProjectCollaborator(insertCollaborator: InsertProjectCollaborator): Promise<ProjectCollaborator> {
    const id = this.currentProjectCollaboratorId++;
    const createdAt = new Date();
    
    const collaborator: ProjectCollaborator = {
      ...insertCollaborator,
      id,
      createdAt,
      inviteStatus: 'Pending',
      inviteToken: null,
      inviteExpires: null,
      email: insertCollaborator.email ?? null,
      userId: insertCollaborator.userId ?? null,
      name: insertCollaborator.name || 'Team Member', // Use default if not provided
      role: insertCollaborator.role ?? 'Contributor'
    };
    
    this.projectCollaborators.set(id, collaborator);
    return collaborator;
  }
  
  async updateProjectCollaborator(id: number, collaboratorData: Partial<ProjectCollaborator>): Promise<ProjectCollaborator | undefined> {
    const collaborator = this.projectCollaborators.get(id);
    if (!collaborator) return undefined;
    
    const updatedCollaborator = { ...collaborator, ...collaboratorData };
    this.projectCollaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }
  
  async deleteProjectCollaborator(id: number): Promise<boolean> {
    return this.projectCollaborators.delete(id);
  }
  
  // Project Endorsement operations
  async getProjectEndorsementsByProjectId(projectId: number): Promise<ProjectEndorsement[]> {
    return Array.from(this.projectEndorsements.values())
      .filter(endorsement => endorsement.projectId === projectId);
  }
  
  async getProjectEndorsementById(id: number): Promise<ProjectEndorsement | undefined> {
    return this.projectEndorsements.get(id);
  }
  
  async createProjectEndorsement(insertEndorsement: InsertProjectEndorsement): Promise<ProjectEndorsement> {
    const id = this.currentProjectEndorsementId++;
    const createdAt = new Date();
    
    const endorsement: ProjectEndorsement = {
      ...insertEndorsement,
      id,
      createdAt,
      message: insertEndorsement.message ?? null,
      clientEmail: insertEndorsement.clientEmail ?? null,
      clientTitle: insertEndorsement.clientTitle ?? null,
      clientCompany: insertEndorsement.clientCompany ?? null,
      rating: insertEndorsement.rating ?? null,
      isVerified: false,
      verificationToken: null,
      verificationExpires: null
    };
    
    this.projectEndorsements.set(id, endorsement);
    return endorsement;
  }
  
  async updateProjectEndorsement(id: number, endorsementData: Partial<ProjectEndorsement>): Promise<ProjectEndorsement | undefined> {
    const endorsement = this.projectEndorsements.get(id);
    if (!endorsement) return undefined;
    
    const updatedEndorsement = { ...endorsement, ...endorsementData };
    this.projectEndorsements.set(id, updatedEndorsement);
    return updatedEndorsement;
  }
  
  async deleteProjectEndorsement(id: number): Promise<boolean> {
    return this.projectEndorsements.delete(id);
  }

  // Portfolio operations
  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values())
      .find(portfolio => portfolio.userId === userId);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const createdAt = new Date();
    const portfolio: Portfolio = {
      id,
      userId: insertPortfolio.userId,
      layout: insertPortfolio.layout || "professional", // Default to professional if not specified
      createdAt,
      updatedAt: createdAt,
      isPublished: insertPortfolio.isPublished ?? false,
      customTitle: insertPortfolio.customTitle ?? null,
      customBio: insertPortfolio.customBio ?? null,
      publicUrl: insertPortfolio.publicUrl ?? null,
      customizationOptions: insertPortfolio.customizationOptions ?? {},
      featuredProjects: insertPortfolio.featuredProjects ?? [],
      featuredSkills: insertPortfolio.featuredSkills ?? [],
      featuredExperiences: insertPortfolio.featuredExperiences ?? []
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, portfolioData: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    
    const updatedPortfolio = { 
      ...portfolio, 
      ...portfolioData,
      updatedAt: new Date() 
    };
    this.portfolios.set(id, updatedPortfolio);
    return updatedPortfolio;
  }

  async deletePortfolio(id: number): Promise<boolean> {
    return this.portfolios.delete(id);
  }
  
  // Service operations
  async getServicesByUserId(userId: number): Promise<Service[]> {
    console.log(`[storage.getServicesByUserId] Looking for services with userId: ${userId}`);
    console.log(`[storage.getServicesByUserId] Total services in database: ${this.services.size}`);
    
    // Convert to array and filter
    let userServices = Array.from(this.services.values())
      .filter(service => service.userId === userId);
    
    // If no services found and this is user 1 (demo/test user), create demo services
    if (userServices.length === 0 && userId === 1) {
      console.log(`[storage.getServicesByUserId] Creating demo services for userId: ${userId}`);
      
      // Create demo services
      const demoServices: Service[] = [
        {
          id: Date.now(),
          userId: 1,
          title: "Web Application Development",
          description: "Full-stack web application development using modern JavaScript frameworks.",
          category: "Development",
          price: "100",
          currency: "USD",
          duration: "1",
          durationType: "hour",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: Date.now() + 1,
          userId: 1,
          title: "Technical Consulting",
          description: "Expert advice on architecture, technology selection, and development best practices.",
          category: "Consulting",
          price: "150",
          currency: "USD",
          duration: "1",
          durationType: "hour",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: Date.now() + 2,
          userId: 1,
          title: "Code Review & Optimization",
          description: "Thorough code review with performance optimization recommendations.",
          category: "Development",
          price: "75",
          currency: "USD",
          duration: "30",
          durationType: "minutes",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Add demo services to the Map
      demoServices.forEach(service => {
        this.services.set(service.id, service);
      });
      
      // Update userServices
      userServices = demoServices;
      
      console.log(`[storage.getServicesByUserId] Created ${demoServices.length} demo services for userId: ${userId}`);
    }
    
    console.log(`[storage.getServicesByUserId] Found ${userServices.length} services for userId: ${userId}`);
    if (userServices.length > 0) {
      console.log(`[storage.getServicesByUserId] First service: ${JSON.stringify(userServices[0])}`);
    }
    
    return userServices;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    console.log(`[storage.createService] Creating service with data:`, JSON.stringify(insertService, null, 2));
    
    // Validate and normalize price values before database insertion
    const normalizedInsert = { 
      ...insertService,
      // Set defaults if not provided
      category: insertService.category ?? "other",
      isHourly: insertService.isHourly ?? false,
      features: insertService.features ?? [],
      order: insertService.order ?? 0,
      isActive: insertService.isActive ?? true
    };
    
    // Ensure price fields are properly formatted for the database
    if (normalizedInsert.priceInr !== undefined) {
      if (normalizedInsert.priceInr === null || normalizedInsert.priceInr === '') {
        normalizedInsert.priceInr = null;
      } else if (typeof normalizedInsert.priceInr === 'string') {
        const parsed = parseFloat(normalizedInsert.priceInr);
        normalizedInsert.priceInr = isNaN(parsed) ? null : parsed;
      } else if (typeof normalizedInsert.priceInr === 'number') {
        // Ensure it's a valid number and round to 2 decimal places
        if (isNaN(normalizedInsert.priceInr) || !isFinite(normalizedInsert.priceInr)) {
          normalizedInsert.priceInr = null;
        } else {
          normalizedInsert.priceInr = Math.round(normalizedInsert.priceInr * 100) / 100;
        }
      }
    }
    
    if (normalizedInsert.priceUsd !== undefined) {
      if (normalizedInsert.priceUsd === null || normalizedInsert.priceUsd === '') {
        normalizedInsert.priceUsd = null;
      } else if (typeof normalizedInsert.priceUsd === 'string') {
        const parsed = parseFloat(normalizedInsert.priceUsd);
        normalizedInsert.priceUsd = isNaN(parsed) ? null : parsed;
      } else if (typeof normalizedInsert.priceUsd === 'number') {
        // Ensure it's a valid number and round to 2 decimal places
        if (isNaN(normalizedInsert.priceUsd) || !isFinite(normalizedInsert.priceUsd)) {
          normalizedInsert.priceUsd = null;
        } else {
          normalizedInsert.priceUsd = Math.round(normalizedInsert.priceUsd * 100) / 100;
        }
      }
    }
    
    console.log(`[storage.createService] Normalized service data:`, JSON.stringify(normalizedInsert, null, 2));
    
    try {
      const [service] = await db.insert(services).values(normalizedInsert).returning();
      console.log(`[storage.createService] Successfully created service with ID ${service.id}`);
      return service;
    } catch (error) {
      console.error(`[storage.createService] Error creating service:`, error);
      // If database insert fails, fall back to memory storage for development
      const id = this.currentServiceId++;
      const createdAt = new Date();
      const service: Service = {
        id,
        userId: normalizedInsert.userId,
        title: normalizedInsert.title,
        description: normalizedInsert.description ?? null,
        category: normalizedInsert.category,
        priceInr: normalizedInsert.priceInr,
        priceUsd: normalizedInsert.priceUsd,
        isHourly: normalizedInsert.isHourly,
        features: normalizedInsert.features,
        imageUrl: normalizedInsert.imageUrl ?? null,
        order: normalizedInsert.order,
        isActive: normalizedInsert.isActive,
        createdAt,
        updatedAt: createdAt
      };
      this.services.set(id, service);
      console.log(`[storage.createService] Fallback to memory storage with ID ${id}`);
      return service;
    }
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    console.log(`[storage.updateService] Updating service with ID ${id} with data:`, JSON.stringify(serviceData, null, 2));
    
    // Get the existing service first
    try {
      const existingService = await db
        .select()
        .from(services)
        .where(eq(services.id, id))
        .then(rows => rows[0]);
        
      if (!existingService) {
        console.log(`[storage.updateService] Service with ID ${id} not found in database`);
        
        // Fall back to memory storage for development
        const service = this.services.get(id);
        if (!service) {
          console.log(`[storage.updateService] Service with ID ${id} not found in memory storage either`);
          return undefined;
        }
        
        const updatedService = { ...service, ...serviceData };
        this.services.set(id, updatedService);
        return updatedService;
      }
      
      // Normalize and validate price values
      const normalizedData = { ...serviceData };
      
      // Handle price fields just like in createService
      if (normalizedData.priceInr !== undefined) {
        if (normalizedData.priceInr === null || normalizedData.priceInr === '') {
          normalizedData.priceInr = null;
        } else if (typeof normalizedData.priceInr === 'string') {
          const parsed = parseFloat(normalizedData.priceInr);
          normalizedData.priceInr = isNaN(parsed) ? null : parsed;
        } else if (typeof normalizedData.priceInr === 'number') {
          if (isNaN(normalizedData.priceInr) || !isFinite(normalizedData.priceInr)) {
            normalizedData.priceInr = null;
          } else {
            normalizedData.priceInr = Math.round(normalizedData.priceInr * 100) / 100;
          }
        }
      }
      
      if (normalizedData.priceUsd !== undefined) {
        if (normalizedData.priceUsd === null || normalizedData.priceUsd === '') {
          normalizedData.priceUsd = null;
        } else if (typeof normalizedData.priceUsd === 'string') {
          const parsed = parseFloat(normalizedData.priceUsd);
          normalizedData.priceUsd = isNaN(parsed) ? null : parsed;
        } else if (typeof normalizedData.priceUsd === 'number') {
          if (isNaN(normalizedData.priceUsd) || !isFinite(normalizedData.priceUsd)) {
            normalizedData.priceUsd = null;
          } else {
            normalizedData.priceUsd = Math.round(normalizedData.priceUsd * 100) / 100;
          }
        }
      }
      
      console.log(`[storage.updateService] Normalized data:`, JSON.stringify(normalizedData, null, 2));
      
      // Update in database
      const [updatedService] = await db
        .update(services)
        .set({
          ...normalizedData,
          updatedAt: new Date()
        })
        .where(eq(services.id, id))
        .returning();
        
      console.log(`[storage.updateService] Successfully updated service with ID ${id}`);
      
      // Also update in memory storage for backward compatibility
      const memService = this.services.get(id);
      if (memService) {
        this.services.set(id, { ...memService, ...normalizedData, updatedAt: new Date() });
      }
      
      return updatedService;
    } catch (error) {
      console.error(`[storage.updateService] Error updating service with ID ${id}:`, error);
      
      // Fall back to memory storage
      const service = this.services.get(id);
      if (!service) return undefined;
      
      const updatedService = { ...service, ...serviceData, updatedAt: new Date() };
      this.services.set(id, updatedService);
      console.log(`[storage.updateService] Fallback to memory storage for service ID ${id}`);
      
      return updatedService;
    }
  }

  async deleteService(id: number): Promise<boolean> {
    console.log(`[storage.deleteService] Deleting service with ID ${id}`);
    
    try {
      // First try to delete from database
      const result = await db
        .delete(services)
        .where(eq(services.id, id))
        .returning();
      
      const deleted = result.length > 0;
      console.log(`[storage.deleteService] Service with ID ${id} deleted from database: ${deleted}`);
      
      // Also delete from memory storage for backward compatibility
      this.services.delete(id);
      
      return deleted;
    } catch (error) {
      console.error(`[storage.deleteService] Error deleting service with ID ${id}:`, error);
      
      // Fall back to memory storage
      const deleted = this.services.delete(id);
      console.log(`[storage.deleteService] Fallback to memory storage for service ID ${id}, deleted: ${deleted}`);
      
      return deleted;
    }
  }
  
  /**
   * Create demo pulses for testing carousel/image gallery functionality
   */
  /**
   * Create demo pulses function removed
   */
  private createDemoPulsesRemoved(userId: number): void {
    // This function has been intentionally emptied
  }

/**
   * Create demo Nowboard items for testing
   */
  /**
   * Create demo nowboard items function removed
   */
  private createDemoNowboardItemsRemoved(userId: number): void {
    // This function has been intentionally emptied
  }

// Pulse operations
  async getPulses(): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async getPulsesByUserId(userId: number): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .filter(pulse => pulse.userId === userId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async getPulseById(id: number): Promise<Pulse | undefined> {
    return this.pulses.get(id);
  }
  
  async createPulse(insertPulse: InsertPulse): Promise<Pulse> {
    const id = this.currentPulseId++;
    const createdAt = new Date();
    
    const pulse: Pulse = {
      id,
      userId: insertPulse.userId,
      type: insertPulse.type,
      title: insertPulse.title,
      content: insertPulse.content ?? null,
      mediaType: insertPulse.mediaType ?? null,
      mediaUrls: insertPulse.mediaUrls ?? [],
      mediaLocalStorageKeys: insertPulse.mediaLocalStorageKeys ?? [],
      pollOptions: insertPulse.pollOptions ?? [],
      projectId: insertPulse.projectId ?? null,
      likes: 0,
      insightfulCount: 0,
      misinformedCount: 0,
      shareCount: 0,
      comments: 0,
      isPublished: insertPulse.isPublished ?? true,
      createdAt,
      updatedAt: createdAt
    };
    
    this.pulses.set(id, pulse);
    
    // Extract and save hashtags from the content/description
    if (insertPulse.content) {
      await this.extractAndSaveHashtags(insertPulse.content, id);
    }
    
    return pulse;
  }
  
  async updatePulse(id: number, pulseData: Partial<Pulse>): Promise<Pulse | undefined> {
    const pulse = this.pulses.get(id);
    if (!pulse) return undefined;
    
    const updatedAt = new Date();
    const updatedPulse = { 
      ...pulse, 
      ...pulseData,
      updatedAt 
    };
    
    this.pulses.set(id, updatedPulse);
    
    // If the content was updated, extract and save new hashtags
    if (pulseData.content && pulseData.content !== pulse.content) {
      await this.extractAndSaveHashtags(pulseData.content, id);
    }
    
    return updatedPulse;
  }
  
  async deletePulse(id: number): Promise<boolean> {
    // First, delete all comments for this pulse
    const commentsToDelete = Array.from(this.pulseComments.entries())
      .filter(([_, comment]) => comment.pulseId === id)
      .map(([commentId, _]) => commentId);
    
    commentsToDelete.forEach(commentId => {
      this.pulseComments.delete(commentId);
    });
    
    // Then delete the pulse itself
    return this.pulses.delete(id);
  }
  
  // Pulse Comment operations
  async getPulseCommentsByPulseId(pulseId: number): Promise<PulseComment[]> {
    return Array.from(this.pulseComments.values())
      .filter(comment => comment.pulseId === pulseId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeA - timeB; // Sort oldest first
      });
  }
  
  async createPulseComment(insertComment: InsertPulseComment): Promise<PulseComment> {
    const id = this.currentPulseCommentId++;
    const createdAt = new Date();
    
    const comment: PulseComment = {
      ...insertComment,
      id,
      createdAt,
      likes: 0
    };
    
    this.pulseComments.set(id, comment);
    
    // Update the comment count on the pulse
    const pulse = this.pulses.get(insertComment.pulseId);
    if (pulse) {
      this.pulses.set(pulse.id, {
        ...pulse,
        comments: (pulse.comments || 0) + 1
      });
    }
    
    return comment;
  }
  
  async deletePulseComment(id: number): Promise<boolean> {
    const comment = this.pulseComments.get(id);
    if (!comment) return false;
    
    // Decrease the comment count on the pulse
    const pulse = this.pulses.get(comment.pulseId);
    if (pulse && pulse.comments && pulse.comments > 0) {
      this.pulses.set(pulse.id, {
        ...pulse,
        comments: pulse.comments - 1
      });
    }
    
    return this.pulseComments.delete(id);
  }
  
  // Poll Vote operations
  async getPollVotesByPulseId(pulseId: number): Promise<PollVote[]> {
    return Array.from(this.pollVotes.values())
      .filter(vote => vote.pulseId === pulseId);
  }
  
  async getPollVoteByUserAndPulse(userId: number, pulseId: number): Promise<PollVote | undefined> {
    return Array.from(this.pollVotes.values())
      .find(vote => vote.userId === userId && vote.pulseId === pulseId);
  }
  
  async createPollVote(insertVote: InsertPollVote): Promise<PollVote> {
    const id = this.currentPollVoteId++;
    const createdAt = new Date();
    
    const vote: PollVote = {
      ...insertVote,
      id,
      createdAt
    };
    
    this.pollVotes.set(id, vote);
    return vote;
  }
  
  async updatePollVote(id: number, voteData: Partial<PollVote>): Promise<PollVote | undefined> {
    const vote = this.pollVotes.get(id);
    if (!vote) return undefined;
    
    const updatedVote = { ...vote, ...voteData };
    this.pollVotes.set(id, updatedVote);
    return updatedVote;
  }
  
  async deletePollVote(id: number): Promise<boolean> {
    return this.pollVotes.delete(id);
  }
  
  // Pulse Reaction operations
  async getPulseReactionsByPulseId(pulseId: number): Promise<PulseReaction[]> {
    return Array.from(this.pulseReactions.values())
      .filter(reaction => reaction.pulseId === pulseId);
  }
  
  async getPulseReactionById(id: number): Promise<PulseReaction | undefined> {
    return this.pulseReactions.get(id);
  }
  
  async getPulseReactionByUserAndPulse(userId: number, pulseId: number, reactionType: "insightful" | "misinformed"): Promise<PulseReaction | undefined> {
    return Array.from(this.pulseReactions.values())
      .find(reaction => reaction.userId === userId && reaction.pulseId === pulseId && reaction.reactionType === reactionType);
  }
  
  // Pulse Reaction operations implementation
  async createPulseReaction(insertReaction: InsertPulseReaction): Promise<PulseReaction> {
    const id = this.currentPulseReactionId++;
    const createdAt = new Date();
    
    const reaction: PulseReaction = {
      ...insertReaction,
      id,
      createdAt
    };
    
    this.pulseReactions.set(id, reaction);
    
    // Update the pulse reaction count
    const pulse = this.pulses.get(insertReaction.pulseId);
    if (pulse) {
      if (insertReaction.reactionType === "insightful") {
        this.pulses.set(pulse.id, {
          ...pulse,
          insightfulCount: (pulse.insightfulCount || 0) + 1
        });
      } else if (insertReaction.reactionType === "misinformed") {
        this.pulses.set(pulse.id, {
          ...pulse,
          misinformedCount: (pulse.misinformedCount || 0) + 1
        });
      }
    }
    
    return reaction;
  }
  
  async deletePulseReaction(id: number): Promise<boolean> {
    const reaction = this.pulseReactions.get(id);
    if (!reaction) return false;
    
    // Decrease the reaction count on the pulse
    const pulse = this.pulses.get(reaction.pulseId);
    if (pulse) {
      if (reaction.reactionType === "insightful" && pulse.insightfulCount && pulse.insightfulCount > 0) {
        this.pulses.set(pulse.id, {
          ...pulse,
          insightfulCount: pulse.insightfulCount - 1
        });
      } else if (reaction.reactionType === "misinformed" && pulse.misinformedCount && pulse.misinformedCount > 0) {
        this.pulses.set(pulse.id, {
          ...pulse,
          misinformedCount: pulse.misinformedCount - 1
        });
      }
    }
    
    // Restore the user's reaction quota when they remove a reaction
    if (reaction.userId && reaction.reactionType) {
      await this.decrementReactionQuota(reaction.userId, reaction.reactionType);
    }
    
    return this.pulseReactions.delete(id);
  }
  
  // User Reaction Quota operations
  async getUserReactionQuota(userId: number): Promise<UserReactionQuota | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    return Array.from(this.userReactionQuotas.values())
      .find(quota => {
        const quotaDate = new Date(quota.date);
        quotaDate.setHours(0, 0, 0, 0);
        return quota.userId === userId && quotaDate.getTime() === today.getTime();
      });
  }
  
  async getOrCreateUserReactionQuota(userId: number): Promise<UserReactionQuota> {
    const existingQuota = await this.getUserReactionQuota(userId);
    if (existingQuota) {
      return existingQuota;
    }
    
    // Create a new quota for today
    const id = this.currentUserReactionQuotaId++;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const quota: UserReactionQuota = {
      id,
      userId,
      date: today,
      insightfulQuotaUsed: 0,
      misinformedQuotaUsed: 0,
      insightfulQuotaMax: 10,
      misinformedQuotaMax: 10,
      updatedAt: new Date()
    };
    
    this.userReactionQuotas.set(id, quota);
    return quota;
  }
  
  async incrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    // Update the appropriate counter
    if (reactionType === "insightful") {
      const currentUsed = quota.insightfulQuotaUsed || 0;
      quota.insightfulQuotaUsed = currentUsed + 1;
    } else if (reactionType === "misinformed") {
      const currentUsed = quota.misinformedQuotaUsed || 0;
      quota.misinformedQuotaUsed = currentUsed + 1;
    }
    
    quota.updatedAt = new Date();
    this.userReactionQuotas.set(quota.id, quota);
    
    return quota;
  }
  
  async decrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    // Update the appropriate counter (decrement only if greater than 0)
    if (reactionType === "insightful") {
      const currentUsed = quota.insightfulQuotaUsed || 0;
      if (currentUsed > 0) {
        quota.insightfulQuotaUsed = currentUsed - 1;
      }
    } else if (reactionType === "misinformed") {
      const currentUsed = quota.misinformedQuotaUsed || 0;
      if (currentUsed > 0) {
        quota.misinformedQuotaUsed = currentUsed - 1;
      }
    }
    
    quota.updatedAt = new Date();
    this.userReactionQuotas.set(quota.id, quota);
    
    return quota;
  }
  
  async checkReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<{ 
    hasQuotaRemaining: boolean; 
    remaining: number; 
    used: number;
    max: number;
  }> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    if (reactionType === "insightful") {
      const used = quota.insightfulQuotaUsed || 0;
      const max = quota.insightfulQuotaMax || 10;
      const remaining = max - used;
      return {
        hasQuotaRemaining: remaining > 0,
        remaining,
        used,
        max
      };
    } else {
      const used = quota.misinformedQuotaUsed || 0;
      const max = quota.misinformedQuotaMax || 10;
      const remaining = max - used;
      return {
        hasQuotaRemaining: remaining > 0,
        remaining,
        used,
        max
      };
    }
  }
  
  // Pulse Share operations
  async getPulseSharesByRecipientId(recipientId: number): Promise<PulseShare[]> {
    return Array.from(this.pulseShares.values())
      .filter(share => share.recipientId === recipientId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async createPulseShare(insertShare: InsertPulseShare): Promise<PulseShare> {
    const id = this.currentPulseShareId++;
    const createdAt = new Date();
    
    // Ensure message is properly handled (null rather than undefined)
    const message = insertShare.message === undefined ? null : insertShare.message;
    
    const share: PulseShare = {
      ...insertShare,
      id,
      isRead: false,
      createdAt,
      message
    };
    
    this.pulseShares.set(id, share);
    
    // Update the share count on the pulse
    const pulse = this.pulses.get(insertShare.pulseId);
    if (pulse) {
      this.pulses.set(pulse.id, {
        ...pulse,
        shareCount: (pulse.shareCount || 0) + 1
      });
    }
    
    return share;
  }
  
  async markPulseShareRead(id: number): Promise<PulseShare | undefined> {
    const share = this.pulseShares.get(id);
    if (!share) return undefined;
    
    const updatedShare = { ...share, isRead: true };
    this.pulseShares.set(id, updatedShare);
    return updatedShare;
  }
  
  async deletePulseShare(id: number): Promise<boolean> {
    const share = this.pulseShares.get(id);
    if (!share) return false;
    
    // Decrease the share count on the pulse
    const pulse = this.pulses.get(share.pulseId);
    if (pulse && pulse.shareCount && pulse.shareCount > 0) {
      this.pulses.set(pulse.id, {
        ...pulse,
        shareCount: pulse.shareCount - 1
      });
    }
    
    return this.pulseShares.delete(id);
  }
  


  /**
   * Clears all users except the demo user (id: 1)
   * This is primarily for development and testing purposes
   */
  async clearAllUsers(): Promise<void> {
    console.log("[storage] clearAllUsers: Clearing all registered users except the demo user");
    
    // Create a list of IDs to remove
    const idsToRemove: number[] = [];
    
    // Find all users except the demo user (ID 1)
    for (const [id, user] of this.users.entries()) {
      if (id !== 1) {
        idsToRemove.push(id);
      }
    }
    
    // Remove users
    for (const id of idsToRemove) {
      this.users.delete(id);
      console.log(`[storage] clearAllUsers: Removed user with ID ${id}`);
    }
    
    // Also clear related verifications
    this.emailVerifications.clear();
    this.otpVerifications.clear();
    
    console.log(`[storage] clearAllUsers: Removed ${idsToRemove.length} users and cleared all verifications`);
  }

  /**
   * Search for pulses by title, description, or tags
   * @param query Search query string
   * @returns Array of matching Pulse objects
   */
   
  // Hashtag operations
  async getHashtags(): Promise<Hashtag[]> {
    return Array.from(this.hashtags.values());
  }
  
  async getHashtagById(id: number): Promise<Hashtag | undefined> {
    return this.hashtags.get(id);
  }
  
  async getHashtagByTag(tag: string): Promise<Hashtag | undefined> {
    // Normalize the tag by removing the '#' if present and converting to lowercase
    const normalizedTag = tag.startsWith('#') ? tag.substring(1).toLowerCase() : tag.toLowerCase();
    return Array.from(this.hashtags.values())
      .find(hashtag => hashtag.tag.toLowerCase() === normalizedTag);
  }
  
  async searchHashtagsByPrefix(prefix: string): Promise<Hashtag[]> {
    // Remove '#' if present and convert to lowercase
    const normalizedPrefix = prefix.startsWith('#') ? prefix.substring(1).toLowerCase() : prefix.toLowerCase();
    
    if (!normalizedPrefix) return [];
    
    return Array.from(this.hashtags.values())
      .filter(hashtag => hashtag.tag.toLowerCase().startsWith(normalizedPrefix))
      .sort((a, b) => {
        const countA = a.count || 0;
        const countB = b.count || 0;
        return countB - countA; // Sort by count (popularity) in descending order
      });
  }
  
  async createHashtag(insertHashtag: InsertHashtag): Promise<Hashtag> {
    const id = this.currentHashtagId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const hashtag: Hashtag = {
      ...insertHashtag,
      id,
      createdAt,
      updatedAt,
      count: 1
    };
    
    this.hashtags.set(id, hashtag);
    return hashtag;
  }
  
  async updateHashtag(id: number, hashtagData: Partial<Hashtag>): Promise<Hashtag | undefined> {
    const hashtag = this.hashtags.get(id);
    if (!hashtag) return undefined;
    
    const updatedHashtag = { ...hashtag, ...hashtagData };
    this.hashtags.set(id, updatedHashtag);
    return updatedHashtag;
  }
  
  async incrementHashtagCount(id: number): Promise<Hashtag | undefined> {
    const hashtag = this.hashtags.get(id);
    if (!hashtag) return undefined;
    
    const currentCount = hashtag.count || 0;
    const updatedHashtag = { 
      ...hashtag, 
      count: currentCount + 1,
      updatedAt: new Date()
    };
    
    this.hashtags.set(id, updatedHashtag);
    return updatedHashtag;
  }
  
  // Pulse Hashtag operations
  async createPulseHashtag(insertPulseHashtag: InsertPulseHashtag): Promise<PulseHashtag> {
    const id = this.currentPulseHashtagId++;
    const createdAt = new Date();
    
    const pulseHashtag: PulseHashtag = {
      ...insertPulseHashtag,
      id,
      createdAt
    };
    
    this.pulseHashtags.set(id, pulseHashtag);
    return pulseHashtag;
  }
  
  async getPulseHashtagsByPulseId(pulseId: number): Promise<PulseHashtag[]> {
    return Array.from(this.pulseHashtags.values())
      .filter(pulseHashtag => pulseHashtag.pulseId === pulseId);
  }
  
  async getHashtagsByPulseId(pulseId: number): Promise<Hashtag[]> {
    const pulseHashtags = await this.getPulseHashtagsByPulseId(pulseId);
    const hashtags: Hashtag[] = [];
    
    for (const pulseHashtag of pulseHashtags) {
      const hashtag = await this.getHashtagById(pulseHashtag.hashtagId);
      if (hashtag) {
        hashtags.push(hashtag);
      }
    }
    
    return hashtags;
  }
  
  async extractAndSaveHashtags(text: string, pulseId: number): Promise<Hashtag[]> {
    try {
      if (!text) return [];
      
      // Regular expression to match hashtags: #word
      // Words can include letters, numbers, underscores
      const hashtagRegex = /#(\w+)/g;
      const matches = text.match(hashtagRegex);
      
      if (!matches) return [];
      
      const savedHashtags: Hashtag[] = [];
      
      // Process each hashtag
      for (const match of matches) {
        try {
          // Remove the '#' character and normalize to lowercase
          const tagText = match.substring(1).toLowerCase();
          
          // Skip empty tags
          if (!tagText) continue;
          
          // Check if this hashtag already exists
          let hashtag = await this.getHashtagByTag(tagText);
          
          if (hashtag) {
            // If it exists, increment its count
            hashtag = await this.incrementHashtagCount(hashtag.id);
          } else {
            // If it doesn't exist, create a new one
            hashtag = await this.createHashtag({
              tag: tagText
            });
          }
          
          if (hashtag) {
            try {
              // Create the association between the pulse and the hashtag
              await this.createPulseHashtag({
                pulseId,
                hashtagId: hashtag.id
              });
              
              savedHashtags.push(hashtag);
            } catch (error) {
              console.error(`Error creating pulse-hashtag association for pulse ${pulseId} and hashtag ${hashtag.id}:`, error);
              // Continue with next hashtag even if this one fails
            }
          }
        } catch (error) {
          console.error(`Error processing hashtag ${match}:`, error);
          // Continue with next hashtag even if this one fails
        }
      }
      
      return savedHashtags;
    } catch (error) {
      console.error(`Error extracting hashtags from text for pulse ${pulseId}:`, error);
      // Return empty array to prevent the entire pulse creation from failing
      return [];
    }
  }
  
  async searchPulses(query: string): Promise<Pulse[]> {
    console.log(`[storage] searchPulses: Searching pulses with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    // First collect all pulses that match by title or content
    const directMatches = Array.from(this.pulses.values()).filter(pulse => {
      // Check title for matches
      const titleMatch = pulse.title?.toLowerCase().includes(normalizedQuery);
      
      // Check content for matches (different field name than "description")
      const contentMatch = pulse.content?.toLowerCase().includes(normalizedQuery);
      
      return titleMatch || contentMatch;
    });
    
    // Now find pulses by hashtag
    let hashtagMatches: Pulse[] = [];
    
    // Check if the query is actually searching for a hashtag
    if (normalizedQuery.startsWith('#')) {
      // Get the tag without the # symbol
      const tagText = normalizedQuery.substring(1);
      
      // Find the hashtag in our hashtags collection
      const hashtag = await this.getHashtagByTag(tagText);
      
      if (hashtag) {
        // Get all pulse-hashtag relationships for this hashtag
        const pulseHashtags = Array.from(this.pulseHashtags.values())
          .filter(ph => ph.hashtagId === hashtag.id);
          
        // Get the corresponding pulses
        for (const ph of pulseHashtags) {
          const pulse = this.pulses.get(ph.pulseId);
          if (pulse) {
            hashtagMatches.push(pulse);
          }
        }
      }
    } else {
      // If not explicitly searching for a hashtag, still try to find hashtags containing the query
      const matchingHashtags = await this.searchHashtagsByPrefix(normalizedQuery);
      
      for (const hashtag of matchingHashtags) {
        // Get all pulse-hashtag relationships for this hashtag
        const pulseHashtags = Array.from(this.pulseHashtags.values())
          .filter(ph => ph.hashtagId === hashtag.id);
          
        // Get the corresponding pulses
        for (const ph of pulseHashtags) {
          const pulse = this.pulses.get(ph.pulseId);
          if (pulse) {
            hashtagMatches.push(pulse);
          }
        }
      }
    }
    
    // Combine the results, removing duplicates
    const allMatches = [...directMatches];
    
    // Add hashtag matches if they're not already in the results
    for (const pulse of hashtagMatches) {
      if (!allMatches.some(p => p.id === pulse.id)) {
        allMatches.push(pulse);
      }
    }
    
    // Sort by recency
    allMatches.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Get user info for each pulse
    const resultsWithUsers = await Promise.all(allMatches.map(async pulse => {
      const user = await this.getUser(pulse.userId);
      return { ...pulse, user };
    }));
    
    console.log(`[storage] searchPulses: Found ${allMatches.length} matching pulses`);
    return resultsWithUsers;
  }
  
  /**
   * Search for user profiles by name, title, location, or industry
   * @param query Search query string
   * @returns Array of matching User objects
   */
  async searchProfiles(query: string): Promise<User[]> {
    console.log(`[storage] searchProfiles: Searching profiles with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    const results = Array.from(this.users.values()).filter(user => {
      // Check various fields for matches
      const nameMatch = user.name?.toLowerCase().includes(normalizedQuery);
      const titleMatch = user.title?.toLowerCase().includes(normalizedQuery);
      const locationMatch = user.location?.toLowerCase().includes(normalizedQuery);
      const industryMatch = user.industry?.toLowerCase().includes(normalizedQuery);
      
      return nameMatch || titleMatch || locationMatch || industryMatch;
    });
    
    console.log(`[storage] searchProfiles: Found ${results.length} matching profiles`);
    return results;
  }
  
  /**
   * Search for hashtags
   * @param query Search query string
   * @returns Array of matching hashtags with usage counts
   */
  async searchHashtags(query: string): Promise<{id: number, name: string, count: number}[]> {
    console.log(`[storage] searchHashtags: Searching hashtags with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    // Search for hashtags with the searchHashtagsByPrefix method
    const hashtags = await this.searchHashtagsByPrefix(normalizedQuery);
    
    // Transform to the expected format
    const results = hashtags.map(hashtag => ({
      id: hashtag.id,
      name: hashtag.tag,
      count: hashtag.count || 0  // Default to 0 if null
    }));
    
    console.log(`[storage] searchHashtags: Found ${results.length} matching hashtags`);
    return results;
  }
  
  // User Hashtag Follow operations
  async followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow> {
    console.log(`[storage] followHashtag: User ${userId} following hashtag ${hashtagId}`);
    
    // Check if the user is already following this hashtag
    const isFollowing = await this.isHashtagFollowedByUser(userId, hashtagId);
    if (isFollowing) {
      console.log(`[storage] followHashtag: User ${userId} is already following hashtag ${hashtagId}`);
      
      // Find the existing follow relationship
      const existingFollow = Array.from(this.userHashtagFollows.values())
        .find(follow => follow.userId === userId && follow.hashtagId === hashtagId);
      
      if (existingFollow) {
        return existingFollow;
      }
    }
    
    // Create a new follow relationship
    const id = this.currentUserHashtagFollowId++;
    const createdAt = new Date();
    
    const follow: UserHashtagFollow = {
      id,
      userId,
      hashtagId,
      createdAt
    };
    
    this.userHashtagFollows.set(id, follow);
    console.log(`[storage] followHashtag: Created new follow relationship with ID ${id}`);
    return follow;
  }
  
  async unfollowHashtag(userId: number, hashtagId: number): Promise<boolean> {
    console.log(`[storage] unfollowHashtag: User ${userId} unfollowing hashtag ${hashtagId}`);
    
    // Find the follow relationship
    const follow = Array.from(this.userHashtagFollows.values())
      .find(follow => follow.userId === userId && follow.hashtagId === hashtagId);
    
    if (!follow) {
      console.log(`[storage] unfollowHashtag: No follow relationship found for user ${userId} and hashtag ${hashtagId}`);
      return false;
    }
    
    // Delete the follow relationship
    const result = this.userHashtagFollows.delete(follow.id);
    console.log(`[storage] unfollowHashtag: Deleted follow relationship with ID ${follow.id}: ${result}`);
    return result;
  }
  
  async getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]> {
    console.log(`[storage] getFollowedHashtagsByUserId: Getting followed hashtags for user ${userId}`);
    
    // Get all hashtag IDs that the user is following
    const hashtagIds = Array.from(this.userHashtagFollows.values())
      .filter(follow => follow.userId === userId)
      .map(follow => follow.hashtagId);
    
    // Get the hashtags with those IDs
    const hashtags = hashtagIds.map(id => this.hashtags.get(id))
      .filter((hashtag): hashtag is Hashtag => hashtag !== undefined);
    
    console.log(`[storage] getFollowedHashtagsByUserId: Found ${hashtags.length} followed hashtags for user ${userId}`);
    return hashtags;
  }
  
  async isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean> {
    const isFollowed = Array.from(this.userHashtagFollows.values())
      .some(follow => follow.userId === userId && follow.hashtagId === hashtagId);
    
    console.log(`[storage] isHashtagFollowedByUser: Hashtag ${hashtagId} is ${isFollowed ? '' : 'not '}followed by user ${userId}`);
    return isFollowed;
  }
  
  async getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]> {
    console.log(`[storage] getPulsesByFollowedHashtags: Getting pulses for hashtags followed by user ${userId}`);
    
    // Get all hashtags followed by the user
    const followedHashtags = await this.getFollowedHashtagsByUserId(userId);
    
    if (followedHashtags.length === 0) {
      console.log(`[storage] getPulsesByFollowedHashtags: User ${userId} is not following any hashtags`);
      return [];
    }
    
    // Get all pulse-hashtag relationships for these hashtags
    const pulseIds = new Set<number>();
    
    for (const hashtag of followedHashtags) {
      const pulseHashtags = Array.from(this.pulseHashtags.values())
        .filter(ph => ph.hashtagId === hashtag.id)
        .map(ph => ph.pulseId);
      
      pulseHashtags.forEach(id => pulseIds.add(id));
    }
    
    // Get all pulses with these IDs
    const pulses = Array.from(pulseIds)
      .map(id => this.pulses.get(id))
      .filter((pulse): pulse is Pulse => pulse !== undefined)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    
    console.log(`[storage] getPulsesByFollowedHashtags: Found ${pulses.length} pulses for hashtags followed by user ${userId}`);
    return pulses;
  }
  
  // News Source operations
  async getNewsSources(): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getNewsSourceById(id: number): Promise<NewsSource | undefined> {
    return this.newsSources.get(id);
  }

  async getNewsSourcesByCategory(category: string): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values())
      .filter(source => source.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    const id = this.currentNewsSourceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsSource: NewsSource = {
      ...source,
      id,
      createdAt,
      updatedAt,
      apiEndpoint: source.apiEndpoint ?? null,
      apiKey: source.apiKey ?? null,
      isActive: source.isActive ?? true
    };
    
    this.newsSources.set(id, newsSource);
    return newsSource;
  }

  async updateNewsSource(id: number, sourceData: Partial<NewsSource>): Promise<NewsSource | undefined> {
    const source = this.newsSources.get(id);
    if (!source) return undefined;
    
    const updatedSource = { 
      ...source, 
      ...sourceData,
      updatedAt: new Date() 
    };
    
    this.newsSources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteNewsSource(id: number): Promise<boolean> {
    return this.newsSources.delete(id);
  }

  // News Article operations
  async getNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticleById(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async getNewsArticlesBySourceId(sourceId: number): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.sourceId === sourceId)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticlesByCategory(category: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.category === category)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getUnprocessedNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => !article.processed)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticlesByIndustry(industry: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => {
        if (!article.industries) return false;
        const industries = JSON.parse(article.industries as string);
        return Array.isArray(industries) && industries.includes(industry);
      })
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentNewsArticleId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsArticle: NewsArticle = {
      ...article,
      id,
      createdAt,
      updatedAt,
      sourceId: article.sourceId ?? null,
      description: article.description ?? null,
      content: article.content ?? null,
      url: article.url ?? null,
      imageUrl: article.imageUrl ?? null,
      author: article.author ?? null,
      publishedAt: article.publishedAt ?? new Date(),
      category: article.category ?? null,
      industries: article.industries ?? '[]',
      processed: article.processed ?? false
    };
    
    this.newsArticles.set(id, newsArticle);
    return newsArticle;
  }

  async updateNewsArticle(id: number, articleData: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const article = this.newsArticles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { 
      ...article, 
      ...articleData,
      updatedAt: new Date() 
    };
    
    this.newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    return this.newsArticles.delete(id);
  }

  // News User Preference operations
  async getNewsUserPreferenceByUserId(userId: number): Promise<NewsUserPreference | undefined> {
    return Array.from(this.newsUserPreferences.values())
      .find(preference => preference.userId === userId);
  }

  async createNewsUserPreference(preference: InsertNewsUserPreference): Promise<NewsUserPreference> {
    const id = this.currentNewsUserPreferenceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsUserPreference: NewsUserPreference = {
      ...preference,
      id,
      createdAt,
      updatedAt,
      preferredIndustries: preference.preferredIndustries ?? '[]',
      preferredSources: preference.preferredSources ?? '[]',
      excludedSources: preference.excludedSources ?? '[]',
      deliveryTime: preference.deliveryTime ?? '17:00',
      enabled: preference.enabled ?? true
    };
    
    this.newsUserPreferences.set(id, newsUserPreference);
    return newsUserPreference;
  }

  async updateNewsUserPreference(id: number, preferenceData: Partial<NewsUserPreference>): Promise<NewsUserPreference | undefined> {
    const preference = this.newsUserPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference = { 
      ...preference, 
      ...preferenceData,
      updatedAt: new Date() 
    };
    
    this.newsUserPreferences.set(id, updatedPreference);
    return updatedPreference;
  }

  async deleteNewsUserPreference(id: number): Promise<boolean> {
    return this.newsUserPreferences.delete(id);
  }
  
  // Musk Suggestion operations
  async getMuskSuggestionsForUser(userId: number): Promise<MuskSuggestion[]> {
    return Array.from(this.muskSuggestions.values())
      .filter(suggestion => suggestion.userId === userId);
  }
  
  async createMuskSuggestion(suggestion: InsertMuskSuggestion): Promise<MuskSuggestion> {
    const id = this.currentMuskSuggestionId++;
    const createdAt = new Date();
    
    const muskSuggestion: MuskSuggestion = {
      ...suggestion,
      id,
      createdAt,
      updatedAt: createdAt,
      dismissed: false,
      actionTaken: false
    };
    
    this.muskSuggestions.set(id, muskSuggestion);
    return muskSuggestion;
  }
  
  async updateMuskSuggestion(id: number, suggestionData: Partial<MuskSuggestion>): Promise<MuskSuggestion | undefined> {
    const suggestion = this.muskSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { 
      ...suggestion, 
      ...suggestionData,
      updatedAt: new Date()
    };
    
    this.muskSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
  
  async deleteMuskSuggestion(id: number): Promise<boolean> {
    return this.muskSuggestions.delete(id);
  }
  
  async dismissMuskSuggestion(id: number): Promise<void> {
    const suggestion = this.muskSuggestions.get(id);
    if (suggestion) {
      suggestion.dismissed = true;
      suggestion.updatedAt = new Date();
      this.muskSuggestions.set(id, suggestion);
    }
  }
  
  async markMuskSuggestionActionTaken(id: number): Promise<void> {
    const suggestion = this.muskSuggestions.get(id);
    if (suggestion) {
      suggestion.actionTaken = true;
      suggestion.updatedAt = new Date();
      this.muskSuggestions.set(id, suggestion);
    }
  }
  
  // Musk Behavior Tracking operations
  async getMuskBehaviorTrackingByUser(userId: number): Promise<MuskBehaviorTracking[]> {
    return Array.from(this.muskBehaviorTracking.values())
      .filter(tracking => tracking.userId === userId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async createMuskBehaviorTracking(tracking: InsertMuskBehaviorTracking): Promise<MuskBehaviorTracking> {
    const id = this.currentMuskBehaviorTrackingId++;
    const createdAt = new Date();
    
    const behaviorTracking: MuskBehaviorTracking = {
      ...tracking,
      id,
      createdAt: tracking.createdAt || createdAt
    };
    
    this.muskBehaviorTracking.set(id, behaviorTracking);
    return behaviorTracking;
  }

  // User Profile Intelligence operations
  async getUserProfileIntelligence(userId: number): Promise<UserProfileIntelligence | undefined> {
    return Array.from(this.userProfileIntelligence.values())
      .find(profile => profile.userId === userId);
  }

  async createUserProfileIntelligence(intelligence: InsertUserProfileIntelligence): Promise<UserProfileIntelligence> {
    // Check if already exists for this user
    const existing = await this.getUserProfileIntelligence(intelligence.userId);
    if (existing) {
      return this.updateUserProfileIntelligence(existing.id, intelligence) as Promise<UserProfileIntelligence>;
    }
    
    const id = existing?.id || Math.max(1, ...Array.from(this.userProfileIntelligence.keys())) + 1;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const profileIntelligence: UserProfileIntelligence = {
      ...intelligence,
      id,
      createdAt,
      updatedAt,
      careerLevel: intelligence.careerLevel || null,
      userGoal: intelligence.userGoal || null,
      careerIntention: intelligence.careerIntention || null,
      primaryIndustry: intelligence.primaryIndustry || null,
      secondaryIndustry: intelligence.secondaryIndustry || null,
      skillsGaps: intelligence.skillsGaps || [],
      relevantCertifications: intelligence.relevantCertifications || [],
      suggestedCertifications: intelligence.suggestedCertifications || [],
      learningStyle: intelligence.learningStyle || null,
      contentPreferences: intelligence.contentPreferences || [],
      careerTrajectory: intelligence.careerTrajectory || null,
      personalBrand: intelligence.personalBrand || null
    };
    
    this.userProfileIntelligence.set(id, profileIntelligence);
    return profileIntelligence;
  }

  async updateUserProfileIntelligence(id: number, intelligence: Partial<UserProfileIntelligence>): Promise<UserProfileIntelligence | undefined> {
    const existing = this.userProfileIntelligence.get(id);
    if (!existing) return undefined;
    
    const updatedIntelligence = { 
      ...existing, 
      ...intelligence,
      updatedAt: new Date() 
    };
    
    this.userProfileIntelligence.set(id, updatedIntelligence);
    return updatedIntelligence;
  }
  
  // Behavior Heatmap operations
  async getBehaviorHeatmapForUser(userId: number): Promise<BehaviorHeatmap[]> {
    return Array.from(this.behaviorHeatmap.values())
      .filter(heatmap => heatmap.userId === userId)
      .sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async createBehaviorHeatmap(heatmap: InsertBehaviorHeatmap): Promise<BehaviorHeatmap> {
    const id = Math.max(1, ...Array.from(this.behaviorHeatmap.keys())) + 1;
    const timestamp = new Date();
    
    const newHeatmap: BehaviorHeatmap = {
      ...heatmap,
      id,
      timestamp: heatmap.timestamp || timestamp,
      dayOfWeek: heatmap.dayOfWeek || timestamp.getDay(),
      hourOfDay: heatmap.hourOfDay || timestamp.getHours(),
      engagementScore: heatmap.engagementScore || 0,
      actionType: heatmap.actionType || 'view',
      contentCategory: heatmap.contentCategory || null,
      durationSeconds: heatmap.durationSeconds || 0
    };
    
    this.behaviorHeatmap.set(id, newHeatmap);
    return newHeatmap;
  }
  
  // Content Scoring operations
  async getContentScoringByContentId(contentId: number): Promise<ContentScoring | undefined> {
    return Array.from(this.contentScoring.values())
      .find(scoring => scoring.contentId === contentId);
  }

  async createContentScoring(scoring: InsertContentScoring): Promise<ContentScoring> {
    // Check if already exists for this content
    const existing = await this.getContentScoringByContentId(scoring.contentId);
    if (existing) {
      return this.updateContentScoring(existing.id, scoring) as Promise<ContentScoring>;
    }
    
    const id = Math.max(1, ...Array.from(this.contentScoring.keys())) + 1;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newScoring: ContentScoring = {
      ...scoring,
      id,
      createdAt,
      updatedAt,
      overallScore: scoring.overallScore || 0,
      clarityScore: scoring.clarityScore || 0,
      engagementScore: scoring.engagementScore || 0,
      relevanceScore: scoring.relevanceScore || 0,
      improvementSuggestions: scoring.improvementSuggestions || [],
      keywordEffectiveness: scoring.keywordEffectiveness || 0,
      sentimentAnalysis: scoring.sentimentAnalysis || 'neutral'
    };
    
    this.contentScoring.set(id, newScoring);
    return newScoring;
  }

  async updateContentScoring(id: number, scoring: Partial<ContentScoring>): Promise<ContentScoring | undefined> {
    const existing = this.contentScoring.get(id);
    if (!existing) return undefined;
    
    const updatedScoring = { 
      ...existing, 
      ...scoring,
      updatedAt: new Date() 
    };
    
    this.contentScoring.set(id, updatedScoring);
    return updatedScoring;
  }
  
  // Industry Trends Monitor operations
  async getIndustryTrends(): Promise<IndustryTrendsMonitor[]> {
    return Array.from(this.industryTrendsMonitor.values())
      .sort((a, b) => {
        const timeA = a.lastUpdated ? a.lastUpdated.getTime() : 0;
        const timeB = b.lastUpdated ? b.lastUpdated.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async getIndustryTrendsByIndustry(industry: string): Promise<IndustryTrendsMonitor[]> {
    return Array.from(this.industryTrendsMonitor.values())
      .filter(trend => trend.industry === industry)
      .sort((a, b) => {
        const timeA = a.lastUpdated ? a.lastUpdated.getTime() : 0;
        const timeB = b.lastUpdated ? b.lastUpdated.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async createIndustryTrend(trend: InsertIndustryTrendsMonitor): Promise<IndustryTrendsMonitor> {
    const id = Math.max(1, ...Array.from(this.industryTrendsMonitor.keys())) + 1;
    const createdAt = new Date();
    const lastUpdated = new Date();
    
    const newTrend: IndustryTrendsMonitor = {
      ...trend,
      id,
      createdAt,
      lastUpdated,
      trendingKeywords: trend.trendingKeywords || [],
      growthRate: trend.growthRate || 0,
      emergingRoles: trend.emergingRoles || [],
      decliningRoles: trend.decliningRoles || [],
      skillsInDemand: trend.skillsInDemand || []
    };
    
    this.industryTrendsMonitor.set(id, newTrend);
    return newTrend;
  }
  
  // User Milestones operations
  async getUserMilestones(userId: number): Promise<UserMilestones[]> {
    return Array.from(this.userMilestones.values())
      .filter(milestone => milestone.userId === userId)
      .sort((a, b) => {
        const timeA = a.achievedAt ? a.achievedAt.getTime() : 0;
        const timeB = b.achievedAt ? b.achievedAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async createUserMilestone(milestone: InsertUserMilestones): Promise<UserMilestones> {
    const id = Math.max(1, ...Array.from(this.userMilestones.keys())) + 1;
    const createdAt = new Date();
    const achievedAt = milestone.achievedAt || new Date();
    
    const newMilestone: UserMilestones = {
      ...milestone,
      id,
      createdAt,
      achievedAt,
      acknowledged: milestone.acknowledged || false,
      milestoneType: milestone.milestoneType || 'achievement',
      description: milestone.description || null,
      rewardPoints: milestone.rewardPoints || 0
    };
    
    this.userMilestones.set(id, newMilestone);
    return newMilestone;
  }

  async markUserMilestoneAcknowledged(id: number): Promise<UserMilestones | undefined> {
    const milestone = this.userMilestones.get(id);
    if (!milestone) return undefined;
    
    const updatedMilestone = { 
      ...milestone, 
      acknowledged: true 
    };
    
    this.userMilestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  // Smart Post Suggestions operations
  async getSmartPostSuggestionsForUser(userId: number): Promise<SmartPostSuggestions[]> {
    return Array.from(this.smartPostSuggestions.values())
      .filter(suggestion => suggestion.userId === userId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async createSmartPostSuggestion(suggestion: InsertSmartPostSuggestions): Promise<SmartPostSuggestions> {
    const id = Math.max(1, ...Array.from(this.smartPostSuggestions.keys())) + 1;
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default expiry of 7 days
    
    const newSuggestion: SmartPostSuggestions = {
      ...suggestion,
      id,
      createdAt,
      expiresAt: suggestion.expiresAt || expiresAt,
      isUsed: suggestion.isUsed || false,
      relevanceScore: suggestion.relevanceScore || 0,
      suggestedHashtags: suggestion.suggestedHashtags || [],
      suggestedTime: suggestion.suggestedTime || null,
      mediaType: suggestion.mediaType || null,
      mediaPrompt: suggestion.mediaPrompt || null
    };
    
    this.smartPostSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async markSmartPostSuggestionUsed(id: number): Promise<SmartPostSuggestions | undefined> {
    const suggestion = this.smartPostSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { 
      ...suggestion, 
      isUsed: true 
    };
    
    this.smartPostSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Nowboard Item operations
  async getNowboardItems(): Promise<NowboardItem[]> {
    return Array.from(this.nowboardItems.values())
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }
  
  async getNowboardItemsByUserId(userId: number): Promise<NowboardItem[]> {
    return Array.from(this.nowboardItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }
  
  async getNowboardItemById(id: number): Promise<NowboardItem | undefined> {
    return this.nowboardItems.get(id);
  }
  
  async getNowboardItemsByCategory(category: "growth" | "learning" | "launch" | "planning" | "collaboration" | "visibility"): Promise<NowboardItem[]> {
    return Array.from(this.nowboardItems.values())
      .filter(item => item.category === category)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }
  
  async createNowboardItem(item: InsertNowboardItem): Promise<NowboardItem> {
    const id = this.currentNowboardItemId++;
    const createdAt = new Date();
    
    const newItem: NowboardItem = {
      ...item,
      id,
      createdAt,
      inspiredCount: 0,
      visibility: item.visibility ?? 'public',
      relatedSkills: item.relatedSkills ?? null,
      relatedProject: item.relatedProject ?? null,
      imageUrl: item.imageUrl ?? null,
      updatedAt: createdAt
    };
    
    this.nowboardItems.set(id, newItem);
    return newItem;
  }
  
  async updateNowboardItem(id: number, item: Partial<NowboardItem>): Promise<NowboardItem | undefined> {
    const existingItem = this.nowboardItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedAt = new Date();
    const updatedItem = { 
      ...existingItem, 
      ...item,
      updatedAt 
    };
    
    this.nowboardItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteNowboardItem(id: number): Promise<boolean> {
    // Also delete all related inspired-by records
    const inspiredByEntries = Array.from(this.nowboardInspiredBy.entries());
    for (const [inspiredId, inspiredBy] of inspiredByEntries) {
      if (inspiredBy.nowboardItemId === id) {
        this.nowboardInspiredBy.delete(inspiredId);
      }
    }
    
    return this.nowboardItems.delete(id);
  }
  
  // Nowboard Inspired By operations
  async getInspiredByForNowboardItem(nowboardItemId: number): Promise<NowboardInspiredBy[]> {
    return Array.from(this.nowboardInspiredBy.values())
      .filter(inspired => inspired.nowboardItemId === nowboardItemId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }
  
  async getInspiredByForUserAndItem(userId: number, nowboardItemId: number): Promise<NowboardInspiredBy | undefined> {
    return Array.from(this.nowboardInspiredBy.values())
      .find(inspired => inspired.userId === userId && inspired.nowboardItemId === nowboardItemId);
  }
  
  async markInspiredByNowboardItem(userId: number, nowboardItemId: number): Promise<NowboardInspiredBy> {
    // Check if this user already marked this item
    const existingInspired = Array.from(this.nowboardInspiredBy.values())
      .find(inspired => inspired.userId === userId && inspired.nowboardItemId === nowboardItemId);
    
    if (existingInspired) {
      return existingInspired;
    }
    
    const id = this.currentNowboardInspiredById++;
    const createdAt = new Date();
    
    const newInspired: NowboardInspiredBy = {
      id,
      userId,
      nowboardItemId,
      createdAt
    };
    
    this.nowboardInspiredBy.set(id, newInspired);
    
    // Increment the inspire count on the nowboard item
    await this.incrementInspiredCount(nowboardItemId);
    
    return newInspired;
  }
  
  async unmarkInspiredByNowboardItem(userId: number, nowboardItemId: number): Promise<boolean> {
    const existingInspired = Array.from(this.nowboardInspiredBy.values())
      .find(inspired => inspired.userId === userId && inspired.nowboardItemId === nowboardItemId);
    
    if (!existingInspired) {
      return false;
    }
    
    // Delete the inspired-by record
    const deleted = this.nowboardInspiredBy.delete(existingInspired.id);
    
    if (deleted) {
      // Decrement the inspire count on the nowboard item
      await this.decrementInspiredCount(nowboardItemId);
    }
    
    return deleted;
  }
  
  async isNowboardItemInspiredByUser(userId: number, nowboardItemId: number): Promise<boolean> {
    return Array.from(this.nowboardInspiredBy.values())
      .some(inspired => inspired.userId === userId && inspired.nowboardItemId === nowboardItemId);
  }
  
  async getUserInspiredCount(userId: number): Promise<number> {
    // Count all Nowboard items that this user has marked as inspired
    const userInspiredCount = Array.from(this.nowboardInspiredBy.values())
      .filter(inspired => inspired.userId === userId)
      .length;
    
    return userInspiredCount;
  }
  
  async incrementInspiredCount(nowboardItemId: number): Promise<NowboardItem | undefined> {
    const item = this.nowboardItems.get(nowboardItemId);
    if (!item) return undefined;
    
    const updatedItem = { 
      ...item, 
      inspiredCount: (item.inspiredCount || 0) + 1,
      updatedAt: new Date()
    };
    
    this.nowboardItems.set(nowboardItemId, updatedItem);
    return updatedItem;
  }
  
  async decrementInspiredCount(nowboardItemId: number): Promise<NowboardItem | undefined> {
    const item = this.nowboardItems.get(nowboardItemId);
    if (!item) return undefined;
    
    // Don't let it go below 0
    const newCount = Math.max(0, (item.inspiredCount || 0) - 1);
    
    const updatedItem = { 
      ...item, 
      inspiredCount: newCount,
      updatedAt: new Date() 
    };
    
    this.nowboardItems.set(nowboardItemId, updatedItem);
    return updatedItem;
  }

  // News Pulse operations
  async createNewsPulse(article: NewsArticle, userId: number): Promise<Pulse> {
    // First, generate content based on the article
    const newsContent = await this.generateNewsContent(article);
    
    // Create a pulse with the type "news-pulse"
    const pulseData: InsertPulse = {
      userId,
      type: "news-pulse",
      title: newsContent.title,
      content: newsContent.content,
      isPublished: true
    };
    
    // Create the pulse
    const pulse = await this.createPulse(pulseData);
    
    // Extract and save hashtags from the content
    if (newsContent.hashtags && newsContent.hashtags.length > 0) {
      // Convert hashtags array to string with # prefix
      const hashtagsText = newsContent.hashtags.map(tag => `#${tag}`).join(' ');
      await this.extractAndSaveHashtags(hashtagsText, pulse.id);
    }
    
    // Mark the article as processed
    await this.updateNewsArticle(article.id, { processed: true });
    
    return pulse;
  }

  async getLatestNewsPulses(userId: number, limit: number = 10): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .filter(pulse => pulse.type === "news-pulse")
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // Sort by createdAt in descending order (newest first)
      })
      .slice(0, limit);
  }

  async generateNewsContent(article: NewsArticle): Promise<{ title: string, content: string, hashtags: string[] }> {
    // In a real implementation, this would use an AI service to generate the content
    // For now, we'll create a simple implementation that formats the article data
    
    // Create a title with industry focus
    let title = article.title || 'Industry News Update';
    
    // Create content that summarizes the article
    let content = '';
    if (article.description) {
      content += article.description;
    } else if (article.content) {
      // Use just the first paragraph or first 200 characters
      const contentText = article.content;
      content += contentText.split('\n')[0] || contentText.substring(0, 200);
    } else {
      content = 'Check out this industry news article that might be relevant to your professional interests.';
    }
    
    // Add source attribution if available
    if (article.url) {
      content += `\n\nRead more: ${article.url}`;
    }
    
    // Generate relevant hashtags
    let hashtags: string[] = [];
    
    // Add category as hashtag if available
    if (article.category) {
      hashtags.push(article.category.replace(/[^a-zA-Z0-9]/g, ''));
    }
    
    // Add some basic industry hashtags
    if (article.industries) {
      try {
        const industriesArray = JSON.parse(article.industries as string);
        if (Array.isArray(industriesArray)) {
          industriesArray.forEach(industry => {
            // Clean up industry name for hashtag (remove spaces and special chars)
            const hashtagIndustry = industry.replace(/[^a-zA-Z0-9]/g, '');
            if (hashtagIndustry) {
              hashtags.push(hashtagIndustry);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing industries JSON:', error);
      }
    }
    
    // Add some generic hashtags
    hashtags.push('industrynews');
    hashtags.push('careerdevelopment');
    
    // Remove duplicates and limit to 5 hashtags
    const uniqueHashtags: string[] = [];
    hashtags.forEach(tag => {
      if (!uniqueHashtags.includes(tag)) {
        uniqueHashtags.push(tag);
      }
    });
    
    return { title, content, hashtags: uniqueHashtags.slice(0, 5) };
  }

  // Musk Match operations
  async getMuskMatchesByUserId(userId: number): Promise<MuskMatch[]> {
    return Array.from(this.muskMatches.values())
      .filter(match => match.userId === userId)
      .sort((a, b) => {
        const timeA = a.shownAt ? a.shownAt.getTime() : 0;
        const timeB = b.shownAt ? b.shownAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }

  async getMuskMatchById(id: number): Promise<MuskMatch | undefined> {
    return this.muskMatches.get(id);
  }

  async createMuskMatch(match: InsertMuskMatch): Promise<MuskMatch> {
    const id = this.currentMuskMatchId++;
    const shownAt = new Date();
    
    const muskMatch: MuskMatch = {
      ...match,
      id,
      isRead: false,
      isDismissed: false,
      isConnected: false,
      shownAt,
      skills: match.skills || [],
      industry: match.industry || null,
      domain: match.domain || null,
      expiresAt: match.expiresAt || null
    };
    
    this.muskMatches.set(id, muskMatch);
    return muskMatch;
  }

  async updateMuskMatch(id: number, matchData: Partial<MuskMatch>): Promise<MuskMatch | undefined> {
    const match = this.muskMatches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...matchData };
    this.muskMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async deleteMuskMatch(id: number): Promise<boolean> {
    return this.muskMatches.delete(id);
  }

  async markMuskMatchAsRead(id: number): Promise<MuskMatch | undefined> {
    const match = this.muskMatches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, isRead: true };
    this.muskMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async markMuskMatchAsDismissed(id: number): Promise<MuskMatch | undefined> {
    const match = this.muskMatches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, isDismissed: true };
    this.muskMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async markMuskMatchAsConnected(id: number): Promise<MuskMatch | undefined> {
    const match = this.muskMatches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, isConnected: true };
    this.muskMatches.set(id, updatedMatch);
    return updatedMatch;
  }

  async getPendingMuskMatches(userId: number): Promise<MuskMatch[]> {
    return Array.from(this.muskMatches.values())
      .filter(match => match.userId === userId && !match.isRead && !match.isDismissed)
      .sort((a, b) => {
        // Sort by match score (highest first)
        return (b.matchScore || 0) - (a.matchScore || 0);
      });
  }
  
  async getCompatibleMuskMatches(userId: number, limit: number = 5): Promise<MuskMatch[]> {
    // Get the user
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Create an array to hold potential matches
    const potentialMatches: { match: MuskMatch; score: number }[] = [];
    
    // Get all users except the current user
    const allUsers = await this.getAllUsers();
    const otherUsers = allUsers.filter(u => u.id !== userId);
    
    // For each potential match user
    for (const otherUser of otherUsers) {
      // Skip users without industry or lookingFor data
      if (!otherUser.industry || !otherUser.lookingFor) continue;
      
      // Compatibility logic
      let matchScore = 0;
      let matchReason = '';
      
      // 1. Check industry match (30%)
      if (user.industry && user.industry === otherUser.industry) {
        matchScore += 30;
        matchReason += `Same industry (${user.industry}). `;
      }
      
      // 2. Check domain match (20%) - if available
      if (user.domain && otherUser.domain && user.domain === otherUser.domain) {
        matchScore += 20;
        matchReason += `Same domain (${user.domain}). `;
      }
      
      // 3. Check looking for compatibility (30%)
      if (user.lookingFor && otherUser.lookingFor) {
        // Complementary lookingFor matches
        const complementaryPairs: {[key: string]: string[]} = {
          "A Career Mentor": ["To Mentor Others"],
          "To Mentor Others": ["A Career Mentor"],
          "Freelance Work": ["Hiring Freelancers"],
          "Hiring Freelancers": ["Freelance Work"],
          "Project Collaborators": ["Project Collaborators", "New Projects"],
          "New Projects": ["Project Collaborators"],
          "Industry Insights": ["To Share Knowledge"],
          "To Share Knowledge": ["Industry Insights"]
        };
        
        if (complementaryPairs[user.lookingFor]?.includes(otherUser.lookingFor)) {
          matchScore += 30;
          matchReason += `Complementary needs: You're looking for "${user.lookingFor}" and they're looking for "${otherUser.lookingFor}". `;
        }
      }
      
      // 4. Check for shared skills (20%) - if available
      const userSkills = await this.getSkillsByUserId(userId);
      const otherUserSkills = await this.getSkillsByUserId(otherUser.id);
      
      if (userSkills.length > 0 && otherUserSkills.length > 0) {
        const userSkillNames = userSkills.map(s => s.name.toLowerCase());
        const otherUserSkillNames = otherUserSkills.map(s => s.name.toLowerCase());
        
        // Count shared skills
        let sharedSkillCount = 0;
        const sharedSkills: string[] = [];
        
        userSkillNames.forEach(skill => {
          if (otherUserSkillNames.includes(skill)) {
            sharedSkillCount++;
            sharedSkills.push(skill);
          }
        });
        
        // Calculate skill match percentage (20% max)
        const skillMatchScore = Math.min(20, Math.floor((sharedSkillCount / Math.max(userSkillNames.length, 1)) * 20));
        matchScore += skillMatchScore;
        
        if (sharedSkills.length > 0) {
          matchReason += `${sharedSkills.length} shared skills: ${sharedSkills.slice(0, 3).join(', ')}${sharedSkills.length > 3 ? '...' : ''}. `;
        }
      }
      
      // Final score - minimum threshold of 40
      if (matchScore >= 40) {
        // Create a match object
        const match: InsertMuskMatch = {
          userId: userId,
          suggestedUserId: otherUser.id,
          matchType: user.lookingFor || 'general',
          matchScore: matchScore,
          matchReason: matchReason.trim(),
          industry: user.industry,
          domain: user.domain || null,
          skills: userSkills.slice(0, 5).map(s => s.name)
        };
        
        // Create the match
        const createdMatch = await this.createMuskMatch(match);
        
        // Add to potential matches array
        potentialMatches.push({ match: createdMatch, score: matchScore });
      }
    }
    
    // Sort by match score (highest first) and return limited results
    return potentialMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.match);
  }

  // Brands of the Day operations
  async getBrandsOfTheDay(): Promise<BrandOfTheDay[]> {
    return Array.from(this.brandsOfTheDay.values())
      .sort((a, b) => {
        const dateA = a.featuredDate.getTime();
        const dateB = b.featuredDate.getTime();
        return dateB - dateA; // Sort by date, newest first
      });
  }

  async getBrandsOfTheDayByDate(date: Date): Promise<BrandOfTheDay[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.brandsOfTheDay.values())
      .filter(brand => {
        const brandDate = brand.featuredDate;
        return brandDate >= startOfDay && brandDate <= endOfDay;
      })
      .sort((a, b) => {
        const scoreA = a.brandValueScore;
        const scoreB = b.brandValueScore;
        return scoreB - scoreA; // Sort by score, highest first
      });
  }

  async getBrandOfTheDayById(id: number): Promise<BrandOfTheDay | undefined> {
    return this.brandsOfTheDay.get(id);
  }

  async getBrandOfTheDayByIndustryAndDomain(industry: string, domain: string, date: Date): Promise<BrandOfTheDay | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.brandsOfTheDay.values())
      .find(brand => {
        const brandDate = brand.featuredDate;
        return brand.industry === industry &&
               brand.domain === domain &&
               brandDate >= startOfDay && 
               brandDate <= endOfDay;
      });
  }

  async getBrandsOfTheDayByUserId(userId: number): Promise<BrandOfTheDay[]> {
    return Array.from(this.brandsOfTheDay.values())
      .filter(brand => brand.userId === userId)
      .sort((a, b) => {
        const dateA = a.featuredDate.getTime();
        const dateB = b.featuredDate.getTime();
        return dateB - dateA; // Sort by date, newest first
      });
  }

  async createBrandOfTheDay(brand: InsertBrandOfTheDay): Promise<BrandOfTheDay> {
    const id = this.currentBrandOfTheDayId++;
    const createdAt = new Date();
    
    const newBrand: BrandOfTheDay = {
      ...brand,
      id,
      createdAt,
      isShared: false,
      shareCount: 0
    };
    
    this.brandsOfTheDay.set(id, newBrand);
    return newBrand;
  }

  async updateBrandOfTheDay(id: number, brand: Partial<BrandOfTheDay>): Promise<BrandOfTheDay | undefined> {
    const existingBrand = this.brandsOfTheDay.get(id);
    if (!existingBrand) {
      return undefined;
    }
    
    const updatedBrand = { ...existingBrand, ...brand };
    this.brandsOfTheDay.set(id, updatedBrand);
    return updatedBrand;
  }

  async markBrandOfTheDayAsShared(id: number): Promise<BrandOfTheDay | undefined> {
    const brand = this.brandsOfTheDay.get(id);
    if (!brand) {
      return undefined;
    }
    
    const updatedBrand: BrandOfTheDay = {
      ...brand,
      isShared: true,
      shareCount: brand.shareCount + 1
    };
    
    this.brandsOfTheDay.set(id, updatedBrand);
    return updatedBrand;
  }

  async calculateBrandValueScore(userId: number): Promise<{
    userId: number;
    brandValueScore: number;
    scoreBreakdown: {
      profileStrength: number;
      careerQuests: number;
      pulseActivity: number;
      portfolioProjects: number;
      engagement: number;
      muskUsage: number;
      consistency: number;
      badges: number;
    };
  }> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Initialize score breakdown
    const scoreBreakdown = {
      profileStrength: 0,  // Max 25 points
      careerQuests: 0,     // Max 15 points
      pulseActivity: 0,    // Max 15 points
      portfolioProjects: 0, // Max 10 points
      engagement: 0,       // Max 10 points
      muskUsage: 0,        // Max 10 points
      consistency: 0,      // Max 10 points
      badges: 0            // Max 5 points
    };

    // 1. Profile Strength (max 25 points)
    // Based on profile completedness percentage
    const profileCompleted = user.profileCompleted || 0;
    scoreBreakdown.profileStrength = Math.round((profileCompleted / 100) * 25);

    // 2. Career Quests (max 15 points)
    // Count completed quests in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedQuests = Array.from(this.userQuests.values())
      .filter(quest => 
        quest.userId === userId && 
        quest.status === 'completed' && 
        quest.completedAt && 
        quest.completedAt >= thirtyDaysAgo
      );
    
    // Each completed quest gives 1.5 points, max 15 points
    scoreBreakdown.careerQuests = Math.min(15, completedQuests.length * 1.5);

    // 3. Pulse Activity (max 15 points)
    // Count pulses in the last 30 days
    const recentPulses = Array.from(this.pulses.values())
      .filter(pulse => 
        pulse.userId === userId && 
        pulse.createdAt >= thirtyDaysAgo
      );
    
    // Each pulse is 3 points, max 15 points
    scoreBreakdown.pulseActivity = Math.min(15, recentPulses.length * 3);

    // 4. Portfolio/Projects (max 10 points)
    // Check if portfolio is published and count projects
    const portfolio = Array.from(this.portfolios.values())
      .find(p => p.userId === userId);
    
    const projects = Array.from(this.projects.values())
      .filter(p => p.userId === userId);
    
    // Published portfolio is 5 points, each project is 1 point, max 10 points
    const portfolioPoints = portfolio && portfolio.isPublished ? 5 : 0;
    scoreBreakdown.portfolioProjects = Math.min(10, portfolioPoints + projects.length);

    // 5. Engagement (max 10 points)
    // Count reactions, comments, shares in the last 30 days
    const recentReactions = Array.from(this.pulseReactions.values())
      .filter(r => r.userId === userId && r.createdAt >= thirtyDaysAgo);
    
    const recentComments = Array.from(this.pulseComments.values())
      .filter(c => c.userId === userId && c.createdAt >= thirtyDaysAgo);
    
    const recentShares = Array.from(this.pulseShares.values())
      .filter(s => s.userId === userId && s.createdAt >= thirtyDaysAgo);
    
    // Each engagement action is 0.5 points, max 10 points
    const engagementCount = recentReactions.length + recentComments.length + recentShares.length;
    scoreBreakdown.engagement = Math.min(10, engagementCount * 0.5);

    // 6. Musk Usage (max 10 points)
    // Count chat messages with Musk in the last 30 days
    const recentMuskMessages = Array.from(this.chatMessages.values())
      .filter(m => 
        m.userId === userId && 
        m.timestamp && 
        m.timestamp >= thirtyDaysAgo
      );
    
    // Each message is 0.5 points, max 10 points
    scoreBreakdown.muskUsage = Math.min(10, recentMuskMessages.length * 0.5);

    // 7. Consistency (max 10 points)
    // Check activity spread over time (last 30 days)
    const daysWithActivity = new Set<string>();
    
    // Collect dates from pulses, reactions, comments, messages
    [...recentPulses, ...recentReactions, ...recentComments, ...recentMuskMessages].forEach(item => {
      const date = item.createdAt || item.timestamp;
      if (date) {
        daysWithActivity.add(date.toISOString().split('T')[0]);
      }
    });
    
    // Activity on different days gives points, max 10 points
    scoreBreakdown.consistency = Math.min(10, daysWithActivity.size / 3);

    // 8. Badges (max 5 points)
    // Count badges
    const userBadges = Array.from(this.userBadges.values())
      .filter(b => b.userId === userId);
    
    // Each badge is 1 point, max 5 points
    scoreBreakdown.badges = Math.min(5, userBadges.length);

    // Calculate total brand value score
    const brandValueScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);

    return {
      userId,
      brandValueScore,
      scoreBreakdown
    };
  }

  // Career Quests operations - Quest Definition methods
  async getQuestDefinitions(): Promise<QuestDefinition[]> {
    return Array.from(this.questDefinitions.values());
  }

  async getQuestDefinitionById(id: number): Promise<QuestDefinition | undefined> {
    return this.questDefinitions.get(id);
  }

  async getActiveQuestDefinitions(): Promise<QuestDefinition[]> {
    return Array.from(this.questDefinitions.values())
      .filter(quest => quest.isActive);
  }

  async getQuestDefinitionsByType(type: string): Promise<QuestDefinition[]> {
    return Array.from(this.questDefinitions.values())
      .filter(quest => quest.type === type && quest.isActive);
  }

  async createQuestDefinition(quest: InsertQuestDefinition): Promise<QuestDefinition> {
    const id = this.currentQuestDefinitionId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const questDefinition: QuestDefinition = {
      ...quest,
      id,
      createdAt,
      updatedAt,
      targetCount: quest.targetCount ?? 1,
      xpReward: quest.xpReward ?? 50,
      requiredProfileCompletion: quest.requiredProfileCompletion ?? 0,
      requiredCareerStage: quest.requiredCareerStage ?? null,
      requiredIndustry: quest.requiredIndustry ?? null,
      muskTip: quest.muskTip ?? null,
      badgeReward: quest.badgeReward ?? null,
      isActive: quest.isActive ?? true
    };
    
    this.questDefinitions.set(id, questDefinition);
    return questDefinition;
  }

  async updateQuestDefinition(id: number, quest: Partial<QuestDefinition>): Promise<QuestDefinition | undefined> {
    const existingQuest = this.questDefinitions.get(id);
    if (!existingQuest) return undefined;
    
    const updatedQuest: QuestDefinition = {
      ...existingQuest,
      ...quest,
      updatedAt: new Date()
    };
    
    this.questDefinitions.set(id, updatedQuest);
    return updatedQuest;
  }

  async deleteQuestDefinition(id: number): Promise<boolean> {
    return this.questDefinitions.delete(id);
  }

  // User Quest operations
  async getUserQuestsByUserId(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values())
      .filter(quest => quest.userId === userId)
      .sort((a, b) => {
        // Sort by most recently assigned first
        const timeA = a.assignedAt ? a.assignedAt.getTime() : 0;
        const timeB = b.assignedAt ? b.assignedAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async getUserQuestById(id: number): Promise<UserQuest | undefined> {
    return this.userQuests.get(id);
  }

  async getActiveUserQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values())
      .filter(quest => quest.userId === userId && quest.status === "active")
      .sort((a, b) => {
        // Sort by most recently assigned first
        const timeA = a.assignedAt ? a.assignedAt.getTime() : 0;
        const timeB = b.assignedAt ? b.assignedAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async getCompletedUserQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values())
      .filter(quest => quest.userId === userId && quest.status === "completed")
      .sort((a, b) => {
        // Sort by most recently completed first
        const timeA = a.completedAt ? a.completedAt.getTime() : 0;
        const timeB = b.completedAt ? b.completedAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async getCurrentWeekUserQuests(userId: number): Promise<UserQuest[]> {
    // Get current week number and year
    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    return Array.from(this.userQuests.values())
      .filter(quest => 
        quest.userId === userId && 
        quest.weekNumber === currentWeek &&
        quest.year === currentYear)
      .sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return 0;
      });
  }

  async createUserQuest(quest: InsertUserQuest): Promise<UserQuest> {
    const id = this.currentUserQuestId++;
    const assignedAt = new Date();
    
    // Get current week number and year if not provided
    const now = new Date();
    const weekNumber = quest.weekNumber || this.getWeekNumber(now);
    const year = quest.year || now.getFullYear();
    
    const userQuest: UserQuest = {
      ...quest,
      id,
      assignedAt,
      weekNumber,
      year,
      progress: quest.progress ?? 0,
      status: quest.status ?? "active",
      completedAt: null,
      dismissedReason: null,
      xpEarned: null,
      badgeEarned: null,
      muskResponse: null
    };
    
    this.userQuests.set(id, userQuest);
    return userQuest;
  }

  async updateUserQuest(id: number, quest: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const existingQuest = this.userQuests.get(id);
    if (!existingQuest) return undefined;
    
    const updatedQuest: UserQuest = {
      ...existingQuest,
      ...quest
    };
    
    this.userQuests.set(id, updatedQuest);
    return updatedQuest;
  }

  async completeUserQuest(id: number, earnedXp?: number): Promise<UserQuest | undefined> {
    const quest = this.userQuests.get(id);
    if (!quest) return undefined;
    
    // Only complete if active
    if (quest.status !== "active") return quest;
    
    // Get quest definition
    const questDefinition = await this.getQuestDefinitionById(quest.questDefinitionId);
    if (!questDefinition) return undefined;
    
    // Set XP earned (either provided or from quest definition)
    const xpEarned = earnedXp || questDefinition.xpReward;
    
    // Update the quest
    const completedQuest: UserQuest = {
      ...quest,
      status: "completed",
      completedAt: new Date(),
      progress: questDefinition.targetCount, // Set to target count
      xpEarned,
      badgeEarned: questDefinition.badgeReward || null
    };
    
    this.userQuests.set(id, completedQuest);
    
    // If there's a badge reward, award it to the user
    if (questDefinition.badgeReward) {
      await this.createUserBadge({
        userId: quest.userId,
        badgeType: questDefinition.badgeReward,
        questId: id,
        displayOnProfile: true,
        displayOnResume: false
      });
    }
    
    // Add XP to user account
    await this.incrementUserXp(
      quest.userId, 
      xpEarned, 
      "quest_completion", 
      id
    );
    
    return completedQuest;
  }

  async dismissUserQuest(id: number, reason?: string): Promise<UserQuest | undefined> {
    const quest = this.userQuests.get(id);
    if (!quest) return undefined;
    
    // Only dismiss if active
    if (quest.status !== "active") return quest;
    
    const dismissedQuest: UserQuest = {
      ...quest,
      status: "dismissed",
      dismissedReason: reason || null
    };
    
    this.userQuests.set(id, dismissedQuest);
    return dismissedQuest;
  }

  async incrementQuestProgress(id: number): Promise<UserQuest | undefined> {
    const quest = this.userQuests.get(id);
    if (!quest) return undefined;
    
    // Only increment if active
    if (quest.status !== "active") return quest;
    
    // Get quest definition
    const questDefinition = await this.getQuestDefinitionById(quest.questDefinitionId);
    if (!questDefinition) return undefined;
    
    // Calculate new progress
    const newProgress = quest.progress + 1;
    
    // Update the quest
    const updatedQuest: UserQuest = {
      ...quest,
      progress: newProgress
    };
    
    this.userQuests.set(id, updatedQuest);
    
    // If progress meets the target, complete the quest
    if (newProgress >= questDefinition.targetCount) {
      return this.completeUserQuest(id);
    }
    
    return updatedQuest;
  }

  async assignWeeklyQuestsToUser(userId: number): Promise<UserQuest[]> {
    // Get current week number and year
    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    // Check if user already has quests for this week
    const existingWeeklyQuests = await this.getCurrentWeekUserQuests(userId);
    if (existingWeeklyQuests.length > 0) {
      return existingWeeklyQuests;
    }
    
    // Get user for profile completion check
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Get all active quest definitions
    const allQuests = await this.getActiveQuestDefinitions();
    
    // Filter quests based on user's profile completion level
    const eligibleQuests = allQuests.filter(quest => {
      if (quest.requiredProfileCompletion && user.profileCompleted < quest.requiredProfileCompletion) {
        return false;
      }
      
      // Filter by required career stage or industry if specified
      if (quest.requiredCareerStage && user.title && !user.title.toLowerCase().includes(quest.requiredCareerStage.toLowerCase())) {
        return false;
      }
      
      if (quest.requiredIndustry && user.industry && user.industry !== quest.requiredIndustry) {
        return false;
      }
      
      return true;
    });
    
    // Randomly select 5 quests (or all if less than 5)
    const numQuests = Math.min(5, eligibleQuests.length);
    const selectedQuests: QuestDefinition[] = [];
    
    // Try to get at least one quest of each type if possible
    const questTypes = [...new Set(eligibleQuests.map(q => q.type))];
    
    for (const type of questTypes) {
      const typeQuests = eligibleQuests.filter(q => q.type === type);
      if (typeQuests.length > 0) {
        // Randomly select one quest of this type
        const randomIndex = Math.floor(Math.random() * typeQuests.length);
        selectedQuests.push(typeQuests[randomIndex]);
        
        // Break if we have enough quests
        if (selectedQuests.length >= numQuests) break;
      }
    }
    
    // If we still need more quests, randomly select from the remaining
    if (selectedQuests.length < numQuests) {
      const remainingQuests = eligibleQuests.filter(q => !selectedQuests.includes(q));
      
      while (selectedQuests.length < numQuests && remainingQuests.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingQuests.length);
        selectedQuests.push(remainingQuests[randomIndex]);
        remainingQuests.splice(randomIndex, 1);
      }
    }
    
    // Create user quests for the selected quest definitions
    const createdQuests: UserQuest[] = [];
    
    for (const questDef of selectedQuests) {
      const quest = await this.createUserQuest({
        userId,
        questDefinitionId: questDef.id,
        status: "active",
        progress: 0,
        weekNumber: currentWeek,
        year: currentYear
      });
      
      createdQuests.push(quest);
    }
    
    return createdQuests;
  }

  // User XP operations
  async getUserXp(userId: number): Promise<UserXp | undefined> {
    return Array.from(this.userXp.values())
      .find(xp => xp.userId === userId);
  }

  async createUserXp(userXp: InsertUserXp): Promise<UserXp> {
    const id = this.currentUserXpId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newUserXp: UserXp = {
      ...userXp,
      id,
      createdAt,
      updatedAt,
      balance: userXp.balance ?? 0,
      lifetimeEarned: userXp.lifetimeEarned ?? 0,
      currentMonthEarned: userXp.currentMonthEarned ?? 0,
      lastEarnedAt: userXp.lastEarnedAt ?? null,
      lastResetAt: userXp.lastResetAt ?? null
    };
    
    this.userXp.set(id, newUserXp);
    return newUserXp;
  }

  async updateUserXp(id: number, userXp: Partial<UserXp>): Promise<UserXp | undefined> {
    const existingXp = this.userXp.get(id);
    if (!existingXp) return undefined;
    
    const updatedXp: UserXp = {
      ...existingXp,
      ...userXp,
      updatedAt: new Date()
    };
    
    this.userXp.set(id, updatedXp);
    return updatedXp;
  }

  async incrementUserXp(userId: number, amount: number, source: string, sourceId?: number): Promise<{ 
    userXp: UserXp, 
    transaction: XpTransaction 
  }> {
    // Get or create user XP record
    let userXp = await this.getUserXp(userId);
    
    // Check if we need to reset month counters
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    if (userXp) {
      // Check if we need to reset monthly XP (different month)
      if (userXp.lastResetAt) {
        const lastResetMonth = userXp.lastResetAt.getMonth();
        const lastResetYear = userXp.lastResetAt.getFullYear();
        
        if (lastResetMonth !== currentMonth || lastResetYear !== currentYear) {
          userXp = await this.updateUserXp(userXp.id, {
            currentMonthEarned: 0,
            lastResetAt: now
          });
        }
      }
      
      // Update existing record
      userXp = await this.updateUserXp(userXp.id, {
        balance: userXp.balance + amount,
        lifetimeEarned: userXp.lifetimeEarned + amount,
        currentMonthEarned: userXp.currentMonthEarned + amount,
        lastEarnedAt: now
      });
    } else {
      // Create new record
      userXp = await this.createUserXp({
        userId,
        balance: amount,
        lifetimeEarned: amount,
        currentMonthEarned: amount,
        lastEarnedAt: now,
        lastResetAt: now
      });
    }
    
    // Create transaction record
    const transaction = await this.createXpTransaction({
      userId,
      amount,
      source,
      sourceId,
      description: this.getXpTransactionDescription(source, amount, sourceId)
    });
    
    return { userXp, transaction };
  }

  async resetMonthlyXp(userId: number): Promise<UserXp | undefined> {
    const userXp = await this.getUserXp(userId);
    if (!userXp) return undefined;
    
    return this.updateUserXp(userXp.id, {
      currentMonthEarned: 0,
      lastResetAt: new Date()
    });
  }

  // Helper function to generate transaction descriptions
  private getXpTransactionDescription(source: string, amount: number, sourceId?: number): string {
    switch (source) {
      case "quest_completion":
        return `Earned ${amount} XP for completing a quest`;
      case "daily_login":
        return `Earned ${amount} XP for daily login`;
      case "pulse_reaction":
        return `Earned ${amount} XP for reacting to a pulse`;
      case "pulse_share":
        return `Earned ${amount} XP for sharing a pulse`;
      case "project_upload":
        return `Earned ${amount} XP for uploading a project`;
      case "musk_suggestion":
        return `Earned ${amount} XP for accepting a Musk suggestion`;
      case "weekly_quest_completion":
        return `Earned ${amount} XP for completing all weekly quests`;
      default:
        return `Earned ${amount} XP`;
    }
  }

  // User Badge operations
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(badge => badge.userId === userId)
      .sort((a, b) => {
        // Sort by most recently earned first
        const timeA = a.earnedAt ? a.earnedAt.getTime() : 0;
        const timeB = b.earnedAt ? b.earnedAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async getUserBadgeById(id: number): Promise<UserBadge | undefined> {
    return this.userBadges.get(id);
  }

  async getUserBadgesByType(userId: number, badgeType: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(badge => badge.userId === userId && badge.badgeType === badgeType)
      .sort((a, b) => {
        // Sort by most recently earned first
        const timeA = a.earnedAt ? a.earnedAt.getTime() : 0;
        const timeB = b.earnedAt ? b.earnedAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async createUserBadge(badge: InsertUserBadge): Promise<UserBadge> {
    const id = this.currentUserBadgeId++;
    const earnedAt = new Date();
    
    const userBadge: UserBadge = {
      ...badge,
      id,
      earnedAt,
      displayOnProfile: badge.displayOnProfile ?? true,
      displayOnResume: badge.displayOnResume ?? false
    };
    
    this.userBadges.set(id, userBadge);
    return userBadge;
  }

  async updateUserBadge(id: number, badge: Partial<UserBadge>): Promise<UserBadge | undefined> {
    const existingBadge = this.userBadges.get(id);
    if (!existingBadge) return undefined;
    
    const updatedBadge: UserBadge = {
      ...existingBadge,
      ...badge
    };
    
    this.userBadges.set(id, updatedBadge);
    return updatedBadge;
  }

  async toggleBadgeDisplay(id: number, displayOnProfile: boolean, displayOnResume: boolean): Promise<UserBadge | undefined> {
    return this.updateUserBadge(id, { displayOnProfile, displayOnResume });
  }

  // XP Transaction operations
  async getXpTransactions(userId: number): Promise<XpTransaction[]> {
    return Array.from(this.xpTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => {
        // Sort by most recent first
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async getXpTransactionById(id: number): Promise<XpTransaction | undefined> {
    return this.xpTransactions.get(id);
  }

  async getXpTransactionsBySource(userId: number, source: string): Promise<XpTransaction[]> {
    return Array.from(this.xpTransactions.values())
      .filter(transaction => transaction.userId === userId && transaction.source === source)
      .sort((a, b) => {
        // Sort by most recent first
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }

  async createXpTransaction(transaction: InsertXpTransaction): Promise<XpTransaction> {
    const id = this.currentXpTransactionId++;
    const createdAt = new Date();
    
    const xpTransaction: XpTransaction = {
      ...transaction,
      id,
      createdAt,
      sourceId: transaction.sourceId ?? null
    };
    
    this.xpTransactions.set(id, xpTransaction);
    return xpTransaction;
  }

  // Helper function to calculate week number (1-52) from date
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

// Import the database connection
import { db, pool, executeWithRetry, sql } from './db';
import { eq } from 'drizzle-orm';

/**
 * DatabaseStorage implementation that connects to a PostgreSQL database via Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    console.log(`[db.getUser] Looking up user with ID: ${id}`);
    
    // Use the retry mechanism for resilient fetching
    return executeWithRetry(async () => {
      try {
        // Simple query first to verify connection
        const testQuery = await pool.query('SELECT 1 as test');
        console.log(`[db.getUser] Test query result:`, testQuery.rows);
        
        // Now actual user query
        const query = `
          SELECT 
            id, username, email, password, phone_number as "phoneNumber", 
            name, photo_url as "photoURL", title, about_me as "aboutMe", 
            location, industry, domain, looking_for as "lookingFor", what_i_offer as "whatIOffer", 
            visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
            email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
            email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
          FROM users
          WHERE id = $1
        `;
        
        console.log(`[db.getUser] Executing query: ${query.replace(/\s+/g, ' ')} with params [${id}]`);
        
        const result = await pool.query(query, [id]);
        
        console.log(`[db.getUser] Query returned ${result.rows.length} rows:`, JSON.stringify(result.rows));
        
        if (result.rows.length > 0) {
          const user = result.rows[0] as User;
          console.log(`[db.getUser] User found:`, JSON.stringify(user));
          return user;
        }
        console.log(`[db.getUser] No user found with ID ${id}`);
        return undefined;
      } catch (error) {
        console.error(`[db.getUser] Error fetching user with ID ${id}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getUser] All retries failed for user ID ${id}:`, error);
      return undefined; // Final fallback to prevent UI from breaking
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    console.log(`[db.getUserByEmail] Looking up user with email: ${email}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT 
            id, username, email, password, phone_number as "phoneNumber", 
            name, photo_url as "photoURL", title, about_me as "aboutMe", 
            location, industry, domain, looking_for as "lookingFor", what_i_offer as "whatIOffer",
            visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
            email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
            email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
          FROM users
          WHERE email = $1
        `, [email]);
        
        console.log(`[db.getUserByEmail] Query returned ${result.rows.length} rows`);
        
        if (result.rows.length > 0) {
          return result.rows[0] as User;
        }
        return undefined;
      } catch (error) {
        console.error(`[db.getUserByEmail] Error fetching user with email ${email}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getUserByEmail] All retries failed for email ${email}:`, error);
      return undefined; // Final fallback to prevent UI from breaking
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`[db.getUserByUsername] Looking up user with username: ${username}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT 
            id, username, email, password, phone_number as "phoneNumber", 
            name, photo_url as "photoURL", title, about_me as "aboutMe", 
            location, industry, domain, looking_for as "lookingFor", what_i_offer as "whatIOffer",
            visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
            email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
            email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
          FROM users
          WHERE username = $1
        `, [username]);
        
        console.log(`[db.getUserByUsername] Query returned ${result.rows.length} rows`);
        
        if (result.rows.length > 0) {
          return result.rows[0] as User;
        }
        return undefined;
      } catch (error) {
        console.error(`[db.getUserByUsername] Error fetching user with username ${username}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getUserByUsername] All retries failed for username ${username}:`, error);
      return undefined; // Final fallback to prevent UI from breaking
    });
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    console.log(`[db.getUserByPhoneNumber] Looking up user with phone number: ${phoneNumber}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT 
            id, username, email, password, phone_number as "phoneNumber", 
            name, photo_url as "photoURL", title, about_me as "aboutMe", 
            location, industry, domain, looking_for as "lookingFor", what_i_offer as "whatIOffer",
            visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", 
            email_verified as "emailVerified", email_verification_token as "emailVerificationToken", 
            email_verification_expires as "emailVerificationExpires", created_at as "createdAt"
          FROM users
          WHERE phone_number = $1
        `, [phoneNumber]);
        
        console.log(`[db.getUserByPhoneNumber] Query returned ${result.rows.length} rows`);
        
        if (result.rows.length > 0) {
          return result.rows[0] as User;
        }
        return undefined;
      } catch (error) {
        console.error(`[db.getUserByPhoneNumber] Error fetching user with phone number ${phoneNumber}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getUserByPhoneNumber] All retries failed for phone number ${phoneNumber}:`, error);
      return undefined; // Final fallback to prevent UI from breaking
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    console.log(`[DatabaseStorage.updateUser] Updating user with ID: ${id}`);
    console.log(`[DatabaseStorage.updateUser] Update data:`, userData);
    
    // First validate the data by removing any fields that don't match the schema
    const validKeys = [
      'id', 'username', 'email', 'password', 'phoneNumber', 'name', 
      'photoURL', 'title', 'aboutMe', 'location', 'industry', 'domain', 
      'lookingFor', 'whatIOffer', 'visitingCardType', 'profileCompleted',
      'emailVerified', 'emailVerificationToken', 'emailVerificationExpires',
      'createdAt'
    ];
    
    // Filter out any keys that don't match our schema or start with _
    const cleanedUserData: Partial<User> = Object.fromEntries(
      Object.entries(userData).filter(([key]) => 
        validKeys.includes(key) && !key.startsWith('_')
      )
    );
    
    // Log cleaned data 
    console.log(`[DatabaseStorage.updateUser] Cleaned user data:`, cleanedUserData);
    
    // Skip update if no valid fields remain
    if (Object.keys(cleanedUserData).length === 0) {
      console.log(`[DatabaseStorage.updateUser] No valid fields to update for user ${id}`);
      const existingUser = await this.getUser(id);
      return existingUser;
    }
    
    // Use retry mechanism to handle intermittent database issues
    return executeWithRetry(async () => {
      try {
        // Direct SQL query for updating user data with improved reliability
        let updateQuery = 'UPDATE users SET ';
        const updateValues: any[] = [];
        const updateParts: string[] = [];
        let paramIndex = 1;
        
        // Add each property to the update
        for (const [key, value] of Object.entries(cleanedUserData)) {
          // Convert camelCase to snake_case for PostgreSQL
          let columnName = "";
          
          // Handle special cases like photoURL -> photo_url (not photo_u_r_l)
          if (key === "photoURL") {
            columnName = "photo_url";
          } else if (key === "phoneNumber") {
            columnName = "phone_number";
          } else if (key === "aboutMe") {
            columnName = "about_me";
          } else if (key === "whatIOffer") {
            columnName = "what_i_offer";
          } else if (key === "lookingFor") {
            columnName = "looking_for";
          } else if (key === "visitingCardType") {
            columnName = "visiting_card_type";
          } else if (key === "profileCompleted") {
            columnName = "profile_completed";
          } else if (key === "emailVerified") {
            columnName = "email_verified";
          } else if (key === "emailVerificationToken") {
            columnName = "email_verification_token";
          } else if (key === "emailVerificationExpires") {
            columnName = "email_verification_expires";
          } else if (key === "createdAt") {
            columnName = "created_at";
          } else {
            // Standard camelCase to snake_case for other fields
            columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          }
          
          updateParts.push(`${columnName} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
        
        // Add WHERE clause and returning
        updateQuery += updateParts.join(', ');
        updateQuery += ` WHERE id = $${paramIndex} RETURNING id, username, email, password, phone_number as "phoneNumber", name, photo_url as "photoURL", title, about_me as "aboutMe", location, industry, domain, looking_for as "lookingFor", what_i_offer as "whatIOffer", visiting_card_type as "visitingCardType", profile_completed as "profileCompleted", email_verified as "emailVerified", email_verification_token as "emailVerificationToken", email_verification_expires as "emailVerificationExpires", created_at as "createdAt"`;
        updateValues.push(id);
        
        console.log(`[DatabaseStorage.updateUser] Generated query:`, updateQuery);
        console.log(`[DatabaseStorage.updateUser] Query params:`, updateValues);
        
        const result = await pool.query(updateQuery, updateValues);
        
        if (result.rows.length === 0) {
          console.log(`[DatabaseStorage.updateUser] No user found with ID ${id}`);
          return undefined;
        }
        
        const updatedUser = result.rows[0];
        console.log(`[DatabaseStorage.updateUser] Updated user successfully:`, updatedUser);
        
        // Verify critical fields were updated correctly
        for (const [key, value] of Object.entries(cleanedUserData)) {
          // Handle null values properly
          const updatedValue = updatedUser[key];
          if (value !== updatedValue) {
            console.warn(`[DatabaseStorage.updateUser] Field '${key}' may not have updated correctly.`);
            console.warn(`Expected: ${value}, Got: ${updatedValue}`);
          }
        }
        
        return updatedUser;
      } catch (error) {
        console.error(`[DatabaseStorage.updateUser] Error updating user:`, error);
        throw error;
      }
    }, 3, 1000); // 3 retries, starting with 1000ms delay
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Work Experience operations
  async getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]> {
    console.log(`[db.getWorkExperiencesByUserId] Looking for experiences with userId: ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", title, company, location, 
                industry, start_date as "startDate", end_date as "endDate", 
                description
          FROM work_experiences
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[db.getWorkExperiencesByUserId] Found ${result.rows.length} work experiences for user ${userId}`);
        
        return result.rows;
      } catch (error) {
        console.error(`[db.getWorkExperiencesByUserId] Error fetching work experiences for user ${userId}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getWorkExperiencesByUserId] All retries failed for user ${userId}:`, error);
      // Return empty array on error instead of throwing, to prevent UI from breaking
      return [];
    });
  }

  async getWorkExperienceById(id: number): Promise<WorkExperience | undefined> {
    const [experience] = await db.select().from(workExperiences).where(eq(workExperiences.id, id));
    return experience || undefined;
  }

  async createWorkExperience(insertExperience: InsertWorkExperience): Promise<WorkExperience> {
    console.log(`[db.createWorkExperience] Creating work experience for user ${insertExperience.userId}`);
    const [experience] = await db.insert(workExperiences).values(insertExperience).returning();
    return experience;
  }

  async updateWorkExperience(id: number, experienceData: Partial<WorkExperience>): Promise<WorkExperience | undefined> {
    const [updatedExperience] = await db
      .update(workExperiences)
      .set(experienceData)
      .where(eq(workExperiences.id, id))
      .returning();
    return updatedExperience || undefined;
  }

  async deleteWorkExperience(id: number): Promise<boolean> {
    const result = await db.delete(workExperiences).where(eq(workExperiences.id, id));
    return result.rowCount > 0;
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    console.log(`[db.getEducationsByUserId] Looking for education records with userId: ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", degree, institution, location, 
                 start_date as "startDate", end_date as "endDate"
          FROM educations
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[db.getEducationsByUserId] Found ${result.rows.length} education records for user ${userId}`);
        
        return result.rows;
      } catch (error) {
        console.error(`[db.getEducationsByUserId] Error fetching education records for user ${userId}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getEducationsByUserId] All retries failed for user ${userId}:`, error);
      // Return empty array on error instead of throwing, to prevent UI from breaking
      return [];
    });
  }

  async getEducationById(id: number): Promise<Education | undefined> {
    const [education] = await db.select().from(educations).where(eq(educations.id, id));
    return education || undefined;
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    console.log(`[db.createEducation] Creating education record for user ${insertEducation.userId}`);
    try {
      const result = await pool.query(`
        INSERT INTO educations (
          user_id, degree, institution, location, start_date, end_date
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING 
          id, user_id as "userId", degree, institution, location, 
          start_date as "startDate", end_date as "endDate"
      `, [
        insertEducation.userId,
        insertEducation.degree,
        insertEducation.institution,
        insertEducation.location,
        insertEducation.startDate,
        insertEducation.endDate
      ]);
      
      console.log(`[db.createEducation] Created education record with ID ${result.rows[0].id}`);
      
      return result.rows[0];
    } catch (error) {
      console.error(`[db.createEducation] Error creating education record:`, error);
      throw error;
    }
  }

  async updateEducation(id: number, educationData: Partial<Education>): Promise<Education | undefined> {
    console.log(`[db.updateEducation] Updating education record with ID ${id}`);
    try {
      // Build the SET clause dynamically based on what fields are provided
      const updateFields: string[] = [];
      const values: any[] = [];
      let valueIndex = 1;
      
      // Handle each possible field that could be updated
      if (educationData.degree !== undefined) {
        updateFields.push(`degree = $${valueIndex++}`);
        values.push(educationData.degree);
      }
      
      if (educationData.institution !== undefined) {
        updateFields.push(`institution = $${valueIndex++}`);
        values.push(educationData.institution);
      }
      
      if (educationData.location !== undefined) {
        updateFields.push(`location = $${valueIndex++}`);
        values.push(educationData.location);
      }
      
      if (educationData.startDate !== undefined) {
        updateFields.push(`start_date = $${valueIndex++}`);
        values.push(educationData.startDate);
      }
      
      if (educationData.endDate !== undefined) {
        updateFields.push(`end_date = $${valueIndex++}`);
        values.push(educationData.endDate);
      }
      
      // If no fields were provided to update, return the original education
      if (updateFields.length === 0) {
        console.log(`[db.updateEducation] No fields to update for education ${id}`);
        return this.getEducationById(id);
      }
      
      // Add the ID as the last parameter
      values.push(id);
      
      const updateQuery = `
        UPDATE educations 
        SET ${updateFields.join(', ')} 
        WHERE id = $${valueIndex}
        RETURNING id, user_id as "userId", degree, institution, location, 
                 start_date as "startDate", end_date as "endDate"
      `;
      
      console.log(`[db.updateEducation] Executing update query for education ${id}`);
      const result = await pool.query(updateQuery, values);
      
      if (result.rows.length > 0) {
        console.log(`[db.updateEducation] Successfully updated education ${id}`);
        return result.rows[0];
      }
      
      console.log(`[db.updateEducation] No education found with ID ${id}`);
      return undefined;
    } catch (error) {
      console.error(`[db.updateEducation] Error updating education with ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteEducation(id: number): Promise<boolean> {
    console.log(`[db.deleteEducation] Deleting education record with ID ${id}`);
    try {
      const result = await pool.query(`
        DELETE FROM educations
        WHERE id = $1
        RETURNING id
      `, [id]);
      
      const deleted = result.rows.length > 0;
      console.log(`[db.deleteEducation] Deleted education record with ID ${id}: ${deleted}`);
      return deleted;
    } catch (error) {
      console.error(`[db.deleteEducation] Error deleting education with ID ${id}:`, error);
      return false;
    }
  }

  // Skill operations
  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    console.log(`[db.getSkillsByUserId] Looking for skills with userId: ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", name, level, proficiency
          FROM skills
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[db.getSkillsByUserId] Found ${result.rows.length} skills for user ${userId}`);
        
        return result.rows;
      } catch (error) {
        console.error(`[db.getSkillsByUserId] Error fetching skills for user ${userId}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getSkillsByUserId] All retries failed for user ${userId}:`, error);
      // Return empty array on error instead of throwing, to prevent UI from breaking
      return [];
    });
  }

  async getSkillById(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set(skillData)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill || undefined;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id));
    return result.rowCount > 0;
  }

  // Project operations
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    console.log(`[db.getProjectsByUserId] Looking for projects with userId: ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", title, description, start_date as "startDate",
                project_url as "projectUrl", category, thumbnail_url as "thumbnailUrl",
                thumbnail_file as "thumbnailFile", media_urls as "mediaUrls",
                created_at as "createdAt", updated_at as "updatedAt"
          FROM projects
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[db.getProjectsByUserId] Found ${result.rows.length} projects for user ${userId}`);
        
        // Parse mediaUrls from JSON string to array for each project
        const projectsWithParsedMediaUrls = result.rows.map(project => {
          try {
            if (project.mediaUrls && typeof project.mediaUrls === 'string') {
              project.mediaUrls = JSON.parse(project.mediaUrls);
            }
          } catch (parseError) {
            console.error(`[db.getProjectsByUserId] Error parsing mediaUrls for project ${project.id}:`, parseError);
            // Keep original string if parsing fails
          }
          return project;
        });
        
        return projectsWithParsedMediaUrls;
      } catch (error) {
        console.error(`[db.getProjectsByUserId] Error fetching projects for user ${userId}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[db.getProjectsByUserId] All retries failed for user ${userId}:`, error);
      // Return empty array on error instead of throwing, to prevent UI from breaking
      return [];
    });
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Portfolio operations
  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    try {
      console.log(`[db.getPortfolioByUserId] Looking for portfolio for user ${userId}`);
      
      const result = await pool.query(`
        SELECT 
          id, 
          user_id as "userId", 
          layout, 
          custom_title as "customTitle", 
          custom_bio as "customBio", 
          customization_options as "customizationOptions", 
          is_published as "isPublished", 
          public_url as "publicUrl", 
          featured_projects as "featuredProjects", 
          featured_skills as "featuredSkills", 
          featured_experiences as "featuredExperiences", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM portfolios
        WHERE user_id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getPortfolioByUserId] No portfolio found for user ${userId}`);
        return undefined;
      }
      
      console.log(`[db.getPortfolioByUserId] Found portfolio for user ${userId}:`, result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getPortfolioByUserId] Error fetching portfolio for user ${userId}:`, error);
      return undefined;
    }
  }

  async getPortfolioById(id: number): Promise<Portfolio | undefined> {
    try {
      console.log(`[db.getPortfolioById] Looking for portfolio with ID ${id}`);
      
      const result = await pool.query(`
        SELECT 
          id, 
          user_id as "userId", 
          layout, 
          custom_title as "customTitle", 
          custom_bio as "customBio", 
          customization_options as "customizationOptions", 
          is_published as "isPublished", 
          public_url as "publicUrl", 
          featured_projects as "featuredProjects", 
          featured_skills as "featuredSkills", 
          featured_experiences as "featuredExperiences", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM portfolios
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getPortfolioById] No portfolio found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.getPortfolioById] Found portfolio with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getPortfolioById] Error fetching portfolio with ID ${id}:`, error);
      return undefined;
    }
  }

  // Service operations
  async getServicesByUserId(userId: number): Promise<Service[]> {
    console.log(`[storage.getServicesByUserId] Fetching services for user ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        // Use direct pool query for more control over the result format
        const result = await pool.query(`
          SELECT 
            id, 
            user_id as "userId", 
            title, 
            description, 
            category, 
            price_inr as "priceInr", 
            price_usd as "priceUsd",
            is_hourly as "isHourly", 
            features, 
            image_url as "imageUrl",
            "order", 
            is_active as "isActive", 
            created_at as "createdAt", 
            updated_at as "updatedAt"
          FROM services
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[storage.getServicesByUserId] Found ${result.rows.length} services for user ${userId} (Query returned ${result.rowCount} rows)`);
        
        return result.rows;
      } catch (error) {
        console.error(`[storage.getServicesByUserId] Error fetching services for user ${userId}:`, error);
        throw error; // Rethrow for retry mechanism
      }
    }, 3, 800).catch(error => {
      console.error(`[storage.getServicesByUserId] All retries failed for user ${userId}:`, error);
      // Return empty array on error instead of throwing, to prevent UI from breaking
      return [];
    });
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }

  // Additional methods from IStorage will be implemented as needed
  // This is a partial implementation for the demo profile data requirement
  
  // Brand of the Day operations
  async getBrandsOfTheDay(): Promise<BrandOfTheDay[]> {
    try {
      console.log('[db.getBrandsOfTheDay] Fetching all brands of the day');
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
        FROM brands_of_the_day
        ORDER BY featured_date DESC
      `);
      
      console.log(`[db.getBrandsOfTheDay] Found ${result.rows.length} brands of the day`);
      return result.rows;
    } catch (error) {
      console.error('[db.getBrandsOfTheDay] Error fetching brands of the day:', error);
      return [];
    }
  }
  
  async getBrandsOfTheDayByDate(date: Date): Promise<BrandOfTheDay[]> {
    try {
      console.log(`[db.getBrandsOfTheDayByDate] Fetching brands of the day for date ${date.toISOString()}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
        FROM brands_of_the_day
        WHERE featured_date::date = $1::date
        ORDER BY industry
      `, [date.toISOString().split('T')[0]]);
      
      console.log(`[db.getBrandsOfTheDayByDate] Found ${result.rows.length} brands of the day for date ${date.toISOString().split('T')[0]}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getBrandsOfTheDayByDate] Error fetching brands of the day for date ${date.toISOString()}:`, error);
      return [];
    }
  }
  
  async getBrandOfTheDayById(id: number): Promise<BrandOfTheDay | undefined> {
    try {
      console.log(`[db.getBrandOfTheDayById] Looking for brand of the day with ID ${id}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
        FROM brands_of_the_day
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getBrandOfTheDayById] No brand of the day found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.getBrandOfTheDayById] Found brand of the day with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getBrandOfTheDayById] Error fetching brand of the day with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async getBrandOfTheDayByIndustryAndDomain(industry: string, domain: string, date?: Date): Promise<BrandOfTheDay | undefined> {
    try {
      console.log(`[db.getBrandOfTheDayByIndustryAndDomain] Looking for brand of the day for industry ${industry} and domain ${domain}`);
      
      let query = `
        SELECT 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
        FROM brands_of_the_day
        WHERE industry = $1 AND domain = $2
      `;
      
      const params = [industry, domain];
      
      // If date is provided, add it to the query
      if (date) {
        query += ` AND featured_date::date = $3::date`;
        params.push(date.toISOString().split('T')[0]);
      } else {
        // If no date is provided, get the most recent one
        query += ` ORDER BY featured_date DESC LIMIT 1`;
      }
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        console.log(`[db.getBrandOfTheDayByIndustryAndDomain] No brand of the day found for industry ${industry} and domain ${domain}`);
        return undefined;
      }
      
      console.log(`[db.getBrandOfTheDayByIndustryAndDomain] Found brand of the day for industry ${industry} and domain ${domain}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getBrandOfTheDayByIndustryAndDomain] Error fetching brand of the day for industry ${industry} and domain ${domain}:`, error);
      return undefined;
    }
  }
  
  async getBrandsOfTheDayByUserId(userId: number): Promise<BrandOfTheDay[]> {
    try {
      console.log(`[db.getBrandsOfTheDayByUserId] Fetching brands of the day for user ${userId}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
        FROM brands_of_the_day
        WHERE user_id = $1
        ORDER BY featured_date DESC
      `, [userId]);
      
      console.log(`[db.getBrandsOfTheDayByUserId] Found ${result.rows.length} brands of the day for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getBrandsOfTheDayByUserId] Error fetching brands of the day for user ${userId}:`, error);
      return [];
    }
  }
  
  async createBrandOfTheDay(brand: InsertBrandOfTheDay): Promise<BrandOfTheDay> {
    try {
      console.log(`[db.createBrandOfTheDay] Creating brand of the day for user ${brand.userId}`);
      
      const result = await pool.query(`
        INSERT INTO brands_of_the_day (
          user_id,
          industry,
          domain,
          brand_value_score,
          musk_comment,
          score_breakdown,
          featured_date,
          expires_date,
          has_been_shared,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
      `, [
        brand.userId,
        brand.industry,
        brand.domain,
        brand.brandValueScore,
        brand.muskComment,
        brand.scoreBreakdown,
        brand.featuredDate,
        brand.expiresDate,
        brand.hasBeenShared,
        brand.createdAt || new Date()
      ]);
      
      console.log(`[db.createBrandOfTheDay] Created brand of the day with ID ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.createBrandOfTheDay] Error creating brand of the day:`, error);
      throw new Error(`Failed to create brand of the day: ${error.message}`);
    }
  }
  
  async updateBrandOfTheDay(id: number, brand: Partial<BrandOfTheDay>): Promise<BrandOfTheDay | undefined> {
    try {
      console.log(`[db.updateBrandOfTheDay] Updating brand of the day with ID ${id}`);
      
      const updateFields = [];
      const values = [];
      let valueCounter = 1;
      
      // Build dynamic update query based on provided fields
      for (const [key, value] of Object.entries(brand)) {
        if (value !== undefined) {
          // Convert camelCase to snake_case for DB column names
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          updateFields.push(`${snakeKey} = $${valueCounter}`);
          values.push(value);
          valueCounter++;
        }
      }
      
      if (updateFields.length === 0) {
        console.log(`[db.updateBrandOfTheDay] No fields to update for brand of the day with ID ${id}`);
        return await this.getBrandOfTheDayById(id);
      }
      
      values.push(id); // Add ID as the last parameter
      
      const result = await pool.query(`
        UPDATE brands_of_the_day
        SET ${updateFields.join(', ')}
        WHERE id = $${valueCounter}
        RETURNING 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
      `, values);
      
      if (result.rows.length === 0) {
        console.log(`[db.updateBrandOfTheDay] No brand of the day found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.updateBrandOfTheDay] Updated brand of the day with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.updateBrandOfTheDay] Error updating brand of the day with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async markBrandOfTheDayAsShared(id: number): Promise<BrandOfTheDay | undefined> {
    try {
      console.log(`[db.markBrandOfTheDayAsShared] Marking brand of the day with ID ${id} as shared`);
      
      const result = await pool.query(`
        UPDATE brands_of_the_day
        SET has_been_shared = true
        WHERE id = $1
        RETURNING 
          id,
          user_id as "userId",
          industry,
          domain,
          brand_value_score as "brandValueScore",
          musk_comment as "muskComment",
          score_breakdown as "scoreBreakdown",
          featured_date as "featuredDate",
          expires_date as "expiresDate",
          has_been_shared as "hasBeenShared",
          created_at as "createdAt"
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`[db.markBrandOfTheDayAsShared] No brand of the day found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.markBrandOfTheDayAsShared] Marked brand of the day with ID ${id} as shared`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.markBrandOfTheDayAsShared] Error marking brand of the day with ID ${id} as shared:`, error);
      return undefined;
    }
  }
  
  async calculateBrandValueScore(userId: number): Promise<{
    userId: number;
    brandValueScore: number;
    scoreBreakdown: {
      profileStrength: number;
      careerQuests: number;
      pulseActivity: number;
      portfolioProjects: number;
      engagement: number;
      muskUsage: number;
      consistency: number;
      badges: number;
    };
  }> {
    // This is a placeholder implementation
    // In a real implementation, we would calculate these scores based on user activity
    console.log(`[db.calculateBrandValueScore] Calculating brand value score for user ${userId}`);
    
    return {
      userId,
      brandValueScore: 75,
      scoreBreakdown: {
        profileStrength: 80,
        careerQuests: 65,
        pulseActivity: 70,
        portfolioProjects: 85,
        engagement: 60,
        muskUsage: 90,
        consistency: 75,
        badges: 80
      }
    };
  }
  
  // Nowboard methods
  async getNowboardItems(): Promise<NowboardItem[]> {
    try {
      console.log('[db.getNowboardItems] Fetching all nowboard items');
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          type,
          action,
          content,
          link,
          metadata,
          created_at as "createdAt",
          updated_at as "updatedAt",
          is_active as "isActive"
        FROM nowboard_items
        ORDER BY created_at DESC
        LIMIT 50
      `);
      
      console.log(`[db.getNowboardItems] Found ${result.rows.length} nowboard items`);
      return result.rows;
    } catch (error) {
      console.error('[db.getNowboardItems] Error fetching nowboard items:', error);
      return [];
    }
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
