import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface CreatePulseStructuredDataProps {
  contentType?: 'poll' | 'media' | 'project' | null;
  industry?: string;
  domain?: string;
}

export default function CreatePulseStructuredData({ contentType, industry, domain }: CreatePulseStructuredDataProps) {
  const [location] = useLocation();

  useEffect(() => {
    // Base WebApplication schema
    const webApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Brandentify Create Pulse",
      "description": "Industry content creation platform for polls, media sharing, and professional networking",
      "url": "https://brandentify.com/create-pulse",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Industry Polls",
        "Media Sharing", 
        "Project Showcase",
        "Professional Networking"
      ],
      "screenshot": "https://brandentify.com/create-pulse-screenshot.jpg",
      "softwareVersion": "1.0",
      "author": {
        "@type": "Organization",
        "name": "Brandentify",
        "url": "https://brandentify.com"
      }
    };

    // Content type specific schemas
    const getContentSpecificSchema = () => {
      switch (contentType) {
        case 'poll':
          return {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": "Industry Poll Creation Tool",
            "description": "Create professional industry polls to gather insights and opinions from your professional network",
            "url": "https://brandentify.com/create-pulse?type=poll",
            "about": industry ? `Industry ${industry} polls and surveys` : "Professional industry polls",
            "keywords": "industry polls, professional surveys, opinion polls, industry insights",
            "inLanguage": "en",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Brandentify",
              "url": "https://brandentify.com"
            }
          };
        case 'media':
          return {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": "Industry Media Sharing Tool", 
            "description": "Share industry media content including images and videos with your professional network",
            "url": "https://brandentify.com/create-pulse?type=media",
            "about": industry ? `Industry ${industry} media and content sharing` : "Professional media sharing",
            "keywords": "industry media, professional content sharing, media upload, industry news",
            "inLanguage": "en",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Brandentify",
              "url": "https://brandentify.com"
            }
          };
        case 'project':
          return {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": "Industry Project Showcase Tool",
            "description": "Showcase your industry projects and professional achievements to build your portfolio",
            "url": "https://brandentify.com/create-pulse?type=project",
            "about": industry ? `Industry ${industry} projects and portfolio` : "Professional project showcase",
            "keywords": "industry projects, professional portfolio, project showcase, career achievements",
            "inLanguage": "en",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Brandentify",
              "url": "https://brandentify.com"
            }
          };
        default:
          return null;
      }
    };

    // CreativeWorkService schema for content creation
    const creativeWorkServiceSchema = {
      "@context": "https://schema.org",
      "@type": "CreativeWorkService",
      "name": "Industry Content Creation Service",
      "description": "Professional content creation tools for industry polls, media sharing, and project showcases",
      "url": "https://brandentify.com/create-pulse",
      "provider": {
        "@type": "Organization",
        "name": "Brandentify",
        "url": "https://brandentify.com"
      },
      "serviceType": "Content Creation",
      "area": "Professional Networking",
      "areaServed": industry ? industry : "Industry Content",
      "domain": domain ? domain : "Professional Development",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Content Creation Tools",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Industry Poll Creation",
              "description": "Create professional industry polls"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Media Content Sharing",
              "description": "Share industry media and content"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Project Showcase",
              "description": "Showcase professional projects"
            }
          }
        ]
      }
    };

    // Organization schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Brandentify",
      "url": "https://brandentify.com",
      "logo": "https://brandentify.com/logo.png",
      "description": "Professional industry content creation and networking platform",
      "sameAs": [
        "https://twitter.com/brandentify",
        "https://linkedin.com/company/brandentify"
      ]
    };

    // Combine all schemas
    const schemas = [
      webApplicationSchema,
      creativeWorkServiceSchema,
      organizationSchema
    ];

    // Add content-specific schema if available
    const contentSpecificSchema = getContentSpecificSchema();
    if (contentSpecificSchema) {
      schemas.push(contentSpecificSchema);
    }

    // Create or update structured data script
    let scriptTag = document.getElementById('create-pulse-structured-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.id = 'create-pulse-structured-data';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(schemas, null, 2);

    // Cleanup function
    return () => {
      const scriptTag = document.getElementById('create-pulse-structured-data');
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [contentType, industry, domain, location]);

  return null; // This component doesn't render anything
}
