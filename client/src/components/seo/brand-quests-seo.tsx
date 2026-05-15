import { useEffect } from 'react';

export function BrandQuestsSEO() {
  useEffect(() => {
    // Update document title
    document.title = 'Brand Quests - Professional Development Challenges | Brandentify';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Complete professional development quests to earn XP and badges. Accelerate your career growth with gamified learning challenges and skill development tasks.');
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'professional development, career quests, gamified learning, XP system, skill development, career growth, professional challenges, brandentify quests');
    
    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Brand Quests - Professional Development Challenges' },
      { property: 'og:description', content: 'Earn XP and badges while developing professional skills through interactive quests and challenges' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://brandentify.com/brand-quests' },
      { property: 'og:image', content: 'https://brandentify.com/quests-og-image.jpg' },
      { property: 'og:site_name', content: 'Brandentify' },
      { property: 'og:image:alt', content: 'Brand Quests - Professional Development Platform' },
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
      { name: 'twitter:title', content: 'Brand Quests - Professional Development' },
      { name: 'twitter:description', content: 'Earn XP and badges while developing professional skills through interactive quests' },
      { name: 'twitter:image', content: 'https://brandentify.com/quests-og-image.jpg' },
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
    canonical.setAttribute('href', 'https://brandentify.com/brand-quests');
    
    // Robots meta
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'index, follow');
    
    // Additional meta tags for gamification
    const additionalTags = [
      { name: 'theme-color', content: '#121212' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'application-name', content: 'Brand Quests' },
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
