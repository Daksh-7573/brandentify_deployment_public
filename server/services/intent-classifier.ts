/**
 * Intent Classifier for Musk Follow-up Generation
 * Classifies user messages into intent types for better follow-up personalization
 */

export type IntentType = 'clarify' | 'probe' | 'action' | 'resource' | 'confirm' | 'alternative' | 'close';

interface ClassificationResult {
  intent: IntentType;
  confidence: number;
  matchedRule?: string;
  reasoning?: string;
}

class IntentClassifier {
  /**
   * Classify a user message into an intent type
   */
  classifyIntent(userMessage: string, userProfile?: any): ClassificationResult {
    const message = userMessage.toLowerCase().trim();

    // 1. Try deterministic keyword rules first (fast path)
    const ruleMatch = this.matchKeywordRules(message);
    if (ruleMatch) {
      return { ...ruleMatch, confidence: 0.95 };
    }

    // 2. Fallback to heuristic scoring
    return this.scoreByHeuristics(message, userProfile);
  }

  /**
   * Match against deterministic keyword rules
   * Rules ordered by priority
   */
  private matchKeywordRules(message: string): ClassificationResult | null {
    // ACTION intent - user wants the system to DO something
    if (this.matchActionIntent(message)) {
      return { intent: 'action', confidence: 0.9, matchedRule: 'action-keywords' };
    }

    // CLARIFY intent - user asks clarifying questions or needs ambiguity resolved
    if (this.matchClarifyIntent(message)) {
      return { intent: 'clarify', confidence: 0.85, matchedRule: 'clarify-keywords' };
    }

    // PROBE intent - user explores deeper, asks for more context
    if (this.matchProbeIntent(message)) {
      return { intent: 'probe', confidence: 0.8, matchedRule: 'probe-keywords' };
    }

    // RESOURCE intent - user asks for templates, examples, tools
    if (this.matchResourceIntent(message)) {
      return { intent: 'resource', confidence: 0.85, matchedRule: 'resource-keywords' };
    }

    // CONFIRM intent - user affirms previous suggestion
    if (this.matchConfirmIntent(message)) {
      return { intent: 'confirm', confidence: 0.9, matchedRule: 'confirm-keywords' };
    }

    // ALTERNATIVE intent - user rejects or asks for different approach
    if (this.matchAlternativeIntent(message)) {
      return { intent: 'alternative', confidence: 0.8, matchedRule: 'alternative-keywords' };
    }

    // CLOSE intent - user ends conversation
    if (this.matchCloseIntent(message)) {
      return { intent: 'close', confidence: 0.85, matchedRule: 'close-keywords' };
    }

    return null;
  }

  private matchActionIntent(message: string): boolean {
    const actionKeywords = [
      'draft', 'write', 'create', 'generate', 'schedule', 'book', 'send', 'share',
      'post', 'publish', 'upload', 'export', 'download', 'apply', 'connect me',
      'introduce me', 'show me', 'help me (create|draft|write|build)',
      "i'd like you to", 'can you', 'could you', 'would you', 'shall i',
      'should i', 'want to', 'need to create', 'need to draft'
    ];

    return actionKeywords.some(keyword => message.includes(keyword));
  }

  private matchClarifyIntent(message: string): boolean {
    const clarifyKeywords = [
      'do you mean', 'which', 'which one', 'which platform', 'which tool',
      'did you mean', 'or do you mean', 'or is it', 'clarify', 'confused',
      'not sure', 'mean by', 'understand'
    ];

    const hasClarifyKeyword = clarifyKeywords.some(keyword => message.includes(keyword));
    const isShortQuestion = message.split(' ').length < 10 && message.includes('?');

    return hasClarifyKeyword || isShortQuestion;
  }

  private matchProbeIntent(message: string): boolean {
    const probeKeywords = [
      'why', 'what', 'how', 'tell me more', 'explain', 'more about',
      'go deeper', 'examples', 'i want', "i'm trying to", 'my goal is',
      'i need to', 'grow', 'get clients', 'pivot', 'monetize', 'expand'
    ];

    return probeKeywords.some(keyword => message.includes(keyword));
  }

  private matchResourceIntent(message: string): boolean {
    const resourceKeywords = [
      'template', 'example', 'sample', 'checklist', 'outline', 'pack', 'tool',
      'guide', 'resource', 'swipe file', 'do you have', 'send me', 'show sample',
      'give example', 'want a', 'need a'
    ];

    return resourceKeywords.some(keyword => message.includes(keyword));
  }

  private matchConfirmIntent(message: string): boolean {
    const confirmKeywords = [
      'yes', 'yep', 'sure', 'okay', 'do it', 'please proceed', 'confirm',
      'sounds good', 'go ahead', "let's do it", 'absolutely', 'definitely',
      'for sure', 'works for me'
    ];

    return confirmKeywords.some(keyword => message.includes(keyword));
  }

  private matchAlternativeIntent(message: string): boolean {
    const alternativeKeywords = [
      'or', 'instead', 'another', 'different', 'not that', "don't want",
      'prefer', 'rather', 'alternative', 'other way', 'else'
    ];

    return alternativeKeywords.some(keyword => message.includes(keyword));
  }

  private matchCloseIntent(message: string): boolean {
    const closeKeywords = [
      'thanks', 'thank you', "that's all", 'bye', 'done', 'not now',
      'later', 'goodbye', 'see you', 'talk soon'
    ];

    return closeKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Fallback heuristic scoring when keyword rules don't match
   */
  private scoreByHeuristics(message: string, userProfile?: any): ClassificationResult {
    const scores: Record<IntentType, number> = {
      clarify: 0,
      probe: 0,
      action: 0,
      resource: 0,
      confirm: 0,
      alternative: 0,
      close: 0
    };

    // Question mark presence
    if (message.includes('?')) {
      scores.clarify += 0.2;
      scores.probe += 0.1;
    }

    // Modal verbs
    if (message.match(/\b(can|could|should|would|shall)\b/)) {
      scores.action += 0.15;
    }

    // First person
    if (message.match(/\bi\b|\bwe\b/)) {
      scores.probe += 0.1;
      scores.action += 0.05;
    }

    // Length heuristics
    const words = message.split(/\s+/).length;
    if (words < 5) {
      scores.confirm += 0.15;
      scores.clarify += 0.1;
    } else if (words > 15) {
      scores.probe += 0.2;
      scores.action += 0.1;
    }

    // Default: probe (most common in career conversations)
    if (Object.values(scores).every(s => s === 0)) {
      return { intent: 'probe', confidence: 0.5, reasoning: 'default-heuristic' };
    }

    // Find highest score
    const maxScore = Math.max(...Object.values(scores));
    const topIntent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as IntentType;

    return {
      intent: topIntent || 'probe',
      confidence: maxScore * 0.7,
      reasoning: 'heuristic-scoring'
    };
  }
}

// Export singleton
export const intentClassifier = new IntentClassifier();
