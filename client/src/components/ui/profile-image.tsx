import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface ProfileImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

/**
 * A profile image component that handles loading errors gracefully
 * and provides a consistent fallback UI
 */
export function ProfileImage({ 
  src, 
  alt, 
  className = "h-full w-full object-cover", 
  fallbackClassName = "h-full w-full flex items-center justify-center bg-muted"
}: ProfileImageProps) {
  const [error, setError] = useState(false);
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);
  
  // Get the initials from the alt text for the fallback
  const getInitials = () => {
    if (!alt || alt === 'User profile') return 'U';
    
    return alt
      .split(' ')
      .map(word => word[0])
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

  if (!src || error) {
    return renderFallback();
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  );
}