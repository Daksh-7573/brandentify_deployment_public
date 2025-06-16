/**
 * Advanced Reference Resolution Service
 * 
 * Resolves pronouns, implicit references, and contextual terms
 * using conversation history and semantic analysis.
 */

import { getConversationMemory, ConversationMemory } from './conversation-memory.js';

export interface ReferenceResolution {
  originalMessage: string;
  resolvedMessage: string;
  references: ResolvedReference[];
  confidence: number;
}

export interface ResolvedReference {
  original: string;
  resolved: string;
  type: 'pronoun' | 'demonstrative' | 'contextual' | 'implicit';
  confidence: number;
}

/**
 * Resolve references in user message using conversation context
 */
export function resolveReferences(
  message: string,
  userId: number,
  userProfile?: any
): ReferenceResolution {
  const memory = getConversationMemory(userId);
  const references: ResolvedReference[] = [];
  let resolvedMessage = message;
  let totalConfidence = 1.0;

  // Define reference patterns to detect
  const referencePatterns = [
    // Pronouns
    { pattern: /\b(it|that|this)\b/gi, type: 'pronoun' as const },
    // Demonstratives
    { pattern: /\b(both|either|one|them|they)\b/gi, type: 'demonstrative' as const },
    // Contextual references
    { pattern: /\b(the (platform|tool|method|approach|option))\b/gi, type: 'contextual' as const },
    // Implicit references
    { pattern: /\b(what about|how about)\s+(\w+)/gi, type: 'implicit' as const }
  ];

  // Extract recent conversation topics
  const recentTopics = extractRecentTopics(memory);
  const recentEntities = extractRecentEntities(memory);

  for (const patternDef of referencePatterns) {
    const matches = Array.from(message.matchAll(patternDef.pattern));
    
    for (const match of matches) {
      const original = match[0];
      const resolved = resolveSpecificReference(
        original,
        patternDef.type,
        recentTopics,
        recentEntities,
        memory,
        userProfile
      );

      if (resolved && resolved !== original) {
        references.push({
          original,
          resolved,
          type: patternDef.type,
          confidence: calculateResolutionConfidence(original, resolved, memory)
        });

        // Replace in message
        resolvedMessage = resolvedMessage.replace(new RegExp(`\\b${escapeRegex(original)}\\b`, 'gi'), resolved);
        totalConfidence *= 0.9; // Slight confidence reduction for each resolution
      }
    }
  }

  // Handle special cases for career-specific contexts
  resolvedMessage = enhanceCareerContext(resolvedMessage, memory, userProfile);

  return {
    originalMessage: message,
    resolvedMessage,
    references,
    confidence: Math.max(0.3, totalConfidence - (references.length * 0.1))
  };
}

/**
 * Resolve specific reference based on type and context
 */
function resolveSpecificReference(
  reference: string,
  type: 'pronoun' | 'demonstrative' | 'contextual' | 'implicit',
  recentTopics: string[],
  recentEntities: string[],
  memory: ConversationMemory,
  userProfile?: any
): string {
  const refLower = reference.toLowerCase();

  switch (type) {
    case 'pronoun':
      return resolvePronoun(refLower, recentTopics, recentEntities, memory);
    
    case 'demonstrative':
      return resolveDemonstrative(refLower, recentTopics, memory);
    
    case 'contextual':
      return resolveContextual(refLower, recentEntities, userProfile);
    
    case 'implicit':
      return resolveImplicit(reference, recentTopics, memory);
    
    default:
      return reference;
  }
}

/**
 * Resolve pronouns like "it", "that", "this"
 */
function resolvePronoun(
  pronoun: string,
  recentTopics: string[],
  recentEntities: string[],
  memory: ConversationMemory
): string {
  // Get the most recent substantive topic
  const lastExchange = memory.exchanges[memory.exchanges.length - 1];
  
  if (pronoun === 'it' || pronoun === 'that') {
    // Look for the most recent noun or topic
    if (recentTopics.length > 0) {
      return recentTopics[0]; // Most recent topic
    }
    if (recentEntities.length > 0) {
      return recentEntities[0]; // Most recent entity
    }
  }
  
  if (pronoun === 'this') {
    // "This" usually refers to current context or recent suggestion
    if (lastExchange && lastExchange.speaker === 'Musk') {
      const suggestions = extractSuggestionsFromMessage(lastExchange.message);
      if (suggestions.length > 0) {
        return suggestions[0];
      }
    }
  }

  return pronoun;
}

/**
 * Resolve demonstratives like "both", "either", "one"
 */
function resolveDemonstrative(
  demonstrative: string,
  recentTopics: string[],
  memory: ConversationMemory
): string {
  if (demonstrative === 'both') {
    // Look for two options mentioned in recent conversation
    const options = findRecentOptions(memory);
    if (options.length >= 2) {
      return `both ${options[0]} and ${options[1]}`;
    }
    return 'both options discussed earlier';
  }
  
  if (demonstrative === 'either') {
    const options = findRecentOptions(memory);
    if (options.length >= 2) {
      return `either ${options[0]} or ${options[1]}`;
    }
    return 'either of the options mentioned';
  }
  
  if (demonstrative === 'one') {
    if (recentTopics.length > 0) {
      return `one of the ${recentTopics[0]} options`;
    }
    return 'one of the options';
  }

  return demonstrative;
}

/**
 * Resolve contextual references like "the platform", "the approach"
 */
function resolveContextual(
  contextual: string,
  recentEntities: string[],
  userProfile?: any
): string {
  if (contextual.includes('platform')) {
    // Check for recent platform mentions
    const platforms = recentEntities.filter(entity => 
      /\b(brandentifier|linkedin|twitter|github|portfolio|website)\b/i.test(entity)
    );
    if (platforms.length > 0) {
      return platforms[0];
    }
    return 'Brandentifier'; // Default to our platform
  }
  
  if (contextual.includes('approach') || contextual.includes('method')) {
    // Look for recent methodology mentions
    const methods = recentEntities.filter(entity =>
      /\b(strategy|method|approach|technique|framework)\b/i.test(entity)
    );
    if (methods.length > 0) {
      return methods[0];
    }
  }

  return contextual;
}

/**
 * Resolve implicit references from "what about" or "how about"
 */
function resolveImplicit(
  reference: string,
  recentTopics: string[],
  memory: ConversationMemory
): string {
  const match = reference.match(/(what about|how about)\s+(\w+)/i);
  if (!match) return reference;
  
  const [, prefix, term] = match;
  
  // Expand the term with context
  const expandedTerm = expandTermWithContext(term, recentTopics, memory);
  
  return `${prefix} ${expandedTerm}`;
}

/**
 * Extract recent topics from conversation memory
 */
function extractRecentTopics(memory: ConversationMemory): string[] {
  const topics: string[] = [];
  const recentExchanges = memory.exchanges.slice(-3);
  
  for (const exchange of recentExchanges) {
    const extractedTopics = extractTopicsFromMessage(exchange.message);
    topics.push(...extractedTopics);
  }
  
  return Array.from(new Set(topics)); // Remove duplicates
}

/**
 * Extract entities (nouns, proper nouns) from recent conversation
 */
function extractRecentEntities(memory: ConversationMemory): string[] {
  const entities: string[] = [];
  const recentExchanges = memory.exchanges.slice(-3);
  
  for (const exchange of recentExchanges) {
    const extractedEntities = extractEntitiesFromMessage(exchange.message);
    entities.push(...extractedEntities);
  }
  
  return Array.from(new Set(entities));
}

/**
 * Extract topics from a message using keyword patterns
 */
function extractTopicsFromMessage(message: string): string[] {
  const topics: string[] = [];
  
  // Career-related topics
  const careerTopics = message.match(/\b(resume|CV|portfolio|skills|experience|networking|interview|job|career|role|position|industry|salary|promotion|leadership|management|strategy)\b/gi);
  if (careerTopics) {
    topics.push(...careerTopics.map(t => t.toLowerCase()));
  }
  
  // Platform topics
  const platformTopics = message.match(/\b(brandentifier|linkedin|twitter|github|portfolio|website|platform|social media|profile)\b/gi);
  if (platformTopics) {
    topics.push(...platformTopics.map(t => t.toLowerCase()));
  }
  
  return topics;
}

/**
 * Extract entities (nouns) from message
 */
function extractEntitiesFromMessage(message: string): string[] {
  const entities: string[] = [];
  
  // Simple noun extraction (this could be enhanced with NLP libraries)
  const words = message.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z]/g, '');
    
    // Check if it's likely a noun (capitalized, ends with common noun suffixes, etc.)
    if (word.length > 3 && (
      /^[A-Z]/.test(word) || // Capitalized
      /ing$|tion$|ness$|ment$|ship$|hood$/.test(word) // Common noun suffixes
    )) {
      entities.push(word.toLowerCase());
    }
  }
  
  return entities;
}

/**
 * Find recent options or alternatives mentioned in conversation
 */
function findRecentOptions(memory: ConversationMemory): string[] {
  const options: string[] = [];
  const recentExchanges = memory.exchanges.slice(-2);
  
  for (const exchange of recentExchanges) {
    // Look for "or" patterns
    const orMatches = exchange.message.match(/(\w+(?:\s+\w+)*)\s+or\s+(\w+(?:\s+\w+)*)/gi);
    if (orMatches) {
      orMatches.forEach(match => {
        const parts = match.split(/\s+or\s+/i);
        options.push(...parts.map(p => p.trim()));
      });
    }
    
    // Look for list patterns
    const listMatches = exchange.message.match(/(\w+(?:\s+\w+)*),\s*(\w+(?:\s+\w+)*),?\s*(?:and|or)\s+(\w+(?:\s+\w+)*)/gi);
    if (listMatches) {
      listMatches.forEach(match => {
        const parts = match.split(/,\s*(?:and|or)\s*/i);
        options.push(...parts.map(p => p.trim()));
      });
    }
  }
  
  return options.filter(opt => opt.length > 2);
}

/**
 * Extract suggestions from Musk's previous message
 */
function extractSuggestionsFromMessage(message: string): string[] {
  const suggestions: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletPoints = message.match(/[•\-\*]\s*([^\n]+)/g);
  if (bulletPoints) {
    suggestions.push(...bulletPoints.map(bp => bp.replace(/[•\-\*]\s*/, '').trim()));
  }
  
  // Look for "I recommend" or "you should" patterns
  const recommendations = message.match(/(?:I recommend|you should|consider|try)\s+([^.!?]+)/gi);
  if (recommendations) {
    suggestions.push(...recommendations.map(rec => rec.trim()));
  }
  
  return suggestions;
}

/**
 * Expand term with conversation context
 */
function expandTermWithContext(
  term: string,
  recentTopics: string[],
  memory: ConversationMemory
): string {
  // Check if term relates to recent topics
  const relatedTopic = recentTopics.find(topic => 
    topic.includes(term.toLowerCase()) || term.toLowerCase().includes(topic)
  );
  
  if (relatedTopic) {
    return `${term} in the context of ${relatedTopic}`;
  }
  
  // Add career context if appropriate
  const careerTerms = ['skills', 'experience', 'role', 'position', 'job', 'career'];
  if (careerTerms.some(ct => term.toLowerCase().includes(ct))) {
    return `${term} for career development`;
  }
  
  return term;
}

/**
 * Enhance message with career-specific context
 */
function enhanceCareerContext(
  message: string,
  memory: ConversationMemory,
  userProfile?: any
): string {
  let enhanced = message;
  
  // Add user context if missing and relevant
  if (userProfile && userProfile.title && !enhanced.includes(userProfile.title)) {
    if (/\b(my|I|career|role|position)\b/i.test(enhanced)) {
      enhanced = enhanced.replace(/\bmy (role|position|career)\b/gi, `my ${userProfile.title} $1`);
    }
  }
  
  // Add industry context
  if (userProfile && userProfile.industry && /\bindustry\b/i.test(enhanced)) {
    enhanced = enhanced.replace(/\bindustry\b/gi, `${userProfile.industry} industry`);
  }
  
  return enhanced;
}

/**
 * Calculate confidence score for reference resolution
 */
function calculateResolutionConfidence(
  original: string,
  resolved: string,
  memory: ConversationMemory
): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence if resolved term appeared recently
  const recentMessages = memory.exchanges.slice(-3).map(e => e.message.toLowerCase());
  const resolvedLower = resolved.toLowerCase();
  
  for (const message of recentMessages) {
    if (message.includes(resolvedLower)) {
      confidence += 0.2;
      break;
    }
  }
  
  // Higher confidence for specific terms
  if (resolved.length > original.length * 2) {
    confidence += 0.1; // More specific resolution
  }
  
  // Lower confidence for very generic resolutions
  if (/\b(thing|stuff|option|choice)\b/i.test(resolved)) {
    confidence -= 0.2;
  }
  
  return Math.max(0.1, Math.min(1.0, confidence));
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}