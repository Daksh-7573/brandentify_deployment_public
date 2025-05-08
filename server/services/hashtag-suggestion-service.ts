import OpenAI from 'openai';
import NodeCache from 'node-cache';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize cache with 1-hour TTL (time-to-live)
const hashtagCache = new NodeCache({ stdTTL: 3600 }); // 1 hour in seconds

/**
 * Interface for hashtag suggestion parameters
 */
interface HashtagSuggestionParams {
  industry?: string;
  domain?: string;
  previouslyUsedHashtags?: string[];
  contentContext?: string;
  count?: number;
}

/**
 * Generate hashtag suggestions based on user's context
 * 
 * @param industry - User's industry (e.g., "Technology", "Healthcare")
 * @param domain - User's domain within the industry (e.g., "Software Development", "Data Science")
 * @param previouslyUsedHashtags - Hashtags previously used by the user (to avoid duplicates)
 * @param contentContext - Post content or context for which hashtags are needed
 * @param count - Number of hashtag suggestions to return
 * @returns Array of suggested hashtags
 */
export async function suggestHashtags({
  industry,
  domain,
  previouslyUsedHashtags = [],
  contentContext = '',
  count = 7
}: HashtagSuggestionParams): Promise<string[]> {
  try {
    // Generate cache key based on input parameters
    const cacheKey = `hashtags:${industry || ''}:${domain || ''}:${contentContext || ''}:${count}`;
    
    // Check if we have cached results
    const cachedHashtags = hashtagCache.get<string[]>(cacheKey);
    if (cachedHashtags) {
      console.log('Using cached hashtag suggestions');
      return filterDuplicates(cachedHashtags, previouslyUsedHashtags);
    }
    
    // Prepare contextual information for the AI
    const contextInfo = [
      industry ? `Industry: ${industry}` : '',
      domain ? `Domain: ${domain}` : '',
      contentContext ? `Content Context: ${contentContext}` : '',
      previouslyUsedHashtags?.length ? `Previously used hashtags: ${previouslyUsedHashtags.join(', ')}` : ''
    ].filter(Boolean).join('\n');
    
    // Prepare the prompt
    const prompt = `You are a professional hashtag generator for a career networking platform. 
Suggest ${count} relevant, professional, and trending hashtags for a ${industry || 'professional'} in the ${domain || 'general'} domain.

Here's the context:
${contextInfo}

Rules:
1. Each hashtag should include the '#' symbol
2. Focus on professional, career-oriented hashtags
3. Include a mix of popular and niche hashtags
4. Keep hashtags concise and easy to read
5. No spaces in hashtags, use CamelCase for multiple words
6. Avoid hashtags that are too generic like #Success or #Business
7. Include industry-specific hashtags that professionals would actually use
8. Include 1-2 trending hashtags in the field when possible

Output the hashtags as a JSON array of strings ONLY, with no additional explanation or commentary.
`;

    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Extract hashtags from response
    const content = response.choices[0].message.content;
    let hashtags: string[] = [];

    if (content) {
      try {
        const parsedResponse = JSON.parse(content);
        if (Array.isArray(parsedResponse.hashtags)) {
          hashtags = parsedResponse.hashtags;
        } else if (typeof parsedResponse === 'object' && Object.values(parsedResponse).some(v => Array.isArray(v))) {
          // Find the first array property if the response doesn't have a "hashtags" key
          const firstArray = Object.values(parsedResponse).find(v => Array.isArray(v));
          if (firstArray) hashtags = firstArray as string[];
        }
      } catch (err) {
        console.error('Error parsing hashtag suggestions:', err);
        // Try to extract hashtags with regex as fallback
        const hashtagRegex = /#[\w\d]+/g;
        const matches = content.match(hashtagRegex);
        if (matches) {
          hashtags = matches;
        }
      }
    }

    // Ensure hashtags are properly formatted
    hashtags = hashtags.map(tag => {
      // Add # if missing
      if (!tag.startsWith('#')) {
        return `#${tag}`;
      }
      return tag;
    });

    // Ensure we have unique hashtags
    hashtags = [...new Set(hashtags)];

    // Limit to requested count
    hashtags = hashtags.slice(0, count);

    // Cache the result
    hashtagCache.set(cacheKey, hashtags);

    // Filter out previously used hashtags if any
    return filterDuplicates(hashtags, previouslyUsedHashtags);
  } catch (error) {
    console.error('Error suggesting hashtags:', error);
    // Return fallback suggestions based on industry if possible
    return getFallbackHashtags(industry, count);
  }
}

/**
 * Filter out previously used hashtags
 */
function filterDuplicates(suggestions: string[], previous: string[] = []): string[] {
  if (!previous || previous.length === 0) {
    return suggestions;
  }
  
  // Normalize for comparison (lowercase, no spaces)
  const normalizedPrevious = previous.map(p => p.toLowerCase().replace(/\s+/g, ''));
  
  return suggestions.filter(suggestion => {
    const normalized = suggestion.toLowerCase().replace(/\s+/g, '');
    return !normalizedPrevious.includes(normalized);
  });
}

/**
 * Get fallback hashtags if API call fails
 */
function getFallbackHashtags(industry?: string, count: number = 7): string[] {
  const generalHashtags = [
    '#CareerGrowth', 
    '#ProfessionalDevelopment', 
    '#CareerAdvice',
    '#JobSearch',
    '#Networking',
    '#LeadershipSkills',
    '#RemoteWork',
    '#WorkLifeBalance',
    '#UpskillYourself',
    '#CareerCoaching'
  ];
  
  const industryHashtags: Record<string, string[]> = {
    'technology': [
      '#TechCareers', 
      '#CodingLife', 
      '#SoftwareEngineering', 
      '#DevLife',
      '#TechTalent',
      '#Cybersecurity',
      '#CloudComputing',
      '#AIinTech',
      '#MachineLearning',
      '#WebDevelopment'
    ],
    'healthcare': [
      '#HealthcareJobs', 
      '#MedicalProfessionals', 
      '#HealthcareInnovation',
      '#TelehealthTech',
      '#MedicalCareers',
      '#NursesRock',
      '#HealthTech',
      '#PatientCare',
      '#MentalHealthAwareness',
      '#PublicHealth'
    ],
    'finance': [
      '#FinanceProfessionals', 
      '#FinTech', 
      '#InvestmentStrategies',
      '#BankingCareers',
      '#FinancialPlanning',
      '#WealthManagement',
      '#AccountingPro',
      '#FinancialAnalysis',
      '#InsuranceIndustry',
      '#CryptoCareers'
    ],
    'marketing': [
      '#MarketingPro', 
      '#DigitalMarketing', 
      '#ContentCreation',
      '#BrandStrategy',
      '#SocialMediaMarketing',
      '#MarketingAnalytics',
      '#SEOStrategy',
      '#GrowthHacking',
      '#EmailMarketing',
      '#MarketingInnovation'
    ],
    'education': [
      '#EducatorLife', 
      '#TeachingCareers', 
      '#EdTech',
      '#OnlineLearning',
      '#EducationInnovation',
      '#TeachersOfInstagram',
      '#HigherEd',
      '#LearningDesign',
      '#CurriculumDevelopment',
      '#EducationalLeadership'
    ]
  };
  
  // Get industry-specific hashtags if available, otherwise use general ones
  let availableHashtags = generalHashtags;
  
  if (industry && industry.toLowerCase() in industryHashtags) {
    availableHashtags = [
      ...industryHashtags[industry.toLowerCase()], 
      ...generalHashtags
    ];
  }
  
  // Shuffle and return requested number
  return shuffle(availableHashtags).slice(0, count);
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}