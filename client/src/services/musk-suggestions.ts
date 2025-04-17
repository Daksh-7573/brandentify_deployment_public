/**
 * Musk AI Career Assistant Suggested Questions Service
 * This service provides contextual question suggestions based on user profile
 */

// Questions for users looking for job opportunities
export const jobOpportunitiesQuestions = [
  "Where in the world should I apply for jobs?",
  "Which job market is best for someone like me?",
  "What roles are in demand in my industry?",
  "What companies are hiring for my skillset this month?",
  "Should I try remote or hybrid for better growth?",
  "How can I become more visible in my industry?",
  "What kind of posts should I share to build thought leadership?",
  "Write a Pulse post for me based on today's trend.",
  "Which portfolio layout is best for my profile?",
  "How am I perceived based on my activity?"
];

// Questions for users looking for career mentorship
export const careerMentorshipQuestions = [
  "How can I find a good career mentor?",
  "What should I ask a potential mentor?",
  "How can I accelerate my career growth?",
  "What skills should I prioritize learning next?",
  "How do I transition to a leadership role?",
  "Am I on the right career path?",
  "What industry trends should I focus on?",
  "How do I build a personal brand in my field?",
  "Should I specialize or generalize my skills?",
  "Can you review my career progression strategy?"
];

// Questions for users looking for skill development
export const skillDevelopmentQuestions = [
  "What skills are most in-demand in my industry?",
  "How can I learn [specific skill] efficiently?",
  "Which certifications would boost my career?",
  "What's the best resource to learn [technology]?",
  "How can I demonstrate my new skills to employers?",
  "Should I focus on technical or soft skills?",
  "How do I balance skill breadth vs depth?",
  "What skills complement my current expertise?",
  "How can I practice new skills in real scenarios?",
  "Can you create a personalized learning path for me?"
];

// Questions for users looking for networking
export const networkingQuestions = [
  "How can I expand my professional network?",
  "What groups or communities should I join?",
  "How do I make meaningful connections at events?",
  "What's the best way to follow up after networking?",
  "How can I leverage my existing network better?",
  "What should I post to attract industry connections?",
  "How do I reach out to someone I admire professionally?",
  "What networking strategies work best in my industry?",
  "How can I build relationships with industry leaders?",
  "Can you help me craft a networking message template?"
];

// Questions for users looking for business opportunities
export const businessOpportunitiesQuestions = [
  "What business trends are emerging in my industry?",
  "How can I identify new market opportunities?",
  "What business model would work best for my idea?",
  "How do I validate my business concept quickly?",
  "What funding options should I consider?",
  "How can I find potential business partners?",
  "What's the first step to starting my own business?",
  "How do I create a compelling pitch deck?",
  "What metrics should I track in my new venture?",
  "How can I balance innovation with profitability?"
];

// Get questions based on looking for category
export function getSuggestedQuestions(lookingFor: string | null): string[] {
  if (!lookingFor) return [];
  
  // Map lookingFor value to appropriate question set
  if (lookingFor.toLowerCase().includes('job') || 
      lookingFor.toLowerCase().includes('employment') ||
      lookingFor.toLowerCase().includes('work')) {
    return jobOpportunitiesQuestions;
  }
  
  if (lookingFor.toLowerCase().includes('mentor') || 
      lookingFor.toLowerCase().includes('guidance') ||
      lookingFor.toLowerCase().includes('advice')) {
    return careerMentorshipQuestions;
  }
  
  if (lookingFor.toLowerCase().includes('skill') || 
      lookingFor.toLowerCase().includes('learn') ||
      lookingFor.toLowerCase().includes('develop')) {
    return skillDevelopmentQuestions;
  }
  
  if (lookingFor.toLowerCase().includes('network') || 
      lookingFor.toLowerCase().includes('connect') ||
      lookingFor.toLowerCase().includes('relationship')) {
    return networkingQuestions;
  }
  
  if (lookingFor.toLowerCase().includes('business') || 
      lookingFor.toLowerCase().includes('startup') ||
      lookingFor.toLowerCase().includes('venture')) {
    return businessOpportunitiesQuestions;
  }
  
  // Default to job opportunities questions if no match found
  return jobOpportunitiesQuestions;
}

// Get a random question from appropriate set
export function getRandomSuggestedQuestion(lookingFor: string | null): string {
  const questions = getSuggestedQuestions(lookingFor);
  
  if (questions.length === 0) {
    return "How can I help with your career today?";
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Get multiple random questions (with no duplicates)
export function getRandomSuggestedQuestions(lookingFor: string | null, count: number = 3): string[] {
  const allQuestions = getSuggestedQuestions(lookingFor);
  
  if (allQuestions.length === 0) {
    return ["How can I help with your career today?"];
  }
  
  // If requested count is higher than available questions, return all questions
  if (count >= allQuestions.length) {
    return [...allQuestions];
  }
  
  // Shuffle the array using Fisher-Yates algorithm
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Take the first 'count' items
  return shuffled.slice(0, count);
}