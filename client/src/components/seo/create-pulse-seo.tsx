import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CreatePulseSEOProps {
  contentType?: 'poll' | 'media' | 'project' | null;
  industry?: string;
  domain?: string;
}

export default function CreatePulseSEO({ contentType, industry, domain }: CreatePulseSEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Dynamic content type titles and descriptions
    const getContentMeta = () => {
      switch (contentType) {
        case 'poll':
          return {
            title: 'Create Industry Poll - Professional Content Creation | Brandentify',
            description: 'Create engaging industry polls to gather insights and opinions from professionals. Share your perspective and drive meaningful discussions in your field.',
            keywords: 'industry polls, professional surveys, opinion polls, industry insights, professional networking, content creation'
          };
        case 'media':
          return {
            title: 'Share Industry Media - Professional Content Platform | Brandentify',
            description: 'Share industry media content including images and videos. Showcase professional updates, achievements, and industry news with your network.',
            keywords: 'industry media, professional content sharing, media upload, industry news, professional updates, content creation'
          };
        case 'project':
          return {
            title: 'Showcase Industry Projects - Professional Portfolio | Brandentify',
            description: 'Showcase your industry projects and professional achievements. Build your portfolio and demonstrate expertise to potential employers and clients.',
            keywords: 'industry projects, professional portfolio, project showcase, career achievements, expertise demonstration, content creation'
          };
        default:
          return {
            title: 'Create Pulse - Industry Content Creation | Brandentify',
            description: 'Create and share industry content with polls, media, and projects. Engage with professionals in your industry and build your professional brand.',
            keywords: 'content creation, industry polls, professional networking, media sharing, industry content, professional branding'
          };
        }
      };

    const meta = getContentMeta();

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        if (name.startsWith('og:')) {
          tag.setAttribute('property', name);
        } else if (name.startsWith('twitter:')) {
          tag.setAttribute('name', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update page title
    document.title = meta.title;

    // Update meta description
    updateMetaTag('description', meta.description);

    // Update meta keywords
    updateMetaTag('keywords', meta.keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', meta.title);
    updateMetaTag('og:description', meta.description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:image', 'https://brandentify.com/create-pulse-og-image.jpg');
    updateMetaTag('og:url', `https://brandentify.com${location.pathname}`);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', meta.title);
    updateMetaTag('twitter:description', meta.description);
    updateMetaTag('twitter:image', 'https://brandentify.com/create-pulse-og-image.jpg');

    // Update canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', `https://brandentify.com${location.pathname}`);

    // Add industry-specific meta if provided
    if (industry) {
      updateMetaTag('article:section', industry);
      updateMetaTag('industry', industry);
    }

    // Add domain-specific meta if provided
    if (domain) {
      updateMetaTag('article:tag', domain);
      updateMetaTag('domain', domain);
    }

    // Add content type meta if provided
    if (contentType) {
      updateMetaTag('content-type', contentType);
      updateMetaTag('article:section', `create-${contentType}`);
    }

    // Cleanup function
    return () => {
      // Tags will be updated/overwritten on next page navigation
    };
  }, [contentType, industry, domain, location.pathname]);

  return null; // This component doesn't render anything
}
