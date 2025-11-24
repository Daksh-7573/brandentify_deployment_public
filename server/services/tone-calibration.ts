/**
 * Tone Calibration Service - Emotional Tone Adjustment
 * Adjusts response tone based on user emotion to feel more human and empathetic
 */

import { Emotion } from './enhanced-intent-classifier';

export type ToneStyle = 'empathetic' | 'energizing' | 'direct' | 'calm' | 'professional';

export interface ToneConfig {
  emotion: Emotion;
  baseIntentStyle: string;
  adjustedTone: ToneStyle;
  toneMarkers: string[];
  responseStyle: string;
}

class ToneCalibrationService {
  /**
   * Determine tone based on emotion and intent
   */
  calibrateTone(emotion: Emotion, intent: string, userProfile?: any): ToneConfig {
    let tone: ToneStyle = 'professional';
    let toneMarkers: string[] = [];
    let responseStyle = '';

    const emotionTyped = emotion as Emotion;

    switch (emotionTyped) {
      case 'frustrated':
        tone = 'empathetic';
        toneMarkers = ['understand', 'let me help', 'here\'s a solution', 'you\'re not alone'];
        responseStyle = 'Start by acknowledging frustration, then offer clear solutions';
        break;

      case 'curious':
        tone = 'calm';
        toneMarkers = ['Let me explain', 'Here\'s the insight', 'Deep dive', 'fascinating'];
        responseStyle = 'Provide detailed explanations and encourage exploration';
        break;

      case 'confident':
        tone = 'energizing';
        toneMarkers = ['Let\'s do this', 'Amazing', 'You\'ve got this', 'Let\'s move forward'];
        responseStyle = 'Be action-oriented, motivational, direct';
        break;

      case 'exploring':
        tone = 'direct';
        toneMarkers = ['Consider', 'Try this', 'Option 1/2', 'experiment with'];
        responseStyle = 'Present options with pros/cons, encourage experimentation';
        break;

      case 'validating':
        tone = 'professional';
        toneMarkers = ['Correct', 'Exactly right', 'Well thought out', 'Validation'];
        responseStyle = 'Confirm their thinking, provide supporting evidence';
        break;

      case 'neutral':
      default:
        tone = 'professional';
        toneMarkers = ['Here\'s my advice', 'Consider this', 'Next steps'];
        responseStyle = 'Neutral, informative tone';
    }

    // Adjust based on profile (if user prefers casual)
    if (userProfile?.tone === 'casual') {
      if (tone === 'professional') tone = 'energizing';
      toneMarkers = toneMarkers.map((m: string) => m.toLowerCase());
    }

    return {
      emotion,
      baseIntentStyle: intent,
      adjustedTone: tone,
      toneMarkers,
      responseStyle,
    };
  }

  /**
   * Inject tone markers into response text
   */
  applyToneToResponse(
    baseText: string,
    toneConfig: ToneConfig,
    options?: { addMarker?: boolean }
  ): string {
    const { adjustedTone, toneMarkers } = toneConfig;

    // For frustrated users, start with empathy
    if (adjustedTone === 'empathetic') {
      if (!baseText.toLowerCase().includes('understand')) {
        return `I understand. ${baseText}`;
      }
    }

    // For exploring users, add reflection
    if (adjustedTone === 'direct') {
      if (!baseText.toLowerCase().includes('option')) {
        return baseText.replace(/^/, 'Here are your options: ');
      }
    }

    // For confident users, be direct and action-oriented
    if (adjustedTone === 'energizing') {
      if (!baseText.toLowerCase().includes("let's")) {
        return baseText.replace(/^/, "Let's do this: ");
      }
    }

    return baseText;
  }

  /**
   * Get response length recommendation based on emotion
   */
  getResponseLengthHint(emotion: Emotion): 'brief' | 'moderate' | 'detailed' {
    switch (emotion) {
      case 'frustrated':
        return 'brief'; // Get to solution quickly
      case 'curious':
        return 'detailed'; // They want to learn
      case 'confident':
        return 'brief'; // Keep momentum
      case 'exploring':
        return 'moderate'; // Balanced
      case 'validating':
        return 'moderate'; // Evidence-based
      default:
        return 'moderate';
    }
  }

  /**
   * Determine formality level based on user profile and emotion
   */
  getFormality(emotion: Emotion, userTone?: string): 'casual' | 'neutral' | 'formal' {
    if (userTone === 'casual') {
      return 'casual';
    }

    if (emotion === 'frustrated' || emotion === 'exploring') {
      return 'casual';
    }

    if (emotion === 'validating') {
      return 'formal';
    }

    return 'neutral';
  }
}

export const toneCalibrationService = new ToneCalibrationService();
