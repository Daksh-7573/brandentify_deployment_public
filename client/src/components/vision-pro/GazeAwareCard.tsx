import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

interface GazeAwareCardProps {
  /** Card title */
  title?: string;
  
  /** Primary content of the card */
  children: React.ReactNode;
  
  /** Optional icon to display with the title */
  icon?: React.ReactNode;
  
  /** Card variant style */
  variant?: 'default' | 'elevated' | 'outlined';
  
  /** Whether to add glow effect on hover/focus */
  glowEffect?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * GazeAwareCard Component
 * 
 * Enhanced card component designed for Vision Pro with enhanced hover states,
 * providing clear visual feedback when gazed at or interacted with.
 * Features depth effects and glow highlights optimized for spatial computing.
 */
const GazeAwareCard: React.FC<GazeAwareCardProps> = ({
  title,
  children,
  icon,
  variant = 'default',
  glowEffect = true,
  className,
}) => {
  const capabilities = useVisionProCapabilities();
  const [isGazed, setIsGazed] = useState(false);
  
  // Enhanced hover effects for Vision Pro
  const handleMouseEnter = () => {
    setIsGazed(true);
  };
  
  const handleMouseLeave = () => {
    setIsGazed(false);
  };
  
  // Apply special Vision Pro classes
  const visionProClasses = capabilities.hasVisionProFeatures
    ? 'visionpro-trackable visionpro-focus-ring transition-all duration-300'
    : '';
  
  // Variant-specific styles
  const variantClasses = {
    default: 'bg-card border border-border',
    elevated: 'bg-card border border-border shadow-lg',
    outlined: 'bg-transparent border-2 border-primary/20',
  };
  
  // Gaze effect classes
  const gazeClasses = isGazed && capabilities.hasVisionProFeatures
    ? glowEffect
      ? 'shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] scale-[1.01] border-primary/30'
      : 'scale-[1.01] border-primary/30'
    : '';
    
  return (
    <Card
      className={cn(
        variantClasses[variant],
        visionProClasses,
        gazeClasses,
        'overflow-hidden transition-all duration-300',
        capabilities.hasVisionProFeatures && 'cursor-none',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {title && (
        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
          {icon && (
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10",
              isGazed && capabilities.hasVisionProFeatures && "bg-primary/20"
            )}>
              <span className="text-primary">{icon}</span>
            </div>
          )}
          <CardTitle className={cn(
            "text-xl font-semibold transition-colors",
            isGazed && capabilities.hasVisionProFeatures && "text-primary"
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(
        capabilities.hasVisionProFeatures && "p-5"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default GazeAwareCard;