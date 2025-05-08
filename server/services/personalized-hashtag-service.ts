import { OpenAI } from "openai";

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for hashtag suggestions to minimize API calls
const hashtagSuggestionCache = new Map<string, { suggestions: string[], timestamp: number }>();
const HASHTAG_CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Enhanced hashtag suggestion interfaces
 */
export interface FollowedHashtag {
  id: number;
  hashtag: string;
  userId: number;
  followedAt: Date;
}

export interface SearchedHashtag {
  id: number;
  hashtag: string;
  userId: number;
  searchedAt: Date;
  count: number;
}

export interface EngagementHashtag {
  hashtag: string;
  count: number;
}

export interface PersonalizedHashtagParams {
  // Basic profile context
  userId?: number;
  industry?: string;
  domain?: string;
  
  // Quest/content context
  questType?: string;
  targetAction?: string;
  contentContext?: string;
  
  // User behavior context
  followedHashtags?: FollowedHashtag[];
  searchedHashtags?: SearchedHashtag[];
  engagementHashtags?: EngagementHashtag[];
  
  // Control parameters
  count?: number;
}

/**
 * Generate personalized hashtag suggestions based on all available context
 * 
 * This function considers four key factors:
 * 1. Industry and domain related hashtags (professional context)
 * 2. Hashtags followed by the user (explicit interest)
 * 3. Hashtags searched by the user (implicit interest)
 * 4. Hashtags from recent post engagement (behavioral patterns)
 */
export async function generatePersonalizedHashtags(params: PersonalizedHashtagParams) {
  const { 
    userId,
    industry, 
    domain, 
    questType,
    targetAction, 
    contentContext,
    followedHashtags = [], 
    searchedHashtags = [], 
    engagementHashtags = [],
    count = 5
  } = params;
  
  // Create cache key from parameters (including user-specific data)
  const cacheKey = JSON.stringify({
    userId,
    industry,
    domain,
    questType,
    targetAction,
    contentContext,
    // Only include arrays if they have data
    ...(followedHashtags.length > 0 ? { followedTags: followedHashtags.map(h => h.hashtag) } : {}),
    ...(searchedHashtags.length > 0 ? { searchedTags: searchedHashtags.map(h => h.hashtag) } : {}),
    ...(engagementHashtags.length > 0 ? { engagementTags: engagementHashtags.map(h => h.hashtag) } : {}),
    count
  });
  
  // Check if we have cached results that aren't expired
  const cachedResult = hashtagSuggestionCache.get(cacheKey);
  if (cachedResult && (Date.now() - cachedResult.timestamp < HASHTAG_CACHE_TTL)) {
    console.log('Returning cached personalized hashtag suggestions');
    return { hashtags: cachedResult.suggestions };
  }
  
  // Prepare comprehensive context information
  let contextInfo = '';
  
  // Add professional context
  if (industry) {
    contextInfo += `Industry: ${industry}\n`;
  }
  
  if (domain) {
    contextInfo += `Domain: ${domain}\n`;
  }
  
  // Add content/action context
  if (questType) {
    contextInfo += `Quest Type: ${questType}\n`;
  }
  
  if (targetAction) {
    contextInfo += `Action Type: ${targetAction}\n`;
  }
  
  if (contentContext) {
    contextInfo += `Content Context: ${contentContext}\n`;
  }
  
  // Add user behavior context
  if (followedHashtags.length > 0) {
    contextInfo += `\nHashtags Followed by User:\n`;
    followedHashtags.forEach(h => {
      contextInfo += `- ${h.hashtag}\n`;
    });
  }
  
  if (searchedHashtags.length > 0) {
    contextInfo += `\nHashtags Searched by User (with frequency):\n`;
    searchedHashtags
      .sort((a, b) => b.count - a.count) // Sort by search frequency
      .slice(0, 10) // Take top 10
      .forEach(h => {
        contextInfo += `- ${h.hashtag} (searched ${h.count} times)\n`;
      });
  }
  
  if (engagementHashtags.length > 0) {
    contextInfo += `\nHashtags from Content User Engaged With (with frequency):\n`;
    engagementHashtags
      .sort((a, b) => b.count - a.count) // Sort by engagement frequency
      .slice(0, 10) // Take top 10
      .forEach(h => {
        contextInfo += `- ${h.hashtag} (appeared in ${h.count} posts)\n`;
      });
  }
  
  // Return empty array if we have no context
  if (!contextInfo.trim()) {
    console.log('No context provided for personalized hashtag suggestions');
    return { hashtags: [] };
  }
  
  // Create system prompt with personalization guidelines
  const systemPrompt = `You are Musk AI, a professional networking assistant specializing in personalized hashtag recommendations.

Generate highly relevant, personalized hashtags based on the comprehensive user context provided.

IMPORTANT PRIORITIZATION RULES:
1. Industry and Domain Context: Top priority - ensure hashtags match the user's professional field (${industry || 'unspecified'}, ${domain || 'unspecified'})
2. User Interest Patterns: Strongly favor hashtags the user has followed or repeatedly searched
3. Engagement History: Incorporate hashtags from content the user has engaged with
4. Content Relevance: Ensure hashtags directly relate to the action or content being created
5. Trending Potential: Include 1-2 trending professional hashtags in the relevant field

Combine standard professional hashtags with those specific to the user's unique interest patterns.
Balance discoverability (common hashtags) with specificity (niche hashtags).

Return ONLY an array of hashtags in the format: ["#Hashtag1", "#Hashtag2", ...] with no additional comments.`;

  // Create detailed user prompt
  const userPrompt = `Based on this comprehensive professional profile and engagement data, suggest ${count} highly personalized hashtags that will maximize visibility and engagement:

${contextInfo}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7
    });

    const content = response.choices[0].message.content || '{"hashtags": []}';
    const parsedResponse = JSON.parse(content);
    
    // Ensure we have an array of hashtags
    const hashtags = Array.isArray(parsedResponse.hashtags) 
      ? parsedResponse.hashtags 
      : [];
    
    // Cache the results
    hashtagSuggestionCache.set(cacheKey, {
      suggestions: hashtags,
      timestamp: Date.now()
    });
    
    return { hashtags };
  } catch (error: unknown) {
    console.error('Error generating personalized hashtag suggestions with OpenAI:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate personalized hashtag suggestions: ${errorMessage}`);
  }
}

/**
 * Generate dummy followed hashtags for demonstration purposes
 * In a real implementation, these would come from a database
 */
export function getDemoFollowedHashtags(industry?: string, domain?: string): FollowedHashtag[] {
  const generalHashtags = [
    '#CareerGrowth', 
    '#ProfessionalDevelopment', 
    '#Networking'
  ];
  
  // Industry-specific hashtags
  const industryHashtags: Record<string, string[]> = {
    'Technology': ['#TechTrends', '#Innovation', '#DigitalTransformation'],
    'Healthcare': ['#HealthTech', '#MedicalInnovation', '#HealthcareLeadership'],
    'Finance': ['#FinTech', '#InvestmentStrategy', '#FinancialLiteracy'],
    'Marketing': ['#DigitalMarketing', '#BrandStrategy', '#MarketingAnalytics'],
    'Education': ['#EdTech', '#LearningInnovation', '#EducationLeadership'],
    'Manufacturing': ['#Industry40', '#SupplyChain', '#OperationsExcellence']
  };
  
  // Domain-specific hashtags
  const domainHashtags: Record<string, string[]> = {
    'Software': ['#SoftwareDevelopment', '#Coding', '#DevOps'],
    'Data': ['#DataScience', '#BigData', '#Analytics'],
    'Design': ['#UXDesign', '#ProductDesign', '#CreativeProcess'],
    'Sales': ['#SalesStrategy', '#ClientSuccess', '#BusinessDevelopment'],
    'HR': ['#TalentAcquisition', '#EmployeeExperience', '#WorkplaceCulture'],
    'Research': ['#Research', '#Innovation', '#ScientificDiscovery'],
    'Leadership': ['#Leadership', '#ExecutiveStrategy', '#ChangeManagement']
  };
  
  // Get industry-specific hashtags if available
  const industryTags = industry && industry in industryHashtags 
    ? industryHashtags[industry] 
    : [];
  
  // Get domain-specific hashtags if available
  const domainTags = domain && domain in domainHashtags 
    ? domainHashtags[domain] 
    : [];
  
  // Combine all hashtags
  const allHashtags = [...generalHashtags, ...industryTags, ...domainTags];
  
  // Create demo followed hashtags
  return allHashtags.map((hashtag, index) => ({
    id: index + 1,
    hashtag,
    userId: 1,
    followedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
  }));
}

/**
 * Generate dummy searched hashtags for demonstration purposes
 * In a real implementation, these would come from a database
 */
export function getDemoSearchedHashtags(industry?: string): SearchedHashtag[] {
  const searchedHashtags = [
    { hashtag: '#CareerAdvice', count: 5 },
    { hashtag: '#JobSearch', count: 3 },
    { hashtag: '#RemoteWork', count: 7 },
    { hashtag: '#Mentorship', count: 2 },
    { hashtag: '#Leadership', count: 4 },
    { hashtag: '#PersonalBranding', count: 6 }
  ];
  
  // Add industry-specific searched hashtags if available
  if (industry) {
    switch (industry) {
      case 'Technology':
        searchedHashtags.push(
          { hashtag: '#TechCareers', count: 8 },
          { hashtag: '#ArtificialIntelligence', count: 5 },
          { hashtag: '#MachineLearning', count: 4 }
        );
        break;
      case 'Healthcare':
        searchedHashtags.push(
          { hashtag: '#HealthTech', count: 6 },
          { hashtag: '#MedicalCareers', count: 3 },
          { hashtag: '#HealthcareInnovation', count: 5 }
        );
        break;
      case 'Finance':
        searchedHashtags.push(
          { hashtag: '#FinTech', count: 7 },
          { hashtag: '#InvestmentBanking', count: 3 },
          { hashtag: '#WealthManagement', count: 5 }
        );
        break;
      default:
        // No industry-specific hashtags
        break;
    }
  }
  
  // Create demo searched hashtags
  return searchedHashtags.map((item, index) => ({
    id: index + 1,
    hashtag: item.hashtag,
    userId: 1,
    searchedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random date within last 14 days
    count: item.count
  }));
}

/**
 * Generate dummy engagement hashtags for demonstration purposes
 * In a real implementation, these would come from analyzing user engagement data
 */
export function getDemoEngagementHashtags(questType?: string): EngagementHashtag[] {
  const baseEngagementHashtags = [
    { hashtag: '#ProfessionalGrowth', count: 12 },
    { hashtag: '#CareerDevelopment', count: 8 },
    { hashtag: '#SuccessTips', count: 15 },
    { hashtag: '#WorkLifeBalance', count: 10 }
  ];
  
  // Add quest-specific engagement hashtags
  if (questType) {
    switch (questType) {
      case 'pulse_creation':
        baseEngagementHashtags.push(
          { hashtag: '#ContentCreation', count: 14 },
          { hashtag: '#ThoughtLeadership', count: 9 },
          { hashtag: '#ProfessionalInsights', count: 11 }
        );
        break;
      case 'networking':
        baseEngagementHashtags.push(
          { hashtag: '#NetworkingTips', count: 17 },
          { hashtag: '#ProfessionalConnections', count: 13 },
          { hashtag: '#CareerNetworking', count: 10 }
        );
        break;
      case 'visibility':
        baseEngagementHashtags.push(
          { hashtag: '#PersonalBranding', count: 16 },
          { hashtag: '#VisibilityStrategy', count: 11 },
          { hashtag: '#ProfessionalPresence', count: 14 }
        );
        break;
      default:
        // No quest-specific hashtags
        break;
    }
  }
  
  return baseEngagementHashtags;
}