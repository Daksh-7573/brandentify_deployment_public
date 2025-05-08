import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface GazeAwareCardProps {
  /**
   * Card title
   */
  title: string;
  
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Optional icon to display in the card header
   */
  icon?: React.ReactNode;
  
  /**
   * Visual style variant
   */
  variant?: 'default' | 'outline' | 'glass' | 'elevated';
  
  /**
   * If true, applies additional Vision Pro optimization
   */
  optimizedForVisionPro?: boolean;
  
  /**
   * Optional click handler for the entire card
   */
  onClick?: () => void;
}

/**
 * GazeAwareCard - A card component optimized for Vision Pro's eye tracking
 * 
 * The card responds to user's gaze with enhanced visual feedback,
 * making it easier to track which element is being looked at.
 */
const GazeAwareCard: React.FC<GazeAwareCardProps> = ({
  title,
  children,
  className = '',
  footer,
  icon,
  variant = 'default',
  optimizedForVisionPro = true,
  onClick,
}) => {
  const [isGazed, setIsGazed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Simple simulation of Vision Pro gaze detection using mouse events
  // This will be replaced with actual Vision Pro APIs when available
  useEffect(() => {
    const handleMouseEnter = () => setIsGazed(true);
    const handleMouseLeave = () => setIsGazed(false);
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);
  
  // Card variant styles
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-md',
    outline: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl',
  };
  
  // Vision Pro optimization styles
  const visionProClasses = optimizedForVisionPro
    ? 'visionpro-trackable transition-all duration-500'
    : 'transition-all duration-300';
    
  // Gaze effect styles
  const gazeClasses = isGazed && optimizedForVisionPro
    ? 'ring-4 ring-primary/30 transform scale-[1.03] shadow-xl'
    : '';
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        'rounded-2xl p-6 overflow-hidden',
        'flex flex-col',
        variantClasses[variant],
        visionProClasses,
        gazeClasses,
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={onClick}
    >
      {/* Card header with title and optional icon */}
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-primary text-2xl">{icon}</div>}
        <h3 className={cn(
          'text-xl font-bold', 
          isGazed && optimizedForVisionPro ? 'text-primary' : 'text-gray-800 dark:text-white',
          'transition-colors duration-300'
        )}>
          {title}
        </h3>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className={cn(
          'mt-4 pt-4 border-t border-gray-100 dark:border-gray-700',
          isGazed && optimizedForVisionPro ? 'opacity-100' : 'opacity-80',
          'transition-opacity duration-300'
        )}>
          {footer}
        </div>
      )}
      
      {/* Vision Pro depth effect */}
      {optimizedForVisionPro && (
        <div 
          className={cn(
            'absolute inset-0 -z-10 opacity-0 bg-gradient-to-br from-primary/20 to-transparent',
            isGazed ? 'opacity-30' : '',
            'transition-opacity duration-500'
          )}
        />
      )}
    </div>
  );
};

export default GazeAwareCard;