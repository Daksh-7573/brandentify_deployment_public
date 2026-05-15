/**
 * Enhanced Quest Content Generator
 * 
 * Generates professional, detailed, actionable Brand Quests with:
 * - Clear objectives and success criteria
 * - Step-by-step instructions
 * - Career impact explanations
 * - Automatic tracking conditions
 * - Personalized content based on user profile
 */

import { db } from '../db';
import { users, brandGoals } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface EnhancedQuestContent {
  // Core identification
  type: string;
  category: 'career' | 'profile' | 'portfolio' | 'social' | 'networking';
  
  // Content fields
  title: string;
  description: string;
  objective: string;
  whyThisMatters: string;
  stepByStepInstructions: string[];
  expectedOutcome: string;
  successCriteria: string[];
  estimatedImpact: string;
  skillArea: string;
  
  // Tracking configuration
  autoTrackingConditions: string[];
  targetAction: string;
  targetCount: number;
  
  // Rewards and metadata
  xpReward: number;
  estimatedTimeMinutes: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  platform?: string;
  deliverableFormat: string;
  quantityValue: number;
  quantityType: string;
  platformConstraints?: string;
  guidanceSnippet: string;
  muskTip: string;
}

export class EnhancedQuestContentGenerator {
  
  /**
   * Generate comprehensive networking quest content
   */
  async generateNetworkingQuest(
    userProfile: any,
    brandGoals: string[],
    questSubtype: 'connections' | 'engagement' | 'outreach' = 'connections'
  ): Promise<EnhancedQuestContent> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your area';
    const title = userProfile.title || 'Professional';
    const name = userProfile.name || 'Professional';
    
    const templates: Record<string, EnhancedQuestContent> = {
      connections: {
        type: 'networking',
        category: 'networking',
        title: `Strategic ${industry} Network Expansion`,
        description: `Connect with 5 targeted professionals in the ${industry} industry to build meaningful professional relationships that support your career growth as a ${title}.`,
        objective: `Identify and connect with 5 relevant ${industry} professionals who can provide industry insights, collaboration opportunities, or career advancement support.`,
        whyThisMatters: `Building a strong professional network is one of the most effective ways to accelerate your career. Quality connections in your industry can lead to job opportunities, mentorship, partnerships, and insider knowledge that keeps you ahead of market trends. Research shows that 70-80% of jobs are found through networking.`,
        stepByStepInstructions: [
          `Use Brandentify's search to find professionals in ${industry} with similar or complementary roles`,
          `Review their profiles to identify common interests, shared connections, or mutual goals`,
          `Send personalized connection requests mentioning specific shared interests or professional alignment`,
          `Engage with at least 2 of their recent posts or updates before or after connecting`,
          `Follow up with a professional message introducing yourself and your professional interests`,
          `Document these connections in your professional network tracker`
        ],
        expectedOutcome: `You will have 5 new strategic connections in your ${industry} network who are relevant to your career goals. These connections should provide ongoing professional value through insights, opportunities, or collaboration potential.`,
        successCriteria: [
          `5 connection requests sent to relevant ${industry} professionals`,
          `At least 3 connections accepted within 7 days`,
          `Engagement demonstrated on connection profiles (likes, comments)`,
          `Professional follow-up messages sent to new connections`
        ],
        estimatedImpact: `Medium-term: Increases your network size by 10-15%. Long-term: Positions you for referral opportunities, industry insights, and potential mentorship relationships. Expected to improve your industry visibility score by 15-20 points.`,
        skillArea: 'Professional Networking & Relationship Building',
        autoTrackingConditions: [
          'connection_request_sent',
          'connection_accepted',
          'profile_engagement_liked',
          'profile_engagement_commented',
          'direct_message_sent'
        ],
        targetAction: 'make_connection',
        targetCount: 5,
        xpReward: 75,
        estimatedTimeMinutes: 45,
        difficultyLevel: 'intermediate',
        deliverableFormat: '5 professional connections with engagement history',
        quantityValue: 5,
        quantityType: 'connections',
        guidanceSnippet: 'Focus on quality over quantity - target professionals whose work aligns with your goals',
        muskTip: `The best networkers don't collect contacts, they cultivate relationships. For each connection, identify ONE specific thing you can offer them first. Give before you ask.`
      },
      
      engagement: {
        type: 'networking',
        category: 'networking',
        title: `Engage with ${industry} Industry Thought Leaders`,
        description: `Engage meaningfully with 8 industry posts from thought leaders and professionals in ${industry} to increase your visibility and demonstrate your expertise.`,
        objective: `Establish your presence in ${industry} conversations by providing thoughtful, value-adding engagement on 8 relevant industry posts.`,
        whyThisMatters: `Active engagement on industry content positions you as an informed professional and increases your visibility among peers and potential employers. Regular, thoughtful comments can lead to recognition as a thought leader yourself and open doors to collaboration opportunities.`,
        stepByStepInstructions: [
          `Identify 8 recent posts from ${industry} professionals in your Industry Pulse feed`,
          `Read each post thoroughly and understand the key message`,
          `Craft thoughtful comments that add value, insights, or relevant experiences`,
          `Ask follow-up questions to encourage deeper conversation`,
          `Like posts that genuinely resonate with your professional perspective`,
          `Track which posts get the most engagement to understand content trends`,
          `Follow up on conversations that develop in comment threads`
        ],
        expectedOutcome: `You will have established 8 meaningful touchpoints with industry content, demonstrating your expertise and professional engagement. Your activity will be visible to the original posters and their networks.`,
        successCriteria: [
          `8 posts engaged with (liked and/or commented)`,
          `At least 4 substantial comments (50+ characters)`,
          `Comments add value beyond generic responses`,
          `Engagement distributed across different content creators`
        ],
        estimatedImpact: `Short-term: Increases your platform activity score. Medium-term: Builds recognition among industry peers. Long-term: Positions you as an engaged community member, potentially leading to collaboration opportunities.`,
        skillArea: 'Professional Communication & Industry Engagement',
        autoTrackingConditions: [
          'post_liked',
          'post_commented',
          'comment_thread_participation',
          'insightful_reaction_added'
        ],
        targetAction: 'engage_with_post',
        targetCount: 8,
        xpReward: 60,
        estimatedTimeMinutes: 30,
        difficultyLevel: 'beginner',
        deliverableFormat: '8 thoughtful post engagements with comments',
        quantityValue: 8,
        quantityType: 'engagements',
        guidanceSnippet: 'Quality comments > likes. Write 2-3 sentences that add genuine value to the conversation',
        muskTip: `Don't just consume content—contribute to it. The professionals who get noticed are the ones who add value to conversations, not just observe them. Show your thinking.`
      },
      
      outreach: {
        type: 'networking',
        category: 'networking',
        title: `Strategic Professional Outreach Campaign`,
        description: `Initiate 3 strategic professional conversations with potential mentors, collaborators, or industry experts in ${industry} to expand your professional opportunities.`,
        objective: `Identify and reach out to 3 high-value professionals who can provide mentorship, collaboration opportunities, or career guidance in your ${industry} field.`,
        whyThisMatters: `Proactive outreach to industry leaders and potential mentors can dramatically accelerate your career trajectory. Most successful professionals attribute significant career milestones to relationships they actively cultivated. This quest builds your confidence in professional outreach and expands your opportunity pipeline.`,
        stepByStepInstructions: [
          `Identify 3 target professionals: potential mentors, industry experts, or collaboration partners`,
          `Research their background, recent work, and professional interests thoroughly`,
          `Find a specific, genuine reason to connect (shared interest, recent work, mutual connection)`,
          `Craft personalized, concise outreach messages (3-4 sentences maximum)`,
          `Send connection requests with personalized notes`,
          `Follow up with value-first messages after connections are accepted`,
          `Track responses and nurture relationships that show promise`
        ],
        expectedOutcome: `You will have initiated 3 strategic professional relationships with industry leaders or potential mentors. At minimum, you'll gain exposure to new perspectives; at best, you'll develop ongoing mentorship or collaboration relationships.`,
        successCriteria: [
          `3 personalized outreach messages sent to strategic targets`,
          `Connection requests include specific, personalized context`,
          `Follow-up messages sent within 48 hours of acceptance`,
          `Professional, respectful tone throughout all communications`,
          `At least 1 meaningful response or ongoing conversation established`
        ],
        estimatedImpact: `High potential impact: Each successful mentorship or collaboration relationship can provide years of career value. Even unsuccessful outreach builds your professional communication skills and industry awareness.`,
        skillArea: 'Strategic Relationship Building & Professional Outreach',
        autoTrackingConditions: [
          'connection_request_sent',
          'connection_accepted',
          'follow_up_message_sent',
          'response_received',
          'conversation_thread_started'
        ],
        targetAction: 'strategic_outreach',
        targetCount: 3,
        xpReward: 100,
        estimatedTimeMinutes: 60,
        difficultyLevel: 'advanced',
        deliverableFormat: '3 strategic professional relationships initiated',
        quantityValue: 3,
        quantityType: 'outreach campaigns',
        guidanceSnippet: 'Research thoroughly before reaching out. Show you understand their work and have a specific reason to connect.',
        muskTip: `Cold outreach isn't about asking—it's about offering. Lead with what YOU can do for THEM. That's how you stand out in a crowded inbox.`
      }
    };
    
    return templates[questSubtype] || templates.connections;
  }
  
  /**
   * Generate comprehensive profile optimization quest content
   */
  async generateProfileQuest(
    userProfile: any,
    brandGoals: string[],
    questSubtype: 'completion' | 'enhancement' | 'branding' = 'completion'
  ): Promise<EnhancedQuestContent> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const currentCompletion = userProfile.profileCompleted || 0;
    
    const templates: Record<string, EnhancedQuestContent> = {
      completion: {
        type: 'profile_update',
        category: 'profile',
        title: `Complete Your Professional Brand Profile`,
        description: `Achieve 90% profile completion by adding missing professional details, skills, and accomplishments. A complete profile increases visibility by up to 3x.`,
        objective: `Fill in all critical profile sections to reach 90% completion, including work experience, skills, education, and professional summary.`,
        whyThisMatters: `A complete professional profile serves as your digital first impression and acts as a 24/7 networking tool. Profiles with 90%+ completion receive 3x more profile views, 2.5x more connection requests, and significantly higher search ranking. In ${industry}, incomplete profiles signal lack of professionalism.`,
        stepByStepInstructions: [
          `Review your current profile completion percentage (${currentCompletion}%)`,
          `Add detailed work experience with quantified achievements (use metrics: %, $, #)`,
          `List 10-15 relevant skills with proficiency levels for ${domain}`,
          `Write a compelling professional summary (150-200 words) highlighting your unique value`,
          `Add education credentials and relevant certifications`,
          `Upload a professional profile photo and cover image`,
          `Include portfolio projects or case studies showcasing ${domain} expertise`,
          `Verify all information is current and accurate`
        ],
        expectedOutcome: `Your profile will reach 90% completion with comprehensive professional information that effectively communicates your expertise in ${domain}. Recruiters and collaborators will have a complete picture of your capabilities.`,
        successCriteria: [
          `Profile completion reaches 90% or higher`,
          `Work experience includes at least 2 positions with detailed descriptions`,
          `Minimum 10 skills listed with proficiency indicators`,
          `Professional summary (150-200 words) added`,
          `Profile photo uploaded`,
          `At least 1 portfolio project or case study included`
        ],
        estimatedImpact: `Immediate: 3x increase in profile visibility. Short-term: More connection requests and profile views from relevant professionals. Long-term: Better positioning for opportunities and higher search ranking in ${industry}.`,
        skillArea: 'Personal Branding & Professional Presentation',
        autoTrackingConditions: [
          'profile_field_updated',
          'work_experience_added',
          'skill_added',
          'profile_photo_uploaded',
          'portfolio_project_added',
          'profile_completion_increased'
        ],
        targetAction: 'update_profile',
        targetCount: 90, // 90% completion
        xpReward: 150,
        estimatedTimeMinutes: 90,
        difficultyLevel: 'intermediate',
        deliverableFormat: '90% complete professional profile',
        quantityValue: 90,
        quantityType: 'percent completion',
        platformConstraints: 'Must include quantified achievements and professional presentation',
        guidanceSnippet: 'Focus on quantifiable achievements. Use numbers to demonstrate impact: "Increased revenue by 25%" beats "Helped increase revenue".',
        muskTip: `Your profile isn't a resume—it's a value proposition. Lead with outcomes, not responsibilities. Numbers convince, adjectives just decorate.`
      },
      
      enhancement: {
        type: 'profile_update',
        category: 'profile',
        title: `Optimize Profile for ${industry} Authority Positioning`,
        description: `Transform your profile into an authority-building asset by adding thought leadership elements, recommendations, and professional achievements that position you as a ${domain} expert.`,
        objective: `Enhance your profile with authority-building elements: recommendations, featured work, publications, speaking engagements, and thought leadership content that positions you as a recognized expert in ${domain}.`,
        whyThisMatters: `Authority positioning differentiates you from other ${industry} professionals. Profiles that demonstrate thought leadership and social proof attract better opportunities, higher-caliber connections, and premium compensation. In today's market, expertise without visibility is wasted potential.`,
        stepByStepInstructions: [
          `Request 3 professional recommendations from colleagues, managers, or clients`,
          `Add featured work section with 2-3 significant projects or case studies`,
          `Include any publications, articles, or content you've created in ${domain}`,
          `List speaking engagements, webinars, or presentations you've delivered`,
          `Add certifications, courses, or continuous learning achievements`,
          `Include metrics and results for each major accomplishment`,
          `Optimize headline and summary for ${industry} keywords`,
          `Create a professional brand statement that communicates your unique value proposition`
        ],
        expectedOutcome: `Your profile will demonstrate authority and expertise in ${domain}, featuring social proof, quantified achievements, and thought leadership elements that differentiate you from other ${industry} professionals.`,
        successCriteria: [
          `3 professional recommendations received and displayed`,
          `2-3 featured projects or case studies with detailed outcomes`,
          `Publications or content samples added (if applicable)`,
          `Professional brand statement created and optimized`,
          `Keywords optimized for ${industry} searchability`,
          `Profile demonstrates clear expertise positioning in ${domain}`
        ],
        estimatedImpact: `Significant impact: Authority-positioned profiles attract 40% more senior-level opportunities and command 15-20% higher compensation in negotiations. Builds long-term professional reputation in ${industry}.`,
        skillArea: 'Authority Building & Professional Branding',
        autoTrackingConditions: [
          'recommendation_received',
          'featured_project_added',
          'publication_added',
          'certification_added',
          'profile_section_enhanced',
          'headline_optimized'
        ],
        targetAction: 'enhance_profile_authority',
        targetCount: 5, // 5 authority elements
        xpReward: 125,
        estimatedTimeMinutes: 120,
        difficultyLevel: 'advanced',
        deliverableFormat: 'Authority-optimized professional profile',
        quantityValue: 5,
        quantityType: 'authority elements',
        platformConstraints: 'Must include social proof and quantified achievements',
        guidanceSnippet: 'Authority comes from demonstrated expertise and social validation. Focus on outcomes and third-party recognition.',
        muskTip: `Expertise without proof is just a claim. Stack your profile with evidence: numbers, recommendations, featured work. Let your results speak louder than your descriptions.`
      },
      
      branding: {
        type: 'profile_update',
        category: 'profile',
        title: `Develop Personal Brand Voice & Messaging`,
        description: `Create a cohesive personal brand voice that communicates your unique value proposition across all profile sections and professional communications.`,
        objective: `Develop and implement consistent personal brand messaging that differentiates you in ${industry} and clearly communicates the unique value you bring to organizations and collaborators.`,
        whyThisMatters: `A strong personal brand is your professional differentiator. In ${industry}, where many professionals have similar skills and experience, your brand voice is what makes you memorable. Clear, consistent messaging helps the right opportunities find you and helps you attract aligned collaborators.`,
        stepByStepInstructions: [
          `Define your unique value proposition: What specific problem do you solve better than others?`,
          `Identify your target audience: Who needs to know about your expertise?`,
          `Develop brand voice guidelines: Professional tone, key messages, signature phrases`,
          `Rewrite headline to communicate value proposition in 10 words or less`,
          `Craft professional summary that tells your career story with brand consistency`,
          `Ensure all profile sections reflect unified brand messaging`,
          `Create elevator pitch (30-second version of your brand story)`,
          `Document brand guidelines for future profile updates and communications`
        ],
        expectedOutcome: `You will have a clearly defined personal brand with consistent messaging across all profile sections. Your brand will communicate a specific, memorable value proposition that differentiates you in ${industry}.`,
        successCriteria: [
          `Unique value proposition clearly articulated`,
          `Target audience defined and understood`,
          `Headline communicates value in ≤10 words`,
          `Professional summary tells cohesive brand story`,
          `All profile sections reflect consistent messaging`,
          `Elevator pitch developed and documented`,
          `Brand voice guidelines documented for future use`
        ],
        estimatedImpact: `Transformative impact: Strong personal brand can increase response rates to outreach by 300%, attract aligned opportunities, and command premium positioning in ${industry}. Long-term career asset.`,
        skillArea: 'Personal Brand Strategy & Professional Positioning',
        autoTrackingConditions: [
          'headline_updated',
          'summary_rewritten',
          'brand_messaging_aligned',
          'value_proposition_defined',
          'brand_guidelines_documented'
        ],
        targetAction: 'develop_personal_brand',
        targetCount: 6, // 6 brand elements
        xpReward: 200,
        estimatedTimeMinutes: 180,
        difficultyLevel: 'advanced',
        deliverableFormat: 'Cohesive personal brand with documented guidelines',
        quantityValue: 6,
        quantityType: 'brand elements',
        platformConstraints: 'Must demonstrate consistency and clear value proposition',
        guidanceSnippet: 'Your brand is what people say about you when you leave the room. Make sure your profile tells that story clearly.',
        muskTip: `Generic professionals are commodities. Branded professionals are premium products. Don't be "experienced in marketing"—be "the marketer who turns $1 into $3." Specificity wins.`
      }
    };
    
    return templates[questSubtype] || templates.completion;
  }
  
  /**
   * Generate comprehensive content creation quest (pulse/post creation)
   */
  async generateContentQuest(
    userProfile: any,
    brandGoals: string[],
    questSubtype: 'pulse' | 'media' | 'project_showcase' = 'pulse'
  ): Promise<EnhancedQuestContent> {
    const industry = userProfile.industry || 'Professional';
    const domain = userProfile.domain || 'General';
    const location = userProfile.location || 'your region';
    
    const templates: Record<string, EnhancedQuestContent> = {
      pulse: {
        type: 'pulse_creation',
        category: 'career',
        title: `Create Authority-Building ${industry} Insight Pulse`,
        description: `Create and publish a professional pulse showcasing your expertise in ${domain}. Share insights, lessons learned, or industry observations that demonstrate your professional depth.`,
        objective: `Publish 2 professional pulses that demonstrate your expertise and provide value to your ${industry} network. Focus on sharing insights, experiences, or observations that position you as a knowledgeable professional.`,
        whyThisMatters: `Content creation is the #1 authority-building activity in professional networking. By sharing valuable insights, you demonstrate expertise, increase visibility, and attract opportunities. Professionals who regularly share insights are perceived as 3x more knowledgeable than those who only consume content.`,
        stepByStepInstructions: [
          `Identify a ${domain} topic you have genuine expertise or experience in`,
          `Choose an angle: lesson learned, industry observation, or professional insight`,
          `Draft pulse with clear hook in first sentence to capture attention`,
          `Include specific details or examples that demonstrate real experience`,
          `Add relevant hashtags (3-5) to increase discoverability in ${industry}`,
          `Include professional image or visual that supports your message`,
          `Review and edit for clarity and professional tone`,
          `Post at optimal time (check Brandentify recommendations)`,
          `Engage with comments after posting to maximize reach`
        ],
        expectedOutcome: `You will publish 2 professional pulses that demonstrate your expertise in ${domain}. These pulses will increase your visibility in ${industry} and position you as a knowledgeable professional who contributes value to the community.`,
        successCriteria: [
          `2 professional pulses published with original insights`,
          `Each pulse includes 200+ words of substantial content`,
          `Professional images or visuals included`,
          `3-5 relevant hashtags used for discoverability`,
          `Clear value proposition communicated in each pulse`,
          `Professional tone maintained throughout`,
          `Engagement (likes, comments) generated on posts`
        ],
        estimatedImpact: `Immediate: Increased visibility and profile views. Short-term: Positions you as a contributing voice in ${industry}. Long-term: Content compounds—each post builds your authority bank and can attract opportunities months after publishing.`,
        skillArea: 'Thought Leadership & Professional Content Creation',
        autoTrackingConditions: [
          'pulse_created',
          'pulse_published',
          'pulse_includes_media',
          'pulse_engagement_received',
          'pulse_shared',
          'hashtag_used'
        ],
        targetAction: 'create_pulse',
        targetCount: 2,
        xpReward: 80,
        estimatedTimeMinutes: 60,
        difficultyLevel: 'intermediate',
        deliverableFormat: '2 professional pulses with insights and engagement',
        quantityValue: 2,
        quantityType: 'pulses',
        platformConstraints: 'Must be original insights with professional presentation',
        guidanceSnippet: 'Share genuine insights, not generic advice. Specific experiences beat general tips every time.',
        muskTip: `The pros don't post updates—they publish insights. What's one thing you know about ${domain} that most people don't? That's your first pulse.`
      },
      
      media: {
        type: 'pulse_creation',
        category: 'career',
        title: `Create Visual Professional Showcase Content`,
        description: `Create and share visual content showcasing your ${domain} work, including project screenshots, process documentation, or professional achievements that demonstrate your capabilities.`,
        objective: `Publish 1 media-rich pulse featuring visual documentation of your professional work, projects, or achievements in ${domain} to demonstrate your capabilities and work quality.`,
        whyThisMatters: `Visual content is processed 60,000x faster than text and generates 94% more engagement. In ${industry}, showing your work is often more powerful than describing it. Media-rich content builds credibility instantly and gives viewers tangible proof of your professional capabilities.`,
        stepByStepInstructions: [
          `Select a professional project, achievement, or process worth showcasing`,
          `Gather or create high-quality visuals: screenshots, photos, infographics`,
          `Ensure images are professional quality (good lighting, clear focus)`,
          `Write context for each image explaining what it demonstrates`,
          `Create before/after comparisons if applicable to show impact`,
          `Add detailed captions that explain the professional significance`,
          `Include your role and specific contributions to the work shown`,
          `Optimize images for platform (dimensions, file size)`,
          `Post with engaging headline that highlights the value shown`
        ],
        expectedOutcome: `You will publish 1 visually compelling pulse that showcases your professional capabilities through tangible evidence. The visual documentation will provide instant credibility and demonstrate the quality of your work in ${domain}.`,
        successCriteria: [
          `1 media-rich pulse published with 3-5 professional images`,
          `Images are high-quality and professionally presented`,
          `Each image includes context explaining its significance`,
          `Your specific role and contributions clearly stated`,
          `Visual content demonstrates tangible professional capabilities`,
          `Engaging headline that highlights value proposition`,
          `Professional tone and presentation throughout`
        ],
        estimatedImpact: `High immediate impact: Visual proof builds credibility faster than any text. Can lead to direct project inquiries, collaboration requests, or job opportunities based on demonstrated work quality.`,
        skillArea: 'Visual Communication & Professional Portfolio Presentation',
        autoTrackingConditions: [
          'media_pulse_created',
          'images_uploaded',
          'pulse_published',
          'media_engagement_received',
          'pulse_shared'
        ],
        targetAction: 'create_media_pulse',
        targetCount: 1,
        xpReward: 100,
        estimatedTimeMinutes: 75,
        difficultyLevel: 'intermediate',
        deliverableFormat: '1 visual showcase pulse with professional images',
        quantityValue: 1,
        quantityType: 'media pulses',
        platformConstraints: 'Images must be professional quality with clear context',
        guidanceSnippet: `Show, don't just tell. Quality visuals with context prove your capabilities instantly.`,
        muskTip: `Portfolio pieces that hide results hide weakness. Lead with your best visual proof. One compelling image with context beats 10 paragraphs of description.`
      },
      
      project_showcase: {
        type: 'portfolio',
        category: 'portfolio',
        title: `Create Comprehensive ${domain} Case Study`,
        description: `Develop a detailed project case study showcasing a significant ${domain} project, including challenge, approach, execution, and quantified results. Position yourself as a results-driven professional.`,
        objective: `Create and publish 1 comprehensive project case study that demonstrates your strategic thinking, execution capabilities, and results delivery in ${domain}.`,
        whyThisMatters: `Case studies are the gold standard for demonstrating professional capability. They prove you can identify challenges, develop solutions, execute effectively, and deliver measurable results. In ${industry}, professionals with documented case studies command 20-30% higher rates and attract premium opportunities.`,
        stepByStepInstructions: [
          `Select a significant project with clear challenges and measurable results`,
          `Document the original challenge or problem in specific terms`,
          `Describe your strategic approach and why you chose it`,
          `Detail the execution process and your specific contributions`,
          `Include quantified results: percentages, dollar amounts, time saved`,
          `Add visual documentation: screenshots, charts, before/after comparisons`,
          `Extract lessons learned and insights gained`,
          `Structure as compelling narrative: Challenge → Strategy → Execution → Results`,
          `Include testimonial or stakeholder quote if available`,
          `Publish with professional formatting and optimization`
        ],
        expectedOutcome: `You will publish 1 comprehensive project case study that serves as tangible proof of your capabilities in ${domain}. The case study will demonstrate strategic thinking, execution excellence, and results delivery to potential employers or clients.`,
        successCriteria: [
          `1 comprehensive case study published with full narrative structure`,
          `Clear challenge description with specific context`,
          `Strategic approach explained with rationale`,
          `Execution details with your specific contributions`,
          `Quantified results with metrics (% improvement, $ saved, time reduced)`,
          `Visual documentation supporting the narrative`,
          `Lessons learned extracted and documented`,
          `Professional presentation and formatting`,
          `Minimum 500 words of substantial content`
        ],
        estimatedImpact: `Maximum professional impact: Case studies are your most powerful credibility asset. Can be referenced in interviews, proposals, and networking. Long-term career asset that appreciates in value.`,
        skillArea: 'Strategic Project Documentation & Results Communication',
        autoTrackingConditions: [
          'case_study_created',
          'project_documented',
          'metrics_included',
          'visuals_added',
          'portfolio_project_published',
          'detailed_description_added'
        ],
        targetAction: 'create_project_case_study',
        targetCount: 1,
        xpReward: 150,
        estimatedTimeMinutes: 120,
        difficultyLevel: 'advanced',
        deliverableFormat: '1 comprehensive project case study with metrics',
        quantityValue: 1,
        quantityType: 'case studies',
        platformConstraints: 'Must include quantified results and detailed execution narrative',
        guidanceSnippet: 'Results without numbers are just stories. Include specific metrics that prove your impact.',
        muskTip: `The case studies that win are the ones that quantify everything. "Improved efficiency" is noise. "Reduced processing time from 5 days to 4 hours" is signal. Specificity separates the pros from the amateurs.`
      }
    };
    
    return templates[questSubtype] || templates.pulse;
  }
  
  /**
   * Generate quest based on user profile analysis and needs
   */
  async generatePersonalizedQuest(
    userProfile: any,
    userActivity: any,
    brandGoals: string[]
  ): Promise<EnhancedQuestContent> {
    const analysis = this.analyzeUserNeeds(userProfile, userActivity);
    
    // Prioritize quest based on greatest need
    if (analysis.needsProfileCompletion) {
      return this.generateProfileQuest(userProfile, brandGoals, 'completion');
    } else if (analysis.needsNetworking) {
      return this.generateNetworkingQuest(userProfile, brandGoals, 'connections');
    } else if (analysis.needsContentCreation) {
      return this.generateContentQuest(userProfile, brandGoals, 'pulse');
    } else if (analysis.needsAuthorityBuilding) {
      return this.generateProfileQuest(userProfile, brandGoals, 'enhancement');
    } else {
      // Default to engagement quest
      return this.generateNetworkingQuest(userProfile, brandGoals, 'engagement');
    }
  }
  
  /**
   * Analyze user profile and activity to identify needs
   */
  private analyzeUserNeeds(userProfile: any, userActivity: any) {
    const profileCompletion = userProfile.profileCompleted || 0;
    const networkSize = userProfile.connectionCount || 0;
    const recentPulses = userActivity.recentPulseCount || 0;
    const engagementScore = userActivity.engagementScore || 0;
    
    return {
      needsProfileCompletion: profileCompletion < 70,
      needsNetworking: networkSize < 10,
      needsContentCreation: recentPulses === 0,
      needsEngagement: engagementScore < 20,
      needsAuthorityBuilding: profileCompletion >= 70 && networkSize >= 10 && recentPulses > 0
    };
  }
}

export const enhancedQuestContentGenerator = new EnhancedQuestContentGenerator();
