/**
 * News Service to fetch articles from various news APIs
 * Supports multiple news sources with a common interface
 */

import axios from 'axios';
import { NewsSource, NewsArticle, InsertNewsArticle } from '@shared/schema';
import { storage } from '../storage';

// Interface for news API responses
interface NewsApiResponse {
  articles: Array<{
    title: string;
    description?: string;
    content?: string;
    url?: string;
    urlToImage?: string;
    publishedAt?: string;
    author?: string;
    source?: {
      id?: string;
      name?: string;
    };
  }>;
}

// News API configuration
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_PAGE_SIZE = 10;

/**
 * Fetch news from NewsAPI.org
 */
export async function fetchFromNewsApi(
  apiKey: string,
  category?: string,
  query?: string,
  language: string = DEFAULT_LANGUAGE,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<NewsApiResponse> {
  try {
    // Build the query parameters
    const params: any = {
      apiKey,
      language,
      pageSize
    };

    // Add optional parameters
    if (category) params.category = category;
    if (query) params.q = query;

    // Make the API request
    const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, { params });
    
    // Validate the response
    if (response.status !== 200) {
      throw new Error(`News API returned status code ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error);
    // Return empty response on failure
    return { articles: [] };
  }
}

/**
 * Fetch news from GNews API
 */
export async function fetchFromGNewsApi(
  apiKey: string,
  category?: string,
  query?: string,
  language: string = 'en',
  max: number = 10
): Promise<NewsApiResponse> {
  try {
    // Build the query parameters
    const params: any = {
      token: apiKey,
      lang: language,
      max
    };

    // Add optional parameters
    if (category) params.topic = category;
    if (query) params.q = query;

    let endpoint = query ? 'search' : 'top-headlines';
    
    // Make the API request
    const response = await axios.get(`https://gnews.io/api/v4/${endpoint}`, { params });
    
    // Validate the response
    if (response.status !== 200) {
      throw new Error(`GNews API returned status code ${response.status}`);
    }

    // Transform the response to match our standard format
    const articles = response.data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      urlToImage: article.image,
      publishedAt: article.publishedAt,
      author: article.source?.name,
      source: {
        id: article.source?.id,
        name: article.source?.name
      }
    }));

    return { articles };
  } catch (error) {
    console.error('Error fetching news from GNews:', error);
    // Return empty response on failure
    return { articles: [] };
  }
}

/**
 * Convert category mappings between our system and external APIs
 */
function mapCategory(category: string, targetApi: string): string {
  // Map our category names to NewsAPI categories
  const categoryMappings: Record<string, Record<string, string>> = {
    'newsapi': {
      'technology': 'technology',
      'business': 'business',
      'finance': 'business',
      'healthcare': 'health',
      'education': 'science',
      'general': 'general',
      'design': 'entertainment',
      'marketing': 'business',
      'engineering': 'science'
    },
    'gnews': {
      'technology': 'technology',
      'business': 'business',
      'finance': 'business',
      'healthcare': 'health',
      'education': 'science',
      'general': 'world',
      'design': 'entertainment',
      'marketing': 'business',
      'engineering': 'science'
    }
  };

  if (targetApi in categoryMappings && category in categoryMappings[targetApi]) {
    return categoryMappings[targetApi][category];
  }
  
  // Default to general if no mapping exists
  return targetApi === 'gnews' ? 'world' : 'general';
}

/**
 * Process news articles: extract industries and other metadata
 */
function processArticles(
  articles: any[], 
  sourceId: number, 
  category: string
): InsertNewsArticle[] {
  return articles.map(article => {
    // Extract industry keywords based on content and category
    const industries = extractIndustries(article, category);
    
    // Convert the category to a valid category from our schema
    const validCategory = validateCategory(category);
    
    return {
      sourceId,
      title: article.title,
      description: article.description || null,
      content: article.content || null,
      url: article.url || null,
      imageUrl: article.urlToImage || null,
      author: article.author || null,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      category: validCategory,
      industries: JSON.stringify(industries),
      processed: false
    };
  });
}

/**
 * Validate and normalize category names to match our schema
 * These values must match the newsSourceCategoryEnum from schema.ts
 */
function validateCategory(category: string): "technology" | "business" | "finance" | "marketing" | "design" | "healthcare" | "education" | "engineering" | "general" {
  // Map of possible input categories to our schema categories
  const categoryMap: Record<string, "technology" | "business" | "finance" | "marketing" | "design" | "healthcare" | "education" | "engineering" | "general"> = {
    'technology': 'technology',
    'tech': 'technology',
    'business': 'business', 
    'finance': 'finance',
    'health': 'healthcare',
    'healthcare': 'healthcare',
    'medical': 'healthcare',
    'education': 'education',
    'science': 'education',
    'design': 'design',
    'art': 'design',
    'marketing': 'marketing',
    'advertising': 'marketing',
    'engineering': 'engineering',
    'general': 'general',
    'world': 'general',
    'entertainment': 'design'
  };
  
  // Normalize the input (lowercase and trim)
  const normalizedCategory = category?.toLowerCase().trim();
  
  // Return the mapped category or default to general
  return normalizedCategory && normalizedCategory in categoryMap 
    ? categoryMap[normalizedCategory] 
    : 'general';
}

/**
 * Extract industries from article content
 */
function extractIndustries(article: any, category: string): string[] {
  const industries: Set<string> = new Set();
  
  // Always include the article category as an industry
  if (category) {
    industries.add(category);
  }
  
  // Basic keyword matching for industries
  const industryKeywords: Record<string, string[]> = {
    'technology': ['tech', 'software', 'hardware', 'app', 'digital', 'AI', 'artificial intelligence', 'machine learning', 'data'],
    'business': ['business', 'company', 'startup', 'enterprise', 'corporate', 'market', 'economy'],
    'finance': ['finance', 'banking', 'investment', 'stock', 'market', 'economy', 'fund'],
    'healthcare': ['health', 'medical', 'doctor', 'hospital', 'patient', 'treatment', 'medicine'],
    'education': ['education', 'school', 'university', 'student', 'learning', 'teaching', 'academic'],
    'engineering': ['engineering', 'engineer', 'design', 'development', 'manufacturing'],
    'marketing': ['marketing', 'advertising', 'brand', 'campaign', 'promotion', 'customer'],
    'design': ['design', 'UI', 'UX', 'user interface', 'creative', 'graphic', 'artist']
  };
  
  // Check content for keywords
  const content = [
    article.title || '', 
    article.description || '', 
    article.content || ''
  ].join(' ').toLowerCase();
  
  // Identify industries based on keywords
  Object.entries(industryKeywords).forEach(([industry, keywords]) => {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        industries.add(industry);
        break;
      }
    }
  });
  
  return Array.from(industries);
}

/**
 * Fetch news from all configured sources and save to database
 */
export async function fetchAndStoreNews(): Promise<number> {
  try {
    console.log('Starting news fetch process...');
    
    // Get all active news sources
    const sources = await storage.getNewsSources();
    const activeSourcesWithKeys = sources.filter(
      source => source.isActive && source.apiKey !== null
    );
    
    if (activeSourcesWithKeys.length === 0) {
      console.log('No active news sources with API keys found');
      return 0;
    }
    
    let totalArticlesAdded = 0;
    
    // Process each news source
    for (const source of activeSourcesWithKeys) {
      console.log(`Fetching news from: ${source.name} (${source.category})`);
      
      try {
        let articles: any[] = [];
        
        // Determine which API client to use based on source configuration
        if (source.url.includes('newsapi.org')) {
          const mappedCategory = mapCategory(source.category, 'newsapi');
          const response = await fetchFromNewsApi(
            source.apiKey as string, 
            mappedCategory
          );
          articles = response.articles;
        } else if (source.url.includes('gnews.io')) {
          const mappedCategory = mapCategory(source.category, 'gnews');
          const response = await fetchFromGNewsApi(
            source.apiKey as string, 
            mappedCategory
          );
          articles = response.articles;
        }
        // Add more API integrations here
        
        console.log(`Received ${articles.length} articles from ${source.name}`);
        
        if (articles.length === 0) {
          continue;
        }
        
        // Process and store articles
        const processedArticles = processArticles(articles, source.id, source.category);
        
        // Save to database, avoiding duplicates by URL
        for (const article of processedArticles) {
          // Skip articles without URLs
          if (!article.url) continue;
          
          // Check if we already have this article (by URL)
          const existingArticles = await storage.getNewsArticles();
          const exists = existingArticles.some(existing => existing.url === article.url);
          
          if (!exists) {
            await storage.createNewsArticle(article);
            totalArticlesAdded++;
          }
        }
      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
        // Continue with next source on error
      }
    }
    
    console.log(`News fetch completed. Added ${totalArticlesAdded} new articles.`);
    return totalArticlesAdded;
  } catch (error) {
    console.error('Error in fetchAndStoreNews:', error);
    return 0;
  }
}

/**
 * Create news pulses from unprocessed articles
 */
export async function createNewsPulsesFromArticles(userId: number): Promise<number> {
  try {
    // Get unprocessed articles
    const unprocessedArticles = await storage.getUnprocessedNewsArticles();
    console.log(`Found ${unprocessedArticles.length} unprocessed articles`);
    
    if (unprocessedArticles.length === 0) {
      return 0;
    }
    
    let pulsesCreated = 0;
    
    // Process each article and create a pulse
    for (const article of unprocessedArticles) {
      try {
        await storage.createNewsPulse(article, userId);
        pulsesCreated++;
      } catch (articleError) {
        console.error(`Error creating pulse for article ${article.id}:`, articleError);
        // Continue with next article on error
      }
    }
    
    console.log(`Created ${pulsesCreated} news pulses`);
    return pulsesCreated;
  } catch (error) {
    console.error('Error in createNewsPulsesFromArticles:', error);
    return 0;
  }
}

/**
 * Enhanced news content generation with OpenAI (to be implemented)
 */
export async function enhanceNewsContent(article: NewsArticle): Promise<{ title: string, content: string, hashtags: string[] }> {
  // For now, use the basic implementation from storage.ts
  // In the future, we'll enhance this with OpenAI integration
  
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

/**
 * Schedule and deliver news based on user preferences
 */
export async function scheduleNewsDelivery(): Promise<void> {
  // This function would be called by a scheduled job (e.g., once per hour)
  // Check user preferences and deliver news at their preferred times
  
  try {
    // Get current hour in 24-hour format (0-23)
    const currentHour = new Date().getHours();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
    
    console.log(`Checking for news delivery at ${currentTime}`);
    
    // Get all news user preferences
    const allPreferences = await getAllNewsUserPreferences();
    
    // Filter users who want news at this hour
    const relevantUsers = allPreferences.filter(pref => {
      // Get just the hour part of the time
      const prefHour = pref.deliveryTime?.split(':')[0].padStart(2, '0');
      const prefTimeString = `${prefHour}:00`;
      
      return pref.enabled && prefTimeString === currentTime;
    });
    
    console.log(`Found ${relevantUsers.length} users scheduled for news at ${currentTime}`);
    
    // Process each user's news delivery
    for (const userPref of relevantUsers) {
      await deliverNewsToUser(userPref.userId);
    }
    
  } catch (error) {
    console.error('Error in scheduleNewsDelivery:', error);
  }
}

/**
 * Get all news user preferences
 */
async function getAllNewsUserPreferences() {
  // In the future, we'll implement this by adding a method to storage.ts
  // For now, we'll get all users and find their preferences
  
  const allUsers = Array.from((await storage.getNewsSources()).values());
  const allPreferences = [];
  
  for (const user of allUsers) {
    const pref = await storage.getNewsUserPreferenceByUserId(user.id);
    if (pref) {
      allPreferences.push(pref);
    }
  }
  
  return allPreferences;
}

/**
 * Deliver news to a specific user
 */
async function deliverNewsToUser(userId: number): Promise<void> {
  try {
    // Fetch user preferences
    const preferences = await storage.getNewsUserPreferenceByUserId(userId);
    
    if (!preferences || !preferences.enabled) {
      console.log(`User ${userId} has no preferences or news is disabled`);
      return;
    }
    
    console.log(`Delivering news to user ${userId}`);
    
    // Parse preferences
    let preferredIndustries: string[] = [];
    let preferredSources: number[] = [];
    let excludedSources: number[] = [];
    
    try {
      if (preferences.preferredIndustries) {
        preferredIndustries = JSON.parse(preferences.preferredIndustries as string);
      }
      
      if (preferences.preferredSources) {
        preferredSources = JSON.parse(preferences.preferredSources as string);
      }
      
      if (preferences.excludedSources) {
        excludedSources = JSON.parse(preferences.excludedSources as string);
      }
    } catch (parseError) {
      console.error('Error parsing user preferences:', parseError);
    }
    
    // Fetch and process news
    // First, get unprocessed articles
    const unprocessedArticles = await storage.getUnprocessedNewsArticles();
    
    // Filter by user preferences
    const relevantArticles = unprocessedArticles.filter(article => {
      // Check if article is from a preferred source
      if (preferredSources.length > 0 && article.sourceId) {
        if (!preferredSources.includes(article.sourceId)) {
          return false;
        }
      }
      
      // Check if article is from an excluded source
      if (excludedSources.length > 0 && article.sourceId) {
        if (excludedSources.includes(article.sourceId)) {
          return false;
        }
      }
      
      // Check if article matches preferred industries
      if (preferredIndustries.length > 0 && article.industries) {
        try {
          const articleIndustries = JSON.parse(article.industries as string);
          // Article is relevant if it matches at least one preferred industry
          return preferredIndustries.some(industry => 
            articleIndustries.includes(industry)
          );
        } catch (error) {
          console.error('Error parsing article industries:', error);
        }
      }
      
      // If no industry preferences, include the article
      return true;
    });
    
    console.log(`Found ${relevantArticles.length} relevant articles for user ${userId}`);
    
    // Create news pulses for relevant articles
    for (const article of relevantArticles.slice(0, 3)) { // Limit to 3 articles per delivery
      await storage.createNewsPulse(article, userId);
    }
    
  } catch (error) {
    console.error(`Error delivering news to user ${userId}:`, error);
  }
}