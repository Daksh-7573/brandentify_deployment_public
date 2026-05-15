import { useEffect } from 'react';

export function BrandQuestsStructuredData() {
  useEffect(() => {
    // Game structured data for quest system
    const gameSchema = {
      '@context': 'https://schema.org',
      '@type': 'Game',
      name: 'Brand Quests',
      description: 'Professional development quest system for career growth through gamified learning challenges',
      applicationCategory: 'EducationalGame',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      gamePlatform: 'Web Browser',
      genre: ['Educational', 'Professional Development', 'Career Growth'],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1250'
      },
      provider: {
        '@type': 'Organization',
        name: 'Brandentify',
        url: 'https://brandentify.com'
      }
    };
    
    // EducationalOrganization schema
    const educationSchema = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Brandentify Quest Platform',
      description: 'AI-powered gamified professional development platform',
      url: 'https://brandentify.com/brand-quests',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Professional Development Quests',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Skill Development Quests',
              description: 'Interactive quests for professional skill development'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Course',
              name: 'Career Growth Challenges',
              description: 'Gamified challenges for career advancement'
            }
          }
        ]
      }
    };
    
    // Achievement schema for XP and badges
    const achievementSchema = {
      '@context': 'https://schema.org',
      '@type': 'Achievement',
      name: 'Professional Development Achievements',
      description: 'XP points and badges earned through completing professional development quests',
      award: 'XP Points and Digital Badges',
      category: 'Professional Development',
      provider: {
        '@type': 'Organization',
        name: 'Brandentify'
      }
    };
    
    // WebPage schema
    const webpageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Brand Quests - Professional Development Challenges',
      description: 'Complete professional development quests to earn XP and badges. Accelerate your career growth with gamified learning challenges.',
      url: 'https://brandentify.com/brand-quests',
      mainEntity: gameSchema,
      about: {
        '@type': 'Thing',
        name: 'Professional Development'
      }
    };
    
    // Create script tags
    const schemas = [gameSchema, educationSchema, achievementSchema, webpageSchema];
    
    schemas.forEach((schema, index) => {
      let script = document.getElementById(`brand-quests-structured-data-${index}`) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = `brand-quests-structured-data-${index}`;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    });
    
    // Cleanup
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`brand-quests-structured-data-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);
  
  return null;
}
