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
   * Rules ordered by priority: Action > Clarify > Probe > Resource > Confirm > Alternative > Close
   */
  private matchKeywordRules(message: string): ClassificationResult | null {
    // 1. ACTION intent (High Priority) - User wants system to DO something
    if (this.matchActionIntent(message)) {
      return { intent: 'action', confidence: 0.95, matchedRule: 'action-regex' };
    }

    // 2. CLARIFY intent - Asking for definitions/choices or ambiguous
    if (this.matchClarifyIntent(message)) {
      return { intent: 'clarify', confidence: 0.9, matchedRule: 'clarify-regex' };
    }

    // 3. PROBE intent - Depth & context seeking
    if (this.matchProbeIntent(message)) {
      return { intent: 'probe', confidence: 0.85, matchedRule: 'probe-regex' };
    }

    // 4. RESOURCE intent - Asking for templates, examples, tools
    if (this.matchResourceIntent(message)) {
      return { intent: 'resource', confidence: 0.9, matchedRule: 'resource-regex' };
    }

    // 5. CONFIRM intent - Affirmation/Acceptance
    if (this.matchConfirmIntent(message)) {
      return { intent: 'confirm', confidence: 0.95, matchedRule: 'confirm-regex' };
    }

    // 6. ALTERNATIVE intent - Rejecting or asking for different approach
    if (this.matchAlternativeIntent(message)) {
      return { intent: 'alternative', confidence: 0.85, matchedRule: 'alternative-regex' };
    }

    // 7. CLOSE intent - End of conversation
    if (this.matchCloseIntent(message)) {
      return { intent: 'close', confidence: 0.9, matchedRule: 'close-regex' };
    }

    return null;
  }

  private matchActionIntent(message: string): boolean {
    const actionRegex = /\b(draft|write|create|generate|schedule|book|send|share|post|publish|upload|export|download|apply|connect me|introduce me|show me)\b/i;
    const phraseRegex = /(i'd like you to (draft|write|create|show))|(can you (draft|create|write|post))|(help me (create|draft|write|build))/i;

    return actionRegex.test(message) || phraseRegex.test(message);
  }

  private matchClarifyIntent(message: string): boolean {
    const clarifyRegex = /\b(do you mean|which (one|platform)|which (tool|format|version)|did you mean|or do you mean|clarify|confused|understand)\b/i;
    const isShortQuestion = message.split(/\s+/).length < 10 && message.endsWith('?');

    // Ambiguous pronouns without clear context (simplified)
    const hasAmbiguousPronouns = /\b(this|that|it|them|they)\b/i.test(message) && message.endsWith('?');

    return clarifyRegex.test(message) || isShortQuestion || hasAmbiguousPronouns;
  }

  private matchProbeIntent(message: string): boolean {
    const probeKeywords = /\b(why|what|how|which|tell me more|explain|more about|go deeper|examples)\b/i;
    const goalPhrases = /\b(i want|i'm trying to|my goal is|i need to)\b/i;
    const goalGrowthWords = /\b(grow|get clients|pivot|monetize|expand)\b/i;

    const isLongGoalMessage = message.split(/\s+/).length > 12 && goalGrowthWords.test(message);

    return probeKeywords.test(message) || goalPhrases.test(message) || isLongGoalMessage;
  }

  private matchResourceIntent(message: string): boolean {
    const resourceRegex = /\b(template|example|sample|checklist|outline|templates|pack|tool|guide|resource|swipe file)\b/i;
    const requestPhrases = /\b(do you have a template|send me|show sample|give example|want a|need a)\b/i;

    return resourceRegex.test(message) || requestPhrases.test(message);
  }

  private matchConfirmIntent(message: string): boolean {
    const confirmRegex = /\b(yes|yep|sure|okay|ok|do it|please proceed|confirm|sounds good|go ahead|let's do it|absolutely|definitely|works for me)\b/i;
    return confirmRegex.test(message);
  }

  private matchAlternativeIntent(message: string): boolean {
    const alternativeRegex = /\b(or|instead|another|different|not that|don’t want|prefer|rather|alternative|else)\b/i;
    return alternativeRegex.test(message);
  }

  private matchCloseIntent(message: string): boolean {
    const closeRegex = /\b(thanks|thank you|that’s all|bye|done|not now|later|goodbye|see you)\b/i;
    return closeRegex.test(message);
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
