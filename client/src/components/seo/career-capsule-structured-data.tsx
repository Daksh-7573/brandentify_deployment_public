import { useEffect } from 'react';

export function CareerCapsuleStructuredData() {
  useEffect(() => {
    // WebApplication structured data for career planning platform
    const webApplicationSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Brandentify Career Capsule',
      description: 'AI-powered career goal planning and milestone tracking platform that helps professionals achieve their career ambitions',
      url: 'https://brandentify.com/career-capsule',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        'Career Goal Setting',
        'AI-Generated Milestones',
        'Progress Tracking',
        'Career Planning',
        'Professional Development',
        'Milestone Management'
      ],
      provider: {
        '@type': 'Organization',
        name: 'Brandentify',
        url: 'https://brandentify.com'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2100'
      }
    };
    
    // CareerService structured data
    const careerServiceSchema = {
      '@context': 'https://schema.org',
      '@type': 'CareerService',
      name: 'Brandentify Career Planning Service',
      description: 'AI-powered career planning service with personalized milestone generation and progress tracking',
      url: 'https://brandentify.com/career-capsule',
      provider: {
        '@type': 'Organization',
        name: 'Brandentify',
        url: 'https://brandentify.com'
      },
      serviceType: 'Career Planning and Development',
      area: 'Professional',
      offers: {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Career Planning',
          description: 'Personalized career goal planning with AI-generated milestones'
        },
        price: '0',
        priceCurrency: 'USD'
      },
      area: 'Professional Development',
      audience: {
        '@type': 'Audience',
        audienceType: 'Professionals seeking career advancement'
      }
    };
    
    // WebPage structured data
    const webpageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Career Capsule - AI-Powered Goal Planning',
      description: 'Set career goals with AI-generated milestones. Track progress, get personalized career development plans, and achieve your professional ambitions.',
      url: 'https://brandentify.com/career-capsule',
      mainEntity: webApplicationSchema,
      about: {
        '@type': 'Thing',
        name: 'Career Planning'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://brandentify.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Career Capsule',
            item: 'https://brandentify.com/career-capsule'
          }
        ]
      }
    };
    
    // Person schema for career professionals
    const personSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Career Professional',
      description: 'Professional using Brandentify Career Capsule for career planning and development',
      knowsAbout: [
        'Career Planning',
        'Goal Setting',
        'Professional Development',
        'Career Advancement'
      ],
      uses: {
        '@type': 'WebApplication',
        name: 'Brandentify Career Capsule',
        url: 'https://brandentify.com/career-capsule'
      }
    };
    
    // Create script tags
    const schemas = [webApplicationSchema, careerServiceSchema, webpageSchema, personSchema];
    
    schemas.forEach((schema, index) => {
      let script = document.getElementById(`career-capsule-structured-data-${index}`) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = `career-capsule-structured-data-${index}`;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    });
    
    // Cleanup
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`career-capsule-structured-data-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);
  
  return null;
}
