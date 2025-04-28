import React, { useState, useEffect } from 'react';

interface DirectImageBackgroundProps {
  imageUrl: string;
  className?: string;
  fallbackColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * A component that renders an image as a CSS background-image rather than an <img> tag.
 * This is useful for dealing with image loading issues in React.
 */
const DirectImageBackground: React.FC<DirectImageBackgroundProps> = ({
  imageUrl,
  className = '',
  fallbackColor = 'rgba(0,0,0,0.1)',
  onLoad,
  onError
}) => {
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Process the URL to ensure it's properly formatted
  useEffect(() => {
    if (!imageUrl) {
      console.warn('DirectImageBackground received empty or null imageUrl');
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Generate a component instance ID for tracking in logs
    const instanceId = Math.random().toString(36).substring(2, 8);
    
    console.log(`[DirImgBg-${instanceId}] Processing URL: "${imageUrl}"`);

    // Normalize the URL format
    let processedUrl = imageUrl;
    
    // Handle different URL formats
    if (imageUrl.startsWith('http')) {
      // If it's already a full URL, use it directly
      processedUrl = imageUrl;
      console.log(`[DirImgBg-${instanceId}] Using full URL as is`);
    } else if (imageUrl.startsWith('/uploads')) {
      // If it's a path starting with /uploads, prepend the origin
      processedUrl = `${window.location.origin}${imageUrl}`;
      console.log(`[DirImgBg-${instanceId}] Adding origin to /uploads path`);
    } else {
      // Try direct URL first
      processedUrl = `${window.location.origin}${imageUrl}`;
      console.log(`[DirImgBg-${instanceId}] Using direct path: ${processedUrl}`);
    }

    console.log(`[DirImgBg-${instanceId}] Final processed URL: ${processedUrl}`);

    // Try alternative URL strategies if needed
    const tryAlternativeUrls = (initialUrl: string) => {
      const urls = [
        initialUrl, 
        `${window.location.origin}/uploads${imageUrl}`,
        `http://localhost:5000${imageUrl}`,
        `http://localhost:5000/uploads${imageUrl}`
      ];
      
      // Test all URLs in sequence
      let loadAttempt = 0;
      
      const tryNextUrl = () => {
        if (loadAttempt >= urls.length) {
          console.error(`[DirImgBg-${instanceId}] All URL formats failed`);
          setHasError(true);
          setIsLoading(false);
          if (onError) onError();
          return;
        }
        
        const currentUrl = urls[loadAttempt];
        console.log(`[DirImgBg-${instanceId}] Trying URL format ${loadAttempt + 1}/${urls.length}: ${currentUrl}`);
        
        const img = new Image();
        img.onload = () => {
          console.log(`[DirImgBg-${instanceId}] SUCCESS! URL loaded: ${currentUrl}`);
          setFinalUrl(currentUrl);
          setIsLoading(false);
          setHasError(false);
          if (onLoad) onLoad();
        };
        img.onerror = () => {
          console.warn(`[DirImgBg-${instanceId}] Failed to load URL: ${currentUrl}`);
          loadAttempt++;
          tryNextUrl();
        };
        img.src = currentUrl;
      };
      
      tryNextUrl();
    };
    
    tryAlternativeUrls(processedUrl);
    
  }, [imageUrl, onLoad, onError]);

  // Define the background style
  const style: React.CSSProperties = finalUrl && !hasError
    ? { 
        backgroundImage: `url(${finalUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: fallbackColor };

  return (
    <div 
      className={`direct-image-background ${className} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`} 
      style={style} 
      data-url={imageUrl}
    />
  );
};

export default DirectImageBackground;