# Musk AI Hashtag Suggestions Feature

This document outlines the hashtag suggestion functionality in the Musk AI Career Assistant.

## Overview

The Hashtag Suggestion feature lets users receive contextually relevant hashtag recommendations based on their industry, domain, content, and historical hashtag usage patterns. This helps users increase the visibility of their posts and engage with relevant professional communities.

## API Endpoints

### 1. Generate Hashtag Suggestions

**Endpoint:** `POST /api/musk-ai/suggest-hashtags`

**Request Body:**
```json
{
  "industry": "Technology",
  "domain": "Software Development",
  "followedHashtags": ["#JavaScript", "#WebDev", "#AI"],
  "previouslyUsedHashtags": ["#ReactJS", "#NodeJS", "#TechTrends"],
  "contentContext": "Sharing my thoughts on the future of serverless computing and edge functions.",
  "count": 8
}
```

**Parameters:**
- `industry` (string, optional): The user's industry (e.g., "Technology", "Healthcare")
- `domain` (string, optional): The user's domain or specialty (e.g., "Software Development", "Digital Marketing")
- `followedHashtags` (array of strings, optional): Hashtags the user follows
- `previouslyUsedHashtags` (array of strings, optional): Hashtags the user has used before
- `contentContext` (string, optional): A brief description of the content the user is creating
- `count` (number, optional, default: 10): Number of hashtag suggestions to generate

**Response:**
```json
{
  "hashtags": ["#Serverless", "#EdgeComputing", "#CloudNative", "#AWS", "#AzureFunctions", "#WebDevelopment", "#TechTrends", "#FutureOfTech"]
}
```

**Note:** At least one of `industry`, `domain`, or `contentContext` must be provided.

### 2. Demo Hashtag Suggestions

**Endpoint:** `GET /api/musk-ai/demo/suggest-hashtags/:industry`

**URL Parameters:**
- `industry` (string, required): Industry for demo suggestions (e.g., "technology", "healthcare")

**Query Parameters:**
- `domain` (string, optional): Domain for more specific suggestions

**Response:**
Same format as the main endpoint.

## Implementation Details

### Caching

The service implements intelligent caching to reduce API calls:
- Cache duration: 1 hour
- Cached by industry, domain, followed hashtags, and content context (first 100 characters)

### OpenAI Integration

The feature uses OpenAI GPT-4o to generate contextually relevant hashtags:
- Model: gpt-4o
- Response format: JSON with hashtag array
- Max tokens: 500

## Testing

### Using the Test Client

1. Open `test-hashtag-client.html` in a browser
2. Fill in the form fields or use one of the demo templates
3. Click "Generate Hashtags"

### Using the Test Script

Run `node test-hashtag-suggestions.js` to test:
1. Main hashtag suggestions API
2. Demo hashtag suggestions endpoint
3. Error handling with invalid requests

## Example Use Cases

1. **Content Creation:** Get hashtag suggestions based on article or post content
2. **Industry Networking:** Discover trending industry-specific hashtags
3. **Profile Enhancement:** Generate professional hashtags for user profiles
4. **Post Optimization:** Improve post visibility with relevant hashtags