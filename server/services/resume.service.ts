import { AIProviderService } from "./ai-provider.service";

export class ResumeService {
  static async analyzeResume(text: string): Promise<string> {
    console.log("[Resume] Text length:", text.length);

    const prompt = `
You are a professional resume analyst.

Analyze the following resume and provide:
1. Strengths
2. Weaknesses
3. Improvement suggestions
4. Overall score out of 10

Resume:
${text}
`;

    return await AIProviderService.generate(prompt);
  }
}
