import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

interface TrackableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The button text content */
  children: React.ReactNode;
  
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  
  /** Button size */
  size?: 'default' | 'large' | 'small';
  
  /** Optional icon to display in the button */
  icon?: React.ReactNode;
  
  /** Whether to adjust size for Vision Pro optimization - defaults to auto-detect */
  optimizedForVisionPro?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * TrackableButton Component
 * 
 * Enhanced button component designed for Vision Pro's gesture and eye tracking capabilities,
 * featuring larger touch targets, enhanced visual feedback, and special interaction states.
 * Automatically adapts based on detected device capabilities.
 */
const TrackableButton: React.FC<TrackableButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  icon,
  optimizedForVisionPro,
  className,
  ...props
}) => {
  // Detect Vision Pro capabilities
  const capabilities = useVisionProCapabilities();
  
  // Use provided override or auto-detected capabilities
  const shouldOptimize = optimizedForVisionPro !== undefined 
    ? optimizedForVisionPro 
    : capabilities.hasVisionProFeatures;
  
  // Map our simplified variants to shadcn variants
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    destructive: 'destructive',
  };
  
  // Calculate size based on Vision Pro optimization
  const sizeClass = shouldOptimize 
    ? size === 'large' ? 'text-lg py-3 px-6' 
    : size === 'small' ? 'text-sm py-1.5 px-3' 
    : 'text-base py-2.5 px-5'
    : '';
  
  // Apply more padding and larger text for Vision Pro
  const trackableClasses = shouldOptimize
    ? 'visionpro-trackable visionpro-button visionpro-focus-ring transition-all duration-300'
    : '';
  
  return (
    <Button
      variant={variantMap[variant] as any}
      className={cn(
        trackableClasses,
        sizeClass,
        shouldOptimize && 'min-h-[48px] min-w-[100px]',
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cn(
          'mr-2 flex items-center justify-center',
          shouldOptimize && 'text-lg'
        )}>
          {icon}
        </span>
      )}
      {children}
    </Button>
  );
};

export default TrackableButton;