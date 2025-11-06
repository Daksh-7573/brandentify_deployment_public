import type { IStorage } from '../storage';

export interface BrandScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'missing';
  suggestions: string[];
}

export interface BrandScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  components: {
    profileBasics: BrandScoreComponent;
    experience: BrandScoreComponent;
    education: BrandScoreComponent;
    skills: BrandScoreComponent;
    portfolio: BrandScoreComponent;
    engagement: BrandScoreComponent;
    network: BrandScoreComponent;
    goalsVision: BrandScoreComponent;
  };
  aiSuggestions: string[];
  lastUpdated: Date;
}

export class BrandScoreCalculator {
  constructor(private storage: IStorage) {}

  async calculateBrandScore(userId: number): Promise<BrandScore> {
    const user = await this.storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const [experiences, educations, skills, projects, pulses, connections] = await Promise.all([
      this.storage.getWorkExperiencesByUserId(userId),
      this.storage.getEducationsByUserId(userId),
      this.storage.getSkillsByUserId(userId),
      this.storage.getProjectsByUserId(userId),
      this.storage.getPulsesByUserId(userId),
      this.storage.getConnectionsByUserId(userId)
    ]);

    const profileBasics = this.scoreProfileBasics(user);
    const experience = this.scoreExperience(experiences || []);
    const education = this.scoreEducation(educations || []);
    const skillsScore = this.scoreSkills(skills || []);
    const portfolio = this.scorePortfolio(projects || []);
    const engagement = this.scoreEngagement(pulses || []);
    const network = this.scoreNetwork(connections || []);
    const goalsVision = this.scoreGoalsVision(user);

    const totalScore = 
      profileBasics.score +
      experience.score +
      education.score +
      skillsScore.score +
      portfolio.score +
      engagement.score +
      network.score +
      goalsVision.score;

    const maxScore = 100;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const grade = this.calculateGrade(percentage);

    return {
      totalScore: Math.round(totalScore),
      maxScore,
      percentage,
      grade,
      components: {
        profileBasics,
        experience,
        education,
        skills: skillsScore,
        portfolio,
        engagement,
        network,
        goalsVision
      },
      aiSuggestions: [],
      lastUpdated: new Date()
    };
  }

  private scoreProfileBasics(user: any): BrandScoreComponent {
    const maxScore = 20;
    let score = 0;
    const suggestions: string[] = [];

    if (user.name) score += 2;
    else suggestions.push('Add your full name to personalize your profile');

    if (user.title) score += 3;
    else suggestions.push('Add a professional title to help others understand your expertise');

    if (user.aboutMe && user.aboutMe.length > 50) score += 4;
    else if (user.aboutMe) {
      score += 2;
      suggestions.push('Expand your about section to at least 50 characters for better visibility');
    } else {
      suggestions.push('Write a compelling about section to showcase your professional story');
    }

    if (user.location) score += 2;
    else suggestions.push('Add your location to help with networking opportunities');

    if (user.industry) score += 3;
    else suggestions.push('Specify your industry to connect with relevant professionals');

    if (user.domain) score += 2;
    else suggestions.push('Add your domain/specialization to stand out in your field');

    if (user.photoURL) score += 4;
    else suggestions.push('Upload a professional profile photo - profiles with photos get 14x more views');

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Profile Basics',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreExperience(experiences: any[]): BrandScoreComponent {
    const maxScore = 15;
    let score = 0;
    const suggestions: string[] = [];

    if (experiences.length === 0) {
      suggestions.push('Add your work experience to build credibility');
      return {
        name: 'Work Experience',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(experiences.length * 3, 9);

    const detailedExperiences = experiences.filter(exp => 
      exp.description && exp.description.length > 100
    );
    score += Math.min(detailedExperiences.length * 2, 6);

    if (experiences.length < 2) {
      suggestions.push('Add more work experiences to showcase your career journey');
    }

    const needsDetails = experiences.length - detailedExperiences.length;
    if (needsDetails > 0) {
      suggestions.push(`Add detailed descriptions to ${needsDetails} experience${needsDetails > 1 ? 's' : ''} (at least 100 characters)`);
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Work Experience',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreEducation(educations: any[]): BrandScoreComponent {
    const maxScore = 10;
    let score = 0;
    const suggestions: string[] = [];

    if (educations.length === 0) {
      suggestions.push('Add your educational background to enhance credibility');
      return {
        name: 'Education',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(educations.length * 5, 10);

    if (educations.length < 2 && educations.some(edu => edu.degree && !edu.degree.toLowerCase().includes('phd'))) {
      suggestions.push('Consider adding certifications or additional degrees to strengthen your profile');
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Education',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreSkills(skills: any[]): BrandScoreComponent {
    const maxScore = 15;
    let score = 0;
    const suggestions: string[] = [];

    if (skills.length === 0) {
      suggestions.push('Add your skills to help others discover your expertise');
      return {
        name: 'Skills',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(skills.length * 1.5, 12);

    const skillsWithProficiency = skills.filter(s => s.proficiency && s.proficiency > 0);
    score += Math.min(skillsWithProficiency.length * 0.3, 3);

    if (skills.length < 5) {
      suggestions.push(`Add ${5 - skills.length} more skills to reach the recommended minimum of 5`);
    }

    if (skillsWithProficiency.length < skills.length) {
      suggestions.push('Set proficiency levels for all your skills to showcase your expertise accurately');
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Skills',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scorePortfolio(projects: any[]): BrandScoreComponent {
    const maxScore = 15;
    let score = 0;
    const suggestions: string[] = [];

    if (projects.length === 0) {
      suggestions.push('Showcase your work by adding projects to your portfolio');
      return {
        name: 'Portfolio',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(projects.length * 4, 12);

    const projectsWithImages = projects.filter(p => p.imageUrl || (p.imageUrls && p.imageUrls.length > 0));
    score += Math.min(projectsWithImages.length * 0.5, 3);

    if (projects.length < 3) {
      suggestions.push(`Add ${3 - projects.length} more projects to build a strong portfolio`);
    }

    if (projectsWithImages.length < projects.length) {
      suggestions.push('Add images to all your projects - visual content increases engagement by 80%');
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Portfolio',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreEngagement(pulses: any[]): BrandScoreComponent {
    const maxScore = 10;
    let score = 0;
    const suggestions: string[] = [];

    if (pulses.length === 0) {
      suggestions.push('Start sharing professional content through pulses to build your brand');
      return {
        name: 'Engagement',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(pulses.length * 1, 7);

    const recentPulses = pulses.filter(p => {
      const pulseDate = new Date(p.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return pulseDate >= thirtyDaysAgo;
    });

    score += Math.min(recentPulses.length * 0.5, 3);

    if (pulses.length < 5) {
      suggestions.push(`Share ${5 - pulses.length} more pulses to establish thought leadership`);
    }

    if (recentPulses.length === 0) {
      suggestions.push('Post recent content - consistent activity keeps your brand relevant');
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Engagement',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreNetwork(connections: any[]): BrandScoreComponent {
    const maxScore = 10;
    let score = 0;
    const suggestions: string[] = [];

    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    if (acceptedConnections.length === 0) {
      suggestions.push('Start building your network by connecting with professionals in your field');
      return {
        name: 'Network',
        score: 0,
        maxScore,
        percentage: 0,
        status: 'missing',
        suggestions
      };
    }

    score += Math.min(acceptedConnections.length * 0.5, 10);

    if (acceptedConnections.length < 10) {
      suggestions.push(`Connect with ${10 - acceptedConnections.length} more professionals to expand your network`);
    } else if (acceptedConnections.length < 50) {
      suggestions.push('Keep growing your network - larger networks create more opportunities');
    }

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Network',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private scoreGoalsVision(user: any): BrandScoreComponent {
    const maxScore = 5;
    let score = 0;
    const suggestions: string[] = [];

    if (user.uvp && user.uvp.length > 20) score += 2;
    else if (user.uvp) {
      score += 1;
      suggestions.push('Expand your unique value proposition to better articulate what makes you unique');
    } else {
      suggestions.push('Define your unique value proposition to clarify your professional brand');
    }

    if (user.primaryAudience) score += 1.5;
    else suggestions.push('Identify your primary audience to tailor your brand messaging');

    if (user.brandGoals && user.brandGoals.length > 0) score += 1.5;
    else suggestions.push('Set brand goals to guide your professional development');

    const percentage = Math.round((score / maxScore) * 100);
    return {
      name: 'Goals & Vision',
      score,
      maxScore,
      percentage,
      status: this.getStatus(percentage),
      suggestions
    };
  }

  private getStatus(percentage: number): 'excellent' | 'good' | 'needs_improvement' | 'missing' {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage > 0) return 'needs_improvement';
    return 'missing';
  }

  private calculateGrade(percentage: number): 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F' {
    if (percentage >= 95) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }
}
