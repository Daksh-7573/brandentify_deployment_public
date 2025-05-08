import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TrackableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Size of the button - larger sizes work better with eye tracking and gestures
   */
  size?: 'default' | 'large' | 'small';
  
  /**
   * Optional variant styles
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  /**
   * Optional icon to display before the text
   */
  icon?: React.ReactNode;
  
  /**
   * If true, applies extra visual cues for better tracking in Vision Pro
   */
  optimizedForVisionPro?: boolean;
}

/**
 * TrackableButton - A button component optimized for Vision Pro's eye tracking and gestures
 * 
 * Features larger hit areas, more pronounced visual feedback states,
 * and optionally enhances the button appearance for better eye tracking.
 */
const TrackableButton: React.FC<TrackableButtonProps> = ({
  children,
  className = '',
  size = 'default',
  variant = 'primary',
  icon,
  optimizedForVisionPro = true,
  ...props
}) => {
  const [isGazed, setIsGazed] = useState(false);
  
  // Size mappings optimized for eye tracking and gestures
  const sizeClasses = {
    default: 'min-w-[120px] min-h-[48px] px-6 py-3 text-base',
    large: 'min-w-[180px] min-h-[64px] px-8 py-4 text-lg',
    small: 'min-w-[100px] min-h-[40px] px-4 py-2 text-sm',
  };
  
  // Visual variant styles
  const variantClasses = {
    primary: 'bg-primary text-white shadow-md hover:bg-primary/90 active:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 active:bg-secondary/80',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20',
  };
  
  // Vision Pro optimized styles 
  const visionProClasses = optimizedForVisionPro
    ? 'visionpro-trackable transition-all duration-300 transform hover:scale-105'
    : '';
    
  // Gaze effect classes - simulate Vision Pro gaze detection with mouse events
  const gazeClasses = isGazed && optimizedForVisionPro
    ? 'ring-4 ring-primary/30 scale-105'
    : '';
  
  return (
    <button
      className={cn(
        'relative rounded-xl font-medium flex items-center justify-center gap-2',
        'transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        visionProClasses,
        gazeClasses,
        className
      )}
      onMouseEnter={() => setIsGazed(true)}
      onMouseLeave={() => setIsGazed(false)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      
      {/* Subtle glow effect that intensifies on hover/gaze */}
      {optimizedForVisionPro && variant === 'primary' && (
        <span 
          className={`absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10 opacity-0 transition-opacity duration-300 ${
            isGazed ? 'opacity-100' : ''
          }`}
        />
      )}
    </button>
  );
};

export default TrackableButton;