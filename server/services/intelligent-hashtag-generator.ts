/**
 * Intelligent Hashtag Generator
 * 
 * Generates contextual, audience-targeted hashtags based on:
 * - User's industry and domain
 * - Primary/secondary audience
 * - Brand goals
 * - Platform best practices
 * - Content type
 * - Geographic relevance
 * 
 * NO RANDOM HASHTAGS - Every tag must make sense and reach the right audience
 */

import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface HashtagSet {
  primary: string[];      // Core industry/domain hashtags (highest relevance)
  audience: string[];     // Audience-targeted hashtags
  trending: string[];     // Platform-specific trending/popular tags
  geographic: string[];   // Location-based tags (if relevant)
  contentType: string[];  // Content format specific tags
}

export interface HashtagGenerationParams {
  userId: number;
  platform: string;
  contentType: string;
  questType: string;
  userGoals?: string[];
}

export class IntelligentHashtagGenerator {
  
  /**
   * Industry-Domain specific hashtag mapping
   * Maps industry → domain → relevant hashtags
   */
  private readonly INDUSTRY_DOMAIN_HASHTAGS: Record<string, Record<string, string[]>> = {
    'Technology': {
      'SaaS': ['#SaaS', '#SoftwareEngineering', '#CloudComputing', '#TechStartups', '#B2BSaaS'],
      'FinTech': ['#FinTech', '#DigitalBanking', '#PaymentTech', '#BlockchainTech', '#FinancialInnovation'],
      'HealthTech': ['#HealthTech', '#DigitalHealth', '#MedTech', '#HealthcareIT', '#TeleHealth'],
      'EdTech': ['#EdTech', '#ELearning', '#EducationInnovation', '#OnlineEducation', '#LearningTech'],
      'AI/ML': ['#ArtificialIntelligence', '#MachineLearning', '#DeepLearning', '#DataScience', '#AI'],
      'Cybersecurity': ['#Cybersecurity', '#InfoSec', '#DataProtection', '#NetworkSecurity', '#CyberDefense'],
      'default': ['#Technology', '#TechInnovation', '#DigitalTransformation', '#Innovation', '#TechTrends']
    },
    'Marketing': {
      'Digital Marketing': ['#DigitalMarketing', '#MarketingStrategy', '#ContentMarketing', '#OnlineMarketing', '#GrowthMarketing'],
      'SaaS': ['#SaaSMarketing', '#B2BMarketing', '#ProductMarketing', '#GrowthHacking', '#MarketingAutomation'],
      'Ecommerce': ['#EcommerceMarketing', '#RetailMarketing', '#OnlineSales', '#D2C', '#EcommerceTips'],
      'Social Media': ['#SocialMediaMarketing', '#SMM', '#SocialStrategy', '#ContentCreation', '#InfluencerMarketing'],
      'Performance Marketing': ['#PerformanceMarketing', '#PaidAds', '#GoogleAds', '#FacebookAds', '#ROI'],
      'default': ['#Marketing', '#MarketingTips', '#BrandStrategy', '#MarketingInsights', '#Advertising']
    },
    'Design': {
      'UI/UX': ['#UIUXDesign', '#UserExperience', '#InterfaceDesign', '#DesignThinking', '#ProductDesign'],
      'Graphic Design': ['#GraphicDesign', '#VisualDesign', '#BrandIdentity', '#CreativeDesign', '#DesignInspiration'],
      'Web Design': ['#WebDesign', '#WebDevelopment', '#ResponsiveDesign', '#UXDesign', '#WebDesigner'],
      'Motion Graphics': ['#MotionGraphics', '#Animation', '#VideoEditing', '#CreativeMotion', '#MotionDesign'],
      'default': ['#Design', '#CreativeWork', '#DesignCommunity', '#VisualIdentity', '#CreativeProcess']
    },
    'Finance': {
      'Investment': ['#Investment', '#InvestmentStrategy', '#WealthManagement', '#FinancialPlanning', '#AssetManagement'],
      'Accounting': ['#Accounting', '#CPA', '#FinancialReporting', '#TaxPlanning', '#BookKeeping'],
      'Banking': ['#Banking', '#FinancialServices', '#RetailBanking', '#CorporateBanking', '#BankingTech'],
      'default': ['#Finance', '#FinancialServices', '#MoneyManagement', '#FinancialLiteracy', '#FinanceCareer']
    },
    'Consulting': {
      'Management Consulting': ['#ManagementConsulting', '#BusinessStrategy', '#StrategicPlanning', '#Consulting', '#BusinessTransformation'],
      'IT Consulting': ['#ITConsulting', '#TechnologyConsulting', '#DigitalConsulting', '#TechStrategy', '#ITSolutions'],
      'HR Consulting': ['#HRConsulting', '#TalentManagement', '#OrganizationalDevelopment', '#PeopleStrategy', '#HRStrategy'],
      'default': ['#Consulting', '#BusinessConsulting', '#ProfessionalServices', '#ConsultingLife', '#StrategyConsulting']
    },
    'Healthcare': {
      'Medical': ['#Healthcare', '#Medicine', '#MedicalProfessional', '#HealthcareProfessional', '#PatientCare'],
      'Nursing': ['#Nursing', '#RegisteredNurse', '#NursingCare', '#HealthcareHeroes', '#NursingLife'],
      'Pharmaceutical': ['#Pharma', '#PharmaceuticalIndustry', '#DrugDevelopment', '#HealthcareInnovation', '#MedicalResearch'],
      'default': ['#Healthcare', '#HealthAndWellness', '#MedicalField', '#HealthcareProfessionals', '#HealthcareIndustry']
    },
    'Hospitality': {
      'Hotel Management': ['#HotelManagement', '#HospitalityIndustry', '#HotelIndustry', '#HospitalityManagement', '#TourismIndustry'],
      'Food & Beverage': ['#FoodAndBeverage', '#RestaurantManagement', '#CulinaryArts', '#F&B', '#HospitalityService'],
      'Event Management': ['#EventManagement', '#EventPlanning', '#EventIndustry', '#MeetingsAndEvents', '#EventProfs'],
      'default': ['#Hospitality', '#HospitalityIndustry', '#CustomerService', '#ServiceExcellence', '#HospitalityCareer']
    },
    'Education': {
      'Teaching': ['#Education', '#Teaching', '#EdChat', '#TeacherLife', '#EducationalLeadership'],
      'Academic Research': ['#AcademicResearch', '#ResearchScholar', '#HigherEducation', '#AcademicLife', '#Research'],
      'Training & Development': ['#TrainingAndDevelopment', '#ProfessionalDevelopment', '#CorporateTraining', '#LearningDevelopment', '#SkillDevelopment'],
      'default': ['#Education', '#Learning', '#EducationMatters', '#LifelongLearning', '#EducationalInnovation']
    }
  };

  /**
   * Audience-specific hashtags
   */
  private readonly AUDIENCE_HASHTAGS: Record<string, string[]> = {
    'founders': ['#Founders', '#StartupFounders', '#Entrepreneurship', '#StartupLife', '#BuildInPublic'],
    'ceos': ['#CEOs', '#Leadership', '#ExecutiveLeadership', '#CLevel', '#BusinessLeaders'],
    'cmos': ['#CMO', '#ChiefMarketingOfficer', '#MarketingLeadership', '#MarketingExecutive', '#MarketingLeaders'],
    'ctos': ['#CTO', '#TechLeadership', '#EngineeringLeadership', '#TechnologyLeader', '#TechExecutive'],
    'developers': ['#Developers', '#SoftwareDevelopment', '#CodeNewbie', '#100DaysOfCode', '#DevCommunity'],
    'designers': ['#Designers', '#DesignCommunity', '#CreativeProfessionals', '#DesignersOfInstagram', '#DesignLife'],
    'marketers': ['#Marketers', '#MarketingProfessionals', '#MarketingCommunity', '#DigitalMarketers', '#MarketingExperts'],
    'students': ['#Students', '#StudentLife', '#CareerDevelopment', '#FreshersJobs', '#InternshipOpportunities'],
    'professionals': ['#Professionals', '#CareerGrowth', '#ProfessionalDevelopment', '#WorkingProfessionals', '#CareerSuccess'],
    'investors': ['#Investors', '#VentureCapital', '#AngelInvestors', '#InvestmentOpportunities', '#StartupFunding'],
    'b2b': ['#B2B', '#B2BMarketing', '#BusinessToBusiness', '#EnterpriseClients', '#B2BSales'],
    'b2c': ['#B2C', '#ConsumerMarketing', '#D2C', '#DirectToConsumer', '#B2CMarketing'],
    'entrepreneurs': ['#Entrepreneurs', '#EntrepreneurLife', '#StartupJourney', '#BusinessOwner', '#SmallBusiness']
  };

  /**
   * Brand Goal specific hashtags
   */
  private readonly GOAL_HASHTAGS: Record<string, string[]> = {
    'visibility_awareness': ['#PersonalBranding', '#ThoughtLeadership', '#BrandVisibility', '#ProfessionalBranding', '#LinkedInCreator'],
    'career_growth': ['#CareerGrowth', '#ProfessionalDevelopment', '#CareerAdvice', '#CareerTips', '#SkillDevelopment'],
    'engagement_community': ['#CommunityBuilding', '#Networking', '#ProfessionalNetworking', '#CommunityEngagement', '#LetConnect'],
    'monetization_impact': ['#BusinessGrowth', '#RevenueGrowth', '#ScaleYourBusiness', '#BusinessOpportunities', '#CreatorEconomy'],
    'build_authority': ['#IndustryExpert', '#ThoughtLeader', '#SubjectMatterExpert', '#AuthorityMarketing', '#IndustryLeader'],
    'attract_opportunities': ['#CareerOpportunities', '#JobOpportunities', '#BusinessOpportunities', '#OpenToWork', '#Hiring'],
    'skill_development': ['#SkillsTraining', '#UpSkilling', '#ContinuousLearning', '#ProfessionalGrowth', '#SkillBuilding'],
    'network_expansion': ['#ProfessionalNetwork', '#NetworkingTips', '#ConnectionsMatter', '#LinkedInNetworking', '#ExpandYourNetwork']
  };

  /**
   * Platform-specific best practice hashtags
   */
  private readonly PLATFORM_HASHTAGS: Record<string, Record<string, string[]>> = {
    'LinkedIn': {
      'post': ['#LinkedInPost', '#LinkedInTips', '#LinkedInCreators', '#LinkedInCommunity'],
      'article': ['#LinkedInArticles', '#LinkedInLongForm', '#ThoughtLeadership'],
      'carousel': ['#LinkedInCarousel', '#VisualContent', '#InfographicDesign'],
      'video': ['#LinkedInVideo', '#VideoMarketing', '#VideoContent']
    },
    'Instagram': {
      'post': ['#InstaDaily', '#ContentCreator', '#InstagramMarketing'],
      'reel': ['#ReelsInstagram', '#InstagramReels', '#ReelItFeelIt', '#ViralReels'],
      'carousel': ['#InstagramCarousel', '#SwipePost', '#CarouselPost'],
      'story': ['#InstagramStories', '#IGStory', '#StoryTime']
    },
    'Twitter': {
      'post': ['#TwitterThread', '#XPlatform', '#TechTwitter'],
      'thread': ['#ThreadUnrolled', '#TwitterTips', '#ThreadReader']
    },
    'Brandentifier': {
      'pulse': ['#IndustryPulse', '#ProfessionalInsights', '#Brandentifier'],
      'project': ['#PortfolioShowcase', '#ProjectSuccess', '#WorkShowcase']
    }
  };

  /**
   * Content type specific hashtags
   */
  private readonly CONTENT_TYPE_HASHTAGS: Record<string, string[]> = {
    'case_study': ['#CaseStudy', '#RealResults', '#ClientSuccess', '#SuccessStory', '#BusinessResults'],
    'tutorial': ['#HowTo', '#Tutorial', '#LearnWithMe', '#EducationalContent', '#StepByStep'],
    'tip': ['#ProTip', '#QuickTip', '#DailyTips', '#TipOfTheDay', '#ProfessionalTips'],
    'poll': ['#Poll', '#YourOpinion', '#IndustryPoll', '#LetDiscuss', '#VoteNow'],
    'insight': ['#IndustryInsights', '#MarketTrends', '#BusinessInsights', '#KeyInsights', '#DataDriven'],
    'announcement': ['#Announcement', '#CompanyNews', '#BigNews', '#Exciting', '#NewLaunch'],
    'behind_the_scenes': ['#BehindTheScenes', '#WorkInProgress', '#ProcessMatters', '#BTS', '#CreativeProcess'],
    'testimonial': ['#ClientTestimonial', '#CustomerSuccess', '#HappyClients', '#ClientLove', '#Reviews']
  };

  /**
   * Geographic hashtags (if location is relevant)
   */
  private readonly GEO_HASHTAGS: Record<string, string[]> = {
    'India': ['#IndiaStartups', '#IndianTech', '#IndiaDigital', '#MadeInIndia'],
    'USA': ['#USABusiness', '#AmericanStartups', '#USATech', '#SiliconValley'],
    'UK': ['#UKBusiness', '#LondonTech', '#UKStartups', '#UKEntrepreneur'],
    'Singapore': ['#SingaporeBusiness', '#SGStartups', '#SingaporeTech', '#SGEntrepreneur'],
    'Dubai': ['#DubaiBusinesses', '#UAETech', '#DubaiStartups', '#MiddleEastBusiness'],
    'default': []
  };

  /**
   * Main hashtag generation function
   */
  async generateIntelligentHashtags(params: HashtagGenerationParams): Promise<{
    hashtags: string[];
    breakdown: HashtagSet;
    context: string;
  }> {
    try {
      // Get user profile for context
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, params.userId))
        .limit(1);

      if (!userProfile) {
        return this.getFallbackHashtags(params.platform, params.contentType);
      }

      const hashtagSet: HashtagSet = {
        primary: [],
        audience: [],
        trending: [],
        geographic: [],
        contentType: []
      };

      // 1. INDUSTRY + DOMAIN HASHTAGS (Most Important - Primary Tags)
      const industry = userProfile.industry || 'Technology';
      const domain = userProfile.domain || 'default';
      
      const industryDomainTags = this.getIndustryDomainHashtags(industry, domain);
      hashtagSet.primary = industryDomainTags.slice(0, 3); // Top 3 most relevant

      // 2. AUDIENCE-TARGETED HASHTAGS
      const audienceTags = this.getAudienceHashtags(
        userProfile.primaryAudience,
        userProfile.secondaryAudience
      );
      hashtagSet.audience = audienceTags.slice(0, 2);

      // 3. GOAL-ALIGNED HASHTAGS
      if (params.userGoals && params.userGoals.length > 0) {
        const goalTags = this.getGoalHashtags(params.userGoals);
        hashtagSet.trending.push(...goalTags.slice(0, 2));
      }

      // 4. PLATFORM-SPECIFIC HASHTAGS
      const platformTags = this.getPlatformHashtags(params.platform, params.contentType);
      hashtagSet.trending.push(...platformTags.slice(0, 2));

      // 5. CONTENT TYPE HASHTAGS
      const contentTags = this.getContentTypeHashtags(params.questType, params.contentType);
      hashtagSet.contentType = contentTags.slice(0, 2);

      // 6. GEOGRAPHIC HASHTAGS (if relevant and user has location)
      if (userProfile.location) {
        const geoTags = this.getGeographicHashtags(userProfile.location);
        if (geoTags.length > 0) {
          hashtagSet.geographic = geoTags.slice(0, 1);
        }
      }

      // Combine all hashtags (max 10 total for optimal reach)
      const allHashtags = [
        ...hashtagSet.primary,
        ...hashtagSet.audience,
        ...hashtagSet.trending,
        ...hashtagSet.contentType,
        ...hashtagSet.geographic
      ].slice(0, 10);

      // Remove duplicates
      const uniqueHashtags = Array.from(new Set(allHashtags));

      // Create context explanation
      const context = this.generateHashtagContext(userProfile, hashtagSet);

      return {
        hashtags: uniqueHashtags,
        breakdown: hashtagSet,
        context
      };

    } catch (error) {
      console.error('[IntelligentHashtagGenerator] Error generating hashtags:', error);
      return this.getFallbackHashtags(params.platform, params.contentType);
    }
  }

  /**
   * Get industry-domain specific hashtags
   */
  private getIndustryDomainHashtags(industry: string, domain: string): string[] {
    const industryMap = this.INDUSTRY_DOMAIN_HASHTAGS[industry];
    
    if (!industryMap) {
      return this.INDUSTRY_DOMAIN_HASHTAGS['Technology']['default'];
    }

    return industryMap[domain] || industryMap['default'] || [];
  }

  /**
   * Get audience-targeted hashtags
   */
  private getAudienceHashtags(primaryAudience?: string | null, secondaryAudience?: string | null): string[] {
    const tags: string[] = [];

    if (primaryAudience) {
      const audienceKey = primaryAudience.toLowerCase().split(',')[0].trim();
      const matchedTags = this.findAudienceHashtags(audienceKey);
      tags.push(...matchedTags);
    }

    if (secondaryAudience && tags.length < 3) {
      const audienceKey = secondaryAudience.toLowerCase().split(',')[0].trim();
      const matchedTags = this.findAudienceHashtags(audienceKey);
      tags.push(...matchedTags);
    }

    return tags.slice(0, 3);
  }

  /**
   * Find matching audience hashtags
   */
  private findAudienceHashtags(audienceText: string): string[] {
    for (const [key, hashtags] of Object.entries(this.AUDIENCE_HASHTAGS)) {
      if (audienceText.includes(key)) {
        return hashtags.slice(0, 2);
      }
    }
    
    // Check for partial matches
    if (audienceText.includes('founder') || audienceText.includes('startup')) {
      return this.AUDIENCE_HASHTAGS['founders'].slice(0, 2);
    }
    if (audienceText.includes('business') || audienceText.includes('b2b')) {
      return this.AUDIENCE_HASHTAGS['b2b'].slice(0, 2);
    }
    
    return this.AUDIENCE_HASHTAGS['professionals'].slice(0, 2);
  }

  /**
   * Get goal-aligned hashtags
   */
  private getGoalHashtags(goals: string[]): string[] {
    const tags: string[] = [];
    
    for (const goal of goals.slice(0, 2)) {
      const goalTags = this.GOAL_HASHTAGS[goal] || [];
      tags.push(...goalTags.slice(0, 2));
    }
    
    return tags;
  }

  /**
   * Get platform-specific hashtags
   */
  private getPlatformHashtags(platform: string, contentType: string): string[] {
    const platformMap = this.PLATFORM_HASHTAGS[platform];
    
    if (!platformMap) {
      return [];
    }

    return platformMap[contentType] || platformMap['post'] || [];
  }

  /**
   * Get content type specific hashtags
   */
  private getContentTypeHashtags(questType: string, contentType: string): string[] {
    // Try to match quest type to content type
    for (const [type, hashtags] of Object.entries(this.CONTENT_TYPE_HASHTAGS)) {
      if (questType.includes(type) || contentType.includes(type)) {
        return hashtags;
      }
    }
    
    return this.CONTENT_TYPE_HASHTAGS['insight'] || [];
  }

  /**
   * Get geographic hashtags
   */
  private getGeographicHashtags(location: string): string[] {
    for (const [region, hashtags] of Object.entries(this.GEO_HASHTAGS)) {
      if (location.toLowerCase().includes(region.toLowerCase())) {
        return hashtags;
      }
    }
    
    return [];
  }

  /**
   * Generate context explanation for hashtags
   */
  private generateHashtagContext(userProfile: any, hashtagSet: HashtagSet): string {
    const parts: string[] = [];
    
    if (hashtagSet.primary.length > 0) {
      parts.push(`Industry-specific (${userProfile.industry}/${userProfile.domain})`);
    }
    if (hashtagSet.audience.length > 0) {
      parts.push(`Audience-targeted (${userProfile.primaryAudience || 'professionals'})`);
    }
    if (hashtagSet.trending.length > 0) {
      parts.push('Goal-aligned & platform-optimized');
    }
    
    return parts.join(' • ');
  }

  /**
   * Fallback hashtags if generation fails
   */
  private getFallbackHashtags(platform: string, contentType: string): {
    hashtags: string[];
    breakdown: HashtagSet;
    context: string;
  } {
    return {
      hashtags: ['#ProfessionalDevelopment', '#CareerGrowth', '#PersonalBranding', '#ThoughtLeadership', '#LinkedInTips'],
      breakdown: {
        primary: ['#ProfessionalDevelopment'],
        audience: ['#CareerGrowth'],
        trending: ['#PersonalBranding'],
        geographic: [],
        contentType: ['#ThoughtLeadership']
      },
      context: 'Generic professional hashtags (profile data incomplete)'
    };
  }
}

export const intelligentHashtagGenerator = new IntelligentHashtagGenerator();
