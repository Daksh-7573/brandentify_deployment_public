/**
 * Industry-Specific Mentoring Overlays for Musk AI
 * 
 * This module provides specialized career guidance tailored to specific industries,
 * incorporating industry trends, common career paths, and domain expertise.
 */

export interface IndustryMentorProfile {
  industry: string;
  expertise: string[];
  commonRoles: string[];
  careerProgressionPaths: { [key: string]: string[] };
  keySkills: string[];
  marketTrends: string[];
  certifications: string[];
  networkingOpportunities: string[];
  salaryRanges: { [key: string]: string };
}

export interface IndustryGuidance {
  industryInsights: string[];
  careerAdvice: string[];
  skillRecommendations: string[];
  nextSteps: string[];
  marketContext: string;
}

/**
 * Get industry-specific mentoring guidance
 */
export function getIndustryMentoring(
  industry: string,
  userTitle: string,
  userExperience: any[],
  intent: string
): IndustryGuidance {
  const profile = getIndustryProfile(industry);
  const experienceLevel = calculateExperienceLevel(userExperience);
  
  return {
    industryInsights: generateIndustryInsights(profile, intent),
    careerAdvice: generateCareerAdvice(profile, userTitle, experienceLevel, intent),
    skillRecommendations: generateSkillRecommendations(profile, userTitle, intent),
    nextSteps: generateNextSteps(profile, userTitle, experienceLevel, intent),
    marketContext: generateMarketContext(profile, experienceLevel)
  };
}

/**
 * Industry profiles with specialized knowledge
 */
function getIndustryProfile(industry: string): IndustryMentorProfile {
  const profiles: { [key: string]: IndustryMentorProfile } = {
    'Technology': {
      industry: 'Technology',
      expertise: ['Software Development', 'Product Management', 'Data Science', 'DevOps', 'Cybersecurity'],
      commonRoles: ['Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Technical Lead'],
      careerProgressionPaths: {
        'Software Engineer': ['Senior Software Engineer', 'Tech Lead', 'Engineering Manager', 'Director of Engineering'],
        'Product Manager': ['Senior PM', 'Lead PM', 'Director of Product', 'VP of Product'],
        'Data Scientist': ['Senior Data Scientist', 'Lead Data Scientist', 'Data Science Manager', 'Chief Data Officer']
      },
      keySkills: ['Programming', 'System Design', 'Agile/Scrum', 'Cloud Computing', 'Machine Learning'],
      marketTrends: ['AI/ML adoption', 'Cloud migration', 'Remote work tools', 'Cybersecurity focus', 'Low-code platforms'],
      certifications: ['AWS Certified', 'Google Cloud Professional', 'PMP', 'Scrum Master', 'Kubernetes'],
      networkingOpportunities: ['Tech meetups', 'GitHub contributions', 'Stack Overflow', 'Tech conferences', 'Hackathons'],
      salaryRanges: {
        'entry': '$70K-$100K',
        'mid': '$100K-$150K',
        'senior': '$150K-$250K',
        'executive': '$250K+'
      }
    },
    
    'Healthcare': {
      industry: 'Healthcare',
      expertise: ['Clinical Operations', 'Healthcare Administration', 'Medical Research', 'Health Informatics', 'Patient Care'],
      commonRoles: ['Nurse', 'Doctor', 'Healthcare Administrator', 'Medical Researcher', 'Health Analyst'],
      careerProgressionPaths: {
        'Nurse': ['Charge Nurse', 'Nurse Manager', 'Director of Nursing', 'Chief Nursing Officer'],
        'Administrator': ['Senior Administrator', 'Department Director', 'VP of Operations', 'Chief Executive Officer'],
        'Analyst': ['Senior Analyst', 'Analytics Manager', 'Director of Analytics', 'Chief Data Officer']
      },
      keySkills: ['Patient Care', 'Healthcare Regulations', 'Electronic Health Records', 'Quality Improvement', 'Healthcare Analytics'],
      marketTrends: ['Telemedicine growth', 'AI in diagnostics', 'Value-based care', 'Digital health records', 'Personalized medicine'],
      certifications: ['CPHIMS', 'RHIA', 'PMP', 'Lean Six Sigma', 'CAHIMS'],
      networkingOpportunities: ['Healthcare conferences', 'Medical associations', 'HIMSS events', 'Research symposiums', 'Hospital networks'],
      salaryRanges: {
        'entry': '$50K-$70K',
        'mid': '$70K-$120K',
        'senior': '$120K-$200K',
        'executive': '$200K+'
      }
    },
    
    'Finance': {
      industry: 'Finance',
      expertise: ['Investment Banking', 'Risk Management', 'Financial Planning', 'Fintech', 'Compliance'],
      commonRoles: ['Financial Analyst', 'Investment Banker', 'Risk Manager', 'Financial Advisor', 'Compliance Officer'],
      careerProgressionPaths: {
        'Analyst': ['Senior Analyst', 'Associate', 'VP', 'Director', 'Managing Director'],
        'Advisor': ['Senior Advisor', 'Portfolio Manager', 'Wealth Manager', 'Partner'],
        'Risk Manager': ['Senior Risk Manager', 'Chief Risk Officer', 'Head of Risk', 'Executive Director']
      },
      keySkills: ['Financial Modeling', 'Risk Assessment', 'Regulatory Knowledge', 'Data Analysis', 'Client Relations'],
      marketTrends: ['Digital banking', 'Cryptocurrency adoption', 'ESG investing', 'Robo-advisors', 'Regulatory technology'],
      certifications: ['CFA', 'FRM', 'CPA', 'Series 7', 'CAIA'],
      networkingOpportunities: ['CFA Society', 'Finance conferences', 'Investment clubs', 'Alumni networks', 'Industry associations'],
      salaryRanges: {
        'entry': '$60K-$90K',
        'mid': '$90K-$150K',
        'senior': '$150K-$300K',
        'executive': '$300K+'
      }
    },
    
    'Hospitality': {
      industry: 'Hospitality',
      expertise: ['Hotel Management', 'Guest Services', 'Revenue Management', 'Food & Beverage', 'Event Planning'],
      commonRoles: ['Hotel Manager', 'Guest Services Manager', 'Event Coordinator', 'Restaurant Manager', 'Travel Consultant'],
      careerProgressionPaths: {
        'Manager': ['Senior Manager', 'Director', 'General Manager', 'Regional Director'],
        'Coordinator': ['Senior Coordinator', 'Manager', 'Director of Events', 'VP of Operations'],
        'Consultant': ['Senior Consultant', 'Account Manager', 'Sales Director', 'VP of Sales']
      },
      keySkills: ['Customer Service', 'Revenue Management', 'Team Leadership', 'Cultural Sensitivity', 'Digital Marketing'],
      marketTrends: ['Sustainable tourism', 'Contactless services', 'Personalized experiences', 'Wellness travel', 'Digital transformation'],
      certifications: ['CHA', 'CGSP', 'CMP', 'Revenue Management', 'Hospitality Marketing'],
      networkingOpportunities: ['Hospitality associations', 'Travel trade shows', 'Hotel conferences', 'Tourism boards', 'Industry meetups'],
      salaryRanges: {
        'entry': '$35K-$50K',
        'mid': '$50K-$80K',
        'senior': '$80K-$150K',
        'executive': '$150K+'
      }
    },
    
    'Marketing': {
      industry: 'Marketing',
      expertise: ['Digital Marketing', 'Brand Management', 'Content Strategy', 'Analytics', 'Customer Experience'],
      commonRoles: ['Marketing Manager', 'Digital Marketer', 'Brand Manager', 'Content Strategist', 'Marketing Analyst'],
      careerProgressionPaths: {
        'Manager': ['Senior Manager', 'Marketing Director', 'VP of Marketing', 'Chief Marketing Officer'],
        'Strategist': ['Senior Strategist', 'Strategy Director', 'Head of Strategy', 'Chief Strategy Officer'],
        'Analyst': ['Senior Analyst', 'Analytics Manager', 'Director of Analytics', 'Chief Data Officer']
      },
      keySkills: ['Digital Marketing', 'Data Analysis', 'Content Creation', 'SEO/SEM', 'Marketing Automation'],
      marketTrends: ['AI-powered marketing', 'Privacy-first advertising', 'Influencer marketing', 'Video content', 'Omnichannel experiences'],
      certifications: ['Google Ads', 'Google Analytics', 'HubSpot', 'Facebook Blueprint', 'Salesforce'],
      networkingOpportunities: ['Marketing conferences', 'Digital marketing meetups', 'Brand associations', 'Content communities', 'Analytics groups'],
      salaryRanges: {
        'entry': '$45K-$65K',
        'mid': '$65K-$100K',
        'senior': '$100K-$180K',
        'executive': '$180K+'
      }
    }
  };
  
  return profiles[industry] || createGenericProfile(industry);
}

function createGenericProfile(industry: string): IndustryMentorProfile {
  return {
    industry,
    expertise: ['Leadership', 'Strategy', 'Operations', 'Communication'],
    commonRoles: ['Manager', 'Analyst', 'Coordinator', 'Specialist'],
    careerProgressionPaths: {
      'Manager': ['Senior Manager', 'Director', 'VP'],
      'Analyst': ['Senior Analyst', 'Lead Analyst', 'Manager'],
      'Specialist': ['Senior Specialist', 'Lead Specialist', 'Manager']
    },
    keySkills: ['Leadership', 'Communication', 'Project Management', 'Data Analysis'],
    marketTrends: ['Digital transformation', 'Remote work', 'Sustainability focus', 'Data-driven decisions'],
    certifications: ['PMP', 'Lean Six Sigma', 'Industry certifications'],
    networkingOpportunities: ['Professional associations', 'Industry conferences', 'LinkedIn groups'],
    salaryRanges: {
      'entry': '$40K-$60K',
      'mid': '$60K-$90K',
      'senior': '$90K-$150K',
      'executive': '$150K+'
    }
  };
}

function calculateExperienceLevel(experiences: any[]): string {
  const totalYears = experiences.reduce((total, exp) => {
    const years = calculateYears(exp.startDate, exp.endDate);
    return total + years;
  }, 0);
  
  if (totalYears < 3) return 'entry';
  if (totalYears < 7) return 'mid';
  if (totalYears < 12) return 'senior';
  return 'executive';
}

function calculateYears(startDate: string, endDate?: string): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const years = end.getFullYear() - start.getFullYear();
  
  return Math.max(0, years);
}

function generateIndustryInsights(profile: IndustryMentorProfile, intent: string): string[] {
  const insights = [];
  
  if (intent.includes('industry_insights') || intent.includes('market_trends')) {
    insights.push(...profile.marketTrends.map(trend => `${trend} is shaping the ${profile.industry} industry`));
  }
  
  if (intent.includes('salary') || intent.includes('compensation')) {
    insights.push(`${profile.industry} salary ranges vary significantly by experience level and location`);
  }
  
  if (intent.includes('networking')) {
    insights.push(`${profile.industry} professionals benefit from active participation in industry events`);
  }
  
  return insights.slice(0, 3);
}

function generateCareerAdvice(
  profile: IndustryMentorProfile, 
  userTitle: string, 
  experienceLevel: string, 
  intent: string
): string[] {
  const advice = [];
  
  if (intent.includes('career_transition') || intent.includes('career_advancement')) {
    const relevantPath = findCareerPath(profile, userTitle);
    if (relevantPath.length > 0) {
      const nextRole = relevantPath[0];
      advice.push(`Consider targeting ${nextRole} positions as your next career step`);
      advice.push(`Build experience in ${profile.keySkills.slice(0, 2).join(' and ')} to prepare for advancement`);
    }
  }
  
  if (intent.includes('skill_development')) {
    const topSkills = profile.keySkills.slice(0, 3);
    advice.push(`Focus on developing ${topSkills.join(', ')} skills for ${profile.industry} success`);
  }
  
  if (experienceLevel === 'entry') {
    advice.push(`Early career in ${profile.industry} should focus on building foundational skills and gaining diverse experience`);
  } else if (experienceLevel === 'senior') {
    advice.push(`At your level, consider leadership opportunities and strategic skill development in ${profile.industry}`);
  }
  
  return advice.slice(0, 3);
}

function generateSkillRecommendations(profile: IndustryMentorProfile, userTitle: string, intent: string): string[] {
  const recommendations = [];
  
  if (intent.includes('skill_development') || intent.includes('learning')) {
    recommendations.push(...profile.keySkills.slice(0, 3));
  }
  
  if (intent.includes('certification')) {
    recommendations.push(...profile.certifications.slice(0, 2));
  }
  
  // Add role-specific skills
  const roleMatch = profile.commonRoles.find(role => 
    userTitle.toLowerCase().includes(role.toLowerCase()) || 
    role.toLowerCase().includes(userTitle.toLowerCase())
  );
  
  if (roleMatch) {
    const roleSkills = getRoleSpecificSkills(roleMatch, profile.industry);
    recommendations.push(...roleSkills);
  }
  
  return Array.from(new Set(recommendations)).slice(0, 4);
}

function generateNextSteps(
  profile: IndustryMentorProfile, 
  userTitle: string, 
  experienceLevel: string, 
  intent: string
): string[] {
  const steps = [];
  
  if (intent.includes('goal_setting') || intent.includes('career_planning')) {
    steps.push('Define specific 6-month and 2-year career objectives');
    steps.push(`Research growth opportunities within ${profile.industry}`);
  }
  
  if (intent.includes('networking')) {
    const topNetworking = profile.networkingOpportunities.slice(0, 2);
    steps.push(`Join ${topNetworking.join(' and ')}`);
  }
  
  if (intent.includes('skill_development')) {
    const topCert = profile.certifications[0];
    if (topCert) {
      steps.push(`Consider pursuing ${topCert} certification`);
    }
  }
  
  // Experience-level specific steps
  if (experienceLevel === 'entry') {
    steps.push('Seek mentorship from senior professionals in your field');
  } else if (experienceLevel === 'senior') {
    steps.push('Consider mentoring junior professionals to build leadership skills');
  }
  
  return steps.slice(0, 3);
}

function generateMarketContext(profile: IndustryMentorProfile, experienceLevel: string): string {
  const trends = profile.marketTrends.slice(0, 2).join(' and ');
  const salaryInfo = profile.salaryRanges[experienceLevel] || 'varies';
  
  return `The ${profile.industry} industry is currently experiencing ${trends}. ` +
         `For ${experienceLevel}-level professionals, typical compensation ranges around ${salaryInfo}. ` +
         `Key growth areas include ${profile.keySkills.slice(0, 2).join(' and ')}.`;
}

function findCareerPath(profile: IndustryMentorProfile, userTitle: string): string[] {
  for (const [role, path] of Object.entries(profile.careerProgressionPaths)) {
    if (userTitle.toLowerCase().includes(role.toLowerCase()) || 
        role.toLowerCase().includes(userTitle.toLowerCase())) {
      return path;
    }
  }
  
  return [`Senior ${userTitle}`, `Lead ${userTitle}`];
}

function getRoleSpecificSkills(role: string, industry: string): string[] {
  const skillMap: { [key: string]: { [key: string]: string[] } } = {
    'Technology': {
      'Software Engineer': ['System Design', 'Code Review', 'Testing'],
      'Product Manager': ['Roadmap Planning', 'User Research', 'Metrics Analysis'],
      'Data Scientist': ['Statistical Analysis', 'Machine Learning', 'Data Visualization']
    },
    'Healthcare': {
      'Nurse': ['Patient Assessment', 'Care Planning', 'Medical Documentation'],
      'Administrator': ['Healthcare Regulations', 'Budget Management', 'Quality Assurance'],
      'Analyst': ['Healthcare Data', 'EHR Systems', 'Clinical Research']
    },
    'Finance': {
      'Analyst': ['Financial Modeling', 'Valuation', 'Market Research'],
      'Advisor': ['Portfolio Management', 'Client Relations', 'Investment Strategy'],
      'Manager': ['Risk Assessment', 'Team Leadership', 'Regulatory Compliance']
    }
  };
  
  return skillMap[industry]?.[role] || ['Communication', 'Leadership'];
}

/**
 * Get industry-specific response enhancement
 */
export function enhanceResponseWithIndustryContext(
  baseResponse: string,
  industry: string,
  userTitle: string,
  intent: string
): string {
  const guidance = getIndustryMentoring(industry, userTitle, [], intent);
  
  if (guidance.marketContext && intent.includes('industry')) {
    return baseResponse + '\n\n' + guidance.marketContext;
  }
  
  if (guidance.careerAdvice.length > 0 && intent.includes('career')) {
    const topAdvice = guidance.careerAdvice[0];
    return baseResponse + '\n\n💡 ' + topAdvice;
  }
  
  return baseResponse;
}