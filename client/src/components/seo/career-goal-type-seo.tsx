import { useEffect } from 'react';

interface CareerGoalTypeSEOProps {
  goalType?: string;
  goalCount?: number;
}

export function CareerGoalTypeSEO({ goalType, goalCount = 0 }: CareerGoalTypeSEOProps) {
  useEffect(() => {
    let title = 'Career Capsule - AI-Powered Goal Planning | Brandentify';
    let description = 'Set career goals with AI-generated milestones. Track progress, get personalized career development plans, and achieve your professional ambitions.';
    
    // Dynamic titles based on goal type
    if (goalType) {
      const goalTypeTitles: Record<string, string> = {
        'promotion': 'Career Promotion Goals | Brandentify',
        'position-change': 'Career Position Change Goals | Brandentify',
        'skill-acquisition': 'Skill Acquisition Goals | Brandentify',
        'industry-switch': 'Industry Switch Goals | Brandentify',
        'entrepreneurship': 'Entrepreneurship Goals | Brandentify',
        'relocation': 'Career Relocation Goals | Brandentify',
        'education': 'Education & Certification Goals | Brandentify',
        'salary-increase': 'Salary Increase Goals | Brandentify',
        'leadership': 'Leadership Development Goals | Brandentify',
        'custom': 'Custom Career Goals | Brandentify'
      };
      
      const goalTypeDescriptions: Record<string, string> = {
        'promotion': `Create ${goalCount} career promotion goals with AI-generated milestones. Get personalized steps to advance to your next position with Brandentify's AI-powered planning.`,
        'position-change': `Set ${goalCount} career position change goals with AI-generated milestones. Plan your career transition with personalized steps and progress tracking.`,
        'skill-acquisition': `Create ${goalCount} skill acquisition goals with AI-generated milestones. Develop new professional skills with personalized learning paths and progress tracking.`,
        'industry-switch': `Plan ${goalCount} industry switch goals with AI-generated milestones. Navigate career transitions with personalized steps and industry-specific guidance.`,
        'entrepreneurship': `Set ${goalCount} entrepreneurship goals with AI-generated milestones. Launch your business with personalized startup steps and progress tracking.`,
        'relocation': `Create ${goalCount} career relocation goals with AI-generated milestones. Plan your career move with personalized steps and location-specific guidance.`,
        'education': `Set ${goalCount} education and certification goals with AI-generated milestones. Advance your qualifications with personalized learning paths and progress tracking.`,
        'salary-increase': `Create ${goalCount} salary increase goals with AI-generated milestones. Plan your salary advancement with personalized steps and market insights.`,
        'leadership': `Develop ${goalCount} leadership goals with AI-generated milestones. Build your leadership skills with personalized development plans and progress tracking.`,
        'custom': `Create ${goalCount} custom career goals with AI-generated milestones. Set personalized career objectives with tailored steps and progress tracking.`
      };
      
      title = goalTypeTitles[goalType] || title;
      description = goalTypeDescriptions[goalType] || description;
    }
    
    // Update document title
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);
    
    // Update canonical URL if goal type is specified
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const canonicalUrl = goalType 
      ? `https://brandentify.com/career-capsule/${goalType}`
      : 'https://brandentify.com/career-capsule';
    canonical.setAttribute('href', canonicalUrl);
    
  }, [goalType, goalCount]);
  
  return null;
}
