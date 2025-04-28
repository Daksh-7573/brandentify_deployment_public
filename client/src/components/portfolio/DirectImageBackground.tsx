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
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Normalize the URL format
    let processedUrl = imageUrl;
    
    // Handle different URL formats
    if (imageUrl.startsWith('http')) {
      // If it's already a full URL, use it directly
      processedUrl = imageUrl;
    } else if (imageUrl.startsWith('/uploads')) {
      // If it's a path starting with /uploads, prepend the origin
      processedUrl = `${window.location.origin}${imageUrl}`;
    } else {
      // For any other case, assume it's a relative path and prepend /uploads
      processedUrl = `${window.location.origin}/uploads${imageUrl}`;
    }

    // For debugging purposes
    console.log('DirectImageBackground processing URL:', imageUrl, 'to:', processedUrl);

    // Create a temporary Image object to test if the image can be loaded
    const testImage = new Image();
    testImage.onload = () => {
      setFinalUrl(processedUrl);
      setIsLoading(false);
      setHasError(false);
      if (onLoad) onLoad();
      console.log('DirectImageBackground successfully loaded:', processedUrl);
    };
    testImage.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      if (onError) onError();
      console.error('DirectImageBackground failed to load:', processedUrl);
    };
    
    // Start the image loading
    testImage.src = processedUrl;
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
    />
  );
};

export default DirectImageBackground;