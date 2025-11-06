import { localAIService } from './local-ai-service';
import type { BrandScore } from './brand-score-calculator';

export class BrandScoreAIAnalyzer {
  async generateAISuggestions(
    userId: number,
    userName: string,
    brandScore: BrandScore,
    userData: any
  ): Promise<string[]> {
    try {
      const prompt = this.buildAnalysisPrompt(userName, brandScore, userData);
      
      const response = await localAIService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 400
      });

      const suggestions = this.extractSuggestions(response);
      return suggestions;
    } catch (error) {
      console.error('[Brand Score AI] Error generating suggestions:', error);
      return this.getFallbackSuggestions(brandScore);
    }
  }

  private buildAnalysisPrompt(
    userName: string,
    brandScore: BrandScore,
    userData: any
  ): string {
    const weakestComponents = Object.entries(brandScore.components)
      .map(([key, comp]) => ({ key, ...comp }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    return `You are a professional career advisor analyzing ${userName}'s personal brand profile.

Current Brand Score: ${brandScore.totalScore}/100 (Grade: ${brandScore.grade})

Industry: ${userData.industry || 'Not specified'}
Domain: ${userData.domain || 'Not specified'}
Current Title: ${userData.title || 'Not specified'}

Weakest Areas:
${weakestComponents.map(c => `- ${c.name}: ${c.percentage}%`).join('\n')}

Profile Analysis:
- Has ${userData.experienceCount || 0} work experiences
- Has ${userData.educationCount || 0} education entries
- Has ${userData.skillsCount || 0} skills listed
- Has ${userData.projectsCount || 0} portfolio projects
- Has ${userData.pulsesCount || 0} pulses posted
- Has ${userData.connectionsCount || 0} professional connections

Based on this analysis, provide EXACTLY 3 high-impact, actionable suggestions to improve ${userName}'s personal brand score. Make them specific, personalized, and prioritize the weakest areas.

Format: Return ONLY a numbered list (1. 2. 3.) with no introduction or conclusion.`;
  }

  private extractSuggestions(aiResponse: string): string[] {
    const lines = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const suggestions: string[] = [];

    for (const line of lines) {
      const match = line.match(/^[\d]+[\.\)]\s*(.+)$/);
      if (match && match[1]) {
        suggestions.push(match[1].trim());
      } else if (line.length > 20 && !line.startsWith('Based on') && !line.startsWith('Here are')) {
        suggestions.push(line);
      }
    }

    return suggestions.slice(0, 3);
  }

  private getFallbackSuggestions(brandScore: BrandScore): string[] {
    const weakestComponents = Object.entries(brandScore.components)
      .map(([key, comp]) => ({ key, ...comp }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    const fallbackMap: Record<string, string> = {
      profileBasics: 'Complete your profile basics with a professional photo, detailed bio, and industry information to make a strong first impression',
      experience: 'Add detailed work experiences with specific achievements and impact metrics to showcase your career progression',
      education: 'Include your educational background and certifications to strengthen your credentials and expertise',
      skills: 'List your key skills with proficiency levels to help others understand your capabilities at a glance',
      portfolio: 'Build a portfolio with 3-5 high-quality projects that demonstrate your best work and expertise',
      engagement: 'Share valuable industry insights through regular pulses to establish yourself as a thought leader',
      network: 'Expand your professional network by connecting with peers, mentors, and industry leaders',
      goalsVision: 'Define your unique value proposition and brand goals to clarify your professional direction'
    };

    return weakestComponents
      .map(c => fallbackMap[c.key] || `Improve your ${c.name} to strengthen your professional brand`)
      .slice(0, 3);
  }
}

export const brandScoreAIAnalyzer = new BrandScoreAIAnalyzer();
