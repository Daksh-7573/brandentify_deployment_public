import { useEffect } from 'react';

export function CareerCapsuleSEO() {
  useEffect(() => {
    // Update document title
    document.title = 'Career Capsule - AI-Powered Goal Planning | Brandentify';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Set career goals with AI-generated milestones. Track progress, get personalized career development plans, and achieve your professional ambitions with Brandentify\'s AI-powered career planning platform.');
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'career planning, goal setting, career development, AI milestones, career goals, professional growth, career advancement, AI career planning, milestone tracking');
    
    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Career Capsule - AI-Powered Goal Planning' },
      { property: 'og:description', content: 'Create career goals with AI-generated milestones and track your professional development progress' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://brandentify.com/career-capsule' },
      { property: 'og:image', content: 'https://brandentify.com/career-capsule-og-image.jpg' },
      { property: 'og:site_name', content: 'Brandentify' },
      { property: 'og:image:alt', content: 'Career Capsule - AI-Powered Career Planning Platform' },
    ];
    
    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Career Capsule - AI-Powered Goal Planning' },
      { name: 'twitter:description', content: 'Create career goals with AI-generated milestones and track your professional development progress' },
      { name: 'twitter:image', content: 'https://brandentify.com/career-capsule-og-image.jpg' },
      { name: 'twitter:creator', content: '@brandentify' },
    ];
    
    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://brandentify.com/career-capsule');
    
    // Robots meta
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'index, follow');
    
    // Additional meta tags for career planning
    const additionalTags = [
      { name: 'theme-color', content: '#121212' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'application-name', content: 'Career Capsule' },
      { name: 'subject', content: 'Career Planning and Goal Setting' },
    ];
    
    additionalTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Cleanup on unmount
    return () => {
      document.title = 'Brandentify - Professional Networking & AI-Powered Career Platform';
    };
  }, []);
  
  return null;
}
