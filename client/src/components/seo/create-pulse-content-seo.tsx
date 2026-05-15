import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface CreatePulseContentSEOProps {
  contentType: 'poll' | 'media' | 'project';
  industry?: string;
  domain?: string;
  step?: number;
  totalSteps?: number;
}

export default function CreatePulseContentSEO({ 
  contentType, 
  industry, 
  domain, 
  step = 1, 
  totalSteps = 1 
}: CreatePulseContentSEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Content type specific SEO data
    const getContentSEOData = () => {
      const baseData = {
        poll: {
          title: 'Create Industry Poll - Professional Survey Tool | Brandentify',
          description: 'Create professional industry polls to gather insights and opinions. Engage with your professional network and drive meaningful discussions in your industry.',
          keywords: 'industry polls, professional surveys, opinion polls, industry insights, professional networking, survey creation',
          h1: 'Create Industry Poll',
          h2: 'Share Your Professional Perspective',
          canonical: '/create-pulse?type=poll',
          ogImage: 'https://brandentify.com/create-poll-og-image.jpg'
        },
        media: {
          title: 'Share Industry Media - Professional Content Platform | Brandentify',
          description: 'Share industry media content including images and videos. Showcase professional updates, achievements, and industry news with your network.',
          keywords: 'industry media, professional content sharing, media upload, industry news, professional updates, content creation',
          h1: 'Share Industry Media',
          h2: 'Showcase Your Professional Content',
          canonical: '/create-pulse?type=media',
          ogImage: 'https://brandentify.com/share-media-og-image.jpg'
        },
        project: {
          title: 'Showcase Industry Project - Professional Portfolio | Brandentify',
          description: 'Showcase your industry projects and professional achievements. Build your portfolio and demonstrate expertise to potential employers and clients.',
          keywords: 'industry projects, professional portfolio, project showcase, career achievements, expertise demonstration, portfolio building',
          h1: 'Showcase Industry Project',
          h2: 'Demonstrate Your Professional Expertise',
          canonical: '/create-pulse?type=project',
          ogImage: 'https://brandentify.com/showcase-project-og-image.jpg'
        }
      };

      return baseData[contentType];
    };

    const seoData = getContentSEOData();

    // Update page title with step information if applicable
    const title = totalSteps > 1 
      ? `${seoData.title} - Step ${step} of ${totalSteps}`
      : seoData.title;

    // Update description with industry context if provided
    const description = industry 
      ? `${seoData.description} Connect with ${industry} professionals and share relevant content.`
      : seoData.description;

    // Update keywords with industry and domain context
    const keywords = [
      ...seoData.keywords.split(', '),
      ...(industry ? [industry, `${industry} professionals`, `${industry} content`] : []),
      ...(domain ? [domain, `${domain} expertise`, `${domain} projects`] : []),
      'professional content creation',
      'industry networking',
      'career development'
    ].join(', ');

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
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:image', seoData.ogImage);
    updateMetaTag('og:url', `https://brandentify.com${seoData.canonical}`);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', seoData.ogImage);

    // Update canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', `https://brandentify.com${seoData.canonical}`);

    // Add industry-specific meta tags
    if (industry) {
      updateMetaTag('article:section', industry);
      updateMetaTag('industry', industry);
      updateMetaTag('target-industry', industry);
    }

    // Add domain-specific meta tags
    if (domain) {
      updateMetaTag('article:tag', domain);
      updateMetaTag('domain', domain);
      updateMetaTag('expertise-area', domain);
    }

    // Add content type and step meta tags
    updateMetaTag('content-type', contentType);
    updateMetaTag('creation-step', step.toString());
    if (totalSteps > 1) {
      updateMetaTag('total-steps', totalSteps.toString());
    }

    // Add structured data for specific content type
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": seoData.h1,
      "description": description,
      "url": `https://brandentify.com${seoData.canonical}`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Brandentify",
        "url": "https://brandentify.com"
      },
      "about": {
        "@type": "Thing",
        "name": industry ? `${industry} ${contentType}` : `Professional ${contentType}`,
        "description": `Professional ${contentType} creation and sharing`
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Professionals"
      },
      "inLanguage": "en",
      "keywords": keywords,
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": `${seoData.h1} Tool`,
        "description": description,
        "applicationCategory": "Content Creation",
        "operatingSystem": "Web Browser"
      }
    };

    // Create or update structured data script
    let scriptTag = document.getElementById('create-pulse-content-structured-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'create-pulse-content-structured-data';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(structuredData, null, 2);

    // Update H1 and H2 elements if they exist
    const h1Element = document.querySelector('h1');
    if (h1Element) {
      h1Element.textContent = seoData.h1;
    }

    const h2Elements = document.querySelectorAll('h2');
    if (h2Elements.length > 0) {
      h2Elements[0].textContent = seoData.h2;
    }

    // Cleanup function
    return () => {
      const scriptTag = document.getElementById('create-pulse-content-structured-data');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [contentType, industry, domain, step, totalSteps, location.pathname]);

  return null; // This component doesn't render anything
}
