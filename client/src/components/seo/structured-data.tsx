import { useEffect } from 'react';

export function AuthPageStructuredData() {
  useEffect(() => {
    // WebPage structured data
    const webpageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Sign In - Brandentify',
      description: 'Secure authentication portal for Brandentify AI career platform',
      url: 'https://brandentify.com/auth',
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'Brandentify',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '1250'
        }
      }
    };
    
    // Organization structured data
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Brandentify',
      url: 'https://brandentify.com',
      logo: 'https://brandentify.com/logo.png',
      sameAs: [
        'https://twitter.com/brandentify',
        'https://linkedin.com/company/brandentify',
        'https://facebook.com/brandentify'
      ],
      description: 'AI-powered career development platform for professional networking and growth'
    };
    
    // Create script tags
    const schemas = [webpageSchema, organizationSchema];
    
    schemas.forEach((schema, index) => {
      let script = document.getElementById(`structured-data-${index}`) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = `structured-data-${index}`;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    });
    
    // Cleanup
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`structured-data-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);
  
  return null;
}
