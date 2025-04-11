import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface ProfileImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  objectFit?: "cover" | "contain" | "fill";
}

/**
 * A profile image component that handles loading errors gracefully
 * and provides a consistent fallback UI
 */
export function ProfileImage({ 
  src, 
  alt, 
  className = "h-full w-full object-cover", 
  fallbackClassName = "h-full w-full flex items-center justify-center bg-muted",
  objectFit = "cover"
}: ProfileImageProps) {
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null | undefined>(src);
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
    
    // Process image source when it changes
    if (src) {
      // If it's a data URL (base64), it's already been processed by our canvas
      // No additional processing needed for base64 images
      setOptimizedSrc(src);
    } else {
      setOptimizedSrc(null);
    }
  }, [src]);
  
  // Get the initials from the alt text for the fallback
  const getInitials = () => {
    if (!alt || alt === 'User profile') return 'U';
    
    return alt
      .split(' ')
      .map(word => word?.[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Default fallback with initials or user icon
  const renderFallback = () => {
    const initials = getInitials();
    
    return (
      <div className={`${fallbackClassName} bg-primary/10`}>
        {initials ? (
          <span className="text-primary font-semibold text-lg">{initials}</span>
        ) : (
          <User className="h-1/2 w-1/2 text-primary/60" />
        )}
      </div>
    );
  };

  if (!optimizedSrc || error) {
    return renderFallback();
  }

  // Apply specific object-fit setting based on prop
  const imageStyle = objectFit !== "cover" ? { objectFit } : undefined;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      style={imageStyle}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
}