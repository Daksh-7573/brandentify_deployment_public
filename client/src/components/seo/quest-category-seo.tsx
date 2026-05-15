import { useEffect } from 'react';

interface QuestCategorySEOProps {
  category?: string;
  questCount?: number;
}

export function QuestCategorySEO({ category, questCount = 0 }: QuestCategorySEOProps) {
  useEffect(() => {
    let title = 'Brand Quests - Professional Development Challenges | Brandentify';
    let description = 'Complete professional development quests to earn XP and badges. Accelerate your career growth with gamified learning challenges.';
    
    // Dynamic titles based on category
    if (category) {
      const categoryTitles: Record<string, string> = {
        'technical': 'Technical Skills Quests | Brandentify',
        'leadership': 'Leadership Development Quests | Brandentify',
        'communication': 'Communication Skills Quests | Brandentify',
        'project-management': 'Project Management Quests | Brandentify',
        'marketing': 'Marketing Skills Quests | Brandentify',
        'sales': 'Sales Development Quests | Brandentify',
        'design': 'Design Skills Quests | Brandentify',
        'data-science': 'Data Science Quests | Brandentify',
        'ai-ml': 'AI & Machine Learning Quests | Brandentify',
        'career-growth': 'Career Growth Quests | Brandentify'
      };
      
      const categoryDescriptions: Record<string, string> = {
        'technical': `Complete ${questCount} technical skill quests to enhance your programming and development abilities. Earn XP and badges in software engineering, web development, and more.`,
        'leadership': `Complete ${questCount} leadership development quests to build your management skills. Earn XP and badges in team leadership, strategic thinking, and executive presence.`,
        'communication': `Complete ${questCount} communication skills quests to improve your professional interactions. Earn XP and badges in public speaking, writing, and interpersonal skills.`,
        'project-management': `Complete ${questCount} project management quests to master project delivery. Earn XP and badges in Agile, Scrum, and project execution.`,
        'marketing': `Complete ${questCount} marketing skills quests to advance your marketing career. Earn XP and badges in digital marketing, content strategy, and brand management.`,
        'sales': `Complete ${questCount} sales development quests to boost your sales performance. Earn XP and badges in prospecting, closing, and customer relationship management.`,
        'design': `Complete ${questCount} design skills quests to enhance your creative abilities. Earn XP and badges in UI/UX design, graphic design, and creative thinking.`,
        'data-science': `Complete ${questCount} data science quests to master data analysis. Earn XP and badges in machine learning, statistics, and data visualization.`,
        'ai-ml': `Complete ${questCount} AI and machine learning quests to stay ahead in tech. Earn XP and badges in artificial intelligence, deep learning, and AI applications.`,
        'career-growth': `Complete ${questCount} career growth quests to accelerate your professional journey. Earn XP and badges in career planning, networking, and personal branding.`
      };
      
      title = categoryTitles[category] || title;
      description = categoryDescriptions[category] || description;
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
    
    // Update canonical URL if category is specified
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const canonicalUrl = category 
      ? `https://brandentify.com/brand-quests/${category}`
      : 'https://brandentify.com/brand-quests';
    canonical.setAttribute('href', canonicalUrl);
    
  }, [category, questCount]);
  
  return null;
}
