/**
 * Enhanced Intent Classifier - Emotion + Stage Detection
 * Upgrades the basic intent classifier with emotional intelligence and journey stage awareness
 */

export type IntentType = 'clarify' | 'probe' | 'action' | 'resource' | 'confirm' | 'alternative' | 'close';
export type Emotion = 'curious' | 'frustrated' | 'confident' | 'exploring' | 'validating' | 'neutral';
export type JourneyStage = 'onboarding' | 'active' | 'optimization' | 'monetization';

export interface EnhancedClassificationResult {
  intent: IntentType;
  emotion: Emotion;
  stage: JourneyStage;
  confidence: number;
  emotionConfidence: number;
  matchedRule?: string;
  reasoning?: string;
}

class EnhancedIntentClassifier {
  /**
   * Classify message with intent, emotion, and stage detection
   */
  classify(userMessage: string, userProfile?: any): EnhancedClassificationResult {
    const message = userMessage.toLowerCase().trim();

    // 1. Detect intent
    const intent = this.detectIntent(message);

    // 2. Detect emotion from message tone
    const emotion = this.detectEmotion(message, userProfile);

    // 3. Infer journey stage from intent + emotion + profile
    const stage = this.inferJourneyStage(intent, emotion, userProfile);

    return {
      intent,
      emotion: emotion.type,
      stage,
      confidence: 0.85,
      emotionConfidence: emotion.confidence,
    };
  }

  private detectIntent(message: string): IntentType {
    // ACTION - user wants system to DO something
    if (this.matchesAction(message)) return 'action';

    // CLARIFY - asking for definitions/choices
    if (this.matchesClarify(message)) return 'clarify';

    // PROBE - exploring deeper, asking why/how
    if (this.matchesProbe(message)) return 'probe';

    // RESOURCE - asking for templates/tools
    if (this.matchesResource(message)) return 'resource';

    // CONFIRM - affirming previous suggestion
    if (this.matchesConfirm(message)) return 'confirm';

    // ALTERNATIVE - rejecting or asking different approach
    if (this.matchesAlternative(message)) return 'alternative';

    // CLOSE - ending conversation
    if (this.matchesClose(message)) return 'close';

    // Default
    return 'probe';
  }

  private detectEmotion(message: string, userProfile?: any): { type: Emotion; confidence: number } {
    const scores = {
      curious: 0,
      frustrated: 0,
      confident: 0,
      exploring: 0,
      validating: 0,
      neutral: 0.2, // Default baseline
    };

    // Frustrated signals
    if (message.match(/frustrated|stuck|can't|unable|doesn't work|problem|issue|help|struggling/i)) {
      scores.frustrated += 0.4;
    }

    // Curious signals
    if (message.match(/what|how|why|interesting|want to learn|curious|tell me more|explain/i)) {
      scores.curious += 0.35;
    }

    // Confident signals
    if (message.match(/i want|i will|i'm ready|let's|go ahead|definitely|absolutely|sure/i)) {
      scores.confident += 0.3;
    }

    // Exploring signals
    if (message.match(/trying to|looking to|considering|maybe|what if|could i|should i/i)) {
      scores.exploring += 0.3;
    }

    // Validating signals
    if (message.match(/is this right|does this make sense|correct|right|agree|confirm|validate/i)) {
      scores.validating += 0.35;
    }

    // Punctuation signals
    if (message.includes('!!!')) {
      scores.confident += 0.2;
      scores.excited = 0.2;
    }
    if (message.match(/\?\?\?|\?!|\!\?/)) {
      scores.frustrated += 0.1;
      scores.confused = 0.1;
    }

    // Message length heuristics
    const wordCount = message.split(/\s+/).length;
    if (wordCount > 15) {
      scores.exploring += 0.1; // Longer messages often exploring
    }

    // Find top emotion
    const maxScore = Math.max(...Object.values(scores));
    let topEmotion = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as Emotion;

    if (!topEmotion) {
      topEmotion = 'neutral';
    }

    return {
      type: topEmotion,
      confidence: Math.min(100, Math.round(maxScore * 100)),
    };
  }

  private inferJourneyStage(intent: IntentType, emotion: Emotion, userProfile?: any): JourneyStage {
    // Use profile data if available
    if (userProfile?.stage) {
      return userProfile.stage;
    }

    // Infer from patterns
    // Early stage: clarify + curious → onboarding
    if (intent === 'clarify' && emotion === 'curious') {
      return 'onboarding';
    }

    // Active building: action + confident → active
    if (intent === 'action' && emotion === 'confident') {
      return 'active';
    }

    // Optimization: resource + exploring → optimization
    if (intent === 'resource' && emotion === 'exploring') {
      return 'optimization';
    }

    // Monetization: action + validating → monetization
    if (intent === 'action' && emotion === 'validating') {
      return 'monetization';
    }

    // Default based on emotion frequency
    if (emotion === 'curious') return 'onboarding';
    if (emotion === 'confident') return 'active';
    if (emotion === 'exploring') return 'optimization';
    if (emotion === 'validating') return 'monetization';

    return 'active'; // Default
  }

  // Intent matching helpers
  private matchesAction(msg: string): boolean {
    return /draft|write|create|generate|schedule|send|share|post|publish|help me/.test(msg);
  }

  private matchesClarify(msg: string): boolean {
    return /which|what|mean|clarify|confused|understand/.test(msg);
  }

  private matchesProbe(msg: string): boolean {
    return /why|how|tell me more|explain|deeper|examples/.test(msg);
  }

  private matchesResource(msg: string): boolean {
    return /template|example|sample|checklist|guide|tool|want a|need a/.test(msg);
  }

  private matchesConfirm(msg: string): boolean {
    return /yes|sure|okay|go ahead|let's do it|absolutely/.test(msg);
  }

  private matchesAlternative(msg: string): boolean {
    return /or|instead|another|different|prefer|rather|else/.test(msg);
  }

  private matchesClose(msg: string): boolean {
    return /thanks|thank you|that's all|bye|done|goodbye/.test(msg);
  }
}

// Export singleton
export const enhancedIntentClassifier = new EnhancedIntentClassifier();
