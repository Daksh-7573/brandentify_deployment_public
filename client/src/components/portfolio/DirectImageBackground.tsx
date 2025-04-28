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

    // For paths that start with /uploads, we directly use them without modification
    // This is the simplest approach and should work with the Express static file serving
    const directUrl = imageUrl.startsWith('/') 
      ? imageUrl  // Use path as-is if it starts with /
      : `/${imageUrl}`; // Add leading slash if missing
    
    console.log(`[DirImgBg-${instanceId}] Using direct path: ${directUrl}`);
    
    // Create a test image to verify if the URL is valid
    const img = new Image();
    
    img.onload = () => {
      console.log(`[DirImgBg-${instanceId}] SUCCESS! Image loaded: ${directUrl}`);
      setFinalUrl(directUrl);
      setIsLoading(false);
      setHasError(false);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      console.error(`[DirImgBg-${instanceId}] Failed to load image: ${directUrl}`);
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
    };
    
    img.src = directUrl;
    
  }, [imageUrl, onLoad, onError]);

  // Define the background style
  const style: React.CSSProperties = finalUrl && !hasError
    ? { 
        backgroundImage: `url(${finalUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { 
        backgroundColor: typeof fallbackColor === 'string' && fallbackColor.startsWith('linear-gradient') 
          ? 'transparent' 
          : fallbackColor,
        backgroundImage: typeof fallbackColor === 'string' && fallbackColor.startsWith('linear-gradient')
          ? fallbackColor
          : 'none',
      };

  return (
    <div 
      className={`direct-image-background ${className} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`} 
      style={style} 
      data-url={imageUrl}
    />
  );
};

export default DirectImageBackground;