import { useEffect } from 'react';

export function AuthPageSEO() {
  useEffect(() => {
    // Update document title
    document.title = 'Sign In - Brandentify | AI-Powered Career Platform';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Secure sign in to Brandentify - AI-powered career development platform for professional growth and networking. Access your personalized career dashboard.');
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'sign in, login, authentication, career platform, professional networking, AI career guidance, brandentify login');
    
    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Sign In - Brandentify' },
      { property: 'og:description', content: 'Access your AI-powered career development dashboard. Secure authentication for professional growth.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://brandentify.com/auth' },
      { property: 'og:image', content: 'https://brandentify.com/auth-og-image.jpg' },
      { property: 'og:site_name', content: 'Brandentify' },
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
      { name: 'twitter:title', content: 'Sign In - Brandentify' },
      { name: 'twitter:description', content: 'Access your AI-powered career development dashboard' },
      { name: 'twitter:image', content: 'https://brandentify.com/auth-og-image.jpg' },
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
    canonical.setAttribute('href', 'https://brandentify.com/auth');
    
    // Robots meta
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'index, follow');
    
    // Cleanup on unmount
    return () => {
      document.title = 'Brandentify - Professional Networking & AI-Powered Career Platform';
    };
  }, []);
  
  return null;
}
