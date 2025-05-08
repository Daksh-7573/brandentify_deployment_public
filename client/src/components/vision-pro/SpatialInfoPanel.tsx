import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useVisionProCapabilities } from './VisionProDetector';

interface SpatialInfoPanelProps {
  /** Panel title */
  title: string;
  
  /** Array of items to display */
  items: React.ReactNode[];
  
  /** Optional icon to display with the title */
  icon?: React.ReactNode;
  
  /** Position in 3D space */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-left' | 'center-right' | 'top' | 'bottom';
  
  /** Z-depth in 3D space (1-10 scale) */
  zDepth?: number;
  
  /** Whether to use glass effect styling */
  glassEffect?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

/**
 * SpatialInfoPanel Component
 * 
 * A component for anchoring information in specific spatial locations
 * for Vision Pro displays. This component creates visually separated
 * information panels with depth effects and position anchoring.
 */
const SpatialInfoPanel: React.FC<SpatialInfoPanelProps> = ({
  title,
  items,
  icon,
  position = 'top-right',
  zDepth = 3,
  glassEffect = false,
  className,
}) => {
  const capabilities = useVisionProCapabilities();
  const [isHovered, setIsHovered] = useState(false);
  
  // Position classes based on position prop
  const positionClasses = {
    'top-left': 'absolute top-4 left-4',
    'top-right': 'absolute top-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'center-left': 'absolute top-1/2 -translate-y-1/2 left-4',
    'center-right': 'absolute top-1/2 -translate-y-1/2 right-4',
    'top': 'absolute top-4 left-1/2 -translate-x-1/2',
    'bottom': 'absolute bottom-4 left-1/2 -translate-x-1/2',
  };
  
  // Normalize z-depth to a 0-1 range for transform scale
  const normalizedZDepth = Math.min(Math.max(zDepth, 1), 10) / 10;
  
  // Calculate z-translate value for 3D effect
  const zTranslate = capabilities.hasVisionProFeatures
    ? `${zDepth * 5}px`
    : '0px';
  
  // Glass effect classes
  const glassClasses = glassEffect
    ? capabilities.hasVisionProFeatures
      ? 'visionpro-glass backdrop-blur-md bg-white/40 dark:bg-gray-900/40'
      : 'bg-white/90 dark:bg-gray-900/90'
    : 'bg-white dark:bg-gray-900';
    
  // Handle hover effects
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  return (
    <div
      className={cn(
        positionClasses[position],
        'rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
        glassClasses,
        'transition-all duration-300 ease-out',
        'w-64 p-4',
        'visionpro-spatial-element',
        isHovered && capabilities.hasVisionProFeatures && 'shadow-xl scale-105',
        className
      )}
      style={{
        transform: `translateZ(${zTranslate}) scale(${isHovered && capabilities.hasVisionProFeatures ? 1.05 : 1})`,
        zIndex: isHovered ? 10 : zDepth,
      }}
      data-position={position}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center mb-3 space-x-2">
        {icon && (
          <div className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            "bg-primary/10 text-primary",
            isHovered && "bg-primary/20"
          )}>
            {icon}
          </div>
        )}
        <h3 className={cn(
          "font-semibold text-lg",
          isHovered && capabilities.hasVisionProFeatures && "text-primary"
        )}>
          {title}
        </h3>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className={cn(
              "py-1.5 px-1",
              "transition-all duration-200",
              "border-b border-gray-100 dark:border-gray-800 last:border-b-0",
              isHovered && capabilities.hasVisionProFeatures && "bg-primary/5"
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpatialInfoPanel;