import { OpenAI } from 'openai';
import { storage } from '../storage';

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface HashtagSuggestionsOptions {
  industry?: string | null;
  domain?: string | null;
  questType?: string;
  targetAction?: string;
  contentContext?: string;
  count?: number;
}

// Define a simple user interface with the fields we need
interface UserProfile {
  industry?: string | null;
  domain?: string | null;
  [key: string]: any;
}

/**
 * Generate personalized hashtag suggestions based on user profile and context
 */
export async function generatePersonalizedHashtags(options: HashtagSuggestionsOptions, user?: UserProfile) {
  const {
    industry,
    domain,
    questType = 'pulse_creation',
    targetAction,
    contentContext,
    count = 5
  } = options;

  try {
    // Default industry if not provided
    const effectiveIndustry = industry || user?.industry || 'technology';
    const effectiveDomain = domain || user?.domain || '';
    
    // Build a prompt based on available context
    let prompt = `Generate ${count} relevant professional hashtags for a post`;
    
    if (questType === 'pulse_creation') {
      prompt += ` on a professional networking platform`;
    } else if (questType) {
      prompt += ` related to ${questType.replace('_', ' ')}`;
    }
    
    if (effectiveIndustry) {
      prompt += ` in the ${effectiveIndustry} industry`;
    }
    
    if (effectiveDomain) {
      prompt += ` with a focus on ${effectiveDomain}`;
    }
    
    if (targetAction) {
      prompt += ` specifically for ${targetAction}`;
    }
    
    if (contentContext) {
      prompt += ` about ${contentContext}`;
    }
    
    prompt += `. Return as a JSON array with format: { "hashtags": ["tag1", "tag2", ...], "sources": ["source1", "source2", ...] }. Do not include the # symbol in the hashtags. Sources should be brief indicators of where the recommendation came from (industry trends, job market data, engagement patterns, etc).`;
    
    // Call OpenAI API with the constructed prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a specialized hashtag suggestion AI for a professional networking platform. Your job is to suggest relevant, trending hashtags based on industry, domain, and context. Focus on professional, industry-specific hashtags that would increase visibility and engagement. Avoid generic hashtags like #success or #motivation unless specifically appropriate.`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const rawResponse = completion.choices[0].message.content;
    
    if (!rawResponse) {
      return { 
        hashtags: [], 
        sources: [],
        error: "Failed to generate hashtag suggestions" 
      };
    }
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(rawResponse);
      return {
        hashtags: jsonResponse.hashtags || [],
        sources: jsonResponse.sources || []
      };
      
    } catch (parseError) {
      console.error("Failed to parse hashtag suggestions:", parseError);
      return { 
        hashtags: [], 
        sources: [],
        error: "Failed to parse hashtag suggestions" 
      };
    }
    
  } catch (error) {
    console.error("Error generating personalized hashtags:", error);
    return { 
      hashtags: [], 
      sources: [],
      error: "Error generating personalized hashtags" 
    };
  }
}

/**
 * Generate demo hashtag suggestions for testing purposes
 */
export async function generateDemoHashtags(options: HashtagSuggestionsOptions) {
  // Create a mock user profile for demo purposes
  const demoUser: UserProfile = {
    industry: options.industry || 'technology',
    domain: options.domain || 'software development',
  };
  
  return generatePersonalizedHashtags(options, demoUser);
}