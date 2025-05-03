import { pool } from './db';
import { sql } from 'drizzle-orm';

// Career Capsule interface
export interface CareerCapsule {
  id: number;
  userId: number;
  title: string;
  goalType: string;
  customGoal?: string | null;
  timeframe: number;
  description?: string | null;
  industry?: string | null;
  isPrivate: boolean;
  overallProgress: number;
  isMuskGenerated: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Insert CareerCapsule interface
export interface InsertCareerCapsule {
  userId: number;
  title: string;
  goalType: string;
  customGoal?: string | null;
  timeframe: number;
  description?: string | null;
  industry?: string | null;
  isPrivate?: boolean;
  overallProgress?: number;
  isMuskGenerated?: boolean;
}

// CapsuleYear interface
export interface CapsuleYear {
  id: number;
  capsuleId: number;
  year: number;
  description?: string | null;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Insert CapsuleYear interface
export interface InsertCapsuleYear {
  capsuleId: number;
  year: number;
  description?: string | null;
  progress?: number;
}

// CapsuleTask interface
export interface CapsuleTask {
  id: number;
  yearId: number;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Insert CapsuleTask interface
export interface InsertCapsuleTask {
  yearId: number;
  title: string;
  description?: string | null;
  isCompleted?: boolean;
}

// CapsuleJournal interface
export interface CapsuleJournal {
  id: number;
  capsuleId: number;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Insert CapsuleJournal interface
export interface InsertCapsuleJournal {
  capsuleId: number;
  title: string;
  content: string;
}

// Helper function for executing database queries
async function executeQuery(queryText: string, params: any[] = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
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
  careerGoals, CareerGoal, InsertCareerGoal,
  goalMilestones, GoalMilestone, InsertGoalMilestone,
  goalSkills, GoalSkill, InsertGoalSkill,
  goalProgressLogs, GoalProgressLog, InsertGoalProgressLog,
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
  brandsOfTheDay, BrandOfTheDay, InsertBrandOfTheDay,
  // Mentorship Connect models
  mentorshipRequests, MentorshipRequest, InsertMentorshipRequest,
  mentorshipFeedback, MentorshipFeedback, InsertMentorshipFeedback,
  // Career Capsule models - removed
  // These models have been commented out in the schema
  // careerCapsules, CareerCapsule, InsertCareerCapsule,
  // capsuleYears, CapsuleYear, InsertCapsuleYear,
  // capsuleTasks, CapsuleTask, InsertCapsuleTask,
  // capsuleJournals, CapsuleJournal, InsertCapsuleJournal
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
  // Career Goal operations
  getCareerGoalsByUserId(userId: number): Promise<CareerGoal[]>;
  getCareerGoalById(id: number): Promise<CareerGoal | undefined>;
  createCareerGoal(goal: InsertCareerGoal): Promise<CareerGoal>;
  updateCareerGoal(id: number, goalData: Partial<CareerGoal>): Promise<CareerGoal | undefined>;
  deleteCareerGoal(id: number): Promise<boolean>;
  
  // Goal Milestone operations
  getGoalMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]>;
  getGoalMilestoneById(id: number): Promise<GoalMilestone | undefined>;
  createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone>;
  updateGoalMilestone(id: number, milestoneData: Partial<GoalMilestone>): Promise<GoalMilestone | undefined>;
  deleteGoalMilestone(id: number): Promise<boolean>;
  
  // Goal Skill operations
  getGoalSkillsByGoalId(goalId: number): Promise<GoalSkill[]>;
  getGoalSkillById(id: number): Promise<GoalSkill | undefined>;
  createGoalSkill(skill: InsertGoalSkill): Promise<GoalSkill>;
  updateGoalSkill(id: number, skillData: Partial<GoalSkill>): Promise<GoalSkill | undefined>;
  deleteGoalSkill(id: number): Promise<boolean>;
  
  // Goal Progress Log operations
  getGoalProgressLogsByGoalId(goalId: number): Promise<GoalProgressLog[]>;
  getGoalProgressLogsByMilestoneId(milestoneId: number): Promise<GoalProgressLog[]>;
  getGoalProgressLogById(id: number): Promise<GoalProgressLog | undefined>;
  createGoalProgressLog(log: InsertGoalProgressLog): Promise<GoalProgressLog>;
  updateGoalProgressLog(id: number, logData: Partial<GoalProgressLog>): Promise<GoalProgressLog | undefined>;
  deleteGoalProgressLog(id: number): Promise<boolean>;
  
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
  getResumeById(id: number): Promise<Resume | undefined>;
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

  // Mentorship Connect operations
  getMentorshipRequestById(id: number): Promise<MentorshipRequest | undefined>;
  getMentorshipRequestsByMenteeId(menteeId: number): Promise<MentorshipRequest[]>;
  getMentorshipRequestsByMentorId(mentorId: number): Promise<MentorshipRequest[]>;
  getActiveMentorshipsCount(userId: number, role: 'mentor' | 'mentee'): Promise<number>;
  getPendingMentorshipRequestsCount(userId: number, role: 'mentor' | 'mentee'): Promise<number>;
  createMentorshipRequest(request: InsertMentorshipRequest): Promise<MentorshipRequest>;
  updateMentorshipRequestStatus(id: number, status: 'accepted' | 'declined' | 'expired' | 'completed', reason?: string): Promise<MentorshipRequest | undefined>;
  getMentorshipFeedbackByMentorshipId(mentorshipId: number): Promise<MentorshipFeedback[]>;
  createMentorshipFeedback(feedback: InsertMentorshipFeedback): Promise<MentorshipFeedback>;
  canRequestMentorship(menteeId: number): Promise<boolean>;
  
  // Career Roadmap operations
  // Career Goal operations
  getCareerGoalsByUserId(userId: number): Promise<CareerGoal[]>;
  getCareerGoalById(id: number): Promise<CareerGoal | undefined>;
  createCareerGoal(goal: InsertCareerGoal): Promise<CareerGoal>;
  updateCareerGoal(id: number, goal: Partial<CareerGoal>): Promise<CareerGoal | undefined>;
  deleteCareerGoal(id: number): Promise<boolean>;
  
  // Goal Milestone operations
  getMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]>;
  getMilestoneById(id: number): Promise<GoalMilestone | undefined>;
  createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone>;
  updateGoalMilestone(id: number, milestone: Partial<GoalMilestone>): Promise<GoalMilestone | undefined>;
  deleteGoalMilestone(id: number): Promise<boolean>;
  
  // Goal Skill operations
  getSkillsByGoalId(goalId: number): Promise<GoalSkill[]>;
  getSkillById(id: number): Promise<GoalSkill | undefined>;
  createGoalSkill(skill: InsertGoalSkill): Promise<GoalSkill>;
  updateGoalSkill(id: number, skill: Partial<GoalSkill>): Promise<GoalSkill | undefined>;
  deleteGoalSkill(id: number): Promise<boolean>;
  
  // Goal Progress Log operations
  getProgressLogsByGoalId(goalId: number): Promise<GoalProgressLog[]>;
  getProgressLogsByMilestoneId(milestoneId: number): Promise<GoalProgressLog[]>;
  getProgressLogById(id: number): Promise<GoalProgressLog | undefined>;
  createGoalProgressLog(log: InsertGoalProgressLog): Promise<GoalProgressLog>;
  updateGoalProgressLog(id: number, log: Partial<GoalProgressLog>): Promise<GoalProgressLog | undefined>;
  deleteGoalProgressLog(id: number): Promise<boolean>;
  
  // Career Capsule operations
  getUserCareerCapsule(userId: number): Promise<CareerCapsule | null>;
  getCareerCapsulesByUserId(userId: number): Promise<CareerCapsule[]>;
  getCareerCapsuleById(id: number): Promise<CareerCapsule | undefined>;
  createCareerCapsule(capsule: InsertCareerCapsule): Promise<CareerCapsule>;
  updateCareerCapsule(id: number, capsule: Partial<CareerCapsule>): Promise<CareerCapsule | undefined>;
  deleteCareerCapsule(id: number): Promise<boolean>;
  updateCapsuleProgress(id: number): Promise<CareerCapsule | undefined>;
  
  // Capsule Year operations
  getCapsuleYearsByCapsuleId(capsuleId: number): Promise<CapsuleYear[]>;
  getCapsuleYearById(id: number): Promise<CapsuleYear | undefined>;
  createCapsuleYear(year: InsertCapsuleYear): Promise<CapsuleYear>;
  updateCapsuleYear(id: number, year: Partial<CapsuleYear>): Promise<CapsuleYear | undefined>;
  deleteCapsuleYear(id: number): Promise<boolean>;
  updateCapsuleYearProgress(id: number): Promise<CapsuleYear | undefined>;
  
  // Capsule Task operations
  getCapsuleTasksByYearId(yearId: number): Promise<CapsuleTask[]>;
  getCapsuleTaskById(id: number): Promise<CapsuleTask | undefined>;
  createCapsuleTask(task: InsertCapsuleTask): Promise<CapsuleTask>;
  updateCapsuleTask(id: number, task: Partial<CapsuleTask>): Promise<CapsuleTask | undefined>;
  deleteCapsuleTask(id: number): Promise<boolean>;
  toggleCapsuleTaskCompletion(id: number): Promise<CapsuleTask | undefined>;
  
  // Capsule Journal operations
  getCapsuleJournalsByCapsuleId(capsuleId: number): Promise<CapsuleJournal[]>;
  getCapsuleJournalById(id: number): Promise<CapsuleJournal | undefined>;
  createCapsuleJournal(journal: InsertCapsuleJournal): Promise<CapsuleJournal>;
  updateCapsuleJournal(id: number, journal: Partial<CapsuleJournal>): Promise<CapsuleJournal | undefined>;
  deleteCapsuleJournal(id: number): Promise<boolean>;
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
  
  // Mentorship Connect models
  private mentorshipRequests: Map<number, MentorshipRequest>;
  private mentorshipFeedback: Map<number, MentorshipFeedback>;
  
  // Career Capsule models - removed
  // private careerCapsules: Map<number, CareerCapsule>;
  // private capsuleYears: Map<number, CapsuleYear>;
  // private capsuleTasks: Map<number, CapsuleTask>;
  // private capsuleJournals: Map<number, CapsuleJournal>;
  
  // Career Capsule models
  private careerGoals: Map<number, CareerGoal>;
  private goalMilestones: Map<number, GoalMilestone>;
  private goalSkills: Map<number, GoalSkill>;
  private goalProgressLogs: Map<number, GoalProgressLog>;
  
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
  
  // Mentorship Connect IDs
  private currentMentorshipRequestId: number;
  private currentMentorshipFeedbackId: number;
  
  // Career Capsule IDs - removed
  // private currentCareerCapsuleId: number;
  // private currentCapsuleYearId: number;
  // private currentCapsuleTaskId: number;
  // private currentCapsuleJournalId: number;
  
  // Career Capsule IDs
  private currentCareerGoalId: number;
  private currentGoalMilestoneId: number;
  private currentGoalSkillId: number;
  private currentGoalProgressLogId: number;

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
    
    // Initialize Mentorship Connect maps
    this.mentorshipRequests = new Map();
    this.mentorshipFeedback = new Map();
    
    // Initialize Career Capsule maps - removed
    // this.careerCapsules = new Map();
    // this.capsuleYears = new Map();
    // this.capsuleTasks = new Map();
    // this.capsuleJournals = new Map();
    
    // Initialize Career Capsule maps
    this.careerGoals = new Map();
    this.goalMilestones = new Map();
    this.goalSkills = new Map();
    this.goalProgressLogs = new Map();
    
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
    
    // Initialize Mentorship Connect IDs
    this.currentMentorshipRequestId = 1;
    this.currentMentorshipFeedbackId = 1;
    
    // Initialize Career Capsule IDs - removed
    // this.currentCareerCapsuleId = 1;
    // this.currentCapsuleYearId = 1;
    // this.currentCapsuleTaskId = 1;
    // this.currentCapsuleJournalId = 1;
    
    // Initialize Career Capsule IDs
    this.currentCareerGoalId = 1;
    this.currentGoalMilestoneId = 1;
    this.currentGoalSkillId = 1;
    this.currentGoalProgressLogId = 1;
    
    // Initialize with a default user for development/demo
    this.initializeDemoData();
  }
  
  /**
   * Initialize demo data for development and testing
   */
  private initializeDemoData() {
    // Create demo user with proper photoURL and other required fields
    const demoUser: User = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      password: null,
      phoneNumber: null,
      name: "Senior Professional",
      photoURL: null,
      title: "Senior Software Engineer",
      location: "San Francisco, CA, USA",
      industry: "Technology",
      lookingFor: "A Career Mentor",
      profileCompleted: 65,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    this.currentUserId++;
    
    // Clear any existing work experiences, education, and skills for the demo user
    this.clearDemoDataMaps();
    
    // No pre-created skills either
    // Skills will be added by the user as needed
    this.currentSkillId = 1;
    
    // Create default portfolio for the demo user
    const demoPortfolio: Portfolio = {
      id: 1,
      userId: 1,
      layout: "professional", // Default layout
      customTitle: null,
      customBio: null,
      customizationOptions: {},
      isPublished: false,
      publicUrl: null,
      featuredProjects: [],
      featuredSkills: [], // No featured skills yet
      featuredExperiences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.portfolios.set(demoPortfolio.id, demoPortfolio);
    this.currentPortfolioId++;
    
    // No pre-created services for new accounts
    // Starting service ID at 1 for the first service a user creates
    this.currentServiceId = 1;
    
    // Add demo pulses for testing image carousel
    this.createDemoPulses(demoUser.id);
    
    // Add demo Nowboard items
    this.createDemoNowboardItems(demoUser.id);
    
    console.log(`[storage.initializeDemoData] No pre-created services - users will add their own`);
    
  }
  
  /**
   * Completely reset all demo data and reinitialize with minimal values
   * Used by the debug endpoint to wipe all existing data
   */
  async reinitializeDemoData(): Promise<void> {
    // First clear all data maps
    this.clearDemoDataMaps();
    
    // Force IDs back to start
    this.currentWorkExperienceId = 1;
    this.currentEducationId = 1;
    this.currentSkillId = 1;
    this.currentPortfolioId = 1;
    this.currentPulseId = 1;
    this.currentPulseCommentId = 1;
    this.currentPollVoteId = 1;
    this.currentHashtagId = 1;
    this.currentPulseHashtagId = 1;
    this.currentUserHashtagFollowId = 1;
    // Reset pulse interaction system IDs
    this.currentPulseReactionId = 1;
    this.currentUserReactionQuotaId = 1;
    this.currentPulseShareId = 1;
    // Reset News IDs
    this.currentNewsSourceId = 1;
    this.currentNewsArticleId = 1;
    this.currentNewsUserPreferenceId = 1;
    // Reset Musk Match ID
    this.currentMuskMatchId = 1;
    // Reset Musk suggestion IDs
    this.currentMuskSuggestionId = 1;
    this.currentMuskBehaviorTrackingId = 1;
    // Reset enhanced Musk intelligence IDs
    this.currentUserProfileIntelligenceId = 1;
    this.currentBehaviorHeatmapId = 1;
    this.currentContentScoringId = 1;
    this.currentIndustryTrendsMonitorId = 1;
    this.currentUserMilestonesId = 1;
    this.currentSmartPostSuggestionsId = 1;
    
    // Reset Nowboard IDs
    this.currentNowboardItemId = 1;
    this.currentNowboardInspiredById = 1;
    
    // Reset Career Quests IDs
    this.currentQuestDefinitionId = 1;
    this.currentUserQuestId = 1;
    this.currentUserXpId = 1;
    this.currentUserBadgeId = 1;
    this.currentXpTransactionId = 1;
    
    // Reset Brand of the Day ID
    this.currentBrandOfTheDayId = 1;
    
    // Reset Mentorship Connect IDs
    this.currentMentorshipRequestId = 1;
    this.currentMentorshipFeedbackId = 1;
    
    // Reset Career Capsule IDs
    this.currentCareerGoalId = 1;
    this.currentGoalMilestoneId = 1;
    this.currentGoalSkillId = 1;
    this.currentGoalProgressLogId = 1;
    
    // Reset Career Capsule IDs - removed
    // this.currentCareerCapsuleId = 1;
    // this.currentCapsuleYearId = 1;
    // this.currentCapsuleTaskId = 1;
    // this.currentCapsuleJournalId = 1;
    
    // No pre-created skills
    
    // Create a default portfolio for the demo user
    const portfolio: Portfolio = {
      id: 1,
      userId: 1,
      layout: "professional", // Default layout
      customTitle: null,
      customBio: null,
      customizationOptions: {},
      isPublished: false,
      publicUrl: null,
      featuredProjects: [],
      featuredSkills: [], // No featured skills
      featuredExperiences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.portfolios.set(portfolio.id, portfolio);
    this.currentPortfolioId++;
    
    // Create sample services for the demo user
    const service1: Service = {
      id: 1,
      userId: 1,
      title: 'Web Application Development',
      description: 'Full-stack web application development using React, Node.js, and PostgreSQL.',
      category: 'development',
      priceUsd: "100",  // Using string format for decimal values
      priceInr: "8000", // Using string format for decimal values
      isHourly: true,
      features: ['Custom UI/UX design', 'Database integration', 'API development', 'Delivery: 2-4 weeks'],
      imageUrl: "https://placehold.co/400x300/4f46e5/ffffff?text=Web+Development",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1
    };
    this.services.set(service1.id, service1);
    
    const service2: Service = {
      id: 2,
      userId: 1,
      title: 'Brand Identity Design',
      description: 'Professional brand identity design including logo, color palette, and brand guidelines.',
      category: 'design',
      priceUsd: "500",  // Using string format for decimal values
      priceInr: "40000", // Using string format for decimal values
      isHourly: false,
      features: ['Logo design', 'Brand guidelines', 'Social media assets', 'Delivery: 1-2 weeks'],
      imageUrl: "https://placehold.co/400x300/e95800/ffffff?text=Brand+Design",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 2
    };
    this.services.set(service2.id, service2);
    
    const service3: Service = {
      id: 3,
      userId: 1,
      title: 'SEO Optimization',
      description: 'Improve your website visibility with professional SEO services.',
      category: 'marketing',
      priceUsd: "300",  // Using string format for decimal values
      priceInr: "24000", // Using string format for decimal values
      isHourly: false,
      features: ['Keyword research', 'On-page optimization', 'Performance tracking', 'Delivery: 2-3 weeks'],
      imageUrl: "https://placehold.co/400x300/22c55e/ffffff?text=SEO+Services",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 3
    };
    this.services.set(service3.id, service3);
    this.currentServiceId = 4;
    
    // Create sample Career Capsule data for the demo user
    const careerGoal: CareerGoal = {
      id: 1,
      userId: 1,
      title: "Become a Senior Software Engineer",
      description: "Advance to a senior-level position with increased technical leadership responsibilities",
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)), // 3 years from now
      goalType: "position",
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 25,
      industryFocus: "Technology"
    };
    this.careerGoals.set(careerGoal.id, careerGoal);
    this.currentCareerGoalId++;
    
    // Create milestone 1
    const milestone1: GoalMilestone = {
      id: 1,
      goalId: 1,
      title: "Master Advanced React Patterns",
      description: "Learn and implement advanced React patterns in production applications",
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // 6 months from now
      status: "in-progress",
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    this.goalMilestones.set(milestone1.id, milestone1);
    this.currentGoalMilestoneId++;
    
    // Create milestone 2
    const milestone2: GoalMilestone = {
      id: 2,
      goalId: 1,
      title: "Lead a Major Project",
      description: "Take ownership of a significant project from start to finish",
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
      status: "not-started",
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    this.goalMilestones.set(milestone2.id, milestone2);
    this.currentGoalMilestoneId++;
    
    // Create milestone 3
    const milestone3: GoalMilestone = {
      id: 3,
      goalId: 1,
      title: "Mentor Junior Developers",
      description: "Regularly mentor 2-3 junior developers to demonstrate leadership",
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // 2 years from now
      status: "not-started",
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    this.goalMilestones.set(milestone3.id, milestone3);
    this.currentGoalMilestoneId++;
    
    // Create skills needed for the career goal
    const skill1: GoalSkill = {
      id: 1,
      goalId: 1,
      skillName: "React Advanced Patterns",
      description: "Proficiency with React Context, Hooks, HOCs, and performance optimization",
      priority: "high",
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.goalSkills.set(skill1.id, skill1);
    this.currentGoalSkillId++;
    
    const skill2: GoalSkill = {
      id: 2,
      goalId: 1,
      skillName: "System Architecture",
      description: "Ability to design complex systems and make high-level technical decisions",
      priority: "medium",
      status: "not-started",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.goalSkills.set(skill2.id, skill2);
    this.currentGoalSkillId++;
    
    const skill3: GoalSkill = {
      id: 3,
      goalId: 1,
      skillName: "Team Leadership",
      description: "Skills in mentoring, code review, technical direction, and team coordination",
      priority: "high",
      status: "not-started",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.goalSkills.set(skill3.id, skill3);
    this.currentGoalSkillId++;
    
    // Create progress log entries
    const progressLog1: GoalProgressLog = {
      id: 1,
      goalId: 1,
      milestone: 1,
      entry: "Completed advanced React patterns course on Frontend Masters",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
      entryType: "accomplishment"
    };
    this.goalProgressLogs.set(progressLog1.id, progressLog1);
    this.currentGoalProgressLogId++;
    
    const progressLog2: GoalProgressLog = {
      id: 2,
      goalId: 1,
      milestone: 1,
      entry: "Implemented Context API and custom hooks in current project",
      createdAt: new Date(new Date().setDate(new Date().getDate() - 15)), // 15 days ago
      entryType: "accomplishment"
    };
    this.goalProgressLogs.set(progressLog2.id, progressLog2);
    this.currentGoalProgressLogId++;
    
    console.log("Demo data reinitialized with minimal values, skill, portfolio, services, and Career Capsule data");
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
    
    // Clear all Career Capsule data
    this.careerGoals.clear();
    this.goalMilestones.clear();
    this.goalSkills.clear();
    this.goalProgressLogs.clear();
    
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
    
    // Clear all Mentorship Connect data
    this.mentorshipRequests.clear();
    this.mentorshipFeedback.clear();
    
    // Clear all Career Capsule data - removed
    // this.careerCapsules.clear();
    // this.capsuleYears.clear();
    // this.capsuleTasks.clear();
    // this.capsuleJournals.clear();
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
    const id = this.currentServiceId++;
    const createdAt = new Date();
    const service: Service = {
      id,
      userId: insertService.userId,
      title: insertService.title,
      description: insertService.description ?? null,
      category: insertService.category ?? "other",
      priceInr: insertService.priceInr ?? null,
      priceUsd: insertService.priceUsd ?? null,
      isHourly: insertService.isHourly ?? false,
      features: insertService.features ?? [],
      imageUrl: insertService.imageUrl ?? null,
      order: insertService.order ?? 0,
      isActive: insertService.isActive ?? true,
      createdAt,
      updatedAt: createdAt
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  /**
   * Create demo pulses for testing carousel/image gallery functionality
   */
  private createDemoPulses(userId: number): void {
    // Create a demo project for project-type pulse
    const demoProject: Project = {
      id: 1,
      userId: userId,
      title: "AI-Powered Career Platform",
      description: "A professional networking platform with intelligent career guidance and portfolio showcase",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago as YYYY-MM-DD
      projectUrl: "https://example.com/demo",
      category: "Web Development",
      thumbnailUrl: "/images/demo/ui-design-1.svg",
      thumbnailFile: null,
      mediaUrls: [
        "/images/demo/ui-design-1.svg",
        "/images/demo/ui-design-2.svg",
        "/images/demo/ui-design-3.svg"
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
    };
    
    // Add project to storage
    this.projects.set(demoProject.id, demoProject);
    this.currentProjectId = 2; // Set next project ID
    
    // Create a demo media pulse with multiple images for carousel testing
    const imagePulse: Pulse = {
      id: 1,
      userId: userId,
      type: "media-pulse",
      title: "My Latest UI Design Work",
      content: "Showcasing some of my recent UI design work on product dashboards and analytics interfaces. I focused on creating clean, intuitive layouts with strong visual hierarchy.",
      mediaType: "image",
      mediaUrls: [
        "/images/demo/ui-design-1.svg",
        "/images/demo/ui-design-2.svg", 
        "/images/demo/ui-design-3.svg",
        "/images/demo/ui-design-4.svg",
        "/images/demo/ui-design-5.svg"
      ],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: null,
      likes: 24,
      insightfulCount: 18,
      misinformedCount: 2,
      shareCount: 5,
      comments: 7,
      isPublished: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };
    
    // Create a poll pulse
    const pollPulse: Pulse = {
      id: 2,
      userId: userId,
      type: "poll",
      title: "What's your preferred development stack?",
      content: "I'm curious about what technologies other professionals are using for their projects.",
      mediaType: null,
      mediaUrls: [],
      mediaLocalStorageKeys: [],
      pollOptions: ["MERN (MongoDB, Express, React, Node)", "LAMP (Linux, Apache, MySQL, PHP)", "JAMstack", "Python + Django/Flask", ".NET Core + Angular/React"],
      projectId: null,
      likes: 42,
      insightfulCount: 30,
      misinformedCount: 3,
      shareCount: 10,
      comments: 18,
      isPublished: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };
    
    // Create a video pulse
    const videoPulse: Pulse = {
      id: 3,
      userId: userId,
      type: "media-pulse",
      title: "Quick Demo of My New App",
      content: "A brief walkthrough of the application I've been developing for the past few months. Would love your feedback!",
      mediaType: "video",
      mediaUrls: ["https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: null,
      likes: 17,
      insightfulCount: 12,
      misinformedCount: 0,
      shareCount: 3,
      comments: 5,
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
    
    // Create a project pulse
    const projectPulse: Pulse = {
      id: 4,
      userId: userId,
      type: "project",
      title: "Just Launched: AI-Powered Career Platform",
      content: "Excited to share my latest project! I've been working on a professional networking platform that uses AI to provide personalized career guidance and a sleek portfolio showcase. Looking for beta testers and feedback.",
      mediaType: null,
      mediaUrls: [],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: demoProject.id,
      likes: 31,
      insightfulCount: 25,
      misinformedCount: 1,
      shareCount: 7,
      comments: 12,
      isPublished: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    
    // Add pulses to storage
    this.pulses.set(imagePulse.id, imagePulse);
    this.pulses.set(pollPulse.id, pollPulse);
    this.pulses.set(videoPulse.id, videoPulse);
    this.pulses.set(projectPulse.id, projectPulse);
    this.currentPulseId = 5; // Set next pulse ID
    
    console.log("[storage.createDemoPulses] Created demo pulses for image carousel testing");
  }
  
  /**
   * Create demo Nowboard items for testing
   */
  private createDemoNowboardItems(userId: number): void {
    const nowboardItem1: NowboardItem = {
      id: 1,
      userId: userId,
      content: "Just completed a new course on advanced React patterns. Learning never stops!",
      category: "learning",
      visibility: "public",
      inspiredCount: 5,
      relatedSkills: "React, JavaScript, Frontend Development",
      relatedProject: null,
      imageUrl: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    
    const nowboardItem2: NowboardItem = {
      id: 2,
      userId: userId,
      content: "Just launched my new portfolio website! Check it out and let me know what you think.",
      category: "launch",
      visibility: "public",
      inspiredCount: 12,
      relatedSkills: "Web Design, UI/UX, Portfolio Development",
      relatedProject: 1, // The demo project we created earlier
      imageUrl: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    
    const nowboardItem3: NowboardItem = {
      id: 3,
      userId: userId,
      content: "Achieved a major milestone in my current project. User engagement up by 45% after the latest update!",
      category: "growth",
      visibility: "public",
      inspiredCount: 8,
      relatedSkills: "Product Management, Analytics, Growth Hacking",
      relatedProject: null,
      imageUrl: null,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
    };
    
    // Add Nowboard items to storage
    this.nowboardItems.set(nowboardItem1.id, nowboardItem1);
    this.nowboardItems.set(nowboardItem2.id, nowboardItem2);
    this.nowboardItems.set(nowboardItem3.id, nowboardItem3);
    this.currentNowboardItemId = 4; // Set next Nowboard item ID
    
    console.log("[storage.createDemoNowboardItems] Created demo Nowboard items");
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

  // Mentorship Connect operations
  async getMentorshipRequestById(id: number): Promise<MentorshipRequest | undefined> {
    return this.mentorshipRequests.get(id);
  }

  async getMentorshipRequestsByMenteeId(menteeId: number): Promise<MentorshipRequest[]> {
    return Array.from(this.mentorshipRequests.values())
      .filter(request => request.menteeId === menteeId);
  }

  async getMentorshipRequestsByMentorId(mentorId: number): Promise<MentorshipRequest[]> {
    return Array.from(this.mentorshipRequests.values())
      .filter(request => request.mentorId === mentorId);
  }

  async getActiveMentorshipsCount(userId: number, role: 'mentor' | 'mentee'): Promise<number> {
    const requests = Array.from(this.mentorshipRequests.values())
      .filter(request => {
        if (role === 'mentor') {
          return request.mentorId === userId && request.status === 'accepted' && request.endDate && new Date(request.endDate) > new Date();
        } else {
          return request.menteeId === userId && request.status === 'accepted' && request.endDate && new Date(request.endDate) > new Date();
        }
      });
    return requests.length;
  }

  async getPendingMentorshipRequestsCount(userId: number, role: 'mentor' | 'mentee'): Promise<number> {
    const requests = Array.from(this.mentorshipRequests.values())
      .filter(request => {
        if (role === 'mentor') {
          return request.mentorId === userId && request.status === 'pending';
        } else {
          return request.menteeId === userId && request.status === 'pending';
        }
      });
    return requests.length;
  }

  async createMentorshipRequest(request: InsertMentorshipRequest): Promise<MentorshipRequest> {
    const id = this.currentMentorshipRequestId++;
    const now = new Date();
    
    const newRequest: MentorshipRequest = {
      ...request,
      id,
      status: 'pending',
      requestedAt: now,
      respondedAt: null,
      startDate: null,
      endDate: null,
      declineReason: null,
      isFeedbackRequested: false,
      createdAt: now,
      updatedAt: now
    };
    
    this.mentorshipRequests.set(id, newRequest);
    return newRequest;
  }

  async updateMentorshipRequestStatus(id: number, status: 'accepted' | 'declined' | 'expired' | 'completed', reason?: string): Promise<MentorshipRequest | undefined> {
    const request = this.mentorshipRequests.get(id);
    if (!request) return undefined;
    
    const now = new Date();
    const updates: Partial<MentorshipRequest> = {
      status,
      respondedAt: now,
      updatedAt: now
    };
    
    if (status === 'declined') {
      updates.declineReason = reason || null;
    }
    
    if (status === 'accepted') {
      updates.startDate = now;
      // Set end date to 30 days from now
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 30);
      updates.endDate = endDate;
    }
    
    const updatedRequest: MentorshipRequest = {
      ...request,
      ...updates
    };
    
    this.mentorshipRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getMentorshipFeedbackByMentorshipId(mentorshipId: number): Promise<MentorshipFeedback[]> {
    return Array.from(this.mentorshipFeedback.values())
      .filter(feedback => feedback.mentorshipId === mentorshipId);
  }

  async createMentorshipFeedback(feedback: InsertMentorshipFeedback): Promise<MentorshipFeedback> {
    const id = this.currentMentorshipFeedbackId++;
    const now = new Date();
    
    const newFeedback: MentorshipFeedback = {
      ...feedback,
      id,
      providedAt: now
    };
    
    this.mentorshipFeedback.set(id, newFeedback);
    return newFeedback;
  }

  async canRequestMentorship(menteeId: number): Promise<boolean> {
    // Check if user has less than 5 active mentors
    const activeCount = await this.getActiveMentorshipsCount(menteeId, 'mentee');
    const pendingCount = await this.getPendingMentorshipRequestsCount(menteeId, 'mentee');
    
    // User can request mentorship if they have fewer than 5 total mentorships (active + pending)
    return (activeCount + pendingCount) < 5;
  }

  // Career Roadmap operations
  // Career Goal operations
  async getCareerGoalsByUserId(userId: number): Promise<CareerGoal[]> {
    try {
      console.log(`Fetching career goals for user ID: ${userId}`);
      
      // First check if the table exists
      const tableCheck = await executeQuery(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = 'career_goals'
         );`
      );
      
      console.log(`Table career_goals exists: ${tableCheck.rows[0].exists}`);
      
      if (!tableCheck.rows[0].exists) {
        console.error('Career goals table does not exist!');
        return [];
      }
      
      const results = await executeQuery(
        `SELECT 
          id, user_id as "userId", title, description, 
          goal_type as "goalType", status, timeframe,
          target_industry as "targetIndustry", target_role as "targetRole",
          current_skills as "currentSkills", required_skills as "requiredSkills",
          progress, is_private as "isPrivate", is_musk_generated as "isMuskGenerated",
          start_date as "startDate", target_date as "targetDate",
          last_updated as "lastUpdated", created_at as "createdAt"
        FROM career_goals 
        WHERE user_id = $1 
        ORDER BY created_at DESC`,
        [userId]
      );
      console.log(`Retrieved ${results.rows.length} career goals`);
      return results.rows;
    } catch (error) {
      console.error("Error in getCareerGoalsByUserId:", error);
      // Log detailed error information
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      return [];
    }
  }

  async getCareerGoalById(id: number): Promise<CareerGoal | undefined> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, user_id as "userId", title, description, 
          goal_type as "goalType", status, timeframe,
          target_industry as "targetIndustry", target_role as "targetRole",
          current_skills as "currentSkills", required_skills as "requiredSkills",
          progress, is_private as "isPrivate", is_musk_generated as "isMuskGenerated",
          start_date as "startDate", target_date as "targetDate",
          last_updated as "lastUpdated", created_at as "createdAt"
        FROM career_goals 
        WHERE id = $1`,
        [id]
      );
      
      if (results.rows.length === 0) {
        return undefined;
      }
      
      return results.rows[0];
    } catch (error) {
      console.error("Error in getCareerGoalById:", error);
      return undefined;
    }
  }

  async createCareerGoal(goal: InsertCareerGoal): Promise<CareerGoal> {
    try {
      console.log('Creating career goal:', JSON.stringify(goal));
      const now = new Date();
      
      const result = await executeQuery(
        `INSERT INTO career_goals (
          user_id, title, description, goal_type, timeframe, 
          target_industry, target_role, is_private, is_musk_generated,
          status, progress, target_date, start_date, last_updated, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING 
          id, user_id as "userId", title, description, 
          goal_type as "goalType", status, timeframe,
          target_industry as "targetIndustry", target_role as "targetRole",
          current_skills as "currentSkills", required_skills as "requiredSkills",
          progress, is_private as "isPrivate", is_musk_generated as "isMuskGenerated",
          start_date as "startDate", target_date as "targetDate",
          last_updated as "lastUpdated", created_at as "createdAt"`,
        [
          goal.userId,
          goal.title,
          goal.description || null,
          goal.goalType || 'position_change',
          goal.timeframe || 1,
          goal.targetIndustry || null,
          goal.targetRole || null,
          goal.isPrivate !== undefined ? goal.isPrivate : true,
          goal.isMuskGenerated !== undefined ? goal.isMuskGenerated : true,
          goal.status || 'not_started',
          0, // Initial progress
          goal.targetDate || null,
          now,
          now,
          now  // Added created_at parameter
        ]
      );
      
      console.log(`Career goal created successfully`, JSON.stringify(result.rows[0]));
      
      // Verify we can immediately fetch it back
      try {
        const verifyResult = await executeQuery(
          `SELECT * FROM career_goals WHERE id = $1`,
          [result.rows[0].id]
        );
        if (verifyResult.rows.length > 0) {
          console.log(`Verified goal exists in database with ID: ${result.rows[0].id}`);
        } else {
          console.warn(`Warning: Could not verify goal with ID ${result.rows[0].id} exists after creation`);
        }
      } catch (verifyError) {
        console.error(`Error verifying goal after creation:`, verifyError);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error("Error in createCareerGoal:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      throw error;
    }
  }

  async updateCareerGoal(id: number, goalData: Partial<CareerGoal>): Promise<CareerGoal | undefined> {
    try {
      // First, check if the goal exists
      const existingGoal = await this.getCareerGoalById(id);
      if (!existingGoal) return undefined;
      
      // Convert updates to SQL SET statements
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Process each field to be updated
      for (const [key, value] of Object.entries(goalData)) {
        // Convert camelCase keys to snake_case
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        updates.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      
      // Always update last_updated timestamp
      updates.push(`last_updated = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;
      
      // Add the ID as the last parameter for the WHERE clause
      values.push(id);
      
      // Construct and execute the query
      const query = `UPDATE career_goals 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING 
          id, user_id as "userId", title, description, 
          goal_type as "goalType", status, timeframe,
          target_industry as "targetIndustry", target_role as "targetRole",
          current_skills as "currentSkills", required_skills as "requiredSkills",
          progress, is_private as "isPrivate", is_musk_generated as "isMuskGenerated",
          start_date as "startDate", target_date as "targetDate",
          last_updated as "lastUpdated", created_at as "createdAt"`;
      
      const result = await executeQuery(query, values);
      
      // Return the updated goal
      return result.rows[0];
    } catch (error) {
      console.error("Error in updateCareerGoal:", error);
      return undefined;
    }
  }

  async deleteCareerGoal(id: number): Promise<boolean> {
    try {
      // First check if the goal exists
      const goal = await this.getCareerGoalById(id);
      if (!goal) return false;
      
      // Delete the goal (the database will handle cascade deletes for related entities)
      const result = await executeQuery(
        `DELETE FROM career_goals WHERE id = $1 RETURNING id`,
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteCareerGoal:", error);
      return false;
    }
  }
  
  // Goal Milestone operations
  async getGoalMilestonesByGoalId(goalId: number): Promise<GoalMilestone[]> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", title, description, 
          target_date as "targetDate", status, "order",
          completed_at as "completedAt", created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM goal_milestones 
        WHERE goal_id = $1 
        ORDER BY "order" ASC`,
        [goalId]
      );
      
      return results.rows;
    } catch (error) {
      console.error(`Error in getGoalMilestonesByGoalId for goalId ${goalId}:`, error);
      return [];
    }
  }
  
  async getGoalMilestoneById(id: number): Promise<GoalMilestone | undefined> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", title, description, 
          target_date as "targetDate", status, "order",
          completed_at as "completedAt", created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM goal_milestones 
        WHERE id = $1`,
        [id]
      );
      
      if (results.rows.length === 0) {
        return undefined;
      }
      
      return results.rows[0];
    } catch (error) {
      console.error(`Error in getGoalMilestoneById for id ${id}:`, error);
      return undefined;
    }
  }
  
  async createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone> {
    try {
      // Get existing milestones to determine the order
      const existingMilestones = await this.getGoalMilestonesByGoalId(milestone.goalId);
      let order = milestone.order || 0;
      
      if (!milestone.order && existingMilestones.length > 0) {
        order = Math.max(...existingMilestones.map(m => m.order || 0)) + 1;
      }
      
      const result = await executeQuery(
        `INSERT INTO goal_milestones (
          goal_id, title, description, target_date, 
          status, "order", completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id, goal_id as "goalId", title, description, 
          target_date as "targetDate", status, "order",
          completed_at as "completedAt", created_at as "createdAt", 
          updated_at as "updatedAt"`,
        [
          milestone.goalId,
          milestone.title,
          milestone.description || null,
          milestone.targetDate || null,
          milestone.status || 'not_started',
          order,
          null // completedAt is initially null
        ]
      );
      
      const newMilestone = result.rows[0];
      
      // Update the goal progress when a milestone is added
      await this.updateGoalProgress(milestone.goalId);
      
      return newMilestone;
    } catch (error) {
      console.error("Error in createGoalMilestone:", error);
      throw error;
    }
  }
  
  async updateGoalMilestone(id: number, milestoneData: Partial<GoalMilestone>): Promise<GoalMilestone | undefined> {
    try {
      const milestone = await this.getGoalMilestoneById(id);
      if (!milestone) return undefined;
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Handle status change - if setting to completed and wasn't completed before, set completedAt
      let completedAt = milestone.completedAt;
      if (milestoneData.status === 'completed' && milestone.status !== 'completed') {
        completedAt = new Date();
        
        // Create a progress log when milestone completed
        await this.createGoalProgressLog({
          goalId: milestone.goalId,
          milestoneId: id,
          entry: `Milestone completed: ${milestone.title}`,
          entryType: 'accomplishment'
        });
      } 
      // If status changes from completed to something else, clear completedAt
      else if (milestoneData.status && milestoneData.status !== 'completed' && milestone.status === 'completed') {
        completedAt = null;
      }
      
      // Process all fields except completedAt (handled separately)
      for (const [key, value] of Object.entries(milestoneData)) {
        if (key !== 'completedAt') {
          // Convert camelCase keys to snake_case
          const snakeKey = key === 'order' ? '"order"' : key.replace(/([A-Z])/g, "_$1").toLowerCase();
          updates.push(`${snakeKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }
      
      // Add completedAt update
      updates.push(`completed_at = $${paramIndex}`);
      values.push(completedAt);
      paramIndex++;
      
      // Always update updated_at
      updates.push(`updated_at = NOW()`);
      
      // Add the ID parameter
      values.push(id);
      
      const query = `UPDATE goal_milestones 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING 
          id, goal_id as "goalId", title, description, 
          target_date as "targetDate", status, "order",
          completed_at as "completedAt", created_at as "createdAt", 
          updated_at as "updatedAt"`;
      
      const result = await executeQuery(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Update the goal progress when a milestone is updated
      await this.updateGoalProgress(milestone.goalId);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateGoalMilestone for id ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteGoalMilestone(id: number): Promise<boolean> {
    try {
      const milestone = await this.getGoalMilestoneById(id);
      if (!milestone) return false;
      
      // Delete associated progress logs first
      await executeQuery(
        `DELETE FROM goal_progress_logs WHERE milestone_id = $1`,
        [id]
      );
      
      // Delete the milestone
      const result = await executeQuery(
        `DELETE FROM goal_milestones WHERE id = $1 RETURNING id`,
        [id]
      );
      
      const success = result.rowCount > 0;
      
      // Update the goal progress when a milestone is deleted
      if (success) {
        await this.updateGoalProgress(milestone.goalId);
      }
      
      return success;
    } catch (error) {
      console.error(`Error in deleteGoalMilestone for id ${id}:`, error);
      return false;
    }
  }
  
  // Helper method to update a goal's progress based on completed milestones
  private async updateGoalProgress(goalId: number): Promise<void> {
    try {
      const goal = await this.getCareerGoalById(goalId);
      if (!goal) return;
      
      const milestones = await this.getGoalMilestonesByGoalId(goalId);
      
      if (milestones.length === 0) {
        // If there are no milestones, set progress to 0
        await this.updateCareerGoal(goalId, { progress: 0 });
        return;
      }
      
      const completedMilestones = milestones.filter(m => m.status === 'completed');
      const progress = Math.floor((completedMilestones.length / milestones.length) * 100);
      
      await executeQuery(
        `UPDATE career_goals SET progress = $1, last_updated = NOW() WHERE id = $2`,
        [progress, goalId]
      );
    } catch (error) {
      console.error(`Error in updateGoalProgress for goalId ${goalId}:`, error);
    }
  }
  
  // Goal Skill operations
  async getGoalSkillsByGoalId(goalId: number): Promise<GoalSkill[]> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", skill_name as "skillName", 
          description, priority, status, 
          created_at as "createdAt", updated_at as "updatedAt"
        FROM goal_skills 
        WHERE goal_id = $1 
        ORDER BY 
          CASE priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
            ELSE 4 
          END, 
          skill_name ASC`,
        [goalId]
      );
      
      return results.rows;
    } catch (error) {
      console.error(`Error in getGoalSkillsByGoalId for goalId ${goalId}:`, error);
      return [];
    }
  }
  
  async getGoalSkillById(id: number): Promise<GoalSkill | undefined> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", skill_name as "skillName", 
          description, priority, status, 
          created_at as "createdAt", updated_at as "updatedAt"
        FROM goal_skills 
        WHERE id = $1`,
        [id]
      );
      
      if (results.rows.length === 0) {
        return undefined;
      }
      
      return results.rows[0];
    } catch (error) {
      console.error(`Error in getGoalSkillById for id ${id}:`, error);
      return undefined;
    }
  }
  
  async createGoalSkill(skill: InsertGoalSkill): Promise<GoalSkill> {
    try {
      const result = await executeQuery(
        `INSERT INTO goal_skills (
          goal_id, skill_name, description, priority, status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id, goal_id as "goalId", skill_name as "skillName", 
          description, priority, status, 
          created_at as "createdAt", updated_at as "updatedAt"`,
        [
          skill.goalId,
          skill.skillName,
          skill.description || null,
          skill.priority || 'medium',
          skill.status || 'not_started'
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error("Error in createGoalSkill:", error);
      throw error;
    }
  }
  
  async updateGoalSkill(id: number, skillData: Partial<GoalSkill>): Promise<GoalSkill | undefined> {
    try {
      const skill = await this.getGoalSkillById(id);
      if (!skill) return undefined;
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(skillData)) {
        // Convert camelCase keys to snake_case
        const snakeKey = key === 'skillName' ? 'skill_name' : key.replace(/([A-Z])/g, "_$1").toLowerCase();
        updates.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      
      // Always update updated_at
      updates.push(`updated_at = NOW()`);
      
      // Add the ID parameter
      values.push(id);
      
      const query = `UPDATE goal_skills 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING 
          id, goal_id as "goalId", skill_name as "skillName", 
          description, priority, status, 
          created_at as "createdAt", updated_at as "updatedAt"`;
      
      const result = await executeQuery(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateGoalSkill for id ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteGoalSkill(id: number): Promise<boolean> {
    try {
      const result = await executeQuery(
        `DELETE FROM goal_skills WHERE id = $1 RETURNING id`,
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error in deleteGoalSkill for id ${id}:`, error);
      return false;
    }
  }
  
  // Goal Progress Log operations
  async getGoalProgressLogsByGoalId(goalId: number): Promise<GoalProgressLog[]> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", milestone_id as "milestoneId", 
          entry, entry_type as "entryType", created_at as "createdAt"
        FROM goal_progress_logs 
        WHERE goal_id = $1 
        ORDER BY created_at DESC`,
        [goalId]
      );
      
      return results.rows;
    } catch (error) {
      console.error(`Error in getGoalProgressLogsByGoalId for goalId ${goalId}:`, error);
      return [];
    }
  }
  
  async getGoalProgressLogsByMilestoneId(milestoneId: number): Promise<GoalProgressLog[]> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", milestone_id as "milestoneId", 
          entry, entry_type as "entryType", created_at as "createdAt"
        FROM goal_progress_logs 
        WHERE milestone_id = $1 
        ORDER BY created_at DESC`,
        [milestoneId]
      );
      
      return results.rows;
    } catch (error) {
      console.error(`Error in getGoalProgressLogsByMilestoneId for milestoneId ${milestoneId}:`, error);
      return [];
    }
  }
  
  async getGoalProgressLogById(id: number): Promise<GoalProgressLog | undefined> {
    try {
      const results = await executeQuery(
        `SELECT 
          id, goal_id as "goalId", milestone_id as "milestoneId", 
          entry, entry_type as "entryType", created_at as "createdAt"
        FROM goal_progress_logs 
        WHERE id = $1`,
        [id]
      );
      
      if (results.rows.length === 0) {
        return undefined;
      }
      
      return results.rows[0];
    } catch (error) {
      console.error(`Error in getGoalProgressLogById for id ${id}:`, error);
      return undefined;
    }
  }
  
  async createGoalProgressLog(log: InsertGoalProgressLog): Promise<GoalProgressLog> {
    try {
      const result = await executeQuery(
        `INSERT INTO goal_progress_logs (
          goal_id, milestone_id, entry, entry_type
        ) VALUES ($1, $2, $3, $4)
        RETURNING 
          id, goal_id as "goalId", milestone_id as "milestoneId", 
          entry, entry_type as "entryType", created_at as "createdAt"`,
        [
          log.goalId,
          log.milestoneId || null,
          log.entry,
          log.entryType || 'accomplishment'
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error("Error in createGoalProgressLog:", error);
      throw error;
    }
  }
  
  async updateGoalProgressLog(id: number, logData: Partial<GoalProgressLog>): Promise<GoalProgressLog | undefined> {
    try {
      const log = await this.getGoalProgressLogById(id);
      if (!log) return undefined;
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(logData)) {
        const snakeKey = key === 'milestoneId' ? 'milestone_id' : 
                          key === 'entryType' ? 'entry_type' : 
                          key.replace(/([A-Z])/g, "_$1").toLowerCase();
        updates.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      
      // Add the ID parameter
      values.push(id);
      
      const query = `UPDATE goal_progress_logs 
        SET ${updates.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING 
          id, goal_id as "goalId", milestone_id as "milestoneId", 
          entry, entry_type as "entryType", created_at as "createdAt"`;
      
      const result = await executeQuery(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateGoalProgressLog for id ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteGoalProgressLog(id: number): Promise<boolean> {
    try {
      const result = await executeQuery(
        `DELETE FROM goal_progress_logs WHERE id = $1 RETURNING id`,
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error in deleteGoalProgressLog for id ${id}:`, error);
      return false;
    }
  }

  // Career Capsule operations
  async getUserCareerCapsule(userId: number): Promise<CareerCapsule | null> {
    // Find the most recently created capsule for the user
    const userCapsules = Array.from(this.careerCapsules.values())
      .filter(capsule => capsule.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return userCapsules.length > 0 ? userCapsules[0] : null;
  }
  
  async getCareerCapsulesByUserId(userId: number): Promise<CareerCapsule[]> {
    return Array.from(this.careerCapsules.values())
      .filter(capsule => capsule.userId === userId);
  }
  
  async getCareerCapsuleById(id: number): Promise<CareerCapsule | undefined> {
    return this.careerCapsules.get(id);
  }
  
  async createCareerCapsule(capsule: InsertCareerCapsule): Promise<CareerCapsule> {
    const id = this.currentCareerCapsuleId++;
    const careerCapsule: CareerCapsule = {
      ...capsule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReviewedAt: new Date(),
      xpEarned: 0,
      completedTasks: 0,
      totalTasks: 0
    };
    
    this.careerCapsules.set(id, careerCapsule);
    return careerCapsule;
  }
  
  async updateCareerCapsule(id: number, data: Partial<CareerCapsule>): Promise<CareerCapsule | undefined> {
    const capsule = this.careerCapsules.get(id);
    if (!capsule) return undefined;
    
    const updatedCapsule = {
      ...capsule,
      ...data,
      updatedAt: new Date()
    };
    
    this.careerCapsules.set(id, updatedCapsule);
    return updatedCapsule;
  }
  
  async deleteCareerCapsule(id: number): Promise<boolean> {
    return this.careerCapsules.delete(id);
  }
  
  async updateCapsuleProgress(id: number): Promise<CareerCapsule | undefined> {
    const capsule = this.careerCapsules.get(id);
    if (!capsule) return undefined;
    
    // Get all years for this capsule
    const years = await this.getCapsuleYearsByCapsuleId(id);
    
    // Calculate total tasks and completed tasks
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const year of years) {
      const tasks = await this.getCapsuleTasksByYearId(year.id);
      totalTasks += tasks.length;
      completedTasks += tasks.filter(task => task.isCompleted).length;
    }
    
    // Update the capsule
    const updatedCapsule = {
      ...capsule,
      totalTasks,
      completedTasks,
      updatedAt: new Date()
    };
    
    this.careerCapsules.set(id, updatedCapsule);
    return updatedCapsule;
  }
  
  async getCapsuleYearsByCapsuleId(capsuleId: number): Promise<CapsuleYear[]> {
    return Array.from(this.capsuleYears.values()).filter(
      year => year.capsuleId === capsuleId
    );
  }
  
  async getCapsuleYearById(id: number): Promise<CapsuleYear | undefined> {
    return this.capsuleYears.get(id);
  }
  
  async createCapsuleYear(year: InsertCapsuleYear): Promise<CapsuleYear> {
    const id = this.currentCapsuleYearId++;
    const capsuleYear: CapsuleYear = {
      ...year,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedTasks: 0,
      totalTasks: 0,
      muskFeedback: year.muskFeedback || null
    };
    
    this.capsuleYears.set(id, capsuleYear);
    return capsuleYear;
  }
  
  async updateCapsuleYear(id: number, data: Partial<CapsuleYear>): Promise<CapsuleYear | undefined> {
    const year = this.capsuleYears.get(id);
    if (!year) return undefined;
    
    const updatedYear = {
      ...year,
      ...data,
      updatedAt: new Date()
    };
    
    this.capsuleYears.set(id, updatedYear);
    return updatedYear;
  }
  
  async deleteCapsuleYear(id: number): Promise<boolean> {
    const year = this.capsuleYears.get(id);
    if (!year) return false;
    
    // Delete all tasks for this year
    const tasks = await this.getCapsuleTasksByYearId(id);
    for (const task of tasks) {
      await this.deleteCapsuleTask(task.id);
    }
    
    // Delete all journals for this year
    const journals = await this.getCapsuleJournalsByYearId(id);
    for (const journal of journals) {
      await this.deleteCapsuleJournal(journal.id);
    }
    
    // Update the career capsule
    if (year.capsuleId) {
      await this.updateCapsuleProgress(year.capsuleId);
    }
    
    return this.capsuleYears.delete(id);
  }
  
  async updateCapsuleYearProgress(id: number): Promise<CapsuleYear | undefined> {
    const year = this.capsuleYears.get(id);
    if (!year) return undefined;
    
    // Get all tasks for this year
    const tasks = await this.getCapsuleTasksByYearId(id);
    
    // Calculate total tasks and completed tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    
    // Update the year
    const updatedYear = {
      ...year,
      totalTasks,
      completedTasks,
      updatedAt: new Date()
    };
    
    this.capsuleYears.set(id, updatedYear);
    
    // Update the capsule
    if (year.capsuleId) {
      await this.updateCapsuleProgress(year.capsuleId);
    }
    
    return updatedYear;
  }
  
  async getCapsuleTasksByYearId(yearId: number): Promise<CapsuleTask[]> {
    return Array.from(this.capsuleTasks.values()).filter(
      task => task.yearId === yearId
    );
  }
  
  async getCapsuleTaskById(id: number): Promise<CapsuleTask | undefined> {
    return this.capsuleTasks.get(id);
  }
  
  async createCapsuleTask(task: InsertCapsuleTask): Promise<CapsuleTask> {
    const id = this.currentCapsuleTaskId++;
    const capsuleTask: CapsuleTask = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: false,
      completedAt: null,
      difficulty: task.difficulty || "medium"
    };
    
    this.capsuleTasks.set(id, capsuleTask);
    
    // Update the total tasks count for the year
    const year = this.capsuleYears.get(task.yearId);
    if (year) {
      const updatedYear = {
        ...year,
        totalTasks: year.totalTasks + 1
      };
      this.capsuleYears.set(year.id, updatedYear);
      
      // Update the career capsule total tasks count
      const capsule = this.careerCapsules.get(year.capsuleId);
      if (capsule) {
        const updatedCapsule = {
          ...capsule,
          totalTasks: capsule.totalTasks + 1
        };
        this.careerCapsules.set(capsule.id, updatedCapsule);
      }
    }
    
    return capsuleTask;
  }
  
  async updateCapsuleTask(id: number, data: Partial<CapsuleTask>): Promise<CapsuleTask | undefined> {
    const task = this.capsuleTasks.get(id);
    if (!task) return undefined;
    
    // Check if the task is being marked as completed
    const isCompletingTask = !task.isCompleted && data.isCompleted === true;
    
    const updatedTask = {
      ...task,
      ...data,
      updatedAt: new Date(),
      completedAt: isCompletingTask ? new Date() : task.completedAt
    };
    
    this.capsuleTasks.set(id, updatedTask);
    
    // If the task is being marked as completed, update the year and capsule completed tasks count
    if (isCompletingTask) {
      const year = this.capsuleYears.get(task.yearId);
      if (year) {
        const updatedYear = {
          ...year,
          completedTasks: year.completedTasks + 1
        };
        this.capsuleYears.set(year.id, updatedYear);
        
        // Update the career capsule completed tasks count
        const capsule = this.careerCapsules.get(year.capsuleId);
        if (capsule) {
          const updatedCapsule = {
            ...capsule,
            completedTasks: capsule.completedTasks + 1,
            xpEarned: capsule.xpEarned + this.getXpForTaskDifficulty(task.difficulty)
          };
          this.careerCapsules.set(capsule.id, updatedCapsule);
        }
      }
    }
    
    return updatedTask;
  }
  
  async deleteCapsuleTask(id: number): Promise<boolean> {
    const task = this.capsuleTasks.get(id);
    if (!task) return false;
    
    // Update the total tasks count for the year
    const year = this.capsuleYears.get(task.yearId);
    if (year) {
      const updatedYear = {
        ...year,
        totalTasks: Math.max(0, year.totalTasks - 1),
        completedTasks: task.isCompleted ? Math.max(0, year.completedTasks - 1) : year.completedTasks
      };
      this.capsuleYears.set(year.id, updatedYear);
      
      // Update the career capsule tasks count
      const capsule = this.careerCapsules.get(year.capsuleId);
      if (capsule) {
        const updatedCapsule = {
          ...capsule,
          totalTasks: Math.max(0, capsule.totalTasks - 1),
          completedTasks: task.isCompleted ? Math.max(0, capsule.completedTasks - 1) : capsule.completedTasks,
          xpEarned: task.isCompleted ? 
            Math.max(0, capsule.xpEarned - this.getXpForTaskDifficulty(task.difficulty)) : 
            capsule.xpEarned
        };
        this.careerCapsules.set(capsule.id, updatedCapsule);
      }
    }
    
    return this.capsuleTasks.delete(id);
  }
  
  async toggleCapsuleTaskCompletion(id: number): Promise<CapsuleTask | undefined> {
    const task = this.capsuleTasks.get(id);
    if (!task) return undefined;
    
    // Toggle completion status
    const isCompleted = !task.isCompleted;
    
    // Use the existing updateCapsuleTask method to handle all the updates
    return this.updateCapsuleTask(id, { 
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    });
  }
  
  async getCapsuleJournalsByYearId(yearId: number): Promise<CapsuleJournal[]> {
    return Array.from(this.capsuleJournals.values())
      .filter(journal => journal.yearId === yearId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }
  
  async getCapsuleJournalsByCapsuleId(capsuleId: number): Promise<CapsuleJournal[]> {
    // First, get all years for this capsule
    const years = await this.getCapsuleYearsByCapsuleId(capsuleId);
    
    // Get journals for each year and combine them
    const journals: CapsuleJournal[] = [];
    
    for (const year of years) {
      const yearJournals = await this.getCapsuleJournalsByYearId(year.id);
      journals.push(...yearJournals);
    }
    
    // Sort by newest first
    return journals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getCapsuleJournalById(id: number): Promise<CapsuleJournal | undefined> {
    return this.capsuleJournals.get(id);
  }
  
  async createCapsuleJournal(journal: InsertCapsuleJournal): Promise<CapsuleJournal> {
    const id = this.currentCapsuleJournalId++;
    const capsuleJournal: CapsuleJournal = {
      ...journal,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      muskFeedback: journal.muskFeedback || null
    };
    
    this.capsuleJournals.set(id, capsuleJournal);
    return capsuleJournal;
  }
  
  async updateCapsuleJournal(id: number, data: Partial<CapsuleJournal>): Promise<CapsuleJournal | undefined> {
    const journal = this.capsuleJournals.get(id);
    if (!journal) return undefined;
    
    const updatedJournal = {
      ...journal,
      ...data,
      updatedAt: new Date()
    };
    
    this.capsuleJournals.set(id, updatedJournal);
    return updatedJournal;
  }
  
  async deleteCapsuleJournal(id: number): Promise<boolean> {
    return this.capsuleJournals.delete(id);
  }
  
  // Helper function to determine XP based on task difficulty
  private getXpForTaskDifficulty(difficulty: string): number {
    switch (difficulty) {
      case "easy":
        return 10;
      case "medium":
        return 20;
      case "hard":
        return 30;
      default:
        return 20; // Default to medium
    }
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
    try {
      console.log('[db.getQuestDefinitions] Fetching all quest definitions');
      
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'quest_definitions'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`[db.getQuestDefinitions] quest_definitions table does not exist`);
        return [];
      }
      
      const result = await pool.query(`
        SELECT 
          id,
          title,
          description,
          type,
          difficulty,
          xp_reward as "xpReward",
          badge_reward as "badgeReward",
          is_active as "isActive",
          completion_criteria as "completionCriteria",
          progress_tracking_field as "progressTrackingField",
          progress_goal as "progressGoal",
          is_repeatable as "isRepeatable",
          tags,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM quest_definitions
      `);
      
      console.log(`[db.getQuestDefinitions] Found ${result.rows.length} quest definitions`);
      return result.rows;
    } catch (error) {
      console.error('[db.getQuestDefinitions] Error fetching quest definitions:', error);
      return [];
    }
  }
  
  // User Quest methods
  async getUserQuestsByUserId(userId: number): Promise<UserQuest[]> {
    try {
      console.log(`[db.getUserQuestsByUserId] Fetching quests for user ${userId}`);
      
      // Check if the table exists first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'user_quests'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`[db.getUserQuestsByUserId] user_quests table does not exist`);
        return [];
      }
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
        FROM user_quests
        WHERE user_id = $1
        ORDER BY assigned_at DESC
      `, [userId]);
      
      console.log(`[db.getUserQuestsByUserId] Found ${result.rows.length} quests for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getUserQuestsByUserId] Error fetching quests for user ${userId}:`, error);
      // Return empty array instead of failing
      return [];
    }
  }
  
  async getCurrentWeekUserQuests(userId: number): Promise<UserQuest[]> {
    try {
      // Get current week number and year
      const now = new Date();
      const currentWeek = this.getWeekNumber(now);
      const currentYear = now.getFullYear();
      
      console.log(`[db.getCurrentWeekUserQuests] Fetching week ${currentWeek} year ${currentYear} quests for user ${userId}`);
      
      // Check if the table exists first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'user_quests'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`[db.getCurrentWeekUserQuests] user_quests table does not exist`);
        return [];
      }
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
        FROM user_quests
        WHERE user_id = $1
          AND week_number = $2
          AND year = $3
        ORDER BY 
          CASE status 
            WHEN 'completed' THEN 2
            WHEN 'dismissed' THEN 1
            ELSE 0
          END,
          assigned_at DESC
      `, [userId, currentWeek, currentYear]);
      
      console.log(`[db.getCurrentWeekUserQuests] Found ${result.rows.length} quests for user ${userId} in week ${currentWeek}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getCurrentWeekUserQuests] Error fetching quests for user ${userId}:`, error);
      // Return empty array to prevent cascading errors
      return [];
    }
  }
  
  // Utility function to get ISO week number
  getWeekNumber(date: Date): number {
    // Create a copy of the date to avoid modifying the original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    
    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    
    return weekNumber;
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

  // User Quest operations - in-memory implementation, replaced by database implementation above
  // This method is not used when the database implementation is active

  async getUserQuestById(id: number): Promise<UserQuest | undefined> {
    try {
      console.log(`[db.getUserQuestById] Fetching quest with ID ${id}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
        FROM user_quests
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getUserQuestById] No quest found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.getUserQuestById] Found quest with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getUserQuestById] Error fetching quest with ID ${id}:`, error);
      return undefined;
    }
  }

  async getActiveUserQuests(userId: number): Promise<UserQuest[]> {
    try {
      console.log(`[db.getActiveUserQuests] Fetching active quests for user ${userId}`);
      
      // Check if the table exists first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'user_quests'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`[db.getActiveUserQuests] user_quests table does not exist`);
        return [];
      }
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
        FROM user_quests
        WHERE user_id = $1 AND status = 'active'
        ORDER BY assigned_at DESC
      `, [userId]);
      
      console.log(`[db.getActiveUserQuests] Found ${result.rows.length} active quests for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getActiveUserQuests] Error fetching active quests for user ${userId}:`, error);
      return [];
    }
  }

  async getCompletedUserQuests(userId: number): Promise<UserQuest[]> {
    try {
      console.log(`[db.getCompletedUserQuests] Fetching completed quests for user ${userId}`);
      
      // Check if the table exists first
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'user_quests'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`[db.getCompletedUserQuests] user_quests table does not exist`);
        return [];
      }
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          quest_definition_id as "questDefinitionId",
          status,
          progress,
          assigned_at as "assignedAt",
          completed_at as "completedAt",
          dismissed_reason as "dismissedReason",
          xp_earned as "xpEarned",
          badge_earned as "badgeEarned",
          musk_response as "muskResponse",
          week_number as "weekNumber",
          year
        FROM user_quests
        WHERE user_id = $1 AND status = 'completed'
        ORDER BY completed_at DESC
      `, [userId]);
      
      console.log(`[db.getCompletedUserQuests] Found ${result.rows.length} completed quests for user ${userId}`);
      return result.rows;
    } catch (error) {
      console.error(`[db.getCompletedUserQuests] Error fetching completed quests for user ${userId}:`, error);
      return [];
    }
  }

  // In-memory implementation of getCurrentWeekUserQuests, replaced by database implementation above
  // This method is not used when the database implementation is active

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
  // Include all required methods to satisfy IStorage interface
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
          const columnName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
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
                industry, domain, start_date as "startDate", end_date as "endDate", 
                description, key_responsibilities as "keyResponsibilities"
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
                 start_date as "startDate", end_date as "endDate",
                 industry, domain, field_of_study as "fieldOfStudy", skills_acquired as "skillsAcquired"
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
    try {
      const result = await pool.query(`
        SELECT id, user_id as "userId", degree, institution, location, 
               start_date as "startDate", end_date as "endDate",
               industry, domain, field_of_study as "fieldOfStudy", skills_acquired as "skillsAcquired"
        FROM educations
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getEducationById] Error fetching education with ID ${id}:`, error);
      return undefined;
    }
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    console.log(`[db.createEducation] Creating education record for user ${insertEducation.userId}`);
    try {
      const result = await pool.query(`
        INSERT INTO educations (
          user_id, degree, institution, location, start_date, end_date, 
          industry, domain, field_of_study, skills_acquired
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING 
          id, user_id as "userId", degree, institution, location, 
          start_date as "startDate", end_date as "endDate",
          industry, domain, field_of_study as "fieldOfStudy", skills_acquired as "skillsAcquired"
      `, [
        insertEducation.userId,
        insertEducation.degree,
        insertEducation.institution,
        insertEducation.location,
        insertEducation.startDate,
        insertEducation.endDate,
        insertEducation.industry || null,
        insertEducation.domain || null,
        insertEducation.fieldOfStudy || null,
        // Use standard JSON.stringify with PostgreSQL JSONB casting
        JSON.stringify(insertEducation.skillsAcquired || [])
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
      
      if (educationData.industry !== undefined) {
        updateFields.push(`industry = $${valueIndex++}`);
        values.push(educationData.industry);
      }
      
      if (educationData.domain !== undefined) {
        updateFields.push(`domain = $${valueIndex++}`);
        values.push(educationData.domain);
      }
      
      if (educationData.fieldOfStudy !== undefined) {
        updateFields.push(`field_of_study = $${valueIndex++}`);
        values.push(educationData.fieldOfStudy);
      }
      
      if (educationData.skillsAcquired !== undefined) {
        console.log(`[db.updateEducation] Processing skillsAcquired array:`, educationData.skillsAcquired);
        updateFields.push(`skills_acquired = $${valueIndex++}::jsonb`);
        // Use standard JSON.stringify with PostgreSQL JSONB casting explicitly
        values.push(JSON.stringify(educationData.skillsAcquired || []));
        console.log(`[db.updateEducation] Formatted skillsAcquired for query:`, JSON.stringify(educationData.skillsAcquired || []));
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
                 start_date as "startDate", end_date as "endDate",
                 industry, domain, field_of_study as "fieldOfStudy", skills_acquired as "skillsAcquired"
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
                project_url as "projectUrl", category, industry, thumbnail_url as "thumbnailUrl",
                thumbnail_file as "thumbnailFile", media_urls as "mediaUrls",
                created_at as "createdAt", updated_at as "updatedAt"
          FROM projects
          WHERE user_id = $1
        `, [userId]);
        
        console.log(`[db.getProjectsByUserId] Found ${result.rows.length} projects for user ${userId}`);
        
        return result.rows;
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
  
  // Resume operations
  async getResumeByUserId(userId: number): Promise<Resume | undefined> {
    try {
      console.log(`[db.getResumeByUserId] Looking for resume with userId: ${userId}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          file_name as "fileName",
          file_data as "fileData",
          score,
          uploaded_at as "uploadedAt",
          is_shadow_resume as "isShadowResume",
          theme_style as "themeStyle",
          is_downloadable as "isDownloadable",
          last_updated_by_musk as "lastUpdatedByMusk",
          visibility,
          metadata
        FROM resumes
        WHERE user_id = $1 AND is_shadow_resume = true
        LIMIT 1
      `, [userId]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getResumeByUserId] No shadow resume found for user ${userId}`);
        return undefined;
      }
      
      console.log(`[db.getResumeByUserId] Found shadow resume with ID ${result.rows[0].id} for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getResumeByUserId] Error fetching resume for user ${userId}:`, error);
      return undefined;
    }
  }
  
  async getResumeById(id: number): Promise<Resume | undefined> {
    try {
      console.log(`[db.getResumeById] Looking for resume with ID: ${id}`);
      
      const result = await pool.query(`
        SELECT 
          id,
          user_id as "userId",
          file_name as "fileName",
          file_data as "fileData",
          score,
          uploaded_at as "uploadedAt",
          is_shadow_resume as "isShadowResume",
          theme_style as "themeStyle",
          is_downloadable as "isDownloadable",
          last_updated_by_musk as "lastUpdatedByMusk",
          visibility,
          metadata
        FROM resumes
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        console.log(`[db.getResumeById] No resume found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.getResumeById] Found resume with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.getResumeById] Error fetching resume with ID ${id}:`, error);
      return undefined;
    }
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    try {
      console.log(`[db.createResume] Creating resume for user ${insertResume.userId}`);
      
      const result = await pool.query(`
        INSERT INTO resumes (
          user_id,
          file_name,
          file_data,
          score,
          uploaded_at,
          is_shadow_resume,
          theme_style,
          is_downloadable,
          last_updated_by_musk,
          visibility,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING 
          id,
          user_id as "userId",
          file_name as "fileName",
          file_data as "fileData",
          score,
          uploaded_at as "uploadedAt",
          is_shadow_resume as "isShadowResume",
          theme_style as "themeStyle",
          is_downloadable as "isDownloadable",
          last_updated_by_musk as "lastUpdatedByMusk",
          visibility,
          metadata
      `, [
        insertResume.userId,
        insertResume.fileName,
        insertResume.fileData,
        insertResume.score || 0,
        new Date(),
        insertResume.isShadowResume || false,
        insertResume.themeStyle || 'professional',
        insertResume.isDownloadable || false,
        insertResume.lastUpdatedByMusk || null,
        insertResume.visibility || 'private',
        insertResume.metadata || null
      ]);
      
      console.log(`[db.createResume] Created resume with ID ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.createResume] Error creating resume:`, error);
      throw error;
    }
  }

  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    try {
      console.log(`[db.updateResume] Updating resume with ID ${id}`);
      
      const updateFields = [];
      const values = [];
      let valueCounter = 1;
      
      // Build dynamic update query based on provided fields
      for (const [key, value] of Object.entries(resumeData)) {
        if (value !== undefined) {
          // Convert camelCase to snake_case for DB column names
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          updateFields.push(`${snakeKey} = $${valueCounter}`);
          values.push(value);
          valueCounter++;
        }
      }
      
      if (updateFields.length === 0) {
        console.log(`[db.updateResume] No fields to update for resume with ID ${id}`);
        
        // Fetch and return the current resume
        const currentResult = await pool.query(`
          SELECT 
            id,
            user_id as "userId",
            file_name as "fileName",
            file_data as "fileData",
            score,
            uploaded_at as "uploadedAt",
            is_shadow_resume as "isShadowResume",
            theme_style as "themeStyle",
            is_downloadable as "isDownloadable",
            last_updated_by_musk as "lastUpdatedByMusk",
            visibility,
            metadata
          FROM resumes
          WHERE id = $1
        `, [id]);
        
        return currentResult.rows[0] || undefined;
      }
      
      values.push(id); // Add ID as the last parameter
      
      const result = await pool.query(`
        UPDATE resumes
        SET ${updateFields.join(', ')}
        WHERE id = $${valueCounter}
        RETURNING 
          id,
          user_id as "userId",
          file_name as "fileName",
          file_data as "fileData",
          score,
          uploaded_at as "uploadedAt",
          is_shadow_resume as "isShadowResume",
          theme_style as "themeStyle",
          is_downloadable as "isDownloadable",
          last_updated_by_musk as "lastUpdatedByMusk",
          visibility,
          metadata
      `, values);
      
      if (result.rows.length === 0) {
        console.log(`[db.updateResume] No resume found with ID ${id}`);
        return undefined;
      }
      
      console.log(`[db.updateResume] Updated resume with ID ${id}`);
      return result.rows[0];
    } catch (error) {
      console.error(`[db.updateResume] Error updating resume with ID ${id}:`, error);
      return undefined;
    }
  }
  
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
  // Career Capsule operations
  async getUserCareerCapsule(userId: number): Promise<CareerCapsule | null> {
    console.log(`[db.getUserCareerCapsule] Looking for career capsule for user ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", title, goal_type as "goalType", 
                custom_goal as "customGoal", timeframe, description, industry, 
                is_private as "isPrivate", overall_progress as "overallProgress", 
                is_musk_generated as "isMuskGenerated", created_at as "createdAt", 
                updated_at as "updatedAt"
          FROM career_capsules
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId]);
        
        if (result.rows.length === 0) {
          console.log(`[db.getUserCareerCapsule] No career capsule found for user ${userId}`);
          return null;
        }
        
        console.log(`[db.getUserCareerCapsule] Found career capsule for user ${userId}`);
        return result.rows[0];
      } catch (error) {
        console.error(`[db.getUserCareerCapsule] Error fetching career capsule for user ${userId}:`, error);
        throw error;
      }
    }, 3, 800);
  }
  
  async getCareerCapsulesByUserId(userId: number): Promise<CareerCapsule[]> {
    console.log(`[db.getCareerCapsulesByUserId] Looking for career capsules for user ${userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", title, goal_type as "goalType", 
                custom_goal as "customGoal", timeframe, description, industry, 
                is_private as "isPrivate", overall_progress as "overallProgress", 
                is_musk_generated as "isMuskGenerated", created_at as "createdAt", 
                updated_at as "updatedAt"
          FROM career_capsules
          WHERE user_id = $1
          ORDER BY created_at DESC
        `, [userId]);
        
        console.log(`[db.getCareerCapsulesByUserId] Found ${result.rows.length} career capsules for user ${userId}`);
        return result.rows;
      } catch (error) {
        console.error(`[db.getCareerCapsulesByUserId] Error fetching career capsules for user ${userId}:`, error);
        throw error;
      }
    }, 3, 800);
  }
  
  async getCareerCapsuleById(id: number): Promise<CareerCapsule | undefined> {
    console.log(`[db.getCareerCapsuleById] Looking for career capsule with ID ${id}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          SELECT id, user_id as "userId", title, goal_type as "goalType", 
                custom_goal as "customGoal", timeframe, description, industry, 
                is_private as "isPrivate", overall_progress as "overallProgress", 
                is_musk_generated as "isMuskGenerated", created_at as "createdAt", 
                updated_at as "updatedAt"
          FROM career_capsules
          WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          console.log(`[db.getCareerCapsuleById] No career capsule found with ID ${id}`);
          return undefined;
        }
        
        console.log(`[db.getCareerCapsuleById] Found career capsule with ID ${id}`);
        return result.rows[0];
      } catch (error) {
        console.error(`[db.getCareerCapsuleById] Error fetching career capsule with ID ${id}:`, error);
        throw error;
      }
    }, 3, 800);
  }
  
  async createCareerCapsule(capsule: InsertCareerCapsule): Promise<CareerCapsule> {
    console.log(`[db.createCareerCapsule] Creating career capsule for user ${capsule.userId}`);
    
    return executeWithRetry(async () => {
      try {
        const result = await pool.query(`
          INSERT INTO career_capsules (
            user_id, title, goal_type, custom_goal, timeframe, description, 
            industry, is_private, is_musk_generated
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING 
            id, user_id as "userId", title, goal_type as "goalType", 
            custom_goal as "customGoal", timeframe, description, industry, 
            is_private as "isPrivate", overall_progress as "overallProgress", 
            is_musk_generated as "isMuskGenerated", created_at as "createdAt", 
            updated_at as "updatedAt"
        `, [
          capsule.userId,
          capsule.title,
          capsule.goalType,
          capsule.customGoal || null,
          capsule.timeframe || 5,
          capsule.description || null,
          capsule.industry || null,
          capsule.isPrivate !== undefined ? capsule.isPrivate : true,
          capsule.isMuskGenerated !== undefined ? capsule.isMuskGenerated : true,
        ]);
        
        console.log(`[db.createCareerCapsule] Created career capsule with ID ${result.rows[0].id}`);
        return result.rows[0];
      } catch (error) {
        console.error(`[db.createCareerCapsule] Error creating career capsule:`, error);
        throw error;
      }
    }, 3, 800);
  }
  
  async updateCareerCapsule(id: number, data: Partial<CareerCapsule>): Promise<CareerCapsule | undefined> {
    console.log(`[db.updateCareerCapsule] Updating career capsule with ID ${id}`);
    
    return executeWithRetry(async () => {
      try {
        // Build the update query dynamically based on the provided data
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;
        
        if (data.title !== undefined) {
          updateFields.push(`title = $${paramIndex++}`);
          values.push(data.title);
        }
        
        if (data.goalType !== undefined) {
          updateFields.push(`goal_type = $${paramIndex++}`);
          values.push(data.goalType);
        }
        
        if (data.customGoal !== undefined) {
          updateFields.push(`custom_goal = $${paramIndex++}`);
          values.push(data.customGoal);
        }
        
        if (data.timeframe !== undefined) {
          updateFields.push(`timeframe = $${paramIndex++}`);
          values.push(data.timeframe);
        }
        
        if (data.description !== undefined) {
          updateFields.push(`description = $${paramIndex++}`);
          values.push(data.description);
        }
        
        if (data.industry !== undefined) {
          updateFields.push(`industry = $${paramIndex++}`);
          values.push(data.industry);
        }
        
        if (data.isPrivate !== undefined) {
          updateFields.push(`is_private = $${paramIndex++}`);
          values.push(data.isPrivate);
        }
        
        if (data.overallProgress !== undefined) {
          updateFields.push(`overall_progress = $${paramIndex++}`);
          values.push(data.overallProgress);
        }
        
        if (data.isMuskGenerated !== undefined) {
          updateFields.push(`is_musk_generated = $${paramIndex++}`);
          values.push(data.isMuskGenerated);
        }
        
        // Add updated_at
        updateFields.push(`updated_at = NOW()`);
        
        // If no fields to update, return the existing capsule
        if (updateFields.length === 0) {
          return this.getCareerCapsuleById(id);
        }
        
        // Add the id parameter
        values.push(id);
        
        const result = await pool.query(`
          UPDATE career_capsules
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING 
            id, user_id as "userId", title, goal_type as "goalType", 
            custom_goal as "customGoal", timeframe, description, industry, 
            is_private as "isPrivate", overall_progress as "overallProgress", 
            is_musk_generated as "isMuskGenerated", created_at as "createdAt", 
            updated_at as "updatedAt"
        `, values);
        
        if (result.rows.length === 0) {
          console.log(`[db.updateCareerCapsule] No career capsule found with ID ${id}`);
          return undefined;
        }
        
        console.log(`[db.updateCareerCapsule] Updated career capsule with ID ${id}`);
        return result.rows[0];
      } catch (error) {
        console.error(`[db.updateCareerCapsule] Error updating career capsule with ID ${id}:`, error);
        throw error;
      }
    }, 3, 800);
  }
  
  async deleteCareerCapsule(id: number): Promise<boolean> {
    console.log(`[db.deleteCareerCapsule] Deleting career capsule with ID ${id}`);
    
    return executeWithRetry(async () => {
      try {
        // Start a transaction to ensure all related records are deleted consistently
        console.log(`[db.deleteCareerCapsule] Starting transaction for deletion of capsule ${id}`);
        await pool.query('BEGIN');
        
        // 1. First get all years for this capsule
        console.log(`[db.deleteCareerCapsule] Querying for years of capsule ${id}`);
        const yearsResult = await pool.query(`
          SELECT id FROM capsule_years WHERE capsule_id = $1
        `, [id]);
        
        const yearIds = yearsResult.rows.map(row => row.id);
        console.log(`[db.deleteCareerCapsule] Found ${yearIds.length} years to delete for capsule ${id}: ${JSON.stringify(yearIds)}`);
        
        // 2. Delete all tasks for these years
        if (yearIds.length > 0) {
          console.log(`[db.deleteCareerCapsule] Deleting tasks for years: ${yearIds.join(', ')}`);
          const taskDeleteResult = await pool.query(`
            DELETE FROM capsule_tasks 
            WHERE year_id = ANY($1::int[])
            RETURNING id
          `, [yearIds]);
          console.log(`[db.deleteCareerCapsule] Deleted ${taskDeleteResult.rowCount} tasks for years ${yearIds.join(', ')}`);
          
          // 3. Delete all journals for these years
          console.log(`[db.deleteCareerCapsule] Deleting journals for years: ${yearIds.join(', ')}`);
          const journalDeleteResult = await pool.query(`
            DELETE FROM capsule_journals
            WHERE year_id = ANY($1::int[])
            RETURNING id
          `, [yearIds]);
          console.log(`[db.deleteCareerCapsule] Deleted ${journalDeleteResult.rowCount} journals for years ${yearIds.join(', ')}`);
          
          // 4. Delete all years for this capsule
          console.log(`[db.deleteCareerCapsule] Deleting years for capsule ${id}`);
          const yearDeleteResult = await pool.query(`
            DELETE FROM capsule_years
            WHERE capsule_id = $1
            RETURNING id
          `, [id]);
          console.log(`[db.deleteCareerCapsule] Deleted ${yearDeleteResult.rowCount} years for capsule ${id}`);
        }
        
        // 5. Finally, delete the capsule itself
        console.log(`[db.deleteCareerCapsule] Deleting the capsule ${id} itself`);
        const result = await pool.query(`
          DELETE FROM career_capsules
          WHERE id = $1
          RETURNING id
        `, [id]);
        
        // Check the results
        const deleted = result.rows.length > 0;
        console.log(`[db.deleteCareerCapsule] Capsule deletion result: ${JSON.stringify(result.rows)}`);
        
        // Commit the transaction
        console.log(`[db.deleteCareerCapsule] Committing transaction for capsule ${id}`);
        await pool.query('COMMIT');
        
        console.log(`[db.deleteCareerCapsule] Successfully deleted career capsule with ID ${id}: ${deleted}`);
        return deleted;
      } catch (error) {
        // Rollback in case of any error
        console.error(`[db.deleteCareerCapsule] ERROR deleting career capsule with ID ${id}:`, error);
        try {
          console.log(`[db.deleteCareerCapsule] Rolling back transaction for capsule ${id}`);
          await pool.query('ROLLBACK');
        } catch (rollbackError) {
          console.error(`[db.deleteCareerCapsule] Error during transaction rollback:`, rollbackError);
        }
        throw error;
      }
    }, 3, 1000);
  }
  
  async updateCapsuleProgress(id: number): Promise<CareerCapsule | undefined> {
    console.log(`[db.updateCapsuleProgress] Updating progress for career capsule with ID ${id}`);
    
    try {
      // Get the capsule first to make sure it exists
      const capsule = await this.getCareerCapsuleById(id);
      if (!capsule) {
        console.log(`[db.updateCapsuleProgress] No career capsule found with ID ${id}`);
        return undefined;
      }
      
      // TODO: Calculate progress based on tasks when Capsule Tasks are implemented
      
      return capsule;
    } catch (error) {
      console.error(`[db.updateCapsuleProgress] Error updating progress for career capsule with ID ${id}:`, error);
      throw error;
    }
  }
}

// Create a properly typed storage instance
const dbStorage = new DatabaseStorage();

// Export a wrapper with access to all methods
export const storage = {
  ...dbStorage,
  
  // User methods
  getUser: (id: number) => dbStorage.getUser(id),
  getUserByEmail: (email: string) => dbStorage.getUserByEmail(email),
  getUserByUsername: (username: string) => dbStorage.getUserByUsername(username),
  getUserByPhoneNumber: (phoneNumber: string) => dbStorage.getUserByPhoneNumber(phoneNumber),
  
  // Career Goal methods
  getCareerGoalsByUserId: (userId: number) => dbStorage.getCareerGoalsByUserId(userId),
  getCareerGoalById: (id: number) => dbStorage.getCareerGoalById(id),
  createCareerGoal: (goal: any) => dbStorage.createCareerGoal(goal),
  updateCareerGoal: (id: number, data: any) => dbStorage.updateCareerGoal(id, data),
  deleteCareerGoal: (id: number) => dbStorage.deleteCareerGoal(id),
  
  // Career Capsule methods
  getUserCareerCapsule: (userId: number) => dbStorage.getUserCareerCapsule(userId),
  getCareerCapsulesByUserId: (userId: number) => dbStorage.getCareerCapsulesByUserId(userId),
  getCareerCapsuleById: (id: number) => dbStorage.getCareerCapsuleById(id),
  createCareerCapsule: (capsule: InsertCareerCapsule) => dbStorage.createCareerCapsule(capsule),
  updateCareerCapsule: (id: number, data: Partial<CareerCapsule>) => dbStorage.updateCareerCapsule(id, data),
  deleteCareerCapsule: (id: number) => dbStorage.deleteCareerCapsule(id),
  updateCapsuleProgress: (id: number) => dbStorage.updateCapsuleProgress(id),
  getCapsuleYearsByCapsuleId: (capsuleId: number) => {
    console.log(`[storage.getCapsuleYearsByCapsuleId] Getting years for capsule ${capsuleId}`);
    try {
      return Promise.resolve([]);
    } catch (error) {
      console.error(`[storage.getCapsuleYearsByCapsuleId] Error:`, error);
      return Promise.resolve([]);
    }
  },
  createCapsuleYear: (year: InsertCapsuleYear) => {
    console.log(`[storage.createCapsuleYear] Creating year for capsule ${year.capsuleId}`);
    try {
      const newYear: CapsuleYear = {
        id: Math.floor(Math.random() * 1000) + 1,
        capsuleId: year.capsuleId,
        yearNumber: year.yearNumber || 1, 
        title: year.title || `Year ${year.yearNumber || 1}`,
        description: year.description || null,
        goalType: year.goalType || null,
        progress: year.progress || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return Promise.resolve(newYear);
    } catch (error) {
      console.error(`[storage.createCapsuleYear] Error:`, error);
      throw error;
    }
  },
  updateCapsuleYear: (id: number, data: Partial<CapsuleYear>) => {
    // Simple implementation for now
    return Promise.resolve(undefined);
  },
  deleteCapsuleYear: (id: number) => {
    // Simple implementation for now
    return Promise.resolve(true);
  },
  getCapsuleTasksByYearId: (yearId: number) => {
    console.log(`[storage.getCapsuleTasksByYearId] Getting tasks for year ${yearId}`);
    try {
      return Promise.resolve([]);
    } catch (error) {
      console.error(`[storage.getCapsuleTasksByYearId] Error:`, error);
      return Promise.resolve([]);
    }
  },
  createCapsuleTask: (task: InsertCapsuleTask) => {
    console.log(`[storage.createCapsuleTask] Creating task for year ${task.yearId}`);
    try {
      const newTask: CapsuleTask = {
        id: Math.floor(Math.random() * 1000) + 1,
        yearId: task.yearId,
        title: task.title,
        description: task.description || null,
        isCompleted: task.isCompleted || false,
        dueDate: task.dueDate || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return Promise.resolve(newTask);
    } catch (error) {
      console.error(`[storage.createCapsuleTask] Error:`, error);
      throw error;
    }
  },
  updateCapsuleTask: (id: number, data: Partial<CapsuleTask>) => {
    // Simple implementation for now
    return Promise.resolve(undefined);
  },
  deleteCapsuleTask: (id: number) => {
    // Simple implementation for now
    return Promise.resolve(true);
  },
  
  // Goal Milestone methods
  getGoalMilestonesByGoalId: (goalId: number) => dbStorage.getGoalMilestonesByGoalId(goalId),
  getGoalMilestoneById: (id: number) => dbStorage.getGoalMilestoneById(id),
  createGoalMilestone: (milestone: any) => dbStorage.createGoalMilestone(milestone),
  updateGoalMilestone: (id: number, data: any) => dbStorage.updateGoalMilestone(id, data),
  deleteGoalMilestone: (id: number) => dbStorage.deleteGoalMilestone(id),
  
  // Goal Skills methods
  getGoalSkillsByGoalId: (goalId: number) => dbStorage.getGoalSkillsByGoalId(goalId),
  getGoalSkillById: (id: number) => dbStorage.getGoalSkillById(id),
  createGoalSkill: (skill: any) => dbStorage.createGoalSkill(skill),
  updateGoalSkill: (id: number, data: any) => dbStorage.updateGoalSkill(id, data),
  deleteGoalSkill: (id: number) => dbStorage.deleteGoalSkill(id),
  
  // Goal Progress Log methods
  getGoalProgressLogsByGoalId: (goalId: number) => dbStorage.getGoalProgressLogsByGoalId(goalId),
  getGoalProgressLogsByMilestoneId: (milestoneId: number) => dbStorage.getGoalProgressLogsByMilestoneId(milestoneId),
  getGoalProgressLogById: (id: number) => dbStorage.getGoalProgressLogById(id),
  createGoalProgressLog: (log: any) => dbStorage.createGoalProgressLog(log),
  updateGoalProgressLog: (id: number, data: any) => dbStorage.updateGoalProgressLog(id, data),
  deleteGoalProgressLog: (id: number) => dbStorage.deleteGoalProgressLog(id)
} as IStorage;
